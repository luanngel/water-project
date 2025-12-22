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
    <div className="flex h-screen">
      <Sidebar setPage={setPage} />
      <div className="flex-1 flex flex-col">
        <TopMenu page={page} subPage={subPage} setSubPage={setSubPage} />
        <main className="flex-1 overflow-auto">
          {renderPage()}
        </main>
      </div>
    </div>
  );
}
