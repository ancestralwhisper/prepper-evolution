import { sql } from "drizzle-orm";
import { pgTable, text, varchar, numeric, serial, timestamp, integer, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const products = pgTable("products", {
  id: serial("id").primaryKey(),
  slug: text("slug").notNull().unique(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  price: numeric("price", { precision: 10, scale: 2 }).notNull(),
  salePrice: numeric("sale_price", { precision: 10, scale: 2 }),
  onSale: boolean("on_sale").notNull().default(false),
  category: text("category").notNull(),
  imageUrl: text("image_url").notNull(),
  amazonLink: text("amazon_link").notNull(),
  features: text("features").array().notNull(),
});

export const comparisons = pgTable("comparisons", {
  id: serial("id").primaryKey(),
  slug: text("slug").notNull().unique(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  productSlugs: text("product_slugs").array().notNull(),
  verdict: text("verdict").notNull(),
});

export const newsletterSubscribers = pgTable("newsletter_subscribers", {
  id: serial("id").primaryKey(),
  email: text("email").notNull().unique(),
  subscribedAt: timestamp("subscribed_at").defaultNow().notNull(),
});

export const linkHealthChecks = pgTable("link_health_checks", {
  id: serial("id").primaryKey(),
  runId: integer("run_id"),
  productId: integer("product_id").notNull(),
  productSlug: text("product_slug").notNull(),
  productName: text("product_name").notNull(),
  url: text("url").notNull(),
  statusCode: integer("status_code"),
  isHealthy: boolean("is_healthy").notNull().default(true),
  errorMessage: text("error_message"),
  checkedAt: timestamp("checked_at").defaultNow().notNull(),
});

export const linkHealthRuns = pgTable("link_health_runs", {
  id: serial("id").primaryKey(),
  totalChecked: integer("total_checked").notNull().default(0),
  totalBroken: integer("total_broken").notNull().default(0),
  totalHealthy: integer("total_healthy").notNull().default(0),
  completedAt: timestamp("completed_at").defaultNow().notNull(),
});

export const insertProductSchema = createInsertSchema(products).omit({ id: true });
export const insertComparisonSchema = createInsertSchema(comparisons).omit({ id: true });
export const insertNewsletterSchema = createInsertSchema(newsletterSubscribers).omit({ id: true, subscribedAt: true });

export type InsertProduct = z.infer<typeof insertProductSchema>;
export type Product = typeof products.$inferSelect;
export type InsertComparison = z.infer<typeof insertComparisonSchema>;
export type Comparison = typeof comparisons.$inferSelect;
export type InsertNewsletter = z.infer<typeof insertNewsletterSchema>;
export type NewsletterSubscriber = typeof newsletterSubscribers.$inferSelect;
export type LinkHealthCheck = typeof linkHealthChecks.$inferSelect;
export type LinkHealthRun = typeof linkHealthRuns.$inferSelect;
