import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertNewsletterSchema, linkHealthChecks, linkHealthRuns, gearRequests, gearTracking, rttFitmentSubmissions } from "@shared/schema";
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

  // --- WordPress /category/slug redirects → /articles?category=slug ---
  app.get('/category/:slug', (req, res) => {
    const catMap: Record<string, string> = {
      overlanding: 'overlanding',
      camping: 'camping',
      gear: 'gear-reviews',
      preparedness: 'skills-strategy',
      'bags-packs': 'skills-strategy',
      communication: 'communication',
      water: 'water-food',
      'water-filters': 'water-food',
      'food-storage': 'water-food',
      'first-aid': 'first-aid',
      security: 'security',
    };
    const mapped = catMap[req.params.slug];
    if (mapped) {
      res.redirect(301, `/articles?category=${mapped}`);
    } else {
      res.redirect(301, '/articles');
    }
  });

  // --- Legacy URL redirects (fix GSC 404s and soft 404s) ---
  const legacyRedirects: Record<string, string> = {
    "/best-rooftop-tents": "/articles/best-rooftop-tents-compared-2026",
    "/best-of": "/articles/best-rooftop-tents-compared-2026",
    "/how-to-start-fire": "/articles/fire-starting-guide-matches-to-bow-drill",
    "/power-calculator": "/tools/solar-power-calculator",
    "/ecoflow-delta-2-max-review": "/articles/best-portable-power-stations-2026",
    "/emergency-communication-grid-down": "/articles/emergency-communication-grid-down",
    "/articles/emergency-communication-grid-down": "/articles/best-emergency-communication-devices",
    "/products/ecoflow-delta-2-max": "/products/ecoflow-delta-3-ultra",
    "/articles/battle-of-the-off-grid-beacons-why-the-devos-lightranger-4000-beats-the-goal-zero-skylight-for-real-world-use": "/articles/best-portable-lighting-camping-2026",
  };

  for (const [oldPath, newPath] of Object.entries(legacyRedirects)) {
    app.get(oldPath, (_req, res) => {
      res.redirect(301, newPath);
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

  // --- VIN Miss Notification ---
  // Called when a VIN decodes successfully via NHTSA but the vehicle isn't in the PE database.
  // Sends a Telegram alert so the vehicle can be evaluated for addition.
  app.post("/api/vin-miss", async (req, res) => {
    try {
      const vin  = sanitize(String(req.body.vin  || "")).toUpperCase().slice(0, 17);
      const make  = sanitize(String(req.body.make  || "")).slice(0, 50);
      const model = sanitize(String(req.body.model || "")).slice(0, 80);
      const year  = parseInt(req.body.year) || 0;

      if (!vin || vin.length !== 17) return res.status(400).json({ error: "Invalid VIN" });
      if (!make || !model || !year) return res.status(400).json({ error: "Missing decoded data" });

      const ts = new Date().toLocaleString("en-US", { timeZone: "America/New_York" });
      console.log(`[vin-miss] ${year} ${make} ${model} — VIN: ${vin} — ${ts}`);

      const botToken = process.env.TOOL_REQUEST_BOT_TOKEN || process.env.TELEGRAM_BOT_TOKEN;
      const chatId   = process.env.TOOL_REQUEST_CHAT_ID  || process.env.TELEGRAM_ADMIN_CHAT_ID;
      if (botToken && chatId) {
        const message = [
          `🔍 *VIN Not In Database*`, ``,
          `*Vehicle:* ${year} ${make} ${model}`,
          `*VIN:* \`${vin}\``,
          ``, `_${ts}_`,
        ].join("\n");
        try {
          await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ chat_id: chatId, text: message, parse_mode: "Markdown" }),
          });
        } catch (err) {
          console.error("[vin-miss] Telegram failed:", err);
        }
      }

      res.json({ success: true });
    } catch (error) {
      console.error("[vin-miss] Error:", error);
      res.status(500).json({ error: "Failed to log VIN miss" });
    }
  });

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

  // --- RTT Fitment Database ---
  const fitmentRateMap = new Map<string, { count: number; resetAt: number }>();
  function isFitmentRateLimited(ip: string): boolean {
    const now = Date.now();
    const entry = fitmentRateMap.get(ip);
    if (!entry || now > entry.resetAt) {
      fitmentRateMap.set(ip, { count: 1, resetAt: now + 86400000 });
      return false;
    }
    entry.count++;
    return entry.count > 3;
  }

  app.get("/api/fitment", async (_req, res) => {
    try {
      const entries = await db.select()
        .from(rttFitmentSubmissions)
        .where(eq(rttFitmentSubmissions.status, "approved"))
        .orderBy(desc(rttFitmentSubmissions.approvedAt));
      res.json(entries);
    } catch (error) {
      console.error("[fitment] fetch error:", error);
      res.status(500).json({ error: "Failed to fetch entries" });
    }
  });

  app.post("/api/fitment", async (req, res) => {
    try {
      const ip = (req.headers["x-forwarded-for"] as string)?.split(",")[0]?.trim() || "unknown";
      if (isFitmentRateLimited(ip)) {
        return res.status(429).json({ error: "Too many submissions today. Try again tomorrow." });
      }

      const schema = z.object({
        rackBrand: z.string().min(2).max(80),
        rackModel: z.string().min(2).max(100),
        rttBrand: z.string().min(2).max(80),
        rttModel: z.string().min(2).max(100),
        vehicleYear: z.number().int().min(1990).max(2030).optional(),
        vehicleMake: z.string().max(60).optional(),
        vehicleModel: z.string().max(80).optional(),
        vehiclePackage: z.string().max(60).optional(),
        crossbarRise: z.number().min(0).max(2.0),
        hasSpine: z.boolean(),
        spineHeight: z.number().min(0).max(0.5).optional(),
        mountFootThickness: z.number().min(0.1).max(4.0),
        riserUsed: z.number().min(0).max(6.0).optional(),
        outcome: z.enum(["sealed", "marginal", "no-fix"]),
        notes: z.string().max(500).optional(),
        facebookUsername: z.string().max(100).optional(),
      });

      const parsed = schema.parse(req.body);
      const allText = [parsed.rackBrand, parsed.rackModel, parsed.rttBrand, parsed.rttModel, parsed.vehicleMake, parsed.vehicleModel, parsed.vehiclePackage, parsed.notes, parsed.facebookUsername].filter(Boolean).join(" ");
      if (containsBlockedContent(allText)) {
        return res.status(400).json({ error: "Invalid content detected" });
      }

      await db.insert(rttFitmentSubmissions).values({
        rackBrand: sanitize(parsed.rackBrand),
        rackModel: sanitize(parsed.rackModel),
        rttBrand: sanitize(parsed.rttBrand),
        rttModel: sanitize(parsed.rttModel),
        vehicleYear: parsed.vehicleYear ?? null,
        vehicleMake: parsed.vehicleMake ? sanitize(parsed.vehicleMake) : null,
        vehicleModel: parsed.vehicleModel ? sanitize(parsed.vehicleModel) : null,
        vehiclePackage: parsed.vehiclePackage ? sanitize(parsed.vehiclePackage) : null,
        crossbarRise: parsed.crossbarRise.toString(),
        hasSpine: parsed.hasSpine,
        spineHeight: parsed.hasSpine && parsed.spineHeight != null ? parsed.spineHeight.toString() : null,
        mountFootThickness: parsed.mountFootThickness.toString(),
        riserUsed: parsed.riserUsed != null ? parsed.riserUsed.toString() : null,
        outcome: parsed.outcome,
        notes: parsed.notes ? parsed.notes.replace(/[<>]/g, "").replace(/javascript:/gi, "").trim().slice(0, 750) : null,
        facebookUsername: parsed.facebookUsername ? sanitize(parsed.facebookUsername) : null,
      });

      const outcomeEmoji = parsed.outcome === "sealed" ? "✅" : parsed.outcome === "marginal" ? "⚠️" : "❌";
      const vehicleStr = [parsed.vehicleYear, parsed.vehicleMake, parsed.vehicleModel, parsed.vehiclePackage].filter(Boolean).join(" ");
      sendTelegramNotification(
        `🏕️ <b>New RTT Fitment Submission</b>\n` +
        `Rack: ${parsed.rackBrand} ${parsed.rackModel}\n` +
        `RTT: ${parsed.rttBrand} ${parsed.rttModel}\n` +
        (vehicleStr ? `Vehicle: ${vehicleStr}\n` : "") +
        `Crossbar rise: ${parsed.crossbarRise}" | Spine: ${parsed.hasSpine ? (parsed.spineHeight || 0) + '"' : "none"}\n` +
        `Mount foot: ${parsed.mountFootThickness}" | Riser: ${parsed.riserUsed != null ? parsed.riserUsed + '"' : "none"}\n` +
        `${outcomeEmoji} Outcome: ${parsed.outcome}\n` +
        (parsed.notes ? `Notes: ${parsed.notes.slice(0, 200)}\n` : "") +
        (parsed.facebookUsername ? `FB: ${parsed.facebookUsername}\n` : "") +
        `\nReview: prepperevolution.com/admin/fitment`
      );

      res.status(200).json({ message: "Submitted for review. Thanks for contributing!" });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Invalid submission data" });
      }
      console.error("[fitment] submit error:", error);
      res.status(500).json({ error: "Failed to submit" });
    }
  });

  app.get("/api/fitment/pending", async (_req, res) => {
    try {
      const entries = await db.select()
        .from(rttFitmentSubmissions)
        .where(eq(rttFitmentSubmissions.status, "pending"))
        .orderBy(desc(rttFitmentSubmissions.createdAt));
      res.json(entries);
    } catch (error) {
      console.error("[fitment] pending error:", error);
      res.status(500).json({ error: "Failed to fetch pending entries" });
    }
  });

  app.patch("/api/fitment/:id/approve", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) return res.status(400).json({ error: "Invalid ID" });
      await db.update(rttFitmentSubmissions)
        .set({ status: "approved", approvedAt: new Date() })
        .where(eq(rttFitmentSubmissions.id, id));
      res.json({ success: true });
    } catch (error) {
      console.error("[fitment] approve error:", error);
      res.status(500).json({ error: "Failed to approve" });
    }
  });

  app.post("/api/fitment/upload-image", async (req, res) => {
    try {
      const contentType = req.headers["content-type"] || "";
      if (!contentType.startsWith("multipart/form-data")) {
        return res.status(400).json({ error: "Must be multipart/form-data" });
      }
      const chunks: Buffer[] = [];
      req.on("data", (chunk) => chunks.push(chunk));
      req.on("end", async () => {
        const body = Buffer.concat(chunks);
        const boundary = contentType.split("boundary=")[1];
        if (!boundary) return res.status(400).json({ error: "No boundary" });

        const boundaryBuf = Buffer.from("--" + boundary);
        const parts: Buffer[] = [];
        let start = body.indexOf(boundaryBuf) + boundaryBuf.length + 2;
        while (start < body.length) {
          const end = body.indexOf(boundaryBuf, start);
          if (end === -1) break;
          parts.push(body.slice(start, end - 2));
          start = end + boundaryBuf.length + 2;
        }

        let fileBuffer: Buffer | null = null;
        let fileName = "upload.jpg";
        let mimeType = "image/jpeg";

        for (const part of parts) {
          const headerEnd = part.indexOf("\r\n\r\n");
          if (headerEnd === -1) continue;
          const headers = part.slice(0, headerEnd).toString();
          if (!headers.includes('filename=')) continue;
          const nameMatch = headers.match(/filename="([^"]+)"/);
          if (nameMatch) fileName = nameMatch[1].replace(/[^a-zA-Z0-9._-]/g, "_");
          const ctMatch = headers.match(/Content-Type:\s*([^\r\n]+)/i);
          if (ctMatch) mimeType = ctMatch[1].trim();
          if (!mimeType.startsWith("image/")) {
            return res.status(400).json({ error: "Only image files allowed" });
          }
          fileBuffer = part.slice(headerEnd + 4);
        }

        if (!fileBuffer) return res.status(400).json({ error: "No file found" });
        if (fileBuffer.length > 5 * 1024 * 1024) return res.status(400).json({ error: "File too large (max 5MB)" });

        const wpRes = await fetch("https://wp.prepperevolution.com/wp-json/wp/v2/media", {
          method: "POST",
          headers: {
            "Authorization": "Basic " + Buffer.from("pe_admin:S4U4 3447 gTtb uGvE Ga8f h4hi").toString("base64"),
            "Content-Disposition": `attachment; filename=${fileName}`,
            "Content-Type": mimeType,
          },
          body: fileBuffer,
        });
        const wpData = await wpRes.json() as any;
        if (!wpData.source_url) return res.status(500).json({ error: "WordPress upload failed" });
        res.json({ url: wpData.source_url });
      });
    } catch (error) {
      console.error("[fitment] image upload error:", error);
      res.status(500).json({ error: "Upload failed" });
    }
  });

  app.patch("/api/fitment/:id/images", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) return res.status(400).json({ error: "Invalid ID" });
      const { imageUrls, notes } = req.body;
      const updates: any = {};
      if (Array.isArray(imageUrls)) updates.imageUrls = imageUrls;
      if (notes) updates.notes = String(notes).replace(/[<>]/g, "").trim().slice(0, 1000);
      await db.update(rttFitmentSubmissions).set(updates).where(eq(rttFitmentSubmissions.id, id));
      res.json({ success: true });
    } catch (error) {
      console.error("[fitment] image update error:", error);
      res.status(500).json({ error: "Failed to update" });
    }
  });

  app.patch("/api/fitment/:id/reject", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) return res.status(400).json({ error: "Invalid ID" });
      await db.update(rttFitmentSubmissions)
        .set({ status: "rejected" })
        .where(eq(rttFitmentSubmissions.id, id));
      res.json({ success: true });
    } catch (error) {
      console.error("[fitment] reject error:", error);
      res.status(500).json({ error: "Failed to reject" });
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
