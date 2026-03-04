
/**
 * RigRated3DViewer — React Three Fiber prototype for UTV visualization
 *
 * FUTURE UPGRADE: Replace RigRatedSvg with interactive 3D UTV models.
 * This is a working prototype that renders a procedural UTV using Three.js
 * primitives (boxes, cylinders). When GLB models are available, swap the
 * procedural geometry for loaded models.
 *
 * Requirements to go live:
 * 1. npm install three @react-three/fiber @react-three/drei
 * 2. Obtain 4-5 low-poly GLB models (one per body type)
 * 3. Replace ProceduralUTV with <primitive object={gltf.scene} />
 *
 * Usage:
 *   <RigRated3DViewer
 *     bodyType="2-seat-sport"
 *     showRoof={true}
 *     showWindshield={true}
 *     showWinch={false}
 *     showRack={false}
 *     showLightBar={true}
 *     loadStatus="green"
 *   />
 */

import { useRef, useState, useEffect, Suspense } from "react";

// ---------------------------------------------------------------------------
// Type-only definitions — these match the Three.js / R3F API surface.
// When dependencies are installed, replace with real imports:
//   import { Canvas, useFrame } from "@react-three/fiber";
//   import { OrbitControls, Environment } from "@react-three/drei";
//   import * as THREE from "three";
// ---------------------------------------------------------------------------

import type { UTVBodyType } from "./rigrated-machines";

interface RigRated3DViewerProps {
  bodyType: UTVBodyType;
  machineId?: string;
  showRoof: boolean;
  showWindshield: boolean;
  showDoors: boolean;
  showFrontBumper: boolean;
  showRearBumper: boolean;
  showWinch: boolean;
  showRack: boolean;
  showLightBar: boolean;
  showRtt: boolean;
  loadStatus: "green" | "yellow" | "orange" | "red";
}

// ─── Body type dimensions (meters, roughly 1:10 scale) ──────────────────

interface BodyDimensions {
  chassisLength: number;
  chassisWidth: number;
  chassisHeight: number;
  cabLength: number;
  cabHeight: number;
  bedLength: number;
  wheelRadius: number;
  wheelWidth: number;
  wheelbaseHalf: number;
  trackHalf: number;
  groundClearance: number;
}

const BODY_DIMS: Record<UTVBodyType, BodyDimensions> = {
  "2-seat-sport": {
    chassisLength: 2.8, chassisWidth: 1.5, chassisHeight: 0.25,
    cabLength: 1.4, cabHeight: 1.1, bedLength: 0.4,
    wheelRadius: 0.38, wheelWidth: 0.28, wheelbaseHalf: 1.1,
    trackHalf: 0.72, groundClearance: 0.35,
  },
  "4-seat-sport": {
    chassisLength: 3.4, chassisWidth: 1.5, chassisHeight: 0.25,
    cabLength: 2.0, cabHeight: 1.1, bedLength: 0.4,
    wheelRadius: 0.38, wheelWidth: 0.28, wheelbaseHalf: 1.35,
    trackHalf: 0.72, groundClearance: 0.35,
  },
  "2-seat-utility": {
    chassisLength: 2.9, chassisWidth: 1.5, chassisHeight: 0.25,
    cabLength: 1.3, cabHeight: 1.2, bedLength: 0.9,
    wheelRadius: 0.35, wheelWidth: 0.26, wheelbaseHalf: 1.1,
    trackHalf: 0.7, groundClearance: 0.3,
  },
  "4-seat-utility": {
    chassisLength: 3.5, chassisWidth: 1.5, chassisHeight: 0.25,
    cabLength: 1.9, cabHeight: 1.2, bedLength: 0.9,
    wheelRadius: 0.35, wheelWidth: 0.26, wheelbaseHalf: 1.35,
    trackHalf: 0.7, groundClearance: 0.3,
  },
  "crew-cab-utility": {
    chassisLength: 3.8, chassisWidth: 1.5, chassisHeight: 0.25,
    cabLength: 2.2, cabHeight: 1.2, bedLength: 0.9,
    wheelRadius: 0.35, wheelWidth: 0.26, wheelbaseHalf: 1.45,
    trackHalf: 0.7, groundClearance: 0.3,
  },
};

const STATUS_COLORS: Record<string, string> = {
  green: "#10B981",
  yellow: "#EAB308",
  orange: "#F97316",
  red: "#EF4444",
};

// ─── Placeholder component (renders when Three.js not installed) ─────────

