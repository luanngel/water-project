import { useState } from "react";
import {
  Home,
  Settings,
  WaterDrop,
  ExpandMore,
  ExpandLess,
  Menu,
} from "@mui/icons-material";

export default function Sidebar({ setPage }: any) {
  const [systemOpen, setSystemOpen] = useState(true);
  const [waterOpen, setWaterOpen] = useState(true);
  const [pinned, setPinned] = useState(false);
  const [hovered, setHovered] = useState(false);

  const isExpanded = pinned || hovered;

  return (
    <aside
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className={`
        h-full bg-[#1f2a48] border-r border-white/10
        transition-all duration-300 flex flex-col overflow-hidden
        ${isExpanded ? "w-72" : "w-16"}
      `}
    >
      {/* HEADER */}
      <div className="border-b border-white/10 px-4 py-3 flex items-center gap-3">
        <button
          onClick={() => setPinned(!pinned)}
          className="text-white opacity-90 hover:opacity-100"
        >
          <Menu />
        </button>

        {isExpanded && (
          <span className="text-lg font-bold text-white whitespace-nowrap">
            Water System
          </span>
        )}
      </div>

      {/* MENU */}
      <div className="flex-1 py-4 px-2 overflow-y-auto">
        <ul className="space-y-1 text-white text-sm">

          {/* DASHBOARD */}
          <li>
            <button
              onClick={() => setPage("home")}
              className="flex items-center w-full px-2 py-2 rounded-md hover:bg-white/10 font-bold"
            >
              <Home className="w-5 h-5 shrink-0" />
              {isExpanded && <span className="ml-3">Dashboard</span>}
            </button>
          </li>

          {/* SYSTEM SETTINGS */}
          <li>
            <button
              onClick={() => isExpanded && setSystemOpen(!systemOpen)}
              className="flex items-center w-full px-2 py-2 rounded-md hover:bg-white/10 font-bold"
            >
              <Settings className="w-5 h-5 shrink-0" />
              {isExpanded && (
                <>
                  <span className="ml-3 flex-1 text-left">
                    System Settings
                  </span>
                  {systemOpen ? <ExpandLess /> : <ExpandMore />}
                </>
              )}
            </button>

            {isExpanded && systemOpen && (
              <ul className="mt-1 space-y-1 text-xs">
                <li>
                  <button
                    onClick={() => setPage("area")}
                    className="pl-10 w-full text-left px-2 py-1.5 rounded-md hover:bg-white/10"
                  >
                    Area Management
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => setPage("operator")}
                    className="pl-10 w-full text-left px-2 py-1.5 rounded-md hover:bg-white/10"
                  >
                    Operator Management
                  </button>
                </li>
              </ul>
            )}
          </li>

          {/* WATER METER SYSTEM */}
          <li>
            <button
              onClick={() => isExpanded && setWaterOpen(!waterOpen)}
              className="flex items-center w-full px-2 py-2 rounded-md hover:bg-white/10 font-bold"
            >
              <WaterDrop className="w-5 h-5 shrink-0" />
              {isExpanded && (
                <>
                  <span className="ml-3 flex-1 text-left">
                    Water Meter System Management
                  </span>
                  {waterOpen ? <ExpandLess /> : <ExpandMore />}
                </>
              )}
            </button>

            {isExpanded && waterOpen && (
              <ul className="mt-1 space-y-1 text-xs">
                {[
                  ["water-install", "Water Meter Installation"],
                  ["device-install", "Device Installation"],
                  ["meter-management", "Meter Management"],
                  ["device-management", "Device Management"],
                  ["data-monitoring", "Data Monitoring"],
                  ["data-query", "Data Query"],
                ].map(([key, label]) => (
                  <li key={key}>
                    <button
                      onClick={() => setPage(key)}
                      className="pl-10 w-full text-left px-2 py-1.5 rounded-md hover:bg-white/10"
                    >
                      {label}
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </li>

        </ul>
      </div>
    </aside>
  );
}
