"use client";

import {
  AltArrowLeft,
  AltArrowRight,
  CheckCircle,
  CloseCircle,
  Gallery,
  Layers,
  Link as LinkIcon,
  Notebook,
  Rocket,
} from "@solar-icons/react";
import type { IconProps } from "@solar-icons/react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  useActionState,
  useEffect,
  useRef,
  useState,
  type ComponentType,
  type KeyboardEvent,
} from "react";

import type { ActionState } from "@/actions/auth";
import { createProject } from "@/actions/projects";
import { Alert } from "@/components/admin/alert";
import { ImageUploader } from "@/components/admin/image-uploader";
import {
  MultiImageUploader,
  type GalleryDraftImage,
} from "@/components/admin/multi-image-uploader";
import { TagPicker } from "@/components/admin/tag-picker";
import {
  Checkbox,
  Field,
  Input,
  NumberInput,
  Select,
  Textarea,
} from "@/components/ui/field";
import { Button } from "@/components/ui/button";
import type { TechTag } from "@/db/schema";
import { cn, slugify } from "@/lib/utils";

type WizardValues = {
  title: string;
  slug: string;
  summary: string;
  description: string;
  repoUrl: string;
  liveUrl: string;
  coverPublicId: string;
  coverAlt: string;
  status: "draft" | "published";
  featured: boolean;
  year: string;
  tagIds: string[];
  gallery: GalleryDraftImage[];
};

const EMPTY: WizardValues = {
  title: "",
  slug: "",
  summary: "",
  description: "",
  repoUrl: "",
  liveUrl: "",
  coverPublicId: "",
  coverAlt: "",
  status: "draft",
  featured: false,
  year: String(new Date().getFullYear()),
  tagIds: [],
  gallery: [],
};

type DraftState = {
  values: WizardValues;
  step: number;
  /** Depois que o slug é editado à mão, o título para de sobrescrevê-lo. */
  slugLocked: boolean;
  /** Veio do armazenamento local, e não de um formulário em branco. */
  restored: boolean;
  /** O armazenamento local já foi lido. Antes disso não há o que salvar. */
  hydrated: boolean;
};

const DRAFT_KEY = "portfolio:new-project-draft:v1";
const initialState: ActionState = {};

const FRESH_DRAFT: DraftState = {
  values: EMPTY,
  step: 0,
  slugLocked: false,
  restored: false,
  hydrated: false,
};

/** Lê o rascunho salvo neste navegador. Só roda depois da montagem. */
function readDraft(): DraftState | null {
  try {
    const stored = window.localStorage.getItem(DRAFT_KEY);
    if (!stored) return null;

    const parsed = JSON.parse(stored) as { values?: WizardValues; step?: number };
    const values = { ...EMPTY, ...parsed.values };

    return {
      values,
      step: Math.min(Math.max(parsed.step ?? 0, 0), STEPS.length - 1),
      slugLocked: Boolean(values.slug),
      restored: true,
      hydrated: true,
    };
  } catch {
    // Rascunho corrompido não pode impedir a criação de um projeto novo.
    window.localStorage.removeItem(DRAFT_KEY);
    return null;
  }
}

const STEPS: {
  id: string;
  label: string;
  hint: string;
  icon: ComponentType<IconProps>;
  /** Campos que o servidor pode reprovar dentro desta etapa. */
  fields: string[];
}[] = [
  {
    id: "basics",
    label: "Identidade",
    hint: "Como o projeto aparece nas listas e nos buscadores.",
    icon: Notebook,
    fields: ["title", "slug", "summary"],
  },
  {
    id: "content",
    label: "Conteúdo",
    hint: "O texto longo, os links e as tecnologias usadas.",
    icon: LinkIcon,
    fields: ["description", "repoUrl", "liveUrl", "tagIds"],
  },
  {
    id: "media",
    label: "Imagens",
    hint: "A capa e as telas que entram na página do projeto.",
    icon: Gallery,
    fields: ["coverPublicId", "coverAlt"],
  },
  {
    id: "publish",
    label: "Publicação",
    hint: "Confira e decida se já entra no ar.",
    icon: Rocket,
    fields: ["status", "year", "featured", "position"],
  },
];

