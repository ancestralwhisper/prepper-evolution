import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertNewsletterSchema, linkHealthChecks, linkHealthRuns } from "@shared/schema";
import { z } from "zod";
import { db } from "./db";
import { desc, eq } from "drizzle-orm";
import { runFullLinkCheck, checkProductLink, getLatestHealthForProduct } from "./linkChecker";

const WP_API_URL = "https://wp.prepperevolution.com/wp-json/wp/v2";

const wpCache: Map<string, { data: any; headers: Record<string, string>; timestamp: number }> = new Map();
const WP_CACHE_TTL = 2 * 60 * 1000; // 2 minutes
const WP_STALE_TTL = 60 * 60 * 1000; // 1 hour - serve stale if WP is down

async function fetchFromWP(url: string, retries = 2): Promise<Response | null> {
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const res = await fetch(url, { signal: AbortSignal.timeout(15000) });
      if (res.ok) return res;
      console.error(`WordPress API attempt ${attempt + 1} returned status ${res.status}`);
    } catch (error) {
      console.error(`WordPress API attempt ${attempt + 1} failed:`, error instanceof Error ? error.message : error);
    }
    if (attempt < retries) {
      await new Promise(r => setTimeout(r, 1000 * (attempt + 1)));
    }
  }
  return null;
}

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

      const existing = await storage.getNewsletterSubscriber(parsed.email);
      if (!existing) {
        await storage.subscribeNewsletter(parsed);
      }

      const kitApiKey = process.env.KIT_API_KEY;
      if (kitApiKey) {
        try {
          const kitRes = await fetch("https://api.kit.com/v4/subscribers", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "X-Kit-Api-Key": kitApiKey,
            },
            body: JSON.stringify({ email_address: parsed.email }),
          });

          if (!kitRes.ok) {
            const kitError = await kitRes.json().catch(() => ({}));
            console.error("Kit API error:", kitRes.status, kitError);
          } else {
            console.log("Kit subscriber added:", parsed.email);
          }
        } catch (kitErr) {
          console.error("Kit API request failed:", kitErr);
        }
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

  // --- WordPress API Proxy (with caching + retry) ---
  app.get("/api/wp/posts", async (req, res) => {
    try {
      const { page = "1", per_page = "10", categories, slug, search } = req.query;
      let url = `${WP_API_URL}/posts?_embed&per_page=${per_page}&page=${page}&status=publish&orderby=date&order=desc`;
      if (categories) url += `&categories=${categories}`;
      if (slug) url += `&slug=${slug}`;
      if (search) url += `&search=${encodeURIComponent(String(search))}`;

      const cacheKey = `posts:${url}`;
      const cached = wpCache.get(cacheKey);
      const now = Date.now();

      if (cached && (now - cached.timestamp) < WP_CACHE_TTL) {
        res.set("x-wp-totalpages", cached.headers["x-wp-totalpages"] || "1");
        res.set("x-wp-total", cached.headers["x-wp-total"] || "0");
        return res.json(cached.data);
      }

      const wpRes = await fetchFromWP(url);

      if (wpRes) {
        const contentType = wpRes.headers.get("content-type") || "";
        if (contentType.includes("application/json")) {
          const totalPages = wpRes.headers.get("x-wp-totalpages") || "1";
          const total = wpRes.headers.get("x-wp-total") || "0";
          const posts = await wpRes.json();

          if (Array.isArray(posts) && posts.length > 0) {
            wpCache.set(cacheKey, {
              data: posts,
              headers: { "x-wp-totalpages": totalPages, "x-wp-total": total },
              timestamp: now,
            });
          }

          res.set("x-wp-totalpages", totalPages);
          res.set("x-wp-total", total);
          return res.json(posts);
        }
      }

      if (cached && (now - cached.timestamp) < WP_STALE_TTL) {
        console.log("WordPress unavailable, serving stale cached posts");
        res.set("x-wp-totalpages", cached.headers["x-wp-totalpages"] || "1");
        res.set("x-wp-total", cached.headers["x-wp-total"] || "0");
        return res.json(cached.data);
      }

      console.error("WordPress API unavailable and no cache available");
      return res.status(503).json({ error: "WordPress temporarily unavailable" });
    } catch (error) {
      console.error("Error proxying WP posts:", error);
      const { page: pg = "1", per_page: pp = "10", categories: cat, slug: sl, search: sr } = req.query;
      let errUrl = `${WP_API_URL}/posts?_embed&per_page=${pp}&page=${pg}&status=publish&orderby=date&order=desc`;
      if (cat) errUrl += `&categories=${cat}`;
      if (sl) errUrl += `&slug=${sl}`;
      if (sr) errUrl += `&search=${encodeURIComponent(String(sr))}`;
      const errCacheKey = `posts:${errUrl}`;
      const errCached = wpCache.get(errCacheKey);
      if (errCached) {
        res.set("x-wp-totalpages", errCached.headers["x-wp-totalpages"] || "1");
        res.set("x-wp-total", errCached.headers["x-wp-total"] || "0");
        return res.json(errCached.data);
      }
      return res.status(503).json({ error: "WordPress temporarily unavailable" });
    }
  });

  app.get("/api/wp/categories", async (_req, res) => {
    try {
      const cacheKey = "categories";
      const cached = wpCache.get(cacheKey);
      const now = Date.now();

      if (cached && (now - cached.timestamp) < WP_CACHE_TTL) {
        return res.json(cached.data);
      }

      const wpRes = await fetchFromWP(`${WP_API_URL}/categories?per_page=100`);

      if (wpRes) {
        const contentType = wpRes.headers.get("content-type") || "";
        if (contentType.includes("application/json")) {
          const categories = await wpRes.json();
          if (Array.isArray(categories) && categories.length > 0) {
            wpCache.set(cacheKey, { data: categories, headers: {}, timestamp: now });
          }
          return res.json(categories);
        }
      }

      if (cached && (now - cached.timestamp) < WP_STALE_TTL) {
        console.log("WordPress unavailable, serving stale cached categories");
        return res.json(cached.data);
      }

      res.json([]);
    } catch (error) {
      console.error("Error proxying WP categories:", error);
      const cached = wpCache.get("categories");
      if (cached) return res.json(cached.data);
      res.json([]);
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