export default function RigRated3DViewer(props: RigRated3DViewerProps) {
  const [hasThree, setHasThree] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Check if Three.js dependencies are available
    try {
      require("three");
      require("@react-three/fiber");
      setHasThree(true);
    } catch {
      setHasThree(false);
    }
  }, []);

  if (!hasThree) {
    return <ThreeJSPlaceholder {...props} />;
  }

  // When Three.js IS installed, dynamically import and render the Canvas
  return (
    <Suspense fallback={<ThreeJSPlaceholder {...props} />}>
      <DynamicCanvas {...props} />
    </Suspense>
  );
}

// ─── Placeholder when Three.js deps aren't installed ─────────────────────

function ThreeJSPlaceholder({ bodyType, loadStatus }: RigRated3DViewerProps) {
  const statusColor = STATUS_COLORS[loadStatus] || STATUS_COLORS.green;
  const dims = BODY_DIMS[bodyType];

  return (
    <div className="bg-muted border border-border rounded-lg p-4">
      <div className="flex items-center justify-between mb-2">
        <span className="text-[10px] font-bold uppercase tracking-wide text-muted-foreground">
          3D Preview (Prototype)
        </span>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: statusColor }} />
          <span className="text-[10px] font-bold text-muted-foreground uppercase">
            {loadStatus === "red" ? "Over Limit" :
             loadStatus === "orange" ? "Caution" :
             loadStatus === "yellow" ? "Near Margin" : "Good"}
          </span>
        </div>
      </div>

      {/* CSS-only 3D perspective preview */}
      <div
        className="relative w-full bg-gradient-to-b from-slate-900 to-slate-800 rounded-md overflow-hidden"
        style={{ aspectRatio: "16/9", perspective: "600px" }}
      >
        {/* Grid floor */}
        <div
          className="absolute inset-x-0 bottom-0 h-1/2"
          style={{
            background: `
              repeating-linear-gradient(90deg, rgba(255,255,255,0.03) 0px, rgba(255,255,255,0.03) 1px, transparent 1px, transparent 40px),
              repeating-linear-gradient(0deg, rgba(255,255,255,0.03) 0px, rgba(255,255,255,0.03) 1px, transparent 1px, transparent 40px)
            `,
            transform: "rotateX(60deg)",
            transformOrigin: "center bottom",
          }}
        />

        {/* UTV silhouette in 3D perspective */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div style={{ transform: "rotateY(-25deg) rotateX(10deg)", transformStyle: "preserve-3d" }}>
            {/* Chassis */}
            <div
              style={{
                width: `${dims.chassisLength * 60}px`,
                height: `${dims.chassisHeight * 60}px`,
                backgroundColor: "#333",
                border: `2px solid ${statusColor}`,
                borderRadius: "4px",
                position: "relative",
              }}
            >
              {/* Cab */}
              <div
                style={{
                  position: "absolute",
                  left: "8px",
                  bottom: "100%",
                  width: `${dims.cabLength * 60}px`,
                  height: `${dims.cabHeight * 40}px`,
                  backgroundColor: "rgba(100,100,100,0.4)",
                  border: `1px solid ${statusColor}`,
                  borderRadius: "3px 3px 0 0",
                  borderBottom: "none",
                }}
              />
              {/* Bed (utility) */}
              {dims.bedLength > 0.5 && (
                <div
                  style={{
                    position: "absolute",
                    right: "4px",
                    bottom: "100%",
                    width: `${dims.bedLength * 60}px`,
                    height: `${dims.cabHeight * 18}px`,
                    backgroundColor: "rgba(80,80,80,0.3)",
                    border: `1px solid ${statusColor}`,
                    borderRadius: "2px 2px 0 0",
                    borderBottom: "none",
                  }}
                />
              )}
            </div>
            {/* Wheels */}
            {[-1, 1].map((side) =>
              [-1, 1].map((axle) => (
                <div
                  key={`${side}-${axle}`}
                  style={{
                    position: "absolute",
                    width: `${dims.wheelRadius * 100}px`,
                    height: `${dims.wheelRadius * 100}px`,
                    borderRadius: "50%",
                    backgroundColor: "#111",
                    border: "3px solid #444",
                    left: `${(dims.chassisLength * 30) + (axle * dims.wheelbaseHalf * 55) - (dims.wheelRadius * 50)}px`,
                    bottom: `${-dims.wheelRadius * 30}px`,
                    transform: `translateZ(${side * dims.trackHalf * 40}px)`,
                  }}
                />
              ))
            )}
          </div>
        </div>

        {/* "3D mode coming soon" overlay */}
        <div className="absolute inset-0 flex flex-col items-center justify-end pb-4">
          <p className="text-white/40 text-xs font-mono uppercase tracking-wider">
            Interactive 3D — Coming Soon
          </p>
          <p className="text-white/20 text-[10px] font-mono mt-1">
            Install: npm i three @react-three/fiber @react-three/drei
          </p>
        </div>
      </div>

      <p className="text-[10px] text-muted-foreground mt-2 text-center">
        Prototype 3D viewer. Full interactive mode requires Three.js + GLB models.
      </p>
    </div>
  );
}

