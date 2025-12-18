import { useState } from "react";
import Sidebar from "./components/layout/Sidebar";
import TopMenu from "./components/layout/TopMenu";

import Home from "./pages/Home";
import MetersPage from "./pages/meters/MeterPage";
import ConcentratorsPage from "./pages/concentrators/ConcentratorsPage";
import UsersPage from "./pages/UsersPage"; // nueva página
import RolesPage from "./pages/RolesPage"; // nueva página

export default function App() {
  const [page, setPage] = useState("home");

  const renderPage = () => {
    switch (page) {
      case "meters":
        return <MetersPage />;
      case "concentrators":
        return <ConcentratorsPage />;
      case "users":
        return <UsersPage />; // nueva
      case "roles":
        return <RolesPage />; // nueva
      case "home":
      default:
        return <Home />;
    }
  };

  return (
    <div className="flex h-screen">
      <Sidebar setPage={setPage} />
      <div className="flex-1 flex flex-col">
        <TopMenu />
        <main className="flex-1 overflow-auto">{renderPage()}</main>
      </div>
    </div>
  );
}
