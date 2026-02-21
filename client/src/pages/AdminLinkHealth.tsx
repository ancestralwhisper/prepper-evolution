import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useSEO } from "@/hooks/useSEO";
import { Button } from "@/components/ui/button";
import { ChevronLeft, RefreshCw, CheckCircle2, XCircle, AlertTriangle, ChevronDown, ChevronUp, ExternalLink } from "lucide-react";
import { Link } from "wouter";
import { useState } from "react";
import type { LinkHealthCheck, LinkHealthRun } from "@shared/schema";

interface LinkHealthData {
  lastRun: LinkHealthRun | null;
  checks: LinkHealthCheck[];
}

export default function AdminLinkHealth() {
  const [showHealthy, setShowHealthy] = useState(false);
  const queryClient = useQueryClient();

  useSEO({
    title: "Link Health Monitor",
    description: "Affiliate link health monitoring dashboard",
  });

  const { data, isLoading } = useQuery<LinkHealthData>({
    queryKey: ["link-health"],
    queryFn: async () => {
      const res = await fetch("/api/link-health");
      if (!res.ok) throw new Error("Failed to fetch link health data");
      return res.json();
    },
    refetchInterval: 10000,
  });

  const runCheck = useMutation({
    mutationFn: async () => {
      const res = await fetch("/api/link-health/run", { method: "POST" });
      if (!res.ok) throw new Error("Failed to start check");
      return res.json();
    },
    onSuccess: () => {
      setTimeout(() => queryClient.invalidateQueries({ queryKey: ["link-health"] }), 5000);
    },
  });

  const brokenLinks = data?.checks.filter(c => !c.isHealthy) || [];
  const healthyLinks = data?.checks.filter(c => c.isHealthy) || [];
  const totalChecked = data?.lastRun?.totalChecked || data?.checks.length || 0;

  const formatDate = (dateStr: string | Date | null) => {
    if (!dateStr) return "Never";
    const d = new Date(dateStr);
    return d.toLocaleString("en-US", {
      month: "short", day: "numeric", year: "numeric",
      hour: "numeric", minute: "2-digit", hour12: true,
      timeZoneName: "short"
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background pt-24 pb-20">
        <div className="max-w-[1000px] mx-auto px-4 md:px-6">
          <div className="text-center py-20">Loading link health data...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pt-24 pb-20">
      <div className="max-w-[1000px] mx-auto px-4 md:px-6">
        <Button 
          variant="ghost" 
          className="text-primary hover:text-primary/80 hover:bg-transparent px-0 mb-8 font-medium"
          onClick={() => window.history.length > 1 ? window.history.back() : window.location.href = '/'}
          data-testid="button-back"
        >
          <ChevronLeft className="w-4 h-4 mr-1" /> Back
        </Button>

        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div>
            <h1 className="text-3xl md:text-4xl font-display font-bold uppercase tracking-tight" data-testid="text-page-title">
              Link Health Monitor
            </h1>
            <p className="text-muted-foreground mt-1">
              Automated affiliate link checker. Runs daily at 3 AM EST.
            </p>
          </div>
          <Button 
            onClick={() => runCheck.mutate()} 
            disabled={runCheck.isPending}
            className="bg-primary hover:bg-primary/90"
            data-testid="button-run-check"
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${runCheck.isPending ? 'animate-spin' : ''}`} />
            {runCheck.isPending ? "Running..." : "Run Check Now"}
          </Button>
        </div>

        {runCheck.isSuccess && (
          <div className="bg-primary/10 border border-primary/30 rounded-lg p-4 mb-6 text-sm font-medium" data-testid="status-check-started">
            <AlertTriangle className="w-4 h-4 inline mr-2 text-primary" />
            Link check started. Results will appear shortly — this page auto-refreshes every 10 seconds.
          </div>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-8">
          <div className="bg-card border border-border rounded-xl p-5">
            <p className="text-sm text-muted-foreground font-medium">Last Check</p>
            <p className="text-lg font-bold mt-1" data-testid="text-last-check">
              {data?.lastRun ? formatDate(data.lastRun.completedAt) : "Never"}
            </p>
          </div>
          <div className="bg-card border border-border rounded-xl p-5">
            <p className="text-sm text-muted-foreground font-medium">Total Checked</p>
            <p className="text-2xl font-bold mt-1" data-testid="text-total-checked">{totalChecked}</p>
          </div>
          <div className="bg-card border border-border rounded-xl p-5">
            <p className="text-sm text-muted-foreground font-medium">Healthy</p>
            <p className="text-2xl font-bold text-green-500 mt-1" data-testid="text-total-healthy">{healthyLinks.length}</p>
          </div>
          <div className="bg-card border border-border rounded-xl p-5">
            <p className="text-sm text-muted-foreground font-medium">Broken</p>
            <p className="text-2xl font-bold text-red-500 mt-1" data-testid="text-total-broken">{brokenLinks.length}</p>
          </div>
        </div>

        {/* Broken Links */}
        {brokenLinks.length > 0 && (
          <div className="mb-8">
            <h2 className="text-xl font-display font-bold mb-4 flex items-center gap-2 text-red-500">
              <XCircle className="w-5 h-5" /> Broken Links ({brokenLinks.length})
            </h2>
            <div className="space-y-3">
              {brokenLinks.map(check => (
                <div key={check.id} className="bg-red-500/10 border border-red-500/30 rounded-xl p-5" data-testid={`card-broken-${check.productSlug}`}>
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                    <div>
                      <h3 className="font-bold text-lg">{check.productName}</h3>
                      <p className="text-sm text-muted-foreground mt-1 break-all">
                        <a href={check.url} target="_blank" rel="noopener noreferrer" className="hover:text-primary flex items-center gap-1">
                          {check.url} <ExternalLink className="w-3 h-3 flex-shrink-0" />
                        </a>
                      </p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <span className="inline-flex items-center gap-1 bg-red-500/20 text-red-500 px-3 py-1 rounded-full text-sm font-bold">
                        {check.statusCode ? `HTTP ${check.statusCode}` : "Connection Failed"}
                      </span>
                    </div>
                  </div>
                  {check.errorMessage && (
                    <p className="text-sm text-red-400 mt-2 font-medium">{check.errorMessage}</p>
                  )}
                  <p className="text-xs text-muted-foreground mt-2">Checked: {formatDate(check.checkedAt)}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {brokenLinks.length === 0 && data?.checks.length ? (
          <div className="bg-green-500/10 border border-green-500/30 rounded-xl p-6 mb-8 text-center" data-testid="status-all-healthy">
            <CheckCircle2 className="w-8 h-8 text-green-500 mx-auto mb-2" />
            <h3 className="font-bold text-lg">All Links Healthy</h3>
            <p className="text-muted-foreground text-sm">Every affiliate link checked out fine.</p>
          </div>
        ) : null}

        {!data?.checks.length && (
          <div className="bg-card border border-border border-dashed rounded-xl p-8 mb-8 text-center" data-testid="status-no-checks">
            <AlertTriangle className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
            <h3 className="font-bold text-lg">No Checks Yet</h3>
            <p className="text-muted-foreground text-sm">Click "Run Check Now" to perform the first link health check.</p>
          </div>
        )}

        {/* Healthy Links (Collapsed) */}
        {healthyLinks.length > 0 && (
          <div>
            <button
              onClick={() => setShowHealthy(!showHealthy)}
              className="flex items-center gap-2 text-lg font-display font-bold mb-4 hover:text-primary transition-colors w-full text-left"
              data-testid="button-toggle-healthy"
            >
              <CheckCircle2 className="w-5 h-5 text-green-500" />
              Healthy Links ({healthyLinks.length})
              {showHealthy ? <ChevronUp className="w-4 h-4 ml-auto" /> : <ChevronDown className="w-4 h-4 ml-auto" />}
            </button>
            
            {showHealthy && (
              <div className="space-y-2">
                {healthyLinks.map(check => (
                  <div key={check.id} className="bg-card border border-border rounded-lg p-4 flex items-center justify-between" data-testid={`card-healthy-${check.productSlug}`}>
                    <div>
                      <h3 className="font-medium">{check.productName}</h3>
                      <p className="text-xs text-muted-foreground mt-1 break-all">{check.url}</p>
                    </div>
                    <span className="inline-flex items-center gap-1 text-green-500 text-sm font-medium flex-shrink-0">
                      <CheckCircle2 className="w-4 h-4" /> {check.statusCode || "OK"}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