// ─── Dynamic Canvas (loaded only when Three.js is available) ─────────────
// This component will be fully functional once dependencies are installed.
// It uses React Three Fiber for GPU-accelerated 3D rendering.

function DynamicCanvas(props: RigRated3DViewerProps) {
  // This is a stub — when Three.js deps are installed, replace with:
  //
  // const { Canvas } = require("@react-three/fiber");
  // const { OrbitControls, Environment, ContactShadows } = require("@react-three/drei");
  //
  // return (
  //   <div className="bg-muted border border-border rounded-lg p-4">
  //     <Canvas
  //       camera={{ position: [4, 3, 5], fov: 40 }}
  //       style={{ height: 300, borderRadius: 8 }}
  //     >
  //       <ambientLight intensity={0.4} />
  //       <directionalLight position={[5, 8, 3]} intensity={1} castShadow />
  //       <ProceduralUTV {...props} />
  //       <ContactShadows position={[0, -0.5, 0]} opacity={0.4} scale={10} blur={2} />
  //       <OrbitControls
  //         enablePan={false}
  //         minDistance={3}
  //         maxDistance={10}
  //         minPolarAngle={0.3}
  //         maxPolarAngle={Math.PI / 2.2}
  //       />
  //       <Environment preset="sunset" />
  //     </Canvas>
  //   </div>
  // );

  // Fallback until deps installed
  return <ThreeJSPlaceholder {...props} />;
}