function isUrl(value: string) {
  try {
    new URL(value);
    return true;
  } catch {
    return false;
  }
}

/** Regras da etapa, verificadas antes de deixar avançar. O servidor repete todas. */
function validateStep(step: number, values: WizardValues) {
  const errors: Record<string, string> = {};

  if (step === 0) {
    if (values.title.trim().length < 2) {
      errors.title = "O título precisa de ao menos 2 caracteres";
    }
    if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(values.slug)) {
      errors.slug = "Use apenas letras minúsculas, números e hífens";
    }
    const summary = values.summary.trim();
    if (summary.length < 10) {
      errors.summary = "Escreva um resumo com ao menos 10 caracteres";
    } else if (summary.length > 280) {
      errors.summary = "Máximo de 280 caracteres";
    }
  }

  if (step === 1) {
    for (const key of ["repoUrl", "liveUrl"] as const) {
      const value = values[key].trim();
      if (value && !isUrl(value)) errors[key] = "Informe uma URL válida";
    }
  }

  if (step === 2 && values.coverPublicId && !values.coverAlt.trim()) {
    errors.coverAlt = "Descreva a capa para quem usa leitor de tela";
  }

  return errors;
}

export function ProjectWizard({ tags }: { tags: TechTag[] }) {
  const router = useRouter();
  const reduceMotion = useReducedMotion();
  const [state, formAction, isSubmitting] = useActionState(
    createProject,
    initialState,
  );

  // Tudo o que o rascunho carrega vive num objeto só: assim recuperar o que
  // ficou salvo é uma única atualização de estado, e não quatro em cascata.
  const [draft, setDraft] = useState<DraftState>(FRESH_DRAFT);
  const { values, step, restored, hydrated } = draft;

  const [direction, setDirection] = useState<1 | -1>(1);
  const [stepErrors, setStepErrors] = useState<Record<string, string>>({});

  /**
   * Trava enquanto a etapa nova ainda não apareceu na tela.
   *
   * O `AnimatePresence mode="wait"` segura o conteúdo antigo pelos 280ms da
   * saída, mas `step` já mudou. Nessa janela cega o usuário não vê resposta ao
   * clique, clica de novo, e o segundo clique avança a partir do estado já
   * atualizado — dois cliques, duas etapas, uma transição vista. Era assim que
   * a última etapa era engolida: o clique repetido caía no "Criar projeto",
   * que o React já havia colocado no lugar do "Continuar".
   */
  const [isChanging, setIsChanging] = useState(false);

  const formRef = useRef<HTMLFormElement>(null);
  const unlockTimer = useRef<number | null>(null);

  function unlock() {
    if (unlockTimer.current) window.clearTimeout(unlockTimer.current);
    setIsChanging(false);
  }

  useEffect(
    () => () => {
      if (unlockTimer.current) window.clearTimeout(unlockTimer.current);
    },
    [],
  );

  function patch(changes: Partial<DraftState>) {
    setDraft((current) => ({ ...current, ...changes }));
  }

  function set<K extends keyof WizardValues>(key: K, value: WizardValues[K]) {
    setDraft((current) => ({
      ...current,
      values: { ...current.values, [key]: value },
    }));
    setStepErrors((current) => {
      if (!(key in current)) return current;
      const next = { ...current };
      delete next[key];
      return next;
    });
  }

  // Recupera o rascunho depois da montagem: ler localStorage durante o render
  // quebraria a hidratação, já que o servidor não tem esse valor. Reagir ao
  // que só existe no navegador é justamente o que um efeito deve fazer.
  useEffect(() => {
    const stored = readDraft();
    // eslint-disable-next-line react-hooks/set-state-in-effect -- localStorage não existe no servidor: só dá para aplicar depois de montar.
    setDraft(stored ? { ...stored, hydrated: true } : { ...FRESH_DRAFT, hydrated: true });
  }, []);

  // Salva com folga para não escrever a cada tecla.
  useEffect(() => {
    if (!hydrated) return;
    const timer = window.setTimeout(() => {
      window.localStorage.setItem(DRAFT_KEY, JSON.stringify({ values, step }));
    }, 400);
    return () => window.clearTimeout(timer);
  }, [values, step, hydrated]);

  // Criado: limpa o rascunho antes de sair, senão o próximo "Novo projeto"
  // reabriria o formulário já preenchido com algo que virou registro.
  useEffect(() => {
    if (!state.redirectTo) return;
    window.localStorage.removeItem(DRAFT_KEY);
    router.push(state.redirectTo);
  }, [state.redirectTo, router]);

  // O servidor só responde depois do envio, e a resposta pode reprovar um campo
  // de outra etapa. Levar a navegação até lá evita um erro invisível.
  useEffect(() => {
    if (!state.fieldErrors) return;
    const failing = STEPS.findIndex((entry) =>
      entry.fields.some((field) => state.fieldErrors?.[field]?.length),
    );
    // eslint-disable-next-line react-hooks/set-state-in-effect -- reação ao retorno da action, que não existe no render.
    if (failing >= 0) setDraft((current) => ({ ...current, step: failing }));
  }, [state.fieldErrors]);

  function goTo(next: number) {
    setDirection(next > step ? 1 : -1);
    patch({ step: next });
    setStepErrors({});

    setIsChanging(true);
    // Rede de segurança: se `onExitComplete` não vier (aba em segundo plano,
    // animação interrompida), a trava se solta sozinha em vez de travar o
    // assistente de vez.
    if (unlockTimer.current) window.clearTimeout(unlockTimer.current);
    unlockTimer.current = window.setTimeout(unlock, 600);
  }

  function advance() {
    if (isChanging) return;
    const errors = validateStep(step, values);
    setStepErrors(errors);
    if (Object.keys(errors).length > 0) return;
    if (step < STEPS.length - 1) goTo(step + 1);
  }

  function discardDraft() {
    window.localStorage.removeItem(DRAFT_KEY);
    setDirection(-1);
    setDraft({ ...FRESH_DRAFT, hydrated: true });
    setStepErrors({});
  }

  /**
   * Envio sempre explícito. Nenhum botão do formulário é `type="submit"`, então
   * não existe ação padrão de clique nem envio implícito para disparar a
   * criação por acidente — só este caminho, chamado de propósito.
   */
  function submitForm() {
    // Mesma trava do avanço: criar o projeto é a ação irreversível do fluxo,
    // e é justamente a que estava sendo disparada pelo clique repetido.
    if (isChanging) return;
    formRef.current?.requestSubmit();
  }

  /** Enter avança a etapa; na última, envia. Nunca as duas coisas. */
  function handleKeyDown(event: KeyboardEvent<HTMLFormElement>) {
    if (event.key !== "Enter") return;
    const target = event.target as HTMLElement;
    if (target.tagName === "TEXTAREA" || target.tagName === "BUTTON") return;

    event.preventDefault();
    if (step === STEPS.length - 1) {
      submitForm();
      return;
    }
    advance();
  }

  const errorFor = (field: string) =>
    stepErrors[field]
      ? [stepErrors[field]]
      : (state.fieldErrors?.[field] ?? undefined);

  const isLast = step === STEPS.length - 1;
  const slide = reduceMotion ? 0 : 28;

  return (
    <form
      ref={formRef}
      action={formAction}
      onKeyDown={handleKeyDown}
      className="flex flex-col gap-6"
    >
      {/* Espelho do estado: são estes campos que o servidor lê, e não os
          controles visíveis, que ficam desmontados fora da etapa atual. */}
      <input type="hidden" name="title" value={values.title} />
      <input type="hidden" name="slug" value={values.slug} />
      <input type="hidden" name="summary" value={values.summary} />
      <input type="hidden" name="description" value={values.description} />
      <input type="hidden" name="repoUrl" value={values.repoUrl} />
      <input type="hidden" name="liveUrl" value={values.liveUrl} />
      <input type="hidden" name="coverPublicId" value={values.coverPublicId} />
      <input type="hidden" name="coverAlt" value={values.coverAlt} />
      <input type="hidden" name="status" value={values.status} />
      <input type="hidden" name="year" value={values.year} />
      {values.featured ? (
        <input type="hidden" name="featured" value="on" />
      ) : null}
      {values.tagIds.map((tagId) => (
        <input key={tagId} type="hidden" name="tagIds" value={tagId} />
      ))}
      <input
        type="hidden"
        name="gallery"
        value={JSON.stringify(values.gallery)}
      />

      <Stepper
        step={step}
        onJump={(next) => {
          if (!isChanging) goTo(next);
        }}
      />

      {restored ? (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-card border border-subtle bg-surface-sunken px-4 py-3">
          <p className="text-sm text-secondary">
            Recuperamos o rascunho que você tinha começado neste navegador.
          </p>
          <button
            type="button"
            onClick={discardDraft}
            className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs text-muted transition-colors hover:bg-danger-soft hover:text-danger"
          >
            <CloseCircle size={14} weight="Linear" />
            Começar do zero
          </button>
        </div>
      ) : null}

      <div className="relative overflow-hidden rounded-card border border-subtle bg-surface-elevated">
        <AnimatePresence
          mode="wait"
          initial={false}
          custom={direction}
          // Dispara no instante em que a etapa nova entra no DOM, ou seja,
          // quando o usuário finalmente vê o resultado do clique.
          onExitComplete={unlock}
        >
          <motion.section
            key={STEPS[step].id}
            custom={direction}
            variants={{
              enter: (dir: number) => ({ opacity: 0, x: dir * slide }),
              center: { opacity: 1, x: 0 },
              exit: (dir: number) => ({ opacity: 0, x: dir * -slide }),
            }}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
            className="flex flex-col gap-5 p-6"
          >
            <header className="flex flex-col gap-1">
              <h2 className="text-base font-medium text-primary">
                {STEPS[step].label}
              </h2>
              <p className="text-sm text-secondary">{STEPS[step].hint}</p>
            </header>

            {step === 0 ? (
              <>
                <Field label="Título" htmlFor="title" error={errorFor("title")}>
                  <Input
                    id="title"
                    value={values.title}
                    onChange={(event) => {
                      const next = event.target.value;
                      setDraft((current) => ({
                        ...current,
                        values: {
                          ...current.values,
                          title: next,
                          slug: current.slugLocked
                            ? current.values.slug
                            : slugify(next),
                        },
                      }));
                    }}
                    autoFocus
                  />
                </Field>

                <Field
                  label="Slug"
                  htmlFor="slug"
                  hint="Endereço público do projeto. Preenchido a partir do título."
                  error={errorFor("slug")}
                >
                  <Input
                    id="slug"
                    value={values.slug}
                    onChange={(event) => {
                      patch({ slugLocked: true });
                      set("slug", event.target.value);
                    }}
                  />
                </Field>

                <Field
                  label="Resumo"
                  htmlFor="summary"
                  hint={`Aparece nos cards e na descrição para buscadores. ${values.summary.length}/280.`}
                  error={errorFor("summary")}
                >
                  <Textarea
                    id="summary"
                    value={values.summary}
                    maxLength={280}
                    onChange={(event) => set("summary", event.target.value)}
                    className="min-h-24"
                  />
                </Field>
              </>
            ) : null}

            {step === 1 ? (
              <>
                <Field
                  label="Descrição"
                  htmlFor="description"
                  hint="Aceita Markdown: títulos, listas, links e blocos de código."
                  error={errorFor("description")}
                >
                  <Textarea
                    id="description"
                    value={values.description}
                    onChange={(event) => set("description", event.target.value)}
                    className="min-h-56 font-mono text-[13px]"
                  />
                </Field>

                <div className="grid gap-5 sm:grid-cols-2">
                  <Field
                    label="Repositório no GitHub"
                    htmlFor="repoUrl"
                    error={errorFor("repoUrl")}
                  >
                    <Input
                      id="repoUrl"
                      type="url"
                      placeholder="https://github.com/usuario/repositorio"
                      value={values.repoUrl}
                      onChange={(event) => set("repoUrl", event.target.value)}
                    />
                  </Field>

                  <Field
                    label="Site publicado"
                    htmlFor="liveUrl"
                    error={errorFor("liveUrl")}
                  >
                    <Input
                      id="liveUrl"
                      type="url"
                      placeholder="https://exemplo.com"
                      value={values.liveUrl}
                      onChange={(event) => set("liveUrl", event.target.value)}
                    />
                  </Field>
                </div>

                <TagPicker
                  tags={tags}
                  selected={values.tagIds}
                  onChange={(next) => set("tagIds", next)}
                />
              </>
            ) : null}

            {step === 2 ? (
              <>
                <ImageUploader
                  label="Imagem de capa"
                  defaultPublicId={values.coverPublicId}
                  onChange={(publicId) => set("coverPublicId", publicId)}
                />

                <Field
                  label="Texto alternativo da capa"
                  htmlFor="coverAlt"
                  hint="Descreva a imagem para leitores de tela."
                  error={errorFor("coverAlt")}
                >
                  <Input
                    id="coverAlt"
                    value={values.coverAlt}
                    onChange={(event) => set("coverAlt", event.target.value)}
                  />
                </Field>

                <div className="flex flex-col gap-2 border-t border-subtle pt-5">
                  <span className="text-sm font-medium text-primary">
                    Galeria
                  </span>
                  <p className="text-sm text-secondary">
                    Telas adicionais mostradas abaixo da descrição. Arraste pela
                    alça para mudar a ordem.
                  </p>
                  <div className="mt-2">
                    <MultiImageUploader
                      value={values.gallery}
                      onChange={(next) => set("gallery", next)}
                      folder="portfolio/projects"
                    />
                  </div>
                </div>
              </>
            ) : null}

            {step === 3 ? (
              <>
                <div className="grid gap-5 sm:grid-cols-2">
                  <Field
                    label="Status"
                    htmlFor="status"
                    error={errorFor("status")}
                  >
                    <Select
                      id="status"
                      value={values.status}
                      onChange={(next) =>
                        set("status", next as WizardValues["status"])
                      }
                      options={[
                        {
                          value: "draft",
                          label: "Rascunho",
                          description: "Invisível no site público",
                        },
                        {
                          value: "published",
                          label: "Publicado",
                          description: "Entra no ar assim que salvar",
                        },
                      ]}
                    />
                  </Field>

                  <Field label="Ano" htmlFor="year" error={errorFor("year")}>
                    <NumberInput
                      id="year"
                      value={values.year}
                      onChange={(next) => set("year", next)}
                      min={1990}
                      max={2100}
                      placeholder="2026"
                    />
                  </Field>
                </div>

                <Checkbox
                  checked={values.featured}
                  onChange={(event) => set("featured", event.target.checked)}
                  label="Destacar na página inicial"
                  hint="Projetos em destaque aparecem na home, além da listagem."
                />

                <Summary values={values} tags={tags} />
              </>
            ) : null}
          </motion.section>
        </AnimatePresence>
      </div>

      {state.error ? <Alert tone="error">{state.error}</Alert> : null}

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          {step > 0 ? (
            <Button
              type="button"
              variant="secondary"
              disabled={isChanging}
              onClick={() => {
                if (!isChanging) goTo(step - 1);
              }}
            >
              <AltArrowLeft size={16} weight="Linear" />
              Voltar
            </Button>
          ) : (
            <Link
              href="/admin/projects"
              className="rounded-full px-4 py-2 text-sm text-secondary transition-colors hover:text-primary"
            >
              Cancelar
            </Link>
          )}
          <span className="text-xs text-muted">
            Etapa {step + 1} de {STEPS.length}
          </span>
        </div>

        {/*
          As duas chaves são obrigatórias. Sem elas o React reaproveita o mesmo
          <button> entre as etapas e só troca o `type`, o que fazia o assistente
          "pular" a última: no clique que sai de Imagens para Publicação, o
          handler roda, o React re-renderiza de forma síncrona e o nó passa a
          ser type="submit" ANTES de o navegador executar a ação padrão do
          clique — que então enviava o formulário recém-chegado à última etapa.
          Com chaves distintas o nó clicado é desmontado e não sobra ação padrão.
        */}
        {isLast ? (
          <Button
            key="create"
            type="button"
            onClick={submitForm}
            disabled={isSubmitting || isChanging}
          >
            <CheckCircle size={16} weight="Bold" />
            {isSubmitting ? "Criando" : "Criar projeto"}
          </Button>
        ) : (
          <Button
            key="advance"
            type="button"
            onClick={advance}
            disabled={isChanging}
          >
            Continuar
            <AltArrowRight size={16} weight="Linear" />
          </Button>
        )}
      </div>
    </form>
  );
}

