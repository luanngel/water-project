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
import { uploadMyAvatar, updateMyProfile } from "./api/me";

import SettingsModal, {
  type AppSettings,
  loadSettings,
} from "./components/SettingsModals";

export type Page =
  | "home"
  | "projects"
  | "meters"
  | "concentrators"
  | "users"
  | "roles";

export default function App() {
  const [page, setPage] = useState<Page>("home");
  const [subPage, setSubPage] = useState<string>("default");
  const [selectedProject, setSelectedProject] = useState<string>("");

  // ✅ perfil usuario + modal
  const [profileOpen, setProfileOpen] = useState(false);
  const [savingProfile, setSavingProfile] = useState(false);

  const [user, setUser] = useState({
    name: "CESPT Admin",
    email: "admin@cespt.gob.mx",
    avatarUrl: null as string | null,
    organismName: "CESPT", // ✅ NUEVO: Empresa/Organismo
  });

  // Settings state
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [settings, setSettings] = useState<AppSettings>(() => loadSettings());

  const navigateToMetersWithProject = (projectName: string) => {
    setSelectedProject(projectName);
    setSubPage(projectName); // útil para breadcrumb si lo usas
    setPage("meters");
  };

  // ✅ handlers
  const handleUploadAvatar = async (file: File) => {
    // 1) Guardar como base64 en localStorage (demo)
    const base64 = await fileToBase64(file);
    localStorage.setItem("mock_avatar", base64 as string);
  
    // 2) Guardar en state para que se vea inmediato
    setUser((prev) => ({ ...prev, avatarUrl: base64 as string }));
  };
  
  function fileToBase64(file: File) {
    return new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result));
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  // ✅ ahora también recibe organismName
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
        // si backend regresa valores, los usamos; si no, usamos "next" o lo anterior
        name: updated.name ?? next.name ?? prev.name,
        email: updated.email ?? next.email ?? prev.email,
        avatarUrl: updated.avatarUrl ?? prev.avatarUrl,
        organismName: updated.organismName ?? next.organismName ?? prev.organismName,
      }));

      setProfileOpen(false);
    } finally {
      setSavingProfile(false);
    }
  };

  // Aplica theme al cargar / cambiar (para cubrir refresh)
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

  return (
    // Blindaje global del layout
    <div
      className={[
        "flex h-screen w-full overflow-hidden",
        settings.compactMode ? "text-sm" : "",
      ].join(" ")}
    >
      {/* Sidebar no debe encogerse */}
      <div className="shrink-0">
        <Sidebar
          setPage={(p) => {
            setPage(p);
            setSubPage("default");
            if (p !== "meters") setSelectedProject("");
          }}
        />
      </div>

      {/* min-w-0: evita que páginas anchas (tablas) empujen el layout */}
      <div className="flex min-w-0 flex-1 flex-col">
        <div className="shrink-0">
          <TopMenu
            page={page}
            subPage={subPage}
            setSubPage={setSubPage}
            setPage={setPage}
            onOpenSettings={() => setSettingsOpen(true)}
            // props de perfil
            userName={user.name}
            userEmail={user.email}
            avatarUrl={user.avatarUrl}
            onOpenProfile={() => setProfileOpen(true)}
            onUploadAvatar={handleUploadAvatar}
          />
        </div>

        {/* Scroll solo aquí */}
        <main className="min-w-0 flex-1 overflow-auto">{renderPage()}</main>
      </div>

      {/* Settings modal */}
      <SettingsModal
        open={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        settings={settings}
        setSettings={setSettings}
      />

      {/* ✅ Profile modal (con avatar + cambiar img + empresa) */}
      <ProfileModal
        open={profileOpen}
        loading={savingProfile}
        avatarUrl={user.avatarUrl} // ✅ NUEVO
        initial={{
          name: user.name,
          email: user.email,
          organismName: user.organismName, // ✅ NUEVO
        }}
        onClose={() => setProfileOpen(false)}
        onSave={handleSaveProfile}
        onUploadAvatar={handleUploadAvatar} // ✅ NUEVO (botón Cambiar img en modal)
      />
    </div>
  );
}
