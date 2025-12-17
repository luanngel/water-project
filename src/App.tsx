import { useState } from "react";
import Sidebar from "./pages/Sidebar";
import TopMenu from "./pages/TopMenu";
import AreaManagement from "./pages/AreaManagement";
import OperatorManagement from "./pages/OperatorManagement";
import DeviceManagement from "./pages/DeviceManagement";
import DataMonitoring from "./pages/DataMonitoring";
import DataQuery from "./pages/DataQuery";
import Home from "./pages/Home";


export default function App() {
  const [page, setPage] = useState<string>("home");
  const [subPage, setSubPage] = useState<string>("default");

  const renderContent = () => {
    switch (page) {
      case "home":
        return <Home />;
      case "area":
        return <AreaManagement />;
      case "operator":
        return <OperatorManagement />;
      case "device-management":
        return <DeviceManagement />;
      case "data-monitoring":
        return <DataMonitoring subPage={subPage} />;
      case "data-query":
        return <DataQuery subPage={subPage} />;
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
