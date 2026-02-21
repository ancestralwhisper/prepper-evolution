import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertNewsletterSchema, linkHealthChecks, linkHealthRuns } from "@shared/schema";
import { z } from "zod";
import { db } from "./db";
import { desc, eq } from "drizzle-orm";
import { runFullLinkCheck, checkProductLink, getLatestHealthForProduct } from "./linkChecker";

const WP_API_URL = "https://prepperevolution.com/wp-json/wp/v2";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {

  // --- Products ---
  app.get("/api/products", async (_req, res) => {
    try {
      const products = await storage.getProducts();
      res.json(products);
    } catch (error) {
      console.error("Error fetching products:", error);
      res.status(500).json({ message: "Failed to fetch products" });
    }
  });

  app.get("/api/products/:slug", async (req, res) => {
    try {
      const product = await storage.getProductBySlug(req.params.slug);
      if (!product) return res.status(404).json({ message: "Product not found" });
      res.json(product);
    } catch (error) {
      console.error("Error fetching product:", error);
      res.status(500).json({ message: "Failed to fetch product" });
    }
  });

  // --- Comparisons ---
  app.get("/api/comparisons", async (_req, res) => {
    try {
      const comparisons = await storage.getComparisons();
      res.json(comparisons);
    } catch (error) {
      console.error("Error fetching comparisons:", error);
      res.status(500).json({ message: "Failed to fetch comparisons" });
    }
  });

  app.get("/api/comparisons/:slug", async (req, res) => {
    try {
      const comparison = await storage.getComparisonBySlug(req.params.slug);
      if (!comparison) return res.status(404).json({ message: "Comparison not found" });
      res.json(comparison);
    } catch (error) {
      console.error("Error fetching comparison:", error);
      res.status(500).json({ message: "Failed to fetch comparison" });
    }
  });

  // --- Newsletter ---
  app.post("/api/newsletter", async (req, res) => {
    try {
      const parsed = insertNewsletterSchema.parse(req.body);

      const kitApiKey = process.env.KIT_API_KEY;
      if (kitApiKey) {
        const kitRes = await fetch("https://api.kit.com/v4/subscribers", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${kitApiKey}`,
          },
          body: JSON.stringify({ email_address: parsed.email }),
        });

        if (!kitRes.ok) {
          const kitError = await kitRes.json().catch(() => ({}));
          console.error("Kit API error:", kitRes.status, kitError);
          return res.status(400).json({ message: "Something went wrong. Try again or check your email address." });
        }
      }

      const existing = await storage.getNewsletterSubscriber(parsed.email);
      if (!existing) {
        await storage.subscribeNewsletter(parsed);
      }

      res.status(200).json({ message: "You're in! Check your inbox for your first briefing." });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Something went wrong. Try again or check your email address." });
      }
      console.error("Error subscribing:", error);
      res.status(500).json({ message: "Something went wrong. Try again or check your email address." });
    }
  });

  // --- WordPress API Proxy ---
  app.get("/api/wp/posts", async (req, res) => {
    try {
      const { page = "1", per_page = "10", categories, slug } = req.query;
      let url = `${WP_API_URL}/posts?_embed&per_page=${per_page}&page=${page}&status=publish&orderby=date&order=desc`;
      if (categories) url += `&categories=${categories}`;
      if (slug) url += `&slug=${slug}`;

      const wpRes = await fetch(url);
      if (!wpRes.ok) {
        return res.status(wpRes.status).json({ message: "WordPress API error" });
      }

      const totalPages = wpRes.headers.get("x-wp-totalpages") || "1";
      const total = wpRes.headers.get("x-wp-total") || "0";
      const posts = await wpRes.json();

      res.set("x-wp-totalpages", totalPages);
      res.set("x-wp-total", total);
      res.json(posts);
    } catch (error) {
      console.error("Error proxying WP posts:", error);
      res.status(500).json({ message: "Failed to fetch posts" });
    }
  });

  app.get("/api/wp/categories", async (_req, res) => {
    try {
      const wpRes = await fetch(`${WP_API_URL}/categories?per_page=100`);
      if (!wpRes.ok) {
        return res.status(wpRes.status).json({ message: "WordPress API error" });
      }
      const categories = await wpRes.json();
      res.json(categories);
    } catch (error) {
      console.error("Error proxying WP categories:", error);
      res.status(500).json({ message: "Failed to fetch categories" });
    }
  });

  // --- Link Health ---
  app.get("/api/link-health", async (_req, res) => {
    try {
      const [latestRun] = await db.select().from(linkHealthRuns).orderBy(desc(linkHealthRuns.completedAt)).limit(1);
      
      if (!latestRun) {
        return res.json({ lastRun: null, checks: [] });
      }

      const checks = await db
        .select()
        .from(linkHealthChecks)
        .where(eq(linkHealthChecks.runId, latestRun.id))
        .orderBy(linkHealthChecks.productName);

      res.json({ lastRun: latestRun, checks });
    } catch (error) {
      console.error("Error fetching link health:", error);
      res.status(500).json({ message: "Failed to fetch link health data" });
    }
  });

  app.post("/api/link-health/run", async (_req, res) => {
    try {
      res.json({ message: "Link check started" });
      runFullLinkCheck().catch(err => console.error("Manual link check failed:", err));
    } catch (error) {
      console.error("Error starting link check:", error);
      res.status(500).json({ message: "Failed to start link check" });
    }
  });

  app.get("/api/link-health/check/:slug", async (req, res) => {
    try {
      const result = await checkProductLink(req.params.slug);
      res.json(result);
    } catch (error) {
      console.error("Error checking product link:", error);
      res.status(500).json({ message: "Failed to check link" });
    }
  });

  app.get("/api/link-health/product/:slug", async (req, res) => {
    try {
      const isHealthy = await getLatestHealthForProduct(req.params.slug);
      res.json({ isHealthy });
    } catch (error) {
      console.error("Error getting product health:", error);
      res.json({ isHealthy: true });
    }
  });

  return httpServer;
}
