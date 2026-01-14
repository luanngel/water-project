import { useMemo, useState } from "react";
import { Plus, Trash2, Pencil, RefreshCcw } from "lucide-react";
import type { Meter } from "../../api/meters";
import { createMeter, deleteMeter, updateMeter } from "../../api/meters";
import ConfirmModal from "../../components/layout/common/ConfirmModal";

import { useMeters } from "./useMeters";
import MetersSidebar from "./MetersSidebar";
import MetersTable from "./MetersTable";
import MetersModal from "./MetersModal";

/* ================= TYPES (exportables para otros componentes) ================= */

export interface DeviceData {
  "Device ID": number;
  "Device EUI": string;
  "Join EUI": string;
  AppKey: string;
  meterId?: string;
}

export type ProjectStatus = "ACTIVO" | "INACTIVO";

export type ProjectCard = {
  name: string;
  region: string;
  projects: number;
  meters: number;
  activeAlerts: number;
  lastSync: string;
  contact: string;
  status: ProjectStatus;
};

export type TakeType = "GENERAL" | "LORA" | "LORAWAN" | "GRANDES";

/* ================= MOCKS (sin backend) ================= */

const MOCK_PROJECTS_BY_TYPE: Record<
  Exclude<TakeType, "GENERAL">,
  Array<{ name: string; meters?: number }>
> = {
  LORA: [
    { name: "LoRa - Demo 01", meters: 12 },
    { name: "LoRa - Demo 02", meters: 7 },
  ],
  LORAWAN: [{ name: "LoRaWAN - Demo 01", meters: 4 }],
  GRANDES: [{ name: "Grandes - Demo 01", meters: 2 }],
};

/* ================= COMPONENT ================= */

