import { Switch, Route, useLocation } from "wouter";
import { useEffect } from "react";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AnimatePresence, motion } from "framer-motion";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import NotFound from "@/pages/not-found";
import Home from "@/pages/Home";
import Article from "@/pages/Article";
import Product from "@/pages/Product";
import Comparison from "@/pages/Comparison";
import Category from "@/pages/Category";
import StartHere from "@/pages/StartHere";
import About from "@/pages/About";
import AdminLinkHealth from "@/pages/AdminLinkHealth";
import Articles from "@/pages/Articles";
import Products from "@/pages/Products";
import ToolsIndex from "@/pages/tools/ToolsIndex";
import BugOutBagCalculator from "@/pages/tools/BugOutBagCalculator";
import SolarPowerCalculator from "@/pages/tools/SolarPowerCalculator";
import WaterStorageCalculator from "@/pages/tools/WaterStorageCalculator";
import FoodStorageCalculator from "@/pages/tools/FoodStorageCalculator";
import KitBuilder from "@/pages/tools/KitBuilder";
import SHTFSimulator from "@/pages/tools/SHTFSimulator";
import CommunityGallery from "@/pages/tools/CommunityGallery";
import MyKits from "@/pages/tools/MyKits";
import VehicleProfile from "@/pages/tools/VehicleProfile";
import RigSafeConfiguratorPage from "@/pages/tools/RigSafeConfiguratorPage";
import RigRatedConfiguratorPage from "@/pages/tools/RigRatedConfiguratorPage";
import TrailIntelPage from "@/pages/tools/TrailIntelPage";
import Quiz from "@/pages/Quiz";
import Contact from "@/pages/Contact";
import PrivacyPolicy from "@/pages/PrivacyPolicy";
import Terms from "@/pages/Terms";

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
            <Route path="/quiz" component={Quiz} />
            <Route path="/contact" component={Contact} />
            <Route path="/privacy-policy" component={PrivacyPolicy} />
            <Route path="/terms" component={Terms} />
            <Route path="/admin/link-health" component={AdminLinkHealth} />
            <Route component={NotFound} />
          </Switch>
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
