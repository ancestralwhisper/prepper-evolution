import { eq } from "drizzle-orm";
import { db } from "./db";
import {
  products, comparisons, newsletterSubscribers,
  type Product, type InsertProduct,
  type Comparison, type InsertComparison,
  type NewsletterSubscriber, type InsertNewsletter,
} from "@shared/schema";

export interface IStorage {
  getProducts(): Promise<Product[]>;
  getProductBySlug(slug: string): Promise<Product | undefined>;
  getProductsByCategory(category: string): Promise<Product[]>;
  insertProduct(product: InsertProduct): Promise<Product>;

  getComparisons(): Promise<Comparison[]>;
  getComparisonBySlug(slug: string): Promise<Comparison | undefined>;
  insertComparison(comparison: InsertComparison): Promise<Comparison>;

  subscribeNewsletter(data: InsertNewsletter): Promise<NewsletterSubscriber>;
  getNewsletterSubscriber(email: string): Promise<NewsletterSubscriber | undefined>;
}

export class DatabaseStorage implements IStorage {
  async getProducts(): Promise<Product[]> {
    return db.select().from(products);
  }

  async getProductBySlug(slug: string): Promise<Product | undefined> {
    const [product] = await db.select().from(products).where(eq(products.slug, slug));
    return product;
  }

  async getProductsByCategory(category: string): Promise<Product[]> {
    return db.select().from(products).where(eq(products.category, category));
  }

  async insertProduct(product: InsertProduct): Promise<Product> {
    const [inserted] = await db.insert(products).values(product).returning();
    return inserted;
  }

  async getComparisons(): Promise<Comparison[]> {
    return db.select().from(comparisons);
  }

  async getComparisonBySlug(slug: string): Promise<Comparison | undefined> {
    const [comparison] = await db.select().from(comparisons).where(eq(comparisons.slug, slug));
    return comparison;
  }

  async insertComparison(comparison: InsertComparison): Promise<Comparison> {
    const [inserted] = await db.insert(comparisons).values(comparison).returning();
    return inserted;
  }

  async subscribeNewsletter(data: InsertNewsletter): Promise<NewsletterSubscriber> {
    const [subscriber] = await db.insert(newsletterSubscribers).values(data).returning();
    return subscriber;
  }

  async getNewsletterSubscriber(email: string): Promise<NewsletterSubscriber | undefined> {
    const [subscriber] = await db.select().from(newsletterSubscribers).where(eq(newsletterSubscribers.email, email));
    return subscriber;
  }
}

export const storage = new DatabaseStorage();
