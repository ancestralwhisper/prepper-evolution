import { db } from "./db";
import { products, linkHealthChecks, linkHealthRuns } from "@shared/schema";
import { eq, desc } from "drizzle-orm";
import { log } from "./index";

const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID;

let isRunning = false;

async function checkSingleLink(url: string): Promise<{ statusCode: number | null; isHealthy: boolean; errorMessage: string | null }> {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 15000);

    const res = await fetch(url, {
      method: "GET",
      redirect: "follow",
      signal: controller.signal,
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.5",
      },
    });

    clearTimeout(timeout);

    const statusCode = res.status;
    const finalUrl = res.url;
    const body = await res.text();

    const isError404 = statusCode === 404;
    const isServerError = statusCode >= 500;
    const isRedirectToError = finalUrl.includes("/error") || finalUrl.includes("/gp/errors") || finalUrl.includes("/404");
    const bodyIndicatesDog = body.includes("we couldn't find that page") || 
                              body.includes("looking for something") ||
                              body.includes("Page not found");

    const isHealthy = !isError404 && !isServerError && !isRedirectToError && !bodyIndicatesDog;

    let errorMessage: string | null = null;
    if (!isHealthy) {
      if (isError404) errorMessage = `HTTP 404 Not Found`;
      else if (isServerError) errorMessage = `HTTP ${statusCode} Server Error`;
      else if (isRedirectToError) errorMessage = `Redirected to error page: ${finalUrl}`;
      else if (bodyIndicatesDog) errorMessage = `Page content indicates product not found`;
    }

    return { statusCode, isHealthy, errorMessage };
  } catch (error: any) {
    const errorMessage = error.name === "AbortError" 
      ? "Request timed out after 15 seconds" 
      : `Connection failed: ${error.message}`;
    return { statusCode: null, isHealthy: false, errorMessage };
  }
}

async function sendTelegramAlert(productName: string, url: string, statusCode: number | null, errorMessage: string | null) {
  if (!TELEGRAM_BOT_TOKEN || !TELEGRAM_CHAT_ID) {
    log("Telegram credentials not configured, skipping alert", "link-checker");
    return;
  }

  try {
    const statusText = statusCode ? `HTTP ${statusCode}` : "Connection Failed";
    const text = `🚨 <b>BROKEN LINK ALERT</b>\n\n<b>Product:</b> ${productName}\n<b>Status:</b> ${statusText}\n<b>Error:</b> ${errorMessage || "Unknown"}\n<b>URL:</b> ${url}\n\nGo to /admin/link-health to review.`;

    await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: TELEGRAM_CHAT_ID,
        text,
        parse_mode: "HTML",
      }),
    });
  } catch (error) {
    console.error("Failed to send Telegram alert:", error);
  }
}

export async function runFullLinkCheck() {
  if (isRunning) {
    log("Link check already in progress, skipping", "link-checker");
    return;
  }

  isRunning = true;
  log("Starting full link health check...", "link-checker");

  try {
    const allProducts = await db.select().from(products);
    let totalBroken = 0;
    let totalHealthy = 0;

    const [run] = await db.insert(linkHealthRuns).values({
      totalChecked: allProducts.length,
      totalBroken: 0,
      totalHealthy: 0,
    }).returning();

    for (const product of allProducts) {
      const result = await checkSingleLink(product.amazonLink);

      await db.insert(linkHealthChecks).values({
        runId: run.id,
        productId: product.id,
        productSlug: product.slug,
        productName: product.name,
        url: product.amazonLink,
        statusCode: result.statusCode,
        isHealthy: result.isHealthy,
        errorMessage: result.errorMessage,
      });

      if (result.isHealthy) {
        totalHealthy++;
      } else {
        totalBroken++;
        await sendTelegramAlert(product.name, product.amazonLink, result.statusCode, result.errorMessage);
      }

      await new Promise(resolve => setTimeout(resolve, 2000));
    }

    await db.update(linkHealthRuns)
      .set({ totalBroken, totalHealthy })
      .where(eq(linkHealthRuns.id, run.id));

    log(`Link check complete: ${allProducts.length} checked, ${totalHealthy} healthy, ${totalBroken} broken`, "link-checker");
  } finally {
    isRunning = false;
  }
}

export async function checkProductLink(productSlug: string): Promise<{ isHealthy: boolean; errorMessage: string | null }> {
  const [product] = await db.select().from(products).where(eq(products.slug, productSlug));
  if (!product) return { isHealthy: true, errorMessage: null };

  const result = await checkSingleLink(product.amazonLink);

  await db.insert(linkHealthChecks).values({
    runId: null,
    productId: product.id,
    productSlug: product.slug,
    productName: product.name,
    url: product.amazonLink,
    statusCode: result.statusCode,
    isHealthy: result.isHealthy,
    errorMessage: result.errorMessage,
  });

  if (!result.isHealthy) {
    await sendTelegramAlert(product.name, product.amazonLink, result.statusCode, result.errorMessage);
  }

  return { isHealthy: result.isHealthy, errorMessage: result.errorMessage };
}

export async function getLatestHealthForProduct(productSlug: string): Promise<boolean> {
  const [latest] = await db
    .select()
    .from(linkHealthChecks)
    .where(eq(linkHealthChecks.productSlug, productSlug))
    .orderBy(desc(linkHealthChecks.checkedAt))
    .limit(1);

  return latest ? latest.isHealthy : true;
}

function scheduleDaily() {
  const checkTime = () => {
    const now = new Date();
    const estOffset = -5;
    const utc = now.getTime() + now.getTimezoneOffset() * 60000;
    const est = new Date(utc + 3600000 * estOffset);
    
    const target = new Date(est);
    target.setHours(3, 0, 0, 0);
    
    if (est >= target) {
      target.setDate(target.getDate() + 1);
    }
    
    const msUntilTarget = target.getTime() - est.getTime();
    return msUntilTarget;
  };

  const scheduleNext = () => {
    const delay = checkTime();
    const hours = Math.floor(delay / 3600000);
    const minutes = Math.floor((delay % 3600000) / 60000);
    log(`Next link health check scheduled in ${hours}h ${minutes}m (3 AM EST)`, "link-checker");
    
    setTimeout(async () => {
      try {
        await runFullLinkCheck();
      } catch (error) {
        console.error("Scheduled link check failed:", error);
      }
      scheduleNext();
    }, delay);
  };

  scheduleNext();
}

export function initLinkChecker() {
  scheduleDaily();
  log("Link health checker initialized. Daily check scheduled at 3 AM EST.", "link-checker");
}
