import { Plus, Trash2, MapPin, Phone, Heart, Radio, Fuel, Wrench } from "lucide-react";
import type { TripPlanData } from "./rigrated-compute";

interface TripPlanProps {
  plan: TripPlanData;
  onChange: (plan: TripPlanData) => void;
  machineLabel: string;
  loadedWeightLbs: number;
  payloadPct: number;
  accessoryList: string[];
  fuelRangeMiles: number;
}

export default function TripPlan({
  plan, onChange, machineLabel, loadedWeightLbs, payloadPct, accessoryList, fuelRangeMiles,
}: TripPlanProps) {
  const update = <K extends keyof TripPlanData>(key: K, value: TripPlanData[K]) => {
    onChange({ ...plan, [key]: value });
  };

  const addRoster = () => {
    if (plan.roster.length >= 6) return;
    update("roster", [...plan.roster, { name: "", medical: "", emergencyContact: "", emergencyPhone: "" }]);
  };
  const removeRoster = (i: number) => {
    update("roster", plan.roster.filter((_, idx) => idx !== i));
  };
  const updateRoster = (i: number, field: string, value: string) => {
    update("roster", plan.roster.map((r, idx) => idx === i ? { ...r, [field]: value } : r));
  };

  const addWaypoint = () => {
    if (plan.waypoints.length >= 10) return;
    update("waypoints", [...plan.waypoints, { name: "", notes: "", isOvernight: false }]);
  };
  const removeWaypoint = (i: number) => {
    update("waypoints", plan.waypoints.filter((_, idx) => idx !== i));
  };
  const updateWaypoint = (i: number, field: string, value: string | boolean) => {
    update("waypoints", plan.waypoints.map((w, idx) => idx === i ? { ...w, [field]: value } : w));
  };

  const inputCls = "w-full bg-muted border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:border-primary outline-none transition-colors";
  const labelCls = "block text-[10px] font-bold uppercase tracking-wide text-muted-foreground mb-1";

  return (
    <div className="space-y-6">
      <div className="bg-primary/5 border border-primary/20 rounded-lg p-4">
        <p className="text-[10px] font-bold uppercase tracking-wide text-primary mb-2">
          Auto-filled from your build
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          <div>
            <span className="text-muted-foreground">Machine</span>
            <p className="font-bold truncate">{machineLabel || "Not selected"}</p>
          </div>
          <div>
            <span className="text-muted-foreground">Loaded Weight</span>
            <p className="font-bold">{loadedWeightLbs.toLocaleString()} lbs</p>
          </div>
          <div>
            <span className="text-muted-foreground">Payload Used</span>
            <p className="font-bold">{payloadPct}%</p>
          </div>
          <div>
            <span className="text-muted-foreground">Fuel Range</span>
            <p className="font-bold">~{fuelRangeMiles} mi</p>
          </div>
        </div>
        {accessoryList.length > 0 && (
          <div className="mt-2">
            <span className="text-[10px] text-muted-foreground">Accessories: </span>
            <span className="text-[10px]">{accessoryList.join(", ")}</span>
          </div>
        )}
      </div>

      <div className="space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="sm:col-span-3">
            <label className={labelCls}>Trip Name</label>
            <input
              type="text" value={plan.tripName}
              onChange={(e) => update("tripName", e.target.value)}
              placeholder="e.g., Paiute Trail Summer 2026"
              className={inputCls}
            />
          </div>
          <div>
            <label className={labelCls}>Start Date</label>
            <input type="date" value={plan.startDate} onChange={(e) => update("startDate", e.target.value)} className={inputCls} />
          </div>
          <div>
            <label className={labelCls}>End Date</label>
            <input type="date" value={plan.endDate} onChange={(e) => update("endDate", e.target.value)} className={inputCls} />
          </div>
          <div>
            <label className={labelCls}>Trail / Route</label>
            <input
              type="text" value={plan.trailRoute}
              onChange={(e) => update("trailRoute", e.target.value)}
              placeholder="e.g., Paiute Trail loop"
              className={inputCls}
            />
          </div>
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-extrabold flex items-center gap-2">
            <Heart className="w-3.5 h-3.5 text-primary" /> Group Roster
          </h4>
          {plan.roster.length < 6 && (
            <button onClick={addRoster} className="flex items-center gap-1 text-[10px] font-bold uppercase text-primary hover:text-primary/80 transition-colors">
              <Plus className="w-3 h-3" /> Add Person
            </button>
          )}
        </div>
        {plan.roster.map((person, i) => (
          <div key={i} className="bg-muted border border-border rounded-lg p-3 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-muted-foreground uppercase">Person {i + 1}</span>
              {plan.roster.length > 1 && (
                <button onClick={() => removeRoster(i)} className="text-red-400 hover:text-red-500 transition-colors">
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <input type="text" value={person.name} onChange={(e) => updateRoster(i, "name", e.target.value)}
                placeholder="Name" className={inputCls} />
              <input type="text" value={person.medical} onChange={(e) => updateRoster(i, "medical", e.target.value)}
                placeholder="Medical notes (allergies, meds)" className={inputCls} />
              <input type="text" value={person.emergencyContact} onChange={(e) => updateRoster(i, "emergencyContact", e.target.value)}
                placeholder="Emergency contact name" className={inputCls} />
              <input type="text" value={person.emergencyPhone} onChange={(e) => updateRoster(i, "emergencyPhone", e.target.value)}
                placeholder="Emergency contact phone" className={inputCls} />
            </div>
          </div>
        ))}
      </div>

      <div className="space-y-3">
        <h4 className="text-sm font-extrabold flex items-center gap-2">
          <Radio className="w-3.5 h-3.5 text-primary" /> Communications
        </h4>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="sm:col-span-3">
            <label className={labelCls}>Comm Plan</label>
            <input type="text" value={plan.commPlan}
              onChange={(e) => update("commPlan", e.target.value)}
              placeholder="e.g., GMRS channel 16, cell at camp 3"
              className={inputCls} />
          </div>
          <div>
            <label className={labelCls}>Check-in Schedule</label>
            <input type="text" value={plan.checkInSchedule}
              onChange={(e) => update("checkInSchedule", e.target.value)}
              placeholder="e.g., Daily at 8am MST"
              className={inputCls} />
          </div>
          <div>
            <label className={labelCls}>Satellite Device</label>
            <input type="text" value={plan.satelliteDevice}
              onChange={(e) => update("satelliteDevice", e.target.value)}
              placeholder="e.g., Garmin inReach Mini 2"
              className={inputCls} />
          </div>
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-extrabold flex items-center gap-2">
            <MapPin className="w-3.5 h-3.5 text-primary" /> Waypoints
          </h4>
          {plan.waypoints.length < 10 && (
            <button onClick={addWaypoint} className="flex items-center gap-1 text-[10px] font-bold uppercase text-primary hover:text-primary/80 transition-colors">
              <Plus className="w-3 h-3" /> Add Waypoint
            </button>
          )}
        </div>
        {plan.waypoints.map((wp, i) => (
          <div key={i} className="flex items-start gap-2">
            <div className="flex-1 grid grid-cols-1 sm:grid-cols-3 gap-2">
              <input type="text" value={wp.name} onChange={(e) => updateWaypoint(i, "name", e.target.value)}
                placeholder={`Waypoint ${i + 1} name`} className={inputCls} />
              <input type="text" value={wp.notes} onChange={(e) => updateWaypoint(i, "notes", e.target.value)}
                placeholder="Notes (fuel, water, etc.)" className={inputCls} />
              <label className="flex items-center gap-2 cursor-pointer self-center">
                <input type="checkbox" checked={wp.isOvernight}
                  onChange={(e) => updateWaypoint(i, "isOvernight", e.target.checked)}
                  className="w-4 h-4 accent-primary" />
                <span className="text-xs">Overnight camp</span>
              </label>
            </div>
            {plan.waypoints.length > 1 && (
              <button onClick={() => removeWaypoint(i)} className="text-red-400 hover:text-red-500 transition-colors mt-2">
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        ))}
      </div>

      <div className="space-y-3">
        <h4 className="text-sm font-extrabold flex items-center gap-2">
          <Phone className="w-3.5 h-3.5 text-primary" /> Emergency Services
        </h4>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label className={labelCls}>Nearest Hospital</label>
            <input type="text" value={plan.nearestHospital}
              onChange={(e) => update("nearestHospital", e.target.value)}
              placeholder="Name + distance" className={inputCls} />
          </div>
          <div>
            <label className={labelCls}>
              <Fuel className="w-3 h-3 inline" /> Nearest Fuel
            </label>
            <input type="text" value={plan.nearestFuel}
              onChange={(e) => update("nearestFuel", e.target.value)}
              placeholder="Station + distance" className={inputCls} />
          </div>
          <div>
            <label className={labelCls}>
              <Wrench className="w-3 h-3 inline" /> Nearest Towing
            </label>
            <input type="text" value={plan.nearestTowing}
              onChange={(e) => update("nearestTowing", e.target.value)}
              placeholder="Service + phone" className={inputCls} />
          </div>
        </div>
      </div>

      <div className="space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className={labelCls}>Recovery Capability</label>
            <input type="text" value={plan.recoveryCapability}
              onChange={(e) => update("recoveryCapability", e.target.value)}
              placeholder="e.g., 4500 lb winch, kinetic rope, shackles"
              className={inputCls} />
          </div>
          <div>
            <label className={labelCls}>Backup Plan</label>
            <input type="text" value={plan.backupPlan}
              onChange={(e) => update("backupPlan", e.target.value)}
              placeholder="e.g., Hwy 89 bailout at waypoint 3"
              className={inputCls} />
          </div>
        </div>
      </div>

      <div className="bg-yellow-500/5 border border-yellow-500/20 rounded-lg p-4 space-y-3">
        <h4 className="text-sm font-extrabold flex items-center gap-2">
          Leave-Behind Document Contact
        </h4>
        <p className="text-[10px] text-muted-foreground">
          This person stays home and gets a copy of the trip plan. If you miss a check-in, they call for help.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className={labelCls}>Contact Name</label>
            <input type="text" value={plan.leaveBehindName}
              onChange={(e) => update("leaveBehindName", e.target.value)}
              placeholder="Name" className={inputCls} />
          </div>
          <div>
            <label className={labelCls}>Contact Phone</label>
            <input type="text" value={plan.leaveBehindPhone}
              onChange={(e) => update("leaveBehindPhone", e.target.value)}
              placeholder="Phone number" className={inputCls} />
          </div>
        </div>
      </div>
    </div>
  );
}