function Stepper({
  step,
  onJump,
}: {
  step: number;
  onJump: (next: number) => void;
}) {
  return (
    <ol className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-0">
      {STEPS.map((entry, index) => {
        const done = index < step;
        const current = index === step;
        const Icon = entry.icon;

        return (
          <li key={entry.id} className="flex flex-1 items-center gap-3">
            <button
              type="button"
              // Voltar é livre; avançar continua passando pela validação.
              onClick={() => (index < step ? onJump(index) : undefined)}
              disabled={index > step}
              aria-current={current ? "step" : undefined}
              className={cn(
                "flex items-center gap-2.5 rounded-full py-1 pr-3 pl-1 transition-colors duration-300",
                index < step && "cursor-pointer hover:bg-surface-sunken",
                index > step && "cursor-default",
              )}
            >
              <span
                className={cn(
                  "grid size-8 shrink-0 place-items-center rounded-full border transition-all duration-500 ease-[var(--ease-out-quint)]",
                  current && "border-accent bg-accent text-accent-fg",
                  done && "border-accent bg-accent-soft text-accent",
                  !current && !done && "border-subtle text-muted",
                )}
              >
                {done ? (
                  <CheckCircle size={15} weight="Bold" />
                ) : (
                  <Icon size={15} weight="Linear" />
                )}
              </span>
              <span
                className={cn(
                  "text-sm whitespace-nowrap transition-colors duration-300",
                  current ? "font-medium text-primary" : "text-secondary",
                )}
              >
                {entry.label}
              </span>
            </button>

            {index < STEPS.length - 1 ? (
              <span
                aria-hidden
                className="hidden h-px flex-1 bg-[var(--border-subtle)] sm:block"
              >
                <motion.span
                  className="block h-px bg-[var(--accent)]"
                  initial={false}
                  animate={{ scaleX: done ? 1 : 0 }}
                  style={{ transformOrigin: "left" }}
                  transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
                />
              </span>
            ) : null}
          </li>
        );
      })}
    </ol>
  );
}

