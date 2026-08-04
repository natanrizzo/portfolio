import { z } from "zod";

/** Empty form fields arrive as "", which we normalize to null before insert. */
const optionalUrl = z
  .union([z.url("Informe uma URL válida"), z.literal("")])
  .transform((value) => (value === "" ? null : value))
  .nullable();

const optionalText = (max: number) =>
  z
    .string()
    .trim()
    .max(max, `Máximo de ${max} caracteres`)
    .transform((value) => (value === "" ? null : value))
    .nullable()
    .optional();

export const loginSchema = z.object({
  email: z.email("Informe um e-mail válido").trim().toLowerCase(),
  password: z.string().min(1, "Informe a senha"),
});

export const projectSchema = z.object({
  title: z
    .string()
    .trim()
    .min(2, "O título precisa de ao menos 2 caracteres")
    .max(140, "Máximo de 140 caracteres"),
  slug: z
    .string()
    .trim()
    .min(2, "O slug precisa de ao menos 2 caracteres")
    .max(140, "Máximo de 140 caracteres")
    .regex(
      /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
      "Use apenas letras minúsculas, números e hífens",
    ),
  summary: z
    .string()
    .trim()
    .min(10, "Escreva um resumo com ao menos 10 caracteres")
    .max(280, "Máximo de 280 caracteres"),
  description: optionalText(20000),
  repoUrl: optionalUrl,
  liveUrl: optionalUrl,
  coverPublicId: optionalText(255),
  coverAlt: optionalText(200),
  status: z.enum(["draft", "published"]),
  featured: z.boolean(),
  // O assistente de criação não envia posição: quem entra vai para o topo e a
  // ordem passa a ser definida pelo arrastar da listagem.
  position: z.preprocess(
    (value) => (value === "" || value === null || value === undefined ? 0 : value),
    z.coerce.number().int().min(0).max(9999),
  ),
  year: z
    .union([z.coerce.number().int().min(1990).max(2100), z.literal("")])
    .transform((value) => (value === "" ? null : (value as number)))
    .nullable()
    .optional(),
  tagIds: z.array(z.uuid()).max(20, "No máximo 20 tecnologias"),
});

export const projectImageSchema = z.object({
  projectId: z.uuid(),
  publicId: z.string().trim().min(1).max(255),
  alt: optionalText(200),
});

/**
 * Galeria enviada junto da criação: as imagens já estão no Cloudinary, mas o
 * projeto ainda não existe, então elas chegam como um JSON no mesmo FormData.
 */
export const projectGallerySchema = z
  .array(
    z.object({
      publicId: z.string().trim().min(1).max(255),
      alt: optionalText(200),
    }),
  )
  .max(12, "No máximo 12 imagens na galeria");

export const projectOrderSchema = z
  .array(z.uuid())
  .min(1)
  .max(500);

export const profileSchema = z.object({
  headline: z
    .string()
    .trim()
    .min(4, "Escreva um título com ao menos 4 caracteres")
    .max(160, "Máximo de 160 caracteres"),
  subheadline: optionalText(320),
  bio: optionalText(8000),
  avatarPublicId: optionalText(255),
  resumeUrl: optionalUrl,
  email: z
    .union([z.email("E-mail inválido"), z.literal("")])
    .transform((value) => (value === "" ? null : value))
    .nullable(),
  githubUrl: optionalUrl,
  linkedinUrl: optionalUrl,
  websiteUrl: optionalUrl,
  availableForWork: z.boolean(),
});

export const tagSchema = z.object({
  name: z.string().trim().min(1, "Informe o nome").max(60),
  iconSlug: optionalText(60),
});

export const passwordChangeSchema = z
  .object({
    currentPassword: z.string().min(1, "Informe a senha atual"),
    newPassword: z
      .string()
      .min(12, "A nova senha precisa de ao menos 12 caracteres")
      .max(200),
    confirmPassword: z.string(),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "As senhas não conferem",
    path: ["confirmPassword"],
  });

export type ProjectInput = z.infer<typeof projectSchema>;
export type ProfileInput = z.infer<typeof profileSchema>;
