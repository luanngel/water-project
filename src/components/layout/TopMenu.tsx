import React, { useEffect, useMemo, useRef, useState } from "react";
import { Bell, User, LogOut } from "lucide-react";

interface TopMenuProps {
  page: string;
  subPage: string;
  setSubPage: (subPage: string) => void;

  userName?: string;
  userEmail?: string;
  avatarUrl?: string | null;

  onOpenProfile?: () => void;

  // ✅ NUEVO: en vez de cerrar, pedimos confirmación desde App
  onRequestLogout?: () => void;
}

const TopMenu: React.FC<TopMenuProps> = ({
  page,
  subPage,
  setSubPage,

  userName = "Usuario",
  userEmail,
  avatarUrl = null,

  onOpenProfile,
  onRequestLogout,
}) => {
  const [openUserMenu, setOpenUserMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement | null>(null);

  const initials = useMemo(() => {
    const parts = (userName || "").trim().split(/\s+/).filter(Boolean);
    const a = parts[0]?.[0] ?? "U";
    const b = parts[1]?.[0] ?? "";
    return (a + b).toUpperCase();
  }, [userName]);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (!openUserMenu) return;
      const el = menuRef.current;
      if (el && !el.contains(e.target as Node)) setOpenUserMenu(false);
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [openUserMenu]);

  useEffect(() => {
    function handleEsc(e: KeyboardEvent) {
      if (e.key === "Escape") setOpenUserMenu(false);
    }
    document.addEventListener("keydown", handleEsc);
    return () => document.removeEventListener("keydown", handleEsc);
  }, []);

  return (
    <header
       className="relative z-20 h-14 shrink-0 flex items-center justify-between px-4 text-white"
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
          type="button"
        >
          <Bell size={20} />
        </button>

        {/* USER MENU */}
        <div className="relative" ref={menuRef}>
          <button
            type="button"
            aria-label="Perfil"
            aria-haspopup="menu"
            aria-expanded={openUserMenu}
            onClick={() => setOpenUserMenu((v) => !v)}
            className="w-9 h-9 rounded-full bg-white/15 flex items-center justify-center cursor-pointer hover:bg-white/25 transition overflow-hidden"
            title="Perfil"
          >
            {avatarUrl ? (
              <img
                src={avatarUrl}
                alt="Avatar"
                className="w-full h-full object-cover"
              />
            ) : (
              <span className="text-xs font-bold opacity-90">{initials}</span>
            )}
          </button>

          {openUserMenu && (
            <div
              role="menu"
              className="
                absolute right-0 mt-2 w-80
                rounded-2xl bg-white border border-slate-200
                shadow-xl overflow-hidden z-50
              "
            >
              {/* Header usuario */}
              <div className="px-5 py-4 border-b border-slate-200">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-full bg-slate-100 overflow-hidden flex items-center justify-center">
                    {avatarUrl ? (
                      <img
                        src={avatarUrl}
                        alt="Avatar"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span className="text-sm font-semibold text-slate-700">
                        {initials}
                      </span>
                    )}
                  </div>

                  <div className="min-w-0">
                    <div className="text-sm font-semibold text-slate-900 truncate">
                      {userName}
                    </div>
                    {userEmail ? (
                      <div className="text-xs text-slate-500 truncate">
                        {userEmail}
                      </div>
                    ) : (
                      <div className="text-xs text-slate-400 truncate">—</div>
                    )}
                  </div>
                </div>
              </div>

              <MenuItem
                label="Ver / editar perfil"
                onClick={() => {
                  setOpenUserMenu(false);
                  onOpenProfile?.();
                }}
                left={<User size={16} />}
              />

              <div className="h-px bg-slate-200 my-1" />

              <MenuItem
                label="Cerrar sesión"
                tone="danger"
                onClick={() => {
                  setOpenUserMenu(false);
                  onRequestLogout?.(); // ✅ abre confirm modal en App
                }}
                left={<LogOut size={16} />}
              />
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

function MenuItem({
  label,
  onClick,
  disabled,
  tone = "default",
  left,
}: {
  label: string;
  onClick: () => void;
  disabled?: boolean;
  tone?: "default" | "danger";
  left?: React.ReactNode;
}) {
  return (
    <button
      type="button"
      role="menuitem"
      disabled={disabled}
      onClick={onClick}
      className={[
        "w-full flex items-center gap-3 px-5 py-3 text-sm text-left",
        "transition-colors",
        disabled ? "opacity-40 cursor-not-allowed" : "hover:bg-slate-100",
        tone === "danger"
          ? "text-red-600 hover:text-red-700"
          : "text-slate-700",
      ].join(" ")}
    >
      <span className="text-slate-400">{left}</span>
      <span className="font-medium">{label}</span>
    </button>
  );
}

export default TopMenu;
