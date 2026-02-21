import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertNewsletterSchema } from "@shared/schema";
import { z } from "zod";

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
      const existing = await storage.getNewsletterSubscriber(parsed.email);
      if (existing) {
        return res.status(200).json({ message: "Already subscribed", subscriber: existing });
      }
      const subscriber = await storage.subscribeNewsletter(parsed);
      res.status(201).json({ message: "Successfully subscribed", subscriber });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid email address" });
      }
      console.error("Error subscribing:", error);
      res.status(500).json({ message: "Failed to subscribe" });
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

  return httpServer;
}
