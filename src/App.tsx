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

  const renderPage = () => {
    switch (page) {
      case "projects":
        return <ProjectsPage />;
      case "meters":
        return <MetersPage />;
      case "concentrators":
        return <ConcentratorsPage />;
      case "users":
        return <UsersPage />;
      case "roles":
        return <RolesPage />;
      case "home":
      default:
        return <Home setPage={setPage} />;
    }
  };

  return (
    <div className="flex h-screen">
      <Sidebar setPage={setPage} />
      <div className="flex-1 flex flex-col">
        <TopMenu />
        <main className="flex-1 overflow-auto">
          {renderPage()}
        </main>
      </div>
    </div>
  );
}
