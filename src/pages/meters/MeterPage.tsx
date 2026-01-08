import { useEffect, useMemo, useState } from "react";
import { Plus, Trash2, Pencil, RefreshCcw } from "lucide-react";
import MaterialTable from "@material-table/core";
import {
  fetchMeters,
  createMeter,
  updateMeter,
  deleteMeter,
  type Meter,
} from "../../api/meters";
import ConfirmModal from "../../components/layout/common/ConfirmModal"; // ✅ NUEVO

interface DeviceData {
  "Device ID": number;
  "Device EUI": string;
  "Join EUI": string;
  AppKey: string;
  meterId?: string;
}

type ProjectStatus = "ACTIVO" | "INACTIVO";

type ProjectCard = {
  name: string;
  region: string;
  projects: number; // placeholder
  meters: number;
  activeAlerts: number;
  lastSync: string;
  contact: string;
  status: ProjectStatus;
};

/* ================= COMPONENT ================= */
export default function MeterManagement({
  selectedProject: initialProject,
}: { selectedProject?: string } = {}) {
  const [allProjects, setAllProjects] = useState<string[]>([]);
  const [loadingProjects, setLoadingProjects] = useState(true);

  const [selectedProject, setSelectedProject] = useState(initialProject || "");

  const [meters, setMeters] = useState<Meter[]>([]);
  const [filteredMeters, setFilteredMeters] = useState<Meter[]>([]);
  const [loadingMeters, setLoadingMeters] = useState(true);
  const [activeMeter, setActiveMeter] = useState<Meter | null>(null);
  const [search, setSearch] = useState("");

  const [projectQuery, setProjectQuery] = useState("");

  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // ✅ NUEVO: confirm modal delete
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const emptyMeter: Omit<Meter, "id"> = {
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
  };

  const emptyDeviceData: DeviceData = {
    "Device ID": 0,
    "Device EUI": "",
    "Join EUI": "",
    AppKey: "",
  };

  const [form, setForm] = useState<Omit<Meter, "id">>(emptyMeter);
  const [deviceForm, setDeviceForm] = useState<DeviceData>(emptyDeviceData);
  const [errors, setErrors] = useState<{ [key: string]: boolean }>({});

  /* ================= LOAD ================= */
  const loadMeters = async () => {
    setLoadingMeters(true);
    setLoadingProjects(true);
    try {
      const data = await fetchMeters();

      const projectsArray = [...new Set(data.map((r) => r.areaName))]
        .filter(Boolean) as string[];

      setAllProjects(projectsArray);
      setMeters(data);

      // ✅ FIX: si no hay proyecto seleccionado, autoselecciona el primero disponible
      setSelectedProject((prev) => {
        if (prev) return prev;
        if (initialProject) return initialProject;
        return projectsArray[0] ?? "";
      });
    } catch (error) {
      console.error("Error loading meters:", error);
      setAllProjects([]);
      setMeters([]);
    } finally {
      setLoadingMeters(false);
      setLoadingProjects(false);
    }
  };

  useEffect(() => {
    loadMeters();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (initialProject) setSelectedProject(initialProject);
  }, [initialProject]);

  // Filtrado por proyecto
  useEffect(() => {
    if (!selectedProject) {
      setFilteredMeters([]);
      return;
    }
    setFilteredMeters(meters.filter((m) => m.areaName === selectedProject));
  }, [selectedProject, meters]);

  /* ================= SIDEBAR PROJECT CARDS (ALWAYS OPEN) ================= */
  const projectsData: ProjectCard[] = useMemo(() => {
    const counts = meters.reduce<Record<string, number>>((acc, m) => {
      const area = m.areaName ?? "SIN PROYECTO";
      acc[area] = (acc[area] ?? 0) + 1;
      return acc;
    }, {});

    const baseRegion = "Baja California";
    const baseContact = "Operaciones";
    const baseLastSync = "Hace 1 h";

    return allProjects.map((name) => ({
      name,
      region: baseRegion,
      projects: 1,
      meters: counts[name] ?? 0,
      activeAlerts: 0,
      lastSync: baseLastSync,
      contact: baseContact,
      status: "ACTIVO",
    }));
  }, [meters, allProjects]);

  const filteredProjects = useMemo(() => {
    const q = projectQuery.trim().toLowerCase();
    if (!q) return projectsData;
    return projectsData.filter((p) => p.name.toLowerCase().includes(q));
  }, [projectQuery, projectsData]);

  /* ================= DEVICE CONFIG MOCK ================= */
  const createOrUpdateDevice = async (deviceData: DeviceData): Promise<void> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        console.log("Device data that would be sent to API:", deviceData);
        resolve();
      }, 500);
    });
  };

  /* ================= VALIDATION ================= */
  const validateForm = (): boolean => {
    const newErrors: { [key: string]: boolean } = {};

    if (!form.meterName.trim()) newErrors["meterName"] = true;
    if (!form.meterSerialNumber.trim()) newErrors["meterSerialNumber"] = true;
    if (!form.areaName.trim()) newErrors["areaName"] = true;
    if (!form.deviceName.trim()) newErrors["deviceName"] = true;
    if (!form.protocolType.trim()) newErrors["protocolType"] = true;

    if (!deviceForm["Device ID"] || deviceForm["Device ID"] === 0)
      newErrors["Device ID"] = true;
    if (!deviceForm["Device EUI"].trim()) newErrors["Device EUI"] = true;
    if (!deviceForm["Join EUI"].trim()) newErrors["Join EUI"] = true;
    if (!deviceForm["AppKey"].trim()) newErrors["AppKey"] = true;

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  /* ================= CRUD ================= */
  const handleSave = async () => {
    if (!validateForm()) return;

    try {
      let savedMeter: Meter;

      if (editingId) {
        const meterToUpdate = meters.find((m) => m.id === editingId);
        if (!meterToUpdate) throw new Error("Meter to update not found");

        const updatedMeter = await updateMeter(editingId, form);
        setMeters((prev) =>
          prev.map((m) => (m.id === editingId ? updatedMeter : m))
        );
        savedMeter = updatedMeter;
      } else {
        const newMeter = await createMeter(form);
        setMeters((prev) => [...prev, newMeter]);
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
        `Error saving meter: ${
          error instanceof Error ? error.message : "Please try again."
        }`

        
      );

    }

  };

  // ✅ MISMA lógica de delete, solo sin window.confirm
  const handleDelete = async () => {
    if (!activeMeter) return;

    try {
      await deleteMeter(activeMeter.id);
      setMeters((prev) => prev.filter((m) => m.id !== activeMeter.id));
      setActiveMeter(null);
    } catch (error) {
      console.error("Error deleting meter:", error);
      alert(
        `Error deleting meter: ${
          error instanceof Error ? error.message : "Please try again."
        }`
      );
    }
  };

  const handleRefresh = () => {
    loadMeters();
    setActiveMeter(null);
  };

  /* ================= SEARCH (CLIENT) ================= */
  const searchFiltered = filteredMeters.filter((m) => {
    const q = search.trim().toLowerCase();
    if (!q) return true;

    return (
      (m.meterName ?? "").toLowerCase().includes(q) ||
      (m.meterSerialNumber ?? "").toLowerCase().includes(q) ||
      (m.deviceId ?? "").toLowerCase().includes(q) ||
      (m.areaName ?? "").toLowerCase().includes(q)
    );
  });

  /* ================= UI ================= */
  return (
    <div className="flex gap-6 p-6 w-full bg-gray-100">
      {/* SIDEBAR */}
      <aside className="w-[420px] shrink-0">
        <div className="bg-white rounded-xl shadow p-4 flex flex-col h-[calc(100vh-48px)]">
          {/* Header */}
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-sm text-gray-500">Proyectos</p>
              <p className="text-xs text-gray-400">
                Seleccionado:{" "}
                <span className="font-semibold">{selectedProject || "—"}</span>
              </p>
            </div>

            <button
              type="button"
              className="inline-flex items-center justify-center rounded-lg bg-blue-600 px-3 py-2 text-xs font-semibold text-white shadow hover:bg-blue-700 transition disabled:opacity-60"
              onClick={handleRefresh}
              disabled={loadingProjects}
              title="Actualizar"
            >
              <RefreshCcw size={14} />
            </button>
          </div>

          {/* Search */}
          <div className="mt-4">
            <input
              value={projectQuery}
              onChange={(e) => setProjectQuery(e.target.value)}
              placeholder="Buscar proyecto…"
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-200"
              disabled={loadingProjects}
            />
          </div>

          {/* List */}
          <div className="mt-4 overflow-y-auto flex-1 space-y-3 pr-1">
            {loadingProjects ? (
              <div className="text-sm text-gray-500">Loading projects...</div>
            ) : allProjects.length === 0 ? (
              <div className="text-sm text-gray-500">
                No projects available. Please contact your administrator.
              </div>
            ) : filteredProjects.length === 0 ? (
              <div className="text-sm text-gray-500 text-center py-10">
                No se encontraron proyectos.
              </div>
            ) : (
              filteredProjects.map((p) => {
                const active = p.name === selectedProject;

                return (
                  <div
                    key={p.name}
                    // ✅ FIX: también selecciona proyecto al dar clic en la tarjeta
                    onClick={() => {
                      setSelectedProject(p.name);
                      setActiveMeter(null);
                      setSearch("");
                    }}
                    className={[
                      "rounded-xl border p-4 transition cursor-pointer",
                      active
                        ? "border-blue-600 bg-blue-50/40"
                        : "border-gray-200 bg-white hover:bg-gray-50",
                    ].join(" ")}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-sm font-semibold text-gray-800">
                          {p.name}
                        </p>
                        <p className="text-xs text-gray-500">{p.region}</p>
                      </div>

                      <span
                        className={[
                          "text-xs font-semibold px-2 py-1 rounded-full",
                          p.status === "ACTIVO"
                            ? "bg-green-100 text-green-700"
                            : "bg-gray-200 text-gray-700",
                        ].join(" ")}
                      >
                        {p.status}
                      </span>
                    </div>

                    <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
                      <div className="flex justify-between gap-2">
                        <span className="text-gray-500">Subproyectos</span>
                        <span className="font-medium text-gray-800">
                          {p.projects}
                        </span>
                      </div>

                      <div className="flex justify-between gap-2">
                        <span className="text-gray-500">Medidores</span>
                        <span className="font-medium text-gray-800">
                          {p.meters}
                        </span>
                      </div>

                      <div className="flex justify-between gap-2">
                        <span className="text-gray-500">Alertas activas</span>
                        <span className="font-medium text-gray-800">
                          {p.activeAlerts}
                        </span>
                      </div>

                      <div className="flex justify-between gap-2">
                        <span className="text-gray-500">Última sync</span>
                        <span className="font-medium text-gray-800">
                          {p.lastSync}
                        </span>
                      </div>

                      <div className="col-span-2 flex justify-between gap-2">
                        <span className="text-gray-500">Responsable</span>
                        <span className="font-medium text-gray-800">
                          {p.contact}
                        </span>
                      </div>
                    </div>

                    <div className="mt-4 flex items-center justify-end gap-2">
                      <button
                        type="button"
                        className={[
                          "rounded-lg px-3 py-2 text-sm font-semibold shadow transition",
                          active
                            ? "bg-blue-600 text-white hover:bg-blue-700"
                            : "bg-gray-900 text-white hover:bg-gray-800",
                        ].join(" ")}
                        onClick={(e) => {
                          // ✅ evita doble click (card + button)
                          e.stopPropagation();
                          setSelectedProject(p.name);
                          setActiveMeter(null);
                          setSearch("");
                        }}
                      >
                        {active ? "Seleccionado" : "Seleccionar"}
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          <div className="pt-3 border-t text-xs text-gray-500">
            Nota: region/alertas/última sync están en modo demostración hasta
            integrar backend.
          </div>
        </div>
      </aside>

      {/* MAIN */}
      <main className="flex-1 flex flex-col gap-6 min-w-0">
        {/* HEADER */}
        <div
          className="rounded-xl shadow p-6 text-white flex justify-between items-center"
          style={{
            background: "linear-gradient(135deg, #4c5f9e, #2a355d, #566bb8)",
          }}
        >
          <div>
            <h1 className="text-2xl font-bold">Meter Management</h1>
            <p className="text-sm text-blue-100">
              {selectedProject
                ? `Proyecto: ${selectedProject}`
                : "Selecciona un proyecto desde el panel izquierdo"}
            </p>
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => {
                const base = { ...emptyMeter };
                if (selectedProject) base.areaName = selectedProject;

                setForm(base);
                setDeviceForm(emptyDeviceData);
                setErrors({});
                setEditingId(null);
                setShowModal(true);
              }}
              disabled={!selectedProject || allProjects.length === 0}
              className="flex items-center gap-2 px-4 py-2 bg-white text-[#4c5f9e] rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Plus size={16} /> Agregar
            </button>

            <button
              onClick={() => {
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
              disabled={!activeMeter}
              className="flex items-center gap-2 px-4 py-2 border border-white/40 rounded-lg disabled:opacity-60"
            >
              <Pencil size={16} /> Editar
            </button>

            {/* ✅ CAMBIO: antes llamaba handleDelete, ahora abre modal */}
            <button
              onClick={() => setConfirmOpen(true)}
              disabled={!activeMeter}
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

        {/* SEARCH */}
        <input
          className="bg-white rounded-lg shadow px-4 py-2 text-sm"
          placeholder="Search by meter name, serial number, device ID, area, device type, or meter status..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          disabled={!selectedProject}
        />

        {/* TABLE */}
        <div className={!selectedProject ? "opacity-60 pointer-events-none" : ""}>
          <MaterialTable
            title="Meters"
            isLoading={loadingMeters}
            columns={[
              {
                title: "Area Name",
                field: "areaName",
                render: (rowData) => rowData.areaName || "-",
              },
              {
                title: "Meter S/N",
                field: "meterSerialNumber",
                render: (rowData) => rowData.meterSerialNumber || "-",
              },
              {
                title: "Meter Name",
                field: "meterName",
                render: (rowData) => rowData.meterName || "-",
              },
              {
                title: "Protocol Type",
                field: "protocolType",
                render: (rowData) => rowData.protocolType || "-",
              },
              {
                title: "Device ID",
                field: "deviceId",
                render: (rowData) => rowData.deviceId || "-",
              },
              {
                title: "Device Name",
                field: "deviceName",
                render: (rowData) => rowData.deviceName || "-",
              },
              {
                title: "Device Type",
                field: "deviceType",
                render: (rowData) => rowData.deviceType || "-",
              },
              {
                title: "Meter Status",
                field: "meterStatus",
                render: (rowData) => rowData.meterStatus || "-",
              },
              {
                title: "Installed Time",
                field: "installedTime",
                render: (rowData) => rowData.installedTime || "-",
              },
            ]}
            data={searchFiltered}
            onRowClick={(_, rowData) => setActiveMeter(rowData as Meter)}
            options={{
              actionsColumnIndex: -1,
              search: false,
              paging: true,
              sorting: true,
              rowStyle: (rowData) => ({
                backgroundColor:
                  activeMeter?.id === (rowData as Meter).id
                    ? "#EEF2FF"
                    : "#FFFFFF",
              }),
            }}
            localization={{
              body: {
                emptyDataSourceMessage: !selectedProject
                  ? "Select a project to view meters."
                  : loadingMeters
                  ? "Loading meters..."
                  : "No meters found. Click 'Add' to create your first meter.",
              },
            }}
          />
        </div>

        {/* ✅ NUEVO: ConfirmModal para borrar */}
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

      {/* MODAL */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-[700px] max-h-[90vh] overflow-y-auto space-y-4">
            <h2 className="text-lg font-semibold">
              {editingId ? "Edit Meter" : "Add Meter"}
            </h2>

            {/* ✅ FORMULARIO (REINTEGRADO) */}
            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-gray-700 border-b pb-2">
                Meter Information
              </h3>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <input
                    className={`w-full border px-3 py-2 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      errors["areaName"] ? "border-red-500" : ""
                    }`}
                    placeholder="Area Name *"
                    value={form.areaName}
                    onChange={(e) => {
                      setForm({ ...form, areaName: e.target.value });
                      if (errors["areaName"]) {
                        setErrors({ ...errors, areaName: false });
                      }
                    }}
                    required
                  />
                  {errors["areaName"] && (
                    <p className="text-red-500 text-xs mt-1">
                      This field is required
                    </p>
                  )}
                </div>

                <div>
                  <input
                    className="w-full border px-3 py-2 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Account Number (optional)"
                    value={form.accountNumber ?? ""}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        accountNumber: e.target.value || null,
                      })
                    }
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <input
                    className="w-full border px-3 py-2 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="User Name (optional)"
                    value={form.userName ?? ""}
                    onChange={(e) =>
                      setForm({ ...form, userName: e.target.value || null })
                    }
                  />
                </div>

                <div>
                  <input
                    className="w-full border px-3 py-2 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="User Address (optional)"
                    value={form.userAddress ?? ""}
                    onChange={(e) =>
                      setForm({ ...form, userAddress: e.target.value || null })
                    }
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <input
                    className={`w-full border px-3 py-2 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      errors["meterSerialNumber"] ? "border-red-500" : ""
                    }`}
                    placeholder="Meter S/N *"
                    value={form.meterSerialNumber}
                    onChange={(e) => {
                      setForm({ ...form, meterSerialNumber: e.target.value });
                      if (errors["meterSerialNumber"]) {
                        setErrors({ ...errors, meterSerialNumber: false });
                      }
                    }}
                    required
                  />
                  {errors["meterSerialNumber"] && (
                    <p className="text-red-500 text-xs mt-1">
                      This field is required
                    </p>
                  )}
                </div>

                <div>
                  <input
                    className={`w-full border px-3 py-2 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      errors["meterName"] ? "border-red-500" : ""
                    }`}
                    placeholder="Meter Name *"
                    value={form.meterName}
                    onChange={(e) => {
                      setForm({ ...form, meterName: e.target.value });
                      if (errors["meterName"]) {
                        setErrors({ ...errors, meterName: false });
                      }
                    }}
                    required
                  />
                  {errors["meterName"] && (
                    <p className="text-red-500 text-xs mt-1">
                      This field is required
                    </p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <input
                    className={`w-full border px-3 py-2 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      errors["protocolType"] ? "border-red-500" : ""
                    }`}
                    placeholder="Protocol Type *"
                    value={form.protocolType}
                    onChange={(e) => {
                      setForm({ ...form, protocolType: e.target.value });
                      if (errors["protocolType"]) {
                        setErrors({ ...errors, protocolType: false });
                      }
                    }}
                    required
                  />
                  {errors["protocolType"] && (
                    <p className="text-red-500 text-xs mt-1">
                      This field is required
                    </p>
                  )}
                </div>

                <div>
                  <input
                    className="w-full border px-3 py-2 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Device ID (optional)"
                    value={form.deviceId ?? ""}
                    onChange={(e) =>
                      setForm({ ...form, deviceId: e.target.value || "" })
                    }
                  />
                </div>
              </div>

              <div>
                <input
                  className={`w-full border px-3 py-2 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors["deviceName"] ? "border-red-500" : ""
                  }`}
                  placeholder="Device Name *"
                  value={form.deviceName}
                  onChange={(e) => {
                    setForm({ ...form, deviceName: e.target.value });
                    if (errors["deviceName"]) {
                      setErrors({ ...errors, deviceName: false });
                    }
                  }}
                  required
                />
                {errors["deviceName"] && (
                  <p className="text-red-500 text-xs mt-1">
                    This field is required
                  </p>
                )}
              </div>
            </div>

            <div className="space-y-3 pt-4">
              <h3 className="text-sm font-semibold text-gray-700 border-b pb-2">
                Device Configuration
              </h3>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <input
                    type="number"
                    className={`w-full border px-3 py-2 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      errors["Device ID"] ? "border-red-500" : ""
                    }`}
                    placeholder="Device ID *"
                    value={deviceForm["Device ID"] || ""}
                    onChange={(e) => {
                      setDeviceForm({
                        ...deviceForm,
                        "Device ID": parseInt(e.target.value) || 0,
                      });
                      if (errors["Device ID"]) {
                        setErrors({ ...errors, "Device ID": false });
                      }
                    }}
                    required
                    min={1}
                  />
                  {errors["Device ID"] && (
                    <p className="text-red-500 text-xs mt-1">
                      This field is required
                    </p>
                  )}
                </div>

                <div>
                  <input
                    className={`w-full border px-3 py-2 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      errors["Device EUI"] ? "border-red-500" : ""
                    }`}
                    placeholder="Device EUI *"
                    value={deviceForm["Device EUI"]}
                    onChange={(e) => {
                      setDeviceForm({
                        ...deviceForm,
                        "Device EUI": e.target.value,
                      });
                      if (errors["Device EUI"]) {
                        setErrors({ ...errors, "Device EUI": false });
                      }
                    }}
                    required
                  />
                  {errors["Device EUI"] && (
                    <p className="text-red-500 text-xs mt-1">
                      This field is required
                    </p>
                  )}
                </div>
              </div>

              <div>
                <input
                  className={`w-full border px-3 py-2 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors["Join EUI"] ? "border-red-500" : ""
                  }`}
                  placeholder="Join EUI *"
                  value={deviceForm["Join EUI"]}
                  onChange={(e) => {
                    setDeviceForm({
                      ...deviceForm,
                      "Join EUI": e.target.value,
                    });
                    if (errors["Join EUI"]) {
                      setErrors({ ...errors, "Join EUI": false });
                    }
                  }}
                  required
                />
                {errors["Join EUI"] && (
                  <p className="text-red-500 text-xs mt-1">
                    This field is required
                  </p>
                )}
              </div>

              <div>
                <input
                  className={`w-full border px-3 py-2 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors["AppKey"] ? "border-red-500" : ""
                  }`}
                  placeholder="AppKey *"
                  value={deviceForm["AppKey"]}
                  onChange={(e) => {
                    setDeviceForm({ ...deviceForm, AppKey: e.target.value });
                    if (errors["AppKey"]) {
                      setErrors({ ...errors, AppKey: false });
                    }
                  }}
                  required
                />
                {errors["AppKey"] && (
                  <p className="text-red-500 text-xs mt-1">
                    This field is required
                  </p>
                )}
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t">
              <button
                onClick={() => {
                  setShowModal(false);
                  setDeviceForm(emptyDeviceData);
                  setErrors({});
                }}
                className="px-4 py-2 rounded hover:bg-gray-100"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                className="bg-[#4c5f9e] text-white px-4 py-2 rounded hover:bg-[#3d4d7e]"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

