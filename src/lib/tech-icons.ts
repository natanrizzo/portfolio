/**
 * Catálogo curado de marcas do Simple Icons usado pelo seletor de ícones.
 *
 * O `slug` é o identificador oficial do Simple Icons — é o que vai para o banco
 * e o que monta a URL do SVG. O `label` e as `keywords` existem só para a busca
 * em português, para que "banco de dados" ache Postgres e "contêiner" ache
 * Docker sem que o usuário precise saber o slug.
 */

export type TechIcon = {
  /** Slug oficial no Simple Icons. */
  slug: string;
  label: string;
  /** Termos em pt-BR que também devem encontrar o ícone. */
  keywords?: string;
};

export type TechIconGroup = {
  id: string;
  label: string;
  icons: TechIcon[];
};

export const TECH_ICON_GROUPS: TechIconGroup[] = [
  {
    id: "languages",
    label: "Linguagens",
    icons: [
      { slug: "typescript", label: "TypeScript", keywords: "ts tipagem" },
      { slug: "javascript", label: "JavaScript", keywords: "js ecmascript" },
      { slug: "python", label: "Python", keywords: "py cobra" },
      { slug: "php", label: "PHP" },
      { slug: "ruby", label: "Ruby", keywords: "rubi" },
      { slug: "go", label: "Go", keywords: "golang" },
      { slug: "rust", label: "Rust", keywords: "ferrugem" },
      { slug: "openjdk", label: "Java", keywords: "jvm jdk" },
      { slug: "kotlin", label: "Kotlin", keywords: "android jvm" },
      { slug: "swift", label: "Swift", keywords: "apple ios" },
      { slug: "c", label: "C" },
      { slug: "cplusplus", label: "C++", keywords: "cpp c mais mais" },
      { slug: "dart", label: "Dart", keywords: "flutter" },
      { slug: "elixir", label: "Elixir" },
      { slug: "lua", label: "Lua" },
      { slug: "scala", label: "Scala" },
      { slug: "haskell", label: "Haskell", keywords: "funcional" },
      { slug: "perl", label: "Perl" },
      { slug: "zig", label: "Zig" },
      { slug: "solidity", label: "Solidity", keywords: "blockchain contrato" },
      { slug: "gnubash", label: "Bash", keywords: "shell terminal script sh" },
    ],
  },
  {
    id: "frontend",
    label: "Front-end",
    icons: [
      { slug: "react", label: "React", keywords: "reactjs react native" },
      { slug: "nextdotjs", label: "Next.js", keywords: "nextjs vercel" },
      { slug: "vuedotjs", label: "Vue", keywords: "vuejs" },
      { slug: "nuxt", label: "Nuxt", keywords: "vue" },
      { slug: "angular", label: "Angular" },
      { slug: "svelte", label: "Svelte", keywords: "sveltekit" },
      { slug: "astro", label: "Astro" },
      { slug: "remix", label: "Remix" },
      { slug: "solid", label: "SolidJS", keywords: "solid js" },
      { slug: "qwik", label: "Qwik" },
      { slug: "htmx", label: "htmx" },
      { slug: "alpinedotjs", label: "Alpine.js", keywords: "alpine" },
      { slug: "jquery", label: "jQuery" },
      { slug: "electron", label: "Electron", keywords: "desktop" },
      { slug: "vite", label: "Vite", keywords: "bundler build empacotador" },
      { slug: "webpack", label: "Webpack", keywords: "bundler empacotador" },
    ],
  },
  {
    id: "styling",
    label: "Estilo e interface",
    icons: [
      { slug: "html5", label: "HTML", keywords: "html5 marcacao" },
      { slug: "css", label: "CSS", keywords: "estilo folha de estilo" },
      { slug: "sass", label: "Sass", keywords: "scss pre processador" },
      { slug: "tailwindcss", label: "Tailwind CSS", keywords: "tailwind utilitario" },
      { slug: "bootstrap", label: "Bootstrap" },
      { slug: "styledcomponents", label: "styled-components", keywords: "css in js" },
      { slug: "mui", label: "Material UI", keywords: "material design mui" },
      { slug: "chakraui", label: "Chakra UI" },
      { slug: "radixui", label: "Radix UI", keywords: "primitivos acessibilidade" },
      { slug: "shadcnui", label: "shadcn/ui", keywords: "shadcn componentes" },
      { slug: "framer", label: "Framer Motion", keywords: "animacao motion" },
      { slug: "storybook", label: "Storybook", keywords: "componentes documentacao" },
      { slug: "greensock", label: "GSAP", keywords: "animacao greensock" },
      { slug: "threedotjs", label: "Three.js", keywords: "3d webgl" },
    ],
  },
  {
    id: "backend",
    label: "Back-end e APIs",
    icons: [
      { slug: "nodedotjs", label: "Node.js", keywords: "node servidor" },
      { slug: "deno", label: "Deno" },
      { slug: "bun", label: "Bun" },
      { slug: "express", label: "Express", keywords: "expressjs api" },
      { slug: "nestjs", label: "NestJS", keywords: "nest" },
      { slug: "fastify", label: "Fastify" },
      { slug: "hono", label: "Hono" },
      { slug: "adonisjs", label: "AdonisJS" },
      { slug: "django", label: "Django", keywords: "python" },
      { slug: "flask", label: "Flask", keywords: "python" },
      { slug: "fastapi", label: "FastAPI", keywords: "python api" },
      { slug: "laravel", label: "Laravel", keywords: "php" },
      { slug: "rubyonrails", label: "Ruby on Rails", keywords: "rails" },
      { slug: "spring", label: "Spring", keywords: "java boot" },
      // O Simple Icons removeu as marcas registradas da Microsoft, Adobe,
      // Amazon e afins. Quem procura "C#" ou "Azure" cai aqui, que é o mais
      // próximo que ainda existe.
      { slug: "dotnet", label: ".NET", keywords: "dotnet csharp c# microsoft azure" },
      { slug: "phoenixframework", label: "Phoenix", keywords: "elixir" },
      { slug: "graphql", label: "GraphQL", keywords: "api consulta" },
      { slug: "trpc", label: "tRPC", keywords: "api tipada" },
      { slug: "socketdotio", label: "Socket.IO", keywords: "websocket tempo real" },
      { slug: "swagger", label: "Swagger", keywords: "openapi documentacao api" },
      { slug: "jsonwebtokens", label: "JWT", keywords: "token autenticacao" },
    ],
  },
  {
    id: "data",
    label: "Bancos de dados",
    icons: [
      { slug: "postgresql", label: "PostgreSQL", keywords: "postgres banco de dados sql" },
      { slug: "mysql", label: "MySQL", keywords: "banco de dados sql" },
      { slug: "mariadb", label: "MariaDB", keywords: "banco de dados sql" },
      { slug: "sqlite", label: "SQLite", keywords: "banco de dados sql" },
      { slug: "mongodb", label: "MongoDB", keywords: "banco de dados nosql" },
      { slug: "redis", label: "Redis", keywords: "cache chave valor" },
      { slug: "supabase", label: "Supabase", keywords: "banco de dados postgres" },
      { slug: "firebase", label: "Firebase", keywords: "google banco de dados" },
      { slug: "prisma", label: "Prisma", keywords: "orm banco de dados" },
      { slug: "drizzle", label: "Drizzle ORM", keywords: "orm banco de dados" },
      { slug: "sequelize", label: "Sequelize", keywords: "orm" },
      { slug: "elasticsearch", label: "Elasticsearch", keywords: "busca indice" },
      { slug: "clickhouse", label: "ClickHouse", keywords: "analitico" },
      { slug: "neo4j", label: "Neo4j", keywords: "grafo" },
      { slug: "apachekafka", label: "Kafka", keywords: "fila mensageria eventos" },
      { slug: "rabbitmq", label: "RabbitMQ", keywords: "fila mensageria" },
    ],
  },
  {
    id: "cloud",
    label: "Cloud e DevOps",
    icons: [
      { slug: "docker", label: "Docker", keywords: "conteiner container imagem" },
      { slug: "kubernetes", label: "Kubernetes", keywords: "k8s orquestracao conteiner" },
      { slug: "googlecloud", label: "Google Cloud", keywords: "gcp nuvem cloud" },
      { slug: "vercel", label: "Vercel", keywords: "deploy hospedagem" },
      { slug: "netlify", label: "Netlify", keywords: "deploy hospedagem" },
      { slug: "cloudflare", label: "Cloudflare", keywords: "cdn dns" },
      { slug: "digitalocean", label: "DigitalOcean", keywords: "vps servidor" },
      { slug: "hostinger", label: "Hostinger", keywords: "vps hospedagem" },
      { slug: "nginx", label: "Nginx", keywords: "servidor proxy" },
      { slug: "traefikproxy", label: "Traefik", keywords: "proxy reverso" },
      { slug: "githubactions", label: "GitHub Actions", keywords: "ci cd pipeline" },
      { slug: "gitlab", label: "GitLab", keywords: "ci cd repositorio" },
      { slug: "jenkins", label: "Jenkins", keywords: "ci cd" },
      { slug: "terraform", label: "Terraform", keywords: "infraestrutura iac" },
      { slug: "ansible", label: "Ansible", keywords: "automacao infraestrutura" },
      { slug: "grafana", label: "Grafana", keywords: "monitoramento dashboard" },
      { slug: "prometheus", label: "Prometheus", keywords: "monitoramento metricas" },
      { slug: "sentry", label: "Sentry", keywords: "erros monitoramento" },
      { slug: "linux", label: "Linux", keywords: "pinguim so" },
      { slug: "ubuntu", label: "Ubuntu", keywords: "linux so" },
      { slug: "debian", label: "Debian", keywords: "linux so" },
      { slug: "archlinux", label: "Arch Linux", keywords: "linux so" },
      { slug: "cloudinary", label: "Cloudinary", keywords: "imagens midia cdn" },
    ],
  },
  {
    id: "mobile",
    label: "Mobile",
    icons: [
      { slug: "flutter", label: "Flutter", keywords: "dart app celular" },
      { slug: "expo", label: "Expo", keywords: "react native app celular" },
      { slug: "android", label: "Android", keywords: "app celular google" },
      { slug: "androidstudio", label: "Android Studio", keywords: "ide app celular" },
      { slug: "apple", label: "Apple", keywords: "ios mac app celular" },
      { slug: "xcode", label: "Xcode", keywords: "ios ide apple" },
      { slug: "ionic", label: "Ionic", keywords: "hibrido app celular" },
      { slug: "capacitor", label: "Capacitor", keywords: "hibrido app celular" },
      { slug: "pwa", label: "PWA", keywords: "progressive web app offline" },
    ],
  },
  {
    id: "tools",
    label: "Ferramentas",
    icons: [
      { slug: "git", label: "Git", keywords: "versionamento controle" },
      { slug: "github", label: "GitHub", keywords: "repositorio versionamento" },
      { slug: "bitbucket", label: "Bitbucket", keywords: "repositorio" },
      { slug: "jetbrains", label: "JetBrains", keywords: "ide" },
      { slug: "intellijidea", label: "IntelliJ IDEA", keywords: "ide java" },
      { slug: "webstorm", label: "WebStorm", keywords: "ide" },
      { slug: "neovim", label: "Neovim", keywords: "vim editor terminal" },
      { slug: "postman", label: "Postman", keywords: "api teste requisicao" },
      { slug: "insomnia", label: "Insomnia", keywords: "api teste requisicao" },
      { slug: "npm", label: "npm", keywords: "pacote gerenciador" },
      { slug: "pnpm", label: "pnpm", keywords: "pacote gerenciador" },
      { slug: "yarn", label: "Yarn", keywords: "pacote gerenciador" },
      { slug: "turborepo", label: "Turborepo", keywords: "monorepo build" },
      { slug: "eslint", label: "ESLint", keywords: "lint qualidade" },
      { slug: "prettier", label: "Prettier", keywords: "formatacao" },
      { slug: "jest", label: "Jest", keywords: "teste unitario" },
      { slug: "vitest", label: "Vitest", keywords: "teste unitario" },
      { slug: "cypress", label: "Cypress", keywords: "teste e2e" },
      { slug: "testinglibrary", label: "Testing Library", keywords: "teste" },
      { slug: "jira", label: "Jira", keywords: "tarefas gestao" },
      { slug: "linear", label: "Linear", keywords: "tarefas gestao" },
      { slug: "notion", label: "Notion", keywords: "documentacao notas" },
      { slug: "discord", label: "Discord", keywords: "comunicacao comunidade" },
      { slug: "trello", label: "Trello", keywords: "kanban tarefas" },
    ],
  },
  {
    id: "design",
    label: "Design",
    icons: [
      { slug: "figma", label: "Figma", keywords: "design prototipo interface" },
      { slug: "blender", label: "Blender", keywords: "3d modelagem" },
      { slug: "sketch", label: "Sketch", keywords: "design interface" },
    ],
  },
  {
    id: "ai",
    label: "IA e dados",
    icons: [
      { slug: "anthropic", label: "Anthropic", keywords: "ia claude" },
      { slug: "claude", label: "Claude", keywords: "ia anthropic" },
      { slug: "googlegemini", label: "Gemini", keywords: "ia google" },
      { slug: "huggingface", label: "Hugging Face", keywords: "ia modelos" },
      { slug: "langchain", label: "LangChain", keywords: "ia agentes" },
      { slug: "ollama", label: "Ollama", keywords: "ia modelo local" },
      { slug: "tensorflow", label: "TensorFlow", keywords: "ia aprendizado de maquina" },
      { slug: "pytorch", label: "PyTorch", keywords: "ia aprendizado de maquina" },
      { slug: "scikitlearn", label: "scikit-learn", keywords: "ia dados" },
      { slug: "pandas", label: "pandas", keywords: "dados python analise" },
      { slug: "numpy", label: "NumPy", keywords: "dados python calculo" },
      { slug: "jupyter", label: "Jupyter", keywords: "notebook dados" },
      { slug: "n8n", label: "n8n", keywords: "automacao fluxo" },
    ],
  },
  {
    id: "platforms",
    label: "Plataformas e serviços",
    icons: [
      { slug: "wordpress", label: "WordPress", keywords: "cms site blog" },
      { slug: "strapi", label: "Strapi", keywords: "cms headless" },
      { slug: "sanity", label: "Sanity", keywords: "cms headless" },
      { slug: "contentful", label: "Contentful", keywords: "cms headless" },
      { slug: "shopify", label: "Shopify", keywords: "ecommerce loja" },
      { slug: "woocommerce", label: "WooCommerce", keywords: "ecommerce loja wordpress" },
      { slug: "stripe", label: "Stripe", keywords: "pagamento checkout" },
      { slug: "mercadopago", label: "Mercado Pago", keywords: "pagamento pix checkout" },
      { slug: "paypal", label: "PayPal", keywords: "pagamento" },
      { slug: "pix", label: "Pix", keywords: "pagamento banco central" },
      { slug: "resend", label: "Resend", keywords: "email transacional" },
      { slug: "auth0", label: "Auth0", keywords: "autenticacao login" },
      { slug: "clerk", label: "Clerk", keywords: "autenticacao login" },
      { slug: "whatsapp", label: "WhatsApp", keywords: "mensagem chat" },
      { slug: "hubspot", label: "HubSpot", keywords: "crm vendas" },
      { slug: "salesforce", label: "Salesforce", keywords: "crm vendas" },
    ],
  },
];

/** Índice plano, usado para resolver um slug já salvo de volta para o rótulo. */
export const TECH_ICONS_BY_SLUG = new Map(
  TECH_ICON_GROUPS.flatMap((group) =>
    group.icons.map((icon) => [icon.slug, { ...icon, group: group.label }]),
  ),
);

/** SVG colorido servido pelo Simple Icons. */
export function techIconUrl(slug: string) {
  return `https://cdn.simpleicons.org/${encodeURIComponent(slug)}`;
}

/** Remove acentos e caixa para que "conteiner" ache "contêiner". */
export function normalizeSearch(value: string) {
  return value
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .trim();
}

export function searchTechIcons(query: string): TechIconGroup[] {
  const term = normalizeSearch(query);
  if (!term) return TECH_ICON_GROUPS;

  const terms = term.split(/\s+/);

  return TECH_ICON_GROUPS.map((group) => {
    const icons = group.icons.filter((icon) => {
      const haystack = normalizeSearch(
        `${icon.label} ${icon.slug} ${icon.keywords ?? ""} ${group.label}`,
      );
      return terms.every((part) => haystack.includes(part));
    });
    return { ...group, icons };
  }).filter((group) => group.icons.length > 0);
}
