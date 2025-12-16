import React from "react";
import { Bell, User, Settings } from "lucide-react";

interface TopMenuProps {
  page: string;
  subPage: string;
  setSubPage: (subPage: string) => void;
}

const TopMenu: React.FC<TopMenuProps> = ({ page, subPage, setSubPage }) => {
  return (
    <header
      className="h-14 shrink-0 flex items-center justify-between px-4 text-white"
      style={{
        background:
          "linear-gradient(135deg, #4c5f9e, #2a355d, #566bb8, #3d4e87)",
      }}
    >
      {/* IZQUIERDA */}
      <div className="flex items-center gap-2 text-sm font-medium opacity-90">
        {page !== "home" && (
          <>
            <span className="capitalize">{page}</span>
            {subPage !== "default" && (
              <>
                <span className="opacity-60">/</span>
                <span className="capitalize">{subPage}</span>
              </>
            )}
          </>
        )}
      </div>

      {/* DERECHA */}
      <div className="flex items-center gap-3">
        <button
          aria-label="Notificaciones"
          className="p-2 rounded-full hover:bg-white/10 transition"
        >
          <Bell size={20} />
        </button>

        <button
          aria-label="Configuración"
          className="p-2 rounded-full hover:bg-white/10 transition"
        >
          <Settings size={20} />
        </button>

        <div
          className="w-9 h-9 rounded-full bg-white/15 flex items-center justify-center cursor-pointer hover:bg-white/25 transition"
          title="Perfil"
        >
          <User size={20} />
        </div>
      </div>
    </header>
  );
};

export default TopMenu;
