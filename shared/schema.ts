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

export const gearRequests = pgTable("gear_requests", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  brand: text("brand"),
  weightOz: numeric("weight_oz", { precision: 8, scale: 1 }),
  category: text("category").notNull(),
  amazonUrl: text("amazon_url"),
  status: text("status").notNull().default("pending"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const gearTracking = pgTable("gear_tracking", {
  id: serial("id").primaryKey(),
  customItems: text("custom_items").notNull(),
  totalItems: integer("total_items").notNull(),
  totalLbs: numeric("total_lbs", { precision: 8, scale: 1 }).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const rttFitmentSubmissions = pgTable("rtt_fitment_submissions", {
  id: serial("id").primaryKey(),
  // Rack
  rackBrand: text("rack_brand").notNull(),
  rackModel: text("rack_model").notNull(),
  // RTT
  rttBrand: text("rtt_brand").notNull(),
  rttModel: text("rtt_model").notNull(),
  // Vehicle (optional but important context)
  vehicleYear: integer("vehicle_year"),
  vehicleMake: text("vehicle_make"),
  vehicleModel: text("vehicle_model"),
  vehiclePackage: text("vehicle_package"),
  // Measurements (decimal inches stored as numeric)
  crossbarRise: numeric("crossbar_rise", { precision: 6, scale: 4 }).notNull(),
  hasSpine: boolean("has_spine").notNull().default(false),
  spineHeight: numeric("spine_height", { precision: 6, scale: 4 }),
  mountFootThickness: numeric("mount_foot_thickness", { precision: 6, scale: 4 }).notNull(),
  // Result
  riserUsed: numeric("riser_used", { precision: 6, scale: 4 }),
  outcome: text("outcome").notNull(), // "sealed" | "marginal" | "no-fix"
  // Community
  notes: text("notes"),
  facebookUsername: text("facebook_username"),
  // Moderation
  status: text("status").notNull().default("pending"),
  verifiedCount: integer("verified_count").notNull().default(1),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  approvedAt: timestamp("approved_at"),
});

export const insertRttFitmentSchema = createInsertSchema(rttFitmentSubmissions).omit({
  id: true, status: true, verifiedCount: true, createdAt: true, approvedAt: true,
});
export type RttFitmentSubmission = typeof rttFitmentSubmissions.$inferSelect;
export type InsertRttFitment = z.infer<typeof insertRttFitmentSchema>;

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
