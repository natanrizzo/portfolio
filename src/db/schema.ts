import { relations } from "drizzle-orm";
import {
  boolean,
  index,
  integer,
  pgEnum,
  pgTable,
  primaryKey,
  text,
  timestamp,
  uniqueIndex,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";

export const projectStatus = pgEnum("project_status", ["draft", "published"]);

/**
 * Single admin user. There is intentionally no signup flow: the row is created
 * by `npm run db:seed` and the password is rotated from the admin UI.
 */
export const adminUsers = pgTable("admin_users", {
  id: uuid("id").primaryKey().defaultRandom(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  name: varchar("name", { length: 120 }).notNull(),
  passwordHash: text("password_hash").notNull(),
  /**
   * Bumped whenever the password changes. Sessions carry this value, so a
   * password rotation invalidates every issued token without a session table.
   */
  sessionVersion: integer("session_version").notNull().default(1),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

/** Single-row table holding the public "about me" content. */
export const profile = pgTable("profile", {
  id: integer("id").primaryKey().default(1),
  headline: varchar("headline", { length: 160 }).notNull(),
  subheadline: varchar("subheadline", { length: 320 }),
  bio: text("bio"),
  avatarPublicId: varchar("avatar_public_id", { length: 255 }),
  resumeUrl: text("resume_url"),
  email: varchar("email", { length: 255 }),
  githubUrl: text("github_url"),
  linkedinUrl: text("linkedin_url"),
  websiteUrl: text("website_url"),
  availableForWork: boolean("available_for_work").notNull().default(false),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const techTags = pgTable(
  "tech_tags",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    name: varchar("name", { length: 60 }).notNull(),
    slug: varchar("slug", { length: 60 }).notNull(),
    /** Simple Icons slug, used to render the brand mark. */
    iconSlug: varchar("icon_slug", { length: 60 }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [uniqueIndex("tech_tags_slug_idx").on(table.slug)],
);

export const projects = pgTable(
  "projects",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    slug: varchar("slug", { length: 140 }).notNull(),
    title: varchar("title", { length: 140 }).notNull(),
    /** Short line used on cards and meta description. */
    summary: varchar("summary", { length: 280 }).notNull(),
    /** Long form Markdown shown on the project detail page. */
    description: text("description"),
    repoUrl: text("repo_url"),
    liveUrl: text("live_url"),
    coverPublicId: varchar("cover_public_id", { length: 255 }),
    coverAlt: varchar("cover_alt", { length: 200 }),
    status: projectStatus("status").notNull().default("draft"),
    featured: boolean("featured").notNull().default(false),
    /** Manual ordering in the public list. Lower comes first. */
    position: integer("position").notNull().default(0),
    year: integer("year"),
    publishedAt: timestamp("published_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    uniqueIndex("projects_slug_idx").on(table.slug),
    index("projects_status_position_idx").on(table.status, table.position),
  ],
);

export const projectImages = pgTable(
  "project_images",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    projectId: uuid("project_id")
      .notNull()
      .references(() => projects.id, { onDelete: "cascade" }),
    publicId: varchar("public_id", { length: 255 }).notNull(),
    alt: varchar("alt", { length: 200 }),
    position: integer("position").notNull().default(0),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [index("project_images_project_idx").on(table.projectId)],
);

export const projectTags = pgTable(
  "project_tags",
  {
    projectId: uuid("project_id")
      .notNull()
      .references(() => projects.id, { onDelete: "cascade" }),
    tagId: uuid("tag_id")
      .notNull()
      .references(() => techTags.id, { onDelete: "cascade" }),
  },
  (table) => [primaryKey({ columns: [table.projectId, table.tagId] })],
);

export const projectsRelations = relations(projects, ({ many }) => ({
  images: many(projectImages),
  tags: many(projectTags),
}));

export const projectImagesRelations = relations(projectImages, ({ one }) => ({
  project: one(projects, {
    fields: [projectImages.projectId],
    references: [projects.id],
  }),
}));

export const techTagsRelations = relations(techTags, ({ many }) => ({
  projects: many(projectTags),
}));

export const projectTagsRelations = relations(projectTags, ({ one }) => ({
  project: one(projects, {
    fields: [projectTags.projectId],
    references: [projects.id],
  }),
  tag: one(techTags, {
    fields: [projectTags.tagId],
    references: [techTags.id],
  }),
}));

export type Project = typeof projects.$inferSelect;
export type NewProject = typeof projects.$inferInsert;
export type ProjectImage = typeof projectImages.$inferSelect;
export type TechTag = typeof techTags.$inferSelect;
export type Profile = typeof profile.$inferSelect;
export type AdminUser = typeof adminUsers.$inferSelect;