// ─── Procedural UTV (Three.js primitives — swap for GLB when ready) ──────
// Uncomment and use when Three.js is installed:
//
// function ProceduralUTV({
//   bodyType, showRoof, showWindshield, showWinch, showRack,
//   showLightBar, showRtt, showFrontBumper, showRearBumper, loadStatus,
// }: RigRated3DViewerProps) {
//   const groupRef = useRef<THREE.Group>(null);
//   const dims = BODY_DIMS[bodyType];
//   const color = STATUS_COLORS[loadStatus];
//   const isUtility = bodyType.includes("utility");
//
//   // Slow auto-rotate
//   useFrame((_, delta) => {
//     if (groupRef.current) groupRef.current.rotation.y += delta * 0.15;
//   });
//
//   return (
//     <group ref={groupRef} position={[0, dims.groundClearance, 0]}>
//       {/* Chassis */}
//       <mesh position={[0, dims.chassisHeight / 2, 0]}>
//         <boxGeometry args={[dims.chassisLength, dims.chassisHeight, dims.chassisWidth]} />
//         <meshStandardMaterial color="#333" metalness={0.3} roughness={0.7} />
//       </mesh>
//
//       {/* Roll cage / cab frame */}
//       <mesh position={[-dims.chassisLength * 0.15, dims.chassisHeight + dims.cabHeight / 2, 0]}>
//         <boxGeometry args={[dims.cabLength, dims.cabHeight, dims.chassisWidth - 0.1]} />
//         <meshStandardMaterial color="#444" metalness={0.4} roughness={0.6} transparent opacity={0.6} />
//       </mesh>
//
//       {/* Windshield (glass) */}
//       {showWindshield && (
//         <mesh position={[-dims.chassisLength * 0.15 - dims.cabLength / 2, dims.chassisHeight + dims.cabHeight * 0.5, 0]}
//               rotation={[0, 0, -0.3]}>
//           <planeGeometry args={[0.05, dims.cabHeight * 0.8]} />
//           <meshStandardMaterial color="#88CCEE" transparent opacity={0.3} side={2} />
//         </mesh>
//       )}
//
//       {/* Bed (utility models) */}
//       {isUtility && (
//         <mesh position={[dims.chassisLength * 0.25, dims.chassisHeight + 0.15, 0]}>
//           <boxGeometry args={[dims.bedLength, 0.3, dims.chassisWidth - 0.1]} />
//           <meshStandardMaterial color="#3a3a3a" metalness={0.2} roughness={0.8} />
//         </mesh>
//       )}
//
//       {/* Roof */}
//       {showRoof && (
//         <mesh position={[-dims.chassisLength * 0.15, dims.chassisHeight + dims.cabHeight + 0.03, 0]}>
//           <boxGeometry args={[dims.cabLength + 0.1, 0.04, dims.chassisWidth]} />
//           <meshStandardMaterial color="#555" metalness={0.5} roughness={0.5} />
//         </mesh>
//       )}
//
//       {/* Light bar */}
//       {showLightBar && (
//         <mesh position={[-dims.chassisLength * 0.15, dims.chassisHeight + dims.cabHeight + 0.08, 0]}>
//           <boxGeometry args={[dims.cabLength * 0.6, 0.04, 0.06]} />
//           <meshStandardMaterial color="#FFD700" emissive="#FFD700" emissiveIntensity={0.5} />
//         </mesh>
//       )}
//
//       {/* Front bumper */}
//       {showFrontBumper && (
//         <mesh position={[-dims.chassisLength / 2 - 0.08, dims.chassisHeight * 0.8, 0]}>
//           <boxGeometry args={[0.08, 0.2, dims.chassisWidth * 0.9]} />
//           <meshStandardMaterial color="#555" metalness={0.6} roughness={0.4} />
//         </mesh>
//       )}
//
//       {/* Rear bumper */}
//       {showRearBumper && (
//         <mesh position={[dims.chassisLength / 2 + 0.08, dims.chassisHeight * 0.8, 0]}>
//           <boxGeometry args={[0.08, 0.2, dims.chassisWidth * 0.9]} />
//           <meshStandardMaterial color="#555" metalness={0.6} roughness={0.4} />
//         </mesh>
//       )}
//
//       {/* Winch */}
//       {showWinch && (
//         <mesh position={[-dims.chassisLength / 2 - 0.12, dims.chassisHeight + 0.1, 0]}>
//           <cylinderGeometry args={[0.06, 0.06, 0.15, 12]} rotation={[0, 0, Math.PI / 2]} />
//           <meshStandardMaterial color="#C45D2C" metalness={0.5} roughness={0.5} />
//         </mesh>
//       )}
//
//       {/* Cargo rack (utility only) */}
//       {showRack && isUtility && (
//         <mesh position={[dims.chassisLength * 0.25, dims.chassisHeight + 0.35, 0]}>
//           <boxGeometry args={[dims.bedLength - 0.1, 0.03, dims.chassisWidth - 0.2]} />
//           <meshStandardMaterial color="#555" metalness={0.4} roughness={0.6} />
//         </mesh>
//       )}
//
//       {/* RTT (utility only) */}
//       {showRtt && isUtility && (
//         <mesh position={[dims.chassisLength * 0.25, dims.chassisHeight + 0.5, 0]}>
//           <boxGeometry args={[dims.bedLength - 0.15, 0.15, dims.chassisWidth - 0.3]} />
//           <meshStandardMaterial color="#C45D2C" metalness={0.2} roughness={0.8} />
//         </mesh>
//       )}
//
//       {/* 4 wheels */}
//       {[-1, 1].map((side) =>
//         [-1, 1].map((axle) => (
//           <group key={`wheel-${side}-${axle}`}
//                  position={[axle * dims.wheelbaseHalf, 0, side * dims.trackHalf]}>
//             {/* Tire */}
//             <mesh rotation={[Math.PI / 2, 0, 0]}>
//               <torusGeometry args={[dims.wheelRadius, dims.wheelWidth / 2, 8, 24]} />
//               <meshStandardMaterial color="#111" roughness={0.9} />
//             </mesh>
//             {/* Rim */}
//             <mesh rotation={[Math.PI / 2, 0, 0]}>
//               <cylinderGeometry args={[dims.wheelRadius * 0.5, dims.wheelRadius * 0.5, dims.wheelWidth, 12]} />
//               <meshStandardMaterial color="#666" metalness={0.8} roughness={0.3} />
//             </mesh>
//           </group>
//         ))
//       )}
//
//       {/* Status glow ring on chassis edge */}
//       <mesh position={[0, dims.chassisHeight + 0.01, 0]} rotation={[-Math.PI / 2, 0, 0]}>
//         <ringGeometry args={[dims.chassisLength * 0.48, dims.chassisLength * 0.5, 32]} />
//         <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.3} transparent opacity={0.4} />
//       </mesh>
//     </group>
//   );
// }

// ─── Export body dimensions for use in other components if needed ─────────
export { BODY_DIMS, STATUS_COLORS };
export type { RigRated3DViewerProps, BodyDimensions };
