import { useEffect, useState } from "react";
import Sidebar from "./components/layout/Sidebar";
import TopMenu from "./components/layout/TopMenu";

import Home from "./pages/Home";
import MetersPage from "./pages/meters/MeterPage";
import ConcentratorsPage from "./pages/concentrators/ConcentratorsPage";
import ProjectsPage from "./pages/projects/ProjectsPage";
import UsersPage from "./pages/UsersPage";
import RolesPage from "./pages/RolesPage";
import ProfileModal from "./components/layout/common/ProfileModal";
import { updateMyProfile } from "./api/me";

import SettingsModal, {
  type AppSettings,
  loadSettings,
} from "./components/SettingsModals";

import LoginPage from "./pages/LoginPage";

// ✅ NUEVO
import ConfirmModal from "./components/layout/common/ConfirmModal";
import Watermark from "./components/layout/common/Watermark";

export type Page =
  | "home"
  | "projects"
  | "meters"
  | "concentrators"
  | "users"
  | "roles";

const AUTH_KEY = "grh_auth";

export default function App() {
  const [isAuth, setIsAuth] = useState<boolean>(() => {
    return Boolean(localStorage.getItem(AUTH_KEY));
  });

  const handleLogin = (payload?: { token?: string }) => {
    localStorage.setItem(
      AUTH_KEY,
      JSON.stringify({ token: payload?.token ?? "demo", ts: Date.now() })
    );
    setIsAuth(true);
  };

  const handleLogout = () => {
    localStorage.removeItem(AUTH_KEY);
    setIsAuth(false);
    // opcional: reset de navegación
    setPage("home");
    setSubPage("default");
    setSelectedProject("");
  };

  // ✅ confirm logout modal state
  const [logoutOpen, setLogoutOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  const [page, setPage] = useState<Page>("home");
  const [subPage, setSubPage] = useState<string>("default");
  const [selectedProject, setSelectedProject] = useState<string>("");

  const [profileOpen, setProfileOpen] = useState(false);
  const [savingProfile, setSavingProfile] = useState(false);

  const [user, setUser] = useState({
    name: "CESPT Admin",
    email: "admin@cespt.gob.mx",
    avatarUrl: null as string | null,
    organismName: "CESPT",
  });

  const [settingsOpen, setSettingsOpen] = useState(false);
  const [settings, setSettings] = useState<AppSettings>(() => loadSettings());

  const navigateToMetersWithProject = (projectName: string) => {
    setSelectedProject(projectName);
    setSubPage(projectName);
    setPage("meters");
  };

  const handleUploadAvatar = async (file: File) => {
    const base64 = await fileToBase64(file);
    localStorage.setItem("mock_avatar", base64);
    setUser((prev) => ({ ...prev, avatarUrl: base64 }));
  };

  function fileToBase64(file: File) {
    return new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result));
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  const handleSaveProfile = async (next: {
    name: string;
    email: string;
    organismName?: string;
  }) => {
    setSavingProfile(true);
    try {
      const updated = await updateMyProfile(next);

      setUser((prev) => ({
        ...prev,
        name: updated.name ?? next.name ?? prev.name,
        email: updated.email ?? next.email ?? prev.email,
        avatarUrl: updated.avatarUrl ?? prev.avatarUrl,
        organismName:
          updated.organismName ?? next.organismName ?? prev.organismName,
      }));

      setProfileOpen(false);
    } finally {
      setSavingProfile(false);
    }
  };

  useEffect(() => {
    const root = document.documentElement;
    root.classList.remove("dark");

    if (settings.theme === "dark") root.classList.add("dark");
    if (settings.theme === "system") {
      const prefersDark = window.matchMedia?.(
        "(prefers-color-scheme: dark)"
      )?.matches;
      if (prefersDark) root.classList.add("dark");
    }
  }, [settings.theme]);

  const renderPage = () => {
    switch (page) {
      case "projects":
        return <ProjectsPage />;
      case "meters":
        return <MetersPage selectedProject={selectedProject} />;
      case "concentrators":
        return <ConcentratorsPage />;
      case "users":
        return <UsersPage />;
      case "roles":
        return <RolesPage />;
      case "home":
      default:
        return (
          <Home
            setPage={(p) => {
              setPage(p);
              setSubPage("default");
            }}
            navigateToMetersWithProject={navigateToMetersWithProject}
          />
        );
    }
  };

  if (!isAuth) {
    return <LoginPage onSuccess={handleLogin} />;
  }

  return (
    <div
      className={[
        "flex h-screen w-full overflow-hidden",
        settings.compactMode ? "text-sm" : "",
      ].join(" ")}
    >
      <div className="shrink-0">
        <Sidebar
          setPage={(p) => {
            setPage(p);
            setSubPage("default");
            if (p !== "meters") setSelectedProject("");
          }}
        />
      </div>

      <div className="flex min-w-0 flex-1 flex-col">
        <div className="shrink-0">
          <TopMenu
            page={page}
            subPage={subPage}
            setSubPage={setSubPage}
            userName={user.name}
            userEmail={user.email}
            avatarUrl={user.avatarUrl}
            onOpenProfile={() => setProfileOpen(true)}
            // ✅ en vez de cerrar, abrimos confirm modal
            onRequestLogout={() => setLogoutOpen(true)}
          />
        </div>

        {/* ✅ AQUÍ VA LA MARCA DE AGUA */}
        <main className="relative min-w-0 flex-1 overflow-auto">
          <Watermark />
          <div className="relative z-10">{renderPage()}</div>
        </main>
      </div>

      <SettingsModal
        open={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        settings={settings}
        setSettings={setSettings}
      />

      <ProfileModal
        open={profileOpen}
        loading={savingProfile}
        avatarUrl={user.avatarUrl}
        initial={{
          name: user.name,
          email: user.email,
          organismName: user.organismName,
        }}
        onClose={() => setProfileOpen(false)}
        onSave={handleSaveProfile}
        onUploadAvatar={handleUploadAvatar}
      />

      {/* ✅ ConfirmModal: Cerrar sesión */}
      <ConfirmModal
        open={logoutOpen}
        title="Cerrar sesión"
        message="¿Estás seguro que deseas cerrar sesión?"
        confirmText="Cerrar sesión"
        cancelText="Cancelar"
        danger
        loading={loggingOut}
        onClose={() => setLogoutOpen(false)}
        onConfirm={async () => {
          setLoggingOut(true);
          try {
            handleLogout();
            setLogoutOpen(false);
          } finally {
            setLoggingOut(false);
          }
        }}
      />
    </div>
  );
}