/** Revisão final: evita voltar etapa por etapa só para conferir o que ficou. */
function Summary({
  values,
  tags,
}: {
  values: WizardValues;
  tags: TechTag[];
}) {
  const selectedTags = tags.filter((tag) => values.tagIds.includes(tag.id));

  const rows: { label: string; value: string }[] = [
    { label: "Título", value: values.title || "—" },
    { label: "Endereço", value: `/projects/${values.slug || "—"}` },
    { label: "Capa", value: values.coverPublicId ? "Enviada" : "Sem capa" },
    {
      label: "Galeria",
      value:
        values.gallery.length > 0
          ? `${values.gallery.length} ${values.gallery.length > 1 ? "imagens" : "imagem"}`
          : "Vazia",
    },
    {
      label: "Tecnologias",
      value:
        selectedTags.length > 0
          ? selectedTags.map((tag) => tag.name).join(", ")
          : "Nenhuma",
    },
  ];

  return (
    <div className="flex flex-col gap-3 rounded-control border border-subtle bg-surface-sunken p-4">
      <div className="flex items-center gap-2 text-sm font-medium text-primary">
        <Layers size={16} weight="Linear" />
        Revisão
      </div>
      <dl className="grid gap-x-6 gap-y-2 sm:grid-cols-2">
        {rows.map((row) => (
          <div key={row.label} className="flex items-baseline gap-2 text-sm">
            <dt className="shrink-0 text-muted">{row.label}</dt>
            <dd className="min-w-0 truncate text-secondary">{row.value}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}