export default function MetersPage({
  selectedProject: initialProject,
}: { selectedProject?: string } = {}) {
  const m = useMeters({ initialProject });

  // UI state
  const [takeType, setTakeType] = useState<TakeType>("GENERAL");
  const isMockMode = takeType !== "GENERAL";

  const [activeMeter, setActiveMeter] = useState<Meter | null>(null);
  const [search, setSearch] = useState("");

  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const emptyMeter: Omit<Meter, "id"> = useMemo(
    () => ({
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      areaName: "",
      accountNumber: null,
      userName: null,
      userAddress: null,
      meterSerialNumber: "",
      meterName: "",
      meterStatus: "Installed",
      protocolType: "",
      priceNo: null,
      priceName: null,
      dmaPartition: null,
      supplyTypes: "",
      deviceId: "",
      deviceName: "",
      deviceType: "",
      usageAnalysisType: "",
      installedTime: new Date().toISOString(),
    }),
    []
  );

  const emptyDeviceData: DeviceData = useMemo(
    () => ({
      "Device ID": 0,
      "Device EUI": "",
      "Join EUI": "",
      AppKey: "",
    }),
    []
  );

  const [form, setForm] = useState<Omit<Meter, "id">>(emptyMeter);
  const [deviceForm, setDeviceForm] = useState<DeviceData>(emptyDeviceData);
  const [errors, setErrors] = useState<Record<string, boolean>>({});

  // Projects cards (real)
  const projectsDataReal: ProjectCard[] = useMemo(() => {
    const baseRegion = "Baja California";
    const baseContact = "Operaciones";
    const baseLastSync = "Hace 1 h";

    return m.allProjects.map((name) => ({
      name,
      region: baseRegion,
      projects: 1,
      meters: m.projectsCounts[name] ?? 0,
      activeAlerts: 0,
      lastSync: baseLastSync,
      contact: baseContact,
      status: "ACTIVO",
    }));
  }, [m.allProjects, m.projectsCounts]);

  // Projects cards (mock)
  const projectsDataMock: ProjectCard[] = useMemo(() => {
    const baseRegion = "Baja California";
    const baseContact = "Operaciones";
    const baseLastSync = "Hace 1 h";

    const mocks = MOCK_PROJECTS_BY_TYPE[takeType as Exclude<TakeType, "GENERAL">] ?? [];
    return mocks.map((x) => ({
      name: x.name,
      region: baseRegion,
      projects: 1,
      meters: x.meters ?? 0,
      activeAlerts: 0,
      lastSync: baseLastSync,
      contact: baseContact,
      status: "ACTIVO",
    }));
  }, [takeType]);

  const sidebarProjects = isMockMode ? projectsDataMock : projectsDataReal;

  // Search filtered
  const searchFiltered = useMemo(() => {
    if (isMockMode) return [];
    const q = search.trim().toLowerCase();
    if (!q) return m.filteredMeters;

    return m.filteredMeters.filter((x) => {
      return (
        (x.meterName ?? "").toLowerCase().includes(q) ||
        (x.meterSerialNumber ?? "").toLowerCase().includes(q) ||
        (x.deviceId ?? "").toLowerCase().includes(q) ||
        (x.areaName ?? "").toLowerCase().includes(q)
      );
    });
  }, [isMockMode, search, m.filteredMeters]);

  // Device config mock
  const createOrUpdateDevice = async (deviceData: DeviceData): Promise<void> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        console.log("Device data that would be sent to API:", deviceData);
        resolve();
      }, 500);
    });
  };

  // Validation
  const validateForm = (): boolean => {
    const next: Record<string, boolean> = {};

    if (!form.meterName.trim()) next["meterName"] = true;
    if (!form.meterSerialNumber.trim()) next["meterSerialNumber"] = true;
    if (!form.areaName.trim()) next["areaName"] = true;
    if (!form.deviceName.trim()) next["deviceName"] = true;
    if (!form.protocolType.trim()) next["protocolType"] = true;

    if (!deviceForm["Device ID"] || deviceForm["Device ID"] === 0) next["Device ID"] = true;
    if (!deviceForm["Device EUI"].trim()) next["Device EUI"] = true;
    if (!deviceForm["Join EUI"].trim()) next["Join EUI"] = true;
    if (!deviceForm["AppKey"].trim()) next["AppKey"] = true;

    setErrors(next);
    return Object.keys(next).length === 0;
  };

  // CRUD
  const handleSave = async () => {
    if (isMockMode) return;
    if (!validateForm()) return;

    try {
      let savedMeter: Meter;

      if (editingId) {
        const meterToUpdate = m.meters.find((x) => x.id === editingId);
        if (!meterToUpdate) throw new Error("Meter to update not found");

        const updatedMeter = await updateMeter(editingId, form);
        m.setMeters((prev) => prev.map((x) => (x.id === editingId ? updatedMeter : x)));
        savedMeter = updatedMeter;
      } else {
        const newMeter = await createMeter(form);
        m.setMeters((prev) => [...prev, newMeter]);
        savedMeter = newMeter;
      }

      try {
        const deviceDataWithRef = { ...deviceForm, meterId: savedMeter.id };
        await createOrUpdateDevice(deviceDataWithRef);
      } catch (deviceError) {
        console.error("Error saving device data:", deviceError);
        alert("Meter saved, but there was an error saving device data.");
      }

      setShowModal(false);
      setEditingId(null);
      setForm(emptyMeter);
      setDeviceForm(emptyDeviceData);
      setErrors({});
      setActiveMeter(null);
    } catch (error) {
      console.error("Error saving meter:", error);
      alert(
        `Error saving meter: ${error instanceof Error ? error.message : "Please try again."}`
      );
    }
  };

  const handleDelete = async () => {
    if (isMockMode) return;
    if (!activeMeter) return;

    try {
      await deleteMeter(activeMeter.id);
      m.setMeters((prev) => prev.filter((x) => x.id !== activeMeter.id));
      setActiveMeter(null);
    } catch (error) {
      console.error("Error deleting meter:", error);
      alert(
        `Error deleting meter: ${error instanceof Error ? error.message : "Please try again."}`
      );
    }
  };

  const handleRefresh = () => {
    m.loadMeters();
    setActiveMeter(null);
  };

  const resetSelection = () => {
    setActiveMeter(null);
    setSearch("");
  };

  return (
    <div className="flex gap-6 p-6 w-full bg-gray-100">
      {/* SIDEBAR */}
      <MetersSidebar
        loadingProjects={m.loadingProjects}
        takeType={takeType}
        setTakeType={setTakeType}
        selectedProject={m.selectedProject}
        setSelectedProject={m.setSelectedProject}
        isMockMode={isMockMode}
        projects={sidebarProjects}
        onRefresh={handleRefresh}
        refreshDisabled={false}
        allProjects={m.allProjects}
        onResetSelection={resetSelection}
      />

      {/* MAIN */}
      <main className="flex-1 flex flex-col gap-6 min-w-0">
        <div
          className="rounded-xl shadow p-6 text-white flex justify-between items-center"
          style={{ background: "linear-gradient(135deg, #4c5f9e, #2a355d, #566bb8)" }}
        >
          <div>
            <h1 className="text-2xl font-bold">Meter Management</h1>
            <p className="text-sm text-blue-100">
              {isMockMode
                ? `Modo demo (${takeType}) - backend pendiente`
                : m.selectedProject
                ? `Proyecto: ${m.selectedProject}`
                : "Selecciona un proyecto desde el panel izquierdo"}
            </p>
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => {
                if (isMockMode) return;

                const base = { ...emptyMeter };
                if (m.selectedProject) base.areaName = m.selectedProject;

                setForm(base);
                setDeviceForm(emptyDeviceData);
                setErrors({});
                setEditingId(null);
                setShowModal(true);
              }}
              disabled={isMockMode || !m.selectedProject || m.allProjects.length === 0}
              className="flex items-center gap-2 px-4 py-2 bg-white text-[#4c5f9e] rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Plus size={16} /> Agregar
            </button>

            <button
              onClick={() => {
                if (isMockMode) return;
                if (!activeMeter) return;

                setEditingId(activeMeter.id);
                setForm({
                  createdAt: activeMeter.createdAt,
                  updatedAt: activeMeter.updatedAt,
                  areaName: activeMeter.areaName,
                  accountNumber: activeMeter.accountNumber,
                  userName: activeMeter.userName,
                  userAddress: activeMeter.userAddress,
                  meterSerialNumber: activeMeter.meterSerialNumber,
                  meterName: activeMeter.meterName,
                  meterStatus: activeMeter.meterStatus,
                  protocolType: activeMeter.protocolType,
                  priceNo: activeMeter.priceNo,
                  priceName: activeMeter.priceName,
                  dmaPartition: activeMeter.dmaPartition,
                  supplyTypes: activeMeter.supplyTypes,
                  deviceId: activeMeter.deviceId,
                  deviceName: activeMeter.deviceName,
                  deviceType: activeMeter.deviceType,
                  usageAnalysisType: activeMeter.usageAnalysisType,
                  installedTime: activeMeter.installedTime,
                });
                setDeviceForm(emptyDeviceData);
                setErrors({});
                setShowModal(true);
              }}
              disabled={isMockMode || !activeMeter}
              className="flex items-center gap-2 px-4 py-2 border border-white/40 rounded-lg disabled:opacity-60"
            >
              <Pencil size={16} /> Editar
            </button>

            <button
              onClick={() => {
                if (isMockMode) return;
                setConfirmOpen(true);
              }}
              disabled={isMockMode || !activeMeter}
              className="flex items-center gap-2 px-4 py-2 border border-white/40 rounded-lg disabled:opacity-60"
            >
              <Trash2 size={16} /> Eliminar
            </button>

            <button
              onClick={handleRefresh}
              className="flex items-center gap-2 px-4 py-2 border border-white/40 rounded-lg"
            >
              <RefreshCcw size={16} /> Actualizar
            </button>
          </div>
        </div>

        <input
          className="bg-white rounded-lg shadow px-4 py-2 text-sm"
          placeholder="Search by meter name, serial number, device ID, or area..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          disabled={isMockMode || !m.selectedProject}
        />

        <MetersTable
          data={searchFiltered}
          isLoading={m.loadingMeters}
          isMockMode={isMockMode}
          selectedProject={m.selectedProject}
          activeMeter={activeMeter}
          onRowClick={(row) => setActiveMeter(row)}
        />

        <ConfirmModal
          open={confirmOpen}
          title="Eliminar medidor"
          message={`¿Estás seguro que quieres eliminar "${
            activeMeter?.meterName ?? "este medidor"
          }" (${activeMeter?.meterSerialNumber ?? "—"})? Esta acción no se puede deshacer.`}
          confirmText="Eliminar"
          cancelText="Cancelar"
          danger
          loading={deleting}
          onClose={() => setConfirmOpen(false)}
          onConfirm={async () => {
            setDeleting(true);
            try {
              await handleDelete();
              setConfirmOpen(false);
            } finally {
              setDeleting(false);
            }
          }}
        />
      </main>

      {showModal && (
        <MetersModal
          editingId={editingId}
          form={form}
          setForm={setForm}
          deviceForm={deviceForm}
          setDeviceForm={setDeviceForm}
          errors={errors}
          setErrors={setErrors}
          onClose={() => {
            setShowModal(false);
            setDeviceForm(emptyDeviceData);
            setErrors({});
          }}
          onSave={handleSave}
        />
      )}
    </div>
  );
}
