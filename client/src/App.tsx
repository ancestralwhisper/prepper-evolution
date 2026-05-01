import { Switch, Route, useLocation, Redirect } from "wouter";
import { useEffect, lazy, Suspense } from "react";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AnimatePresence, motion } from "framer-motion";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import NotFound from "@/pages/not-found";
import Home from "@/pages/Home";

// Lazy-loaded pages — only downloaded when navigated to
const Article = lazy(() => import("@/pages/Article"));
const Product = lazy(() => import("@/pages/Product"));
const Comparison = lazy(() => import("@/pages/Comparison"));
const Category = lazy(() => import("@/pages/Category"));
const StartHere = lazy(() => import("@/pages/StartHere"));
const About = lazy(() => import("@/pages/About"));
const AdminLinkHealth = lazy(() => import("@/pages/AdminLinkHealth"));
const Articles = lazy(() => import("@/pages/Articles"));
const Products = lazy(() => import("@/pages/Products"));
const Quiz = lazy(() => import("@/pages/Quiz"));
const Contact = lazy(() => import("@/pages/Contact"));
const PrivacyPolicy = lazy(() => import("@/pages/PrivacyPolicy"));
const Terms = lazy(() => import("@/pages/Terms"));
const GearList = lazy(() => import("@/pages/freebies/GearList"));
const FamilyKit = lazy(() => import("@/pages/freebies/FamilyKit"));
const BobWeightGuide = lazy(() => import("@/pages/freebies/BobWeightGuide"));

// Tools — all lazy loaded
const ToolsIndex = lazy(() => import("@/pages/tools/ToolsIndex"));
const BugOutBagCalculator = lazy(() => import("@/pages/tools/BugOutBagCalculator"));
const SolarPowerCalculator = lazy(() => import("@/pages/tools/SolarPowerCalculator"));
const WaterStorageCalculator = lazy(() => import("@/pages/tools/WaterStorageCalculator"));
const FoodStorageCalculator = lazy(() => import("@/pages/tools/FoodStorageCalculator"));
const KitBuilder = lazy(() => import("@/pages/tools/KitBuilder"));
const SHTFSimulator = lazy(() => import("@/pages/tools/SHTFSimulator"));
const CommunityGallery = lazy(() => import("@/pages/tools/CommunityGallery"));
const MyKits = lazy(() => import("@/pages/tools/MyKits"));
const VehicleProfile = lazy(() => import("@/pages/tools/VehicleProfile"));
const RigSafeConfiguratorPage = lazy(() => import("@/pages/tools/RigSafeConfiguratorPage"));
const RigRatedConfiguratorPage = lazy(() => import("@/pages/tools/RigRatedConfiguratorPage"));
const TrailIntelPage = lazy(() => import("@/pages/tools/TrailIntelPage"));
const PowerSystemBuilderPage = lazy(() => import("@/pages/tools/PowerSystemBuilderPage"));
const PowerStationRuntimeCalculator = lazy(() => import("@/pages/tools/PowerStationRuntimeCalculator"));
const FuelRangePlanner = lazy(() => import("@/pages/tools/FuelRangePlanner"));
const Deadstock = lazy(() => import("@/pages/tools/Deadstock"));
const BarterEstimator = lazy(() => import("@/pages/tools/BarterEstimator"));
const TentFinder = lazy(() => import("@/pages/tools/TentFinder"));
const GearFinder = lazy(() => import("@/pages/tools/GearFinder"));
const SkillsAnalyzer = lazy(() => import("@/pages/tools/SkillsAnalyzer"));
const ThreatRiskDashboard = lazy(() => import("@/pages/tools/ThreatRiskDashboard"));
const ReadinessDashboard = lazy(() => import("@/pages/tools/ReadinessDashboard"));
const EvacuationRoutePlanner = lazy(() => import("@/pages/tools/EvacuationRoutePlanner"));
const SolarCompatChecker = lazy(() => import("@/pages/tools/SolarCompatChecker"));
const FailureModeDiagnostic = lazy(() => import("@/pages/tools/FailureModeDiagnostic"));
const VirtualGoBag = lazy(() => import("@/pages/tools/VirtualGoBag"));
const SITREP = lazy(() => import("@/pages/tools/SITREP"));
const RackRTTFitmentDatabase = lazy(() => import("@/pages/tools/RackRTTFitmentDatabase"));
const LoadBalancer = lazy(() => import("@/pages/tools/LoadBalancer"));
const AdminFitment = lazy(() => import("@/pages/tools/AdminFitment"));
const HouseholdSetup = lazy(() => import("@/pages/tools/HouseholdSetup"));
const ShareResults = lazy(() => import("@/pages/tools/ShareResults"));
const ProgrammaticAnswers = lazy(() => import("@/pages/tools/ProgrammaticAnswers"));

