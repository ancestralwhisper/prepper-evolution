/**
 * GA4 custom event tracking for Prepper Evolution tools.
 *
 * All events use the "pe_" prefix so they're easy to find in GA4 reports.
 * Events are fire-and-forget — never block UI for analytics.
 */

type PEEvent =
  // Tool lifecycle
  | { name: "pe_tool_view"; params: { tool: string } }
  | { name: "pe_tool_started"; params: { tool: string; machine?: string; vehicle?: string } }
  | { name: "pe_report_generated"; params: { tool: string; machine?: string; vehicle?: string } }

  // Selection events
  | { name: "pe_machine_selected"; params: { tool: string; machine: string } }
  | { name: "pe_vehicle_selected"; params: { tool: string; vehicle: string } }
  | { name: "pe_gear_added"; params: { tool: string; item: string; category: string } }
  | { name: "pe_suspension_selected"; params: { brand: string; model: string } }
  | { name: "pe_tire_selected"; params: { brand: string; model: string } }
  | { name: "pe_wheel_selected"; params: { brand: string; model: string } }
  | { name: "pe_scenario_selected"; params: { scenario: string } }

  // Engagement
  | { name: "pe_share_clicked"; params: { tool: string; platform: string } }
  | { name: "pe_pdf_exported"; params: { tool: string } }
  | { name: "pe_affiliate_click"; params: { tool: string; product: string; url: string } }
  | { name: "pe_pwa_install"; params: Record<string, never> }
  | { name: "pe_zip_lookup"; params: { zip3: string; tool: string } }
  | { name: "pe_bmac_click"; params: Record<string, never> }

  // Results / outcomes
  | { name: "pe_scenario_completed"; params: { scenario: string; outcome: string; score: number } }
  | { name: "pe_payload_warning"; params: { machine: string; pct: number; warning: string } }
  | { name: "pe_kit_saved"; params: { tool: string } };

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
  }
}

export function trackEvent<E extends PEEvent>(event: E["name"], params: E["params"]): void {
  try {
    if (typeof window !== "undefined" && window.gtag) {
      window.gtag("event", event, params);
    }
  } catch {
    // Never break the app for analytics
  }
}
