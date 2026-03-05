import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertNewsletterSchema, linkHealthChecks, linkHealthRuns, gearRequests, gearTracking } from "@shared/schema";
import { z } from "zod";
import { db } from "./db";
import { desc, eq } from "drizzle-orm";
import { runFullLinkCheck, checkProductLink, getLatestHealthForProduct } from "./linkChecker";
import { handleTrailIntel } from "./trail-intel";

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

  // --- WordPress category slug redirects (social media links use /category/slug format) ---
  const wpCategories = [
    "gear", "preparedness", "bags-packs", "communication", "overlanding",
    "water", "water-filters", "food-storage", "first-aid", "security",
    "financial", "skills", "wilderness", "campsite-skills", "getting-started",
    "knives-tools", "electronics", "recovery-gear", "rooftop-tents",
    "fridges-coolers", "power-stations", "stoves-cooking", "vehicle-builds",
    "overland-expo", "camping", "car-camping", "backpacking", "cold-weather",
    "urban-survival", "uncategorized",
  ];

  for (const category of wpCategories) {
    app.get(`/${category}/*slug`, (req, res) => {
      const slug = req.params.slug;
      res.redirect(301, `/articles/${slug}`);
    });
  }

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

  // --- Telegram Notification Helper ---
  async function sendTelegramNotification(text: string) {
    const token = process.env.TOOL_REQUEST_BOT_TOKEN;
    const chatId = process.env.TOOL_REQUEST_CHAT_ID;
    if (!token || !chatId) return;
    try {
      await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ chat_id: chatId, text, parse_mode: "HTML" }),
      });
    } catch (err) {
      console.error("Telegram notification failed:", err);
    }
  }

  // --- Gear Request & Tracking ---
  app.post("/api/gear-requests", async (req, res) => {
    try {
      const schema = z.object({
        name: z.string().min(2).max(100),
        brand: z.string().max(50).optional(),
        weightOz: z.number().min(0.1).max(10000).optional(),
        category: z.string().min(1),
        amazonUrl: z.string().max(200).optional(),
        source: z.string().max(50).optional(),
      });
      const parsed = schema.parse(req.body);
      await db.insert(gearRequests).values({
        name: parsed.name,
        brand: parsed.brand || null,
        weightOz: parsed.weightOz?.toString() || null,
        category: parsed.category,
        amazonUrl: parsed.amazonUrl || null,
      });

      const src = parsed.source || "unknown";
      sendTelegramNotification(
        `🔧 <b>New Gear Request</b> [${src}]\n` +
        `Name: ${parsed.name}\n` +
        `Brand: ${parsed.brand || "—"}\n` +
        `Category: ${parsed.category}\n` +
        (parsed.weightOz ? `Weight/Watts: ${parsed.weightOz}\n` : "") +
        (parsed.amazonUrl ? `URL: ${parsed.amazonUrl}` : "")
      );

      res.status(200).json({ message: "Request submitted" });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Invalid request data" });
      }
      console.error("Gear request error:", error);
      res.status(500).json({ error: "Failed to submit request" });
    }
  });

  app.post("/api/gear-tracking", async (req, res) => {
    try {
      const schema = z.object({
        customItems: z.array(z.object({
          name: z.string(),
          weightOz: z.number(),
          category: z.string(),
        })),
        totalItems: z.number(),
        totalLbs: z.number(),
      });
      const parsed = schema.parse(req.body);
      await db.insert(gearTracking).values({
        customItems: JSON.stringify(parsed.customItems),
        totalItems: parsed.totalItems,
        totalLbs: parsed.totalLbs.toString(),
      });
      res.status(200).json({ message: "Tracked" });
    } catch {
      res.status(200).json({ message: "ok" });
    }
  });

  // --- Vehicle Requests ---
  const BLOCKED_WORDS = [
    "dick","dicks","fuck","shit","ass","bitch","cock","pussy","cunt",
    "nigger","faggot","retard","whore","slut","bastard","damn","piss",
    "dildo","vibrator","porn","xxx","anal","penis","vagina","boob",
    "viagra","cialis","casino","crypto","nft","onlyfans",
  ];
  const BLOCKED_PATTERNS = [/(.)\1{4,}/i, /https?:\/\//i, /\b\d{10,}\b/];
  function containsBlockedContent(text: string): boolean {
    const lower = text.toLowerCase().replace(/[^a-z\s]/g, "");
    if (BLOCKED_WORDS.some((w) => lower.includes(w))) return true;
    return BLOCKED_PATTERNS.some((p) => p.test(text));
  }
  function sanitize(str: string): string {
    return str.replace(/[<>]/g, "").replace(/javascript:/gi, "").trim().slice(0, 200);
  }
  const vehicleRateMap = new Map<string, { count: number; resetAt: number }>();
  function isVehicleRateLimited(ip: string): boolean {
    const now = Date.now();
    const entry = vehicleRateMap.get(ip);
    if (!entry || now > entry.resetAt) {
      vehicleRateMap.set(ip, { count: 1, resetAt: now + 3600000 });
      return false;
    }
    entry.count++;
    return entry.count > 5;
  }

  app.post("/api/vehicle-requests", async (req, res) => {
    try {
      const ip = (req.headers["x-forwarded-for"] as string)?.split(",")[0]?.trim() || "unknown";
      if (isVehicleRateLimited(ip)) {
        return res.status(429).json({ error: "Too many requests. Try again later." });
      }

      const make = sanitize(String(req.body.make || ""));
      const model = sanitize(String(req.body.model || ""));
      const year = sanitize(String(req.body.year || ""));
      const trim = req.body.trim ? sanitize(String(req.body.trim)) : undefined;
      const bodyType = req.body.bodyType ? sanitize(String(req.body.bodyType)) : undefined;
      const notes = req.body.notes ? sanitize(String(req.body.notes)) : undefined;
      const email = req.body.email ? sanitize(String(req.body.email)) : undefined;
      const source = req.body.source ? sanitize(String(req.body.source)) : undefined;

      if (!make || make.length < 2) return res.status(400).json({ error: "Make is required (min 2 characters)" });
      if (!model || model.length < 2) return res.status(400).json({ error: "Model is required (min 2 characters)" });
      if (!year || year.length < 4) return res.status(400).json({ error: "Year is required" });

      const allText = [make, model, year, trim, bodyType, notes].filter(Boolean).join(" ");
      if (containsBlockedContent(allText)) return res.status(400).json({ error: "Invalid content detected" });

      const request = { make, model, year, trim, bodyType, notes, email, source };
      console.log("[vehicle-request] New submission:", JSON.stringify(request));

      const sourceLabel = source === "rigrated" ? "RigRated UTV Builder" :
        source === "rigsafe" ? "RigSafe Configurator" :
        source === "vehicle-profile" ? "Vehicle Profile" : source || "Ops Deck";
      const botToken = process.env.TOOL_REQUEST_BOT_TOKEN || process.env.TELEGRAM_BOT_TOKEN;
      const chatId = process.env.TOOL_REQUEST_CHAT_ID || process.env.TELEGRAM_ADMIN_CHAT_ID;
      if (botToken && chatId) {
        const message = [
          `🚗 *New Vehicle Request*`, ``,
          `*Source:* ${sourceLabel}`, `*Make:* ${make}`, `*Model:* ${model}`, `*Year:* ${year}`,
          trim ? `*Trim:* ${trim}` : null, bodyType ? `*Body Type:* ${bodyType}` : null,
          notes ? `*Notes:* ${notes}` : null, email ? `*Email:* ${email}` : null,
          ``, `_Submitted ${new Date().toLocaleString("en-US", { timeZone: "America/New_York" })}_`,
        ].filter(Boolean).join("\n");
        try {
          await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ chat_id: chatId, text: message, parse_mode: "Markdown" }),
          });
        } catch (err) {
          console.error("[vehicle-request] Telegram failed:", err);
        }
      }

      res.json({ success: true, message: "Thanks! Your vehicle request has been submitted. We'll review it and add it to the database." });
    } catch (error) {
      console.error("[vehicle-request] Error:", error);
      res.status(500).json({ error: "Failed to submit request" });
    }
  });

  // --- Community Builds ---
  app.get("/api/community-builds", async (_req, res) => {
    try {
      const fs = await import("fs/promises");
      const path = await import("path");
      const filePath = path.join(process.cwd(), "server", "data", "community-builds.json");
      const raw = await fs.readFile(filePath, "utf-8");
      const builds = JSON.parse(raw);
      const approved = builds.filter((b: any) => b.status === "approved");
      res.json(approved);
    } catch (error) {
      console.error("Error reading community builds:", error);
      res.json([]);
    }
  });

  const profanityWords = ["fuck", "shit", "ass", "bitch", "damn", "cunt", "dick", "cock", "pussy", "nigger", "faggot", "retard"];

  function hasProfanity(text: string): boolean {
    const lower = text.toLowerCase();
    return profanityWords.some((word) => lower.includes(word));
  }

  app.post("/api/community-builds", async (req, res) => {
    try {
      const schema = z.object({
        nickname: z.string().min(2).max(30),
        buildType: z.enum(["bob", "solar", "water", "food", "kit"]),
        title: z.string().min(3).max(100),
        description: z.string().min(10).max(500),
        tags: z.array(z.string().max(30)).max(5).optional(),
        data: z.record(z.any()),
      });

      const parsed = schema.parse(req.body);

      if (hasProfanity(parsed.nickname) || hasProfanity(parsed.title) || hasProfanity(parsed.description)) {
        return res.status(400).json({ error: "Please keep it clean — no profanity." });
      }

      const fs = await import("fs/promises");
      const path = await import("path");
      const filePath = path.join(process.cwd(), "server", "data", "community-builds.json");
      const raw = await fs.readFile(filePath, "utf-8");
      const builds = JSON.parse(raw);

      const newBuild = {
        id: `build_${Date.now()}`,
        nickname: parsed.nickname,
        buildType: parsed.buildType,
        title: parsed.title,
        description: parsed.description,
        tags: parsed.tags || [],
        data: parsed.data,
        likes: 0,
        status: "pending",
        createdAt: new Date().toISOString(),
      };

      builds.push(newBuild);
      await fs.writeFile(filePath, JSON.stringify(builds, null, 2));

      sendTelegramNotification(
        `🏗️ <b>New Community Build</b>\n` +
        `By: ${parsed.nickname}\n` +
        `Type: ${parsed.buildType}\n` +
        `Title: ${parsed.title}\n` +
        `Description: ${parsed.description.slice(0, 200)}${parsed.description.length > 200 ? "..." : ""}`
      );

      res.status(200).json({ message: "Build submitted for review!" });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Invalid build data" });
      }
      console.error("Community build error:", error);
      res.status(500).json({ error: "Failed to submit build" });
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

  app.get("/api/trail-intel", async (req, res) => {
    try {
      await handleTrailIntel(req, res);
    } catch (error) {
      console.error("Trail Intel error:", error);
      res.status(500).json({ error: "Internal server error" });
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
