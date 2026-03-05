import { useSEO } from "@/hooks/useSEO";
import PowerSystemBuilder from "./PowerSystemBuilder";

export default function PowerSystemBuilderPage() {
  useSEO({
    title: "Power System Builder — 12V Auxiliary Electrical Design | Prepper Evolution",
    description:
      "Design a complete 12V auxiliary electrical system for your overlanding vehicle. Wire gauge calculator, fuse sizing, LiFePO4 battery bank design, DC-DC charger selection, and solar integration.",
  });

  return <PowerSystemBuilder />;
}
