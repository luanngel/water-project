import React from "react";
import grhWatermark from "../../../assets/images/grhWatermark.png";

export default function Watermark({
  opacity = 0.08,
  size = 520,
}: {
  opacity?: number;
  size?: number;
}) {
  return (
    <div className="pointer-events-none fixed inset-0 z-20 overflow-hidden">
      {/* Marca centrada (SIN rotación) */}
      <div
        className="absolute left-1/2 top-1/2"
        style={{
          transform: "translate(-50%, -50%)",
          opacity,
        }}
      >
        <img
          src={grhWatermark}
          alt="GRH Watermark"
          width={size}
          height={size}
          className="select-none object-contain"
          draggable={false}
          style={{ filter: "grayscale(100%)" }} // opcional
        />
      </div>

      {/* Marca secundaria (SIN rotación) */}
      <div
        className="absolute right-[-140px] bottom-[-180px]"
        style={{
          opacity: Math.max(0.04, opacity * 0.55),
        }}
      >
        <img
          src={grhWatermark}
          alt="GRH Watermark"
          width={Math.round(size * 0.75)}
          height={Math.round(size * 0.75)}
          className="select-none object-contain"
          draggable={false}
          style={{ filter: "grayscale(100%)" }} // opcional
        />
      </div>
    </div>
  );
}