function ScrollToTop() {
  const [location] = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location]);
  return null;
}

function Router() {
  const [location] = useLocation();
  
  return (
    <>
      <ScrollToTop />
      <AnimatePresence mode="wait">
        <motion.div
          key={location}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="min-h-screen flex flex-col"
        >
          <Suspense fallback={<div className="min-h-screen bg-background" />}>
          <Switch location={location}>
            <Route path="/" component={Home} />
            <Route path="/start-here" component={StartHere} />
            <Route path="/about" component={About} />
            <Route path="/articles" component={Articles} />
            <Route path="/articles/:slug" component={Article} />
            <Route path="/products" component={Products} />
            <Route path="/products/:slug" component={Product} />
            <Route path="/comparisons/:slug" component={Comparison} />
            <Route path="/category/:name" component={Category} />
            <Route path="/tools" component={ToolsIndex} />
            <Route path="/tools/bug-out-bag-calculator" component={BugOutBagCalculator} />
            <Route path="/tools/solar-power-calculator" component={SolarPowerCalculator} />
            <Route path="/tools/water-storage-calculator" component={WaterStorageCalculator} />
            <Route path="/tools/food-storage-calculator" component={FoodStorageCalculator} />
            <Route path="/tools/72-hour-kit-builder" component={KitBuilder} />
            <Route path="/tools/shtf-simulator" component={SHTFSimulator} />
            <Route path="/tools/community" component={CommunityGallery} />
            <Route path="/tools/my-kits" component={MyKits} />
            <Route path="/tools/vehicle-profile" component={VehicleProfile} />
            <Route path="/tools/rigsafe-configurator" component={RigSafeConfiguratorPage} />
            <Route path="/tools/rigrated-configurator" component={RigRatedConfiguratorPage} />
            <Route path="/tools/trail-intel" component={TrailIntelPage} />
            <Route path="/tools/power-system-builder" component={PowerSystemBuilderPage} />
            <Route path="/tools/power-station-runtime" component={PowerStationRuntimeCalculator} />
            <Route path="/tools/fuel-range-planner" component={FuelRangePlanner} />
            <Route path="/tools/deadstock" component={Deadstock} />
            <Route path="/tools/barter-value-estimator" component={BarterEstimator} />
            <Route path="/tools/tent-finder" component={TentFinder} />
            <Route path="/tools/gear-finder" component={GearFinder} />
            <Route path="/tools/skills-tracker" component={SkillsAnalyzer} />
            <Route path="/tools/threat-risk-dashboard" component={ThreatRiskDashboard} />
            <Route path="/tools/readiness-dashboard" component={ReadinessDashboard} />
            <Route path="/tools/evacuation-route-planner" component={EvacuationRoutePlanner} />
            <Route path="/tools/solar-compatibility" component={SolarCompatChecker} />
            <Route path="/tools/field-diagnostic" component={FailureModeDiagnostic} />
            <Route path="/tools/virtual-go-bag" component={VirtualGoBag} />
            <Route path="/tools/sitrep" component={SITREP} />
            <Route path="/tools/rack-rtt-fitment-database" component={RackRTTFitmentDatabase} />
            <Route path="/tools/load-balancer" component={LoadBalancer} />
            <Route path="/admin/fitment" component={AdminFitment} />
            <Route path="/tools/household" component={HouseholdSetup} />
            <Route path="/tools/share" component={ShareResults} />
            <Route path="/tools/answers" component={ProgrammaticAnswers} />
            <Route path="/readiness">{() => <Redirect href="/tools/readiness-dashboard" />}</Route>
            <Route path="/quiz" component={Quiz} />
            <Route path="/contact" component={Contact} />
            <Route path="/privacy-policy" component={PrivacyPolicy} />
            <Route path="/terms" component={Terms} />
            <Route path="/admin/link-health" component={AdminLinkHealth} />
            <Route path="/freebies/gear-list" component={GearList} />
            <Route path="/freebies/72-hour-kit" component={FamilyKit} />
            <Route path="/freebies/bob-weight-guide" component={BobWeightGuide} />
            <Route component={NotFound} />
          </Switch>
          </Suspense>
        </motion.div>
      </AnimatePresence>
    </>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <SiteHeader />
        <Router />
        <SiteFooter />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
