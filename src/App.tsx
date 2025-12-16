import { useState } from "react";
import Sidebar from "./pages/Sidebar";
import TopMenu from "./pages/TopMenu";
import AreaManagement from "./pages/AreaManagement";
import OperatorManagement from "./pages/OperatorManagement";
import Home from "./pages/Home";

// Tipos para las páginas que reciben subPage
interface PageProps {
  subPage: string;
}

export default function App() {
  const [page, setPage] = useState<string>("home");
  const [subPage, setSubPage] = useState<string>("default");

  const renderContent = () => {
    switch (page) {
      case "home":
        return <Home />;
      case "area":
        return <AreaManagement subPage={subPage} />; // ahora tipado correctamente
      case "operator":
        return <OperatorManagement subPage={subPage} />; // también
      default:
        return <div>Selecciona una opción</div>;
    }
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden">
      {/* SIDEBAR */}
      <Sidebar setPage={setPage} />

      {/* MAIN */}
      <div className="flex flex-col flex-1 overflow-hidden">
        <TopMenu page={page} subPage={subPage} setSubPage={setSubPage} />

        <main className="flex-1 overflow-auto bg-gray-100 p-4">
          {renderContent()}
        </main>
      </div>
    </div>
  );
}
