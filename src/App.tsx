import { useState } from "react";
import Sidebar from "./components/layout/Sidebar";
import TopMenu from "./components/layout/TopMenu";

import Home from "./pages/Home";
import MetersPage from "./pages/meters/MeterPage";
import ConcentratorsPage from "./pages/concentrators/ConcentratorsPage";
import ProjectsPage from "./pages/projects/ProjectsPage";
import UsersPage from "./pages/UsersPage";
import RolesPage from "./pages/RolesPage";

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

  const navigateToMetersWithProject = (projectName: string) => {
    setSelectedProject(projectName);
    setPage("meters");
  };

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
        return <Home setPage={setPage} navigateToMetersWithProject={navigateToMetersWithProject} />;
    }
  };

  return (
    // Blindaje global del layout
    <div className="flex h-screen w-full overflow-hidden">
      {/* Sidebar no debe encogerse */}
      <div className="shrink-0">
        <Sidebar setPage={setPage} />
      </div>
  
      {/* min-w-0: evita que páginas anchas (tablas) empujen el layout */}
      <div className="flex min-w-0 flex-1 flex-col">
        <div className="shrink-0">
          <TopMenu page={page} subPage={subPage} setSubPage={setSubPage} />
        </div>
  
        {/* Scroll solo aquí */}
        <main className="min-w-0 flex-1 overflow-auto">
          {renderPage()}
        </main>
      </div>
    </div>
  );
}  