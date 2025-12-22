import { useState, useEffect, useMemo } from "react";
import { Plus, Trash2, Pencil, RefreshCcw } from "lucide-react";
import MaterialTable from "@material-table/core";
import { fetchProjectNames } from "../../api/projects";
import {
  fetchMeters,
  createMeter,
  updateMeter,
  deleteMeter,
  type Meter,
} from "../../api/meters";

/* ================= TYPES ================= */

interface User {
  name: string;
  role: "SUPER_ADMIN" | "USER";
  project?: string; // asignado si no es superadmin
}

/* ================= COMPONENT ================= */
export default function MeterManagement() {
  // Simulación de usuario actual
  const currentUser: User = {
    name: "Admin GRH",
    role: "SUPER_ADMIN", // cambiar a USER para probar otro caso
    project: "CESPT",
  };

  const [allProjects, setAllProjects] = useState<string[]>([]);
  const [loadingProjects, setLoadingProjects] = useState(true);

  // Proyectos visibles según el usuario
  const visibleProjects = useMemo(() =>
    currentUser.role === "SUPER_ADMIN"
      ? allProjects
      : currentUser.project
      ? [currentUser.project]
      : [],
    [allProjects, currentUser.role, currentUser.project]
  );

  const [selectedProject, setSelectedProject] = useState("");

  useEffect(() => {
    const loadProjects = async () => {
      try {
        const projects = await fetchProjectNames();
        setAllProjects(projects);
      } catch (error) {
        console.error('Error loading projects:', error);
        setAllProjects([]);
      } finally {
        setLoadingProjects(false);
      }
    };

    loadProjects();
  }, []);

  useEffect(() => {
    if (visibleProjects.length > 0 && !selectedProject) {
      setSelectedProject(visibleProjects[0]);
    }
  }, [visibleProjects, selectedProject]);

  const [meters, setMeters] = useState<Meter[]>([]);
  const [loadingMeters, setLoadingMeters] = useState(true);
  const [activeMeter, setActiveMeter] = useState<Meter | null>(null);
  const [search, setSearch] = useState("");

  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

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

  const [form, setForm] = useState<Omit<Meter, "id">>(emptyMeter);

  const loadMeters = async () => {
    setLoadingMeters(true);
    try {
      const data = await fetchMeters();
      setMeters(data);
    } catch (error) {
      console.error("Error loading meters:", error);
      setMeters([]);
    } finally {
      setLoadingMeters(false);
    }
  };

  useEffect(() => {
    loadMeters();
  }, []);

  const handleSave = async () => {
    try {
      if (editingId) {
        const meterToUpdate = meters.find(m => m.id === editingId);
        if (!meterToUpdate) {
          throw new Error("Meter to update not found");
        }

        const updatedMeter = await updateMeter(editingId, form);
        setMeters((prev) =>
          prev.map((m) =>
            m.id === editingId ? updatedMeter : m
          )
        );
      } else {
        const newMeter = await createMeter(form);
        setMeters((prev) => [...prev, newMeter]);
      }
      setShowModal(false);
      setEditingId(null);
      setForm(emptyMeter);
      setActiveMeter(null);
    } catch (error) {
      console.error('Error saving meter:', error);
      alert(
        `Error saving meter: ${
          error instanceof Error ? error.message : "Please try again."
        }`
      );
    }
  };

  const handleDelete = async () => {
    if (!activeMeter) return;

    const confirmDelete = window.confirm(
      `Are you sure you want to delete the meter "${activeMeter.meterName}" (${activeMeter.meterSerialNumber})?`
    );

    if (!confirmDelete) return;

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

  /* ================= FILTER ================= */
  const filtered = meters.filter(
    (m) =>
      (m.meterName.toLowerCase().includes(search.toLowerCase()) ||
        m.meterSerialNumber.toLowerCase().includes(search.toLowerCase()) ||
        m.deviceId.toLowerCase().includes(search.toLowerCase()) ||
        m.areaName.toLowerCase().includes(search.toLowerCase()))
  );

  /* ================= UI ================= */
  return (
    <div className="flex gap-6 p-6 w-full bg-gray-100">
      {/* LEFT INFO SIDEBAR */}
      <div className="w-72 bg-white rounded-xl shadow p-4">
        <h3 className="text-xs font-semibold text-gray-500 mb-3">
          Project Information
        </h3>

        <select
          value={selectedProject}
          onChange={(e) => setSelectedProject(e.target.value)}
          className="w-full border px-3 py-2 rounded"
          disabled={loadingProjects || visibleProjects.length === 0}
        >
          {loadingProjects ? (
            <option>Loading projects...</option>
          ) : visibleProjects.length === 0 ? (
            <option>No projects available</option>
          ) : (
            visibleProjects.map((proj) => (
              <option key={proj} value={proj}>
                {proj}
              </option>
            ))
          )}
        </select>

        {visibleProjects.length === 0 && !loadingProjects && (
          <p className="text-sm text-gray-500 mt-2">
            No projects available. Please contact your administrator.
          </p>
        )}
      </div>

      {/* MAIN */}
      <div className="flex-1 flex flex-col gap-6">
        {/* HEADER */}
        <div
          className="rounded-xl shadow p-6 text-white flex justify-between items-center"
          style={{
            background:
              "linear-gradient(135deg, #4c5f9e, #2a355d, #566bb8)",
          }}
        >
          <div>
            <h1 className="text-2xl font-bold">Meter Management</h1>
            <p className="text-sm text-blue-100">Medidores registrados</p>
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => {
                setForm(emptyMeter);
                setEditingId(null);
                setShowModal(true);
              }}
              disabled={!selectedProject || visibleProjects.length === 0}
              className="flex items-center gap-2 px-4 py-2 bg-white text-[#4c5f9e] rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Plus size={16} /> Add
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
                setShowModal(true);
              }}
              disabled={!activeMeter}
              className="flex items-center gap-2 px-4 py-2 border border-white/40 rounded-lg disabled:opacity-60"
            >
              <Pencil size={16} /> Edit
            </button>

            <button
              onClick={handleDelete}
              disabled={!activeMeter}
              className="flex items-center gap-2 px-4 py-2 border border-white/40 rounded-lg disabled:opacity-60"
            >
              <Trash2 size={16} /> Delete
            </button>

            <button
              onClick={handleRefresh}
              className="flex items-center gap-2 px-4 py-2 border border-white/40 rounded-lg"
            >
              <RefreshCcw size={16} /> Refresh
            </button>
          </div>
        </div>

        {/* SEARCH */}
        <input
          className="bg-white rounded-lg shadow px-4 py-2 text-sm"
          placeholder="Search by meter name, serial number, device ID, or area..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        {/* TABLE */}
        <MaterialTable
          title="Meters"
          isLoading={loadingMeters}
          columns={[
            { title: "Meter Name", field: "meterName" },
            { title: "Serial Number", field: "meterSerialNumber" },
            { title: "Area", field: "areaName" },
            { title: "Device ID", field: "deviceId" },
            { title: "Device Name", field: "deviceName" },
            {
              title: "Status",
              field: "meterStatus",
              render: (rowData) => (
                <span
                  className={`px-3 py-1 rounded-full text-xs font-semibold border ${
                    rowData.meterStatus === "Installed"
                      ? "text-green-600 border-green-600"
                      : "text-gray-600 border-gray-600"
                  }`}
                >
                  {rowData.meterStatus}
                </span>
              ),
            },
            { title: "Protocol", field: "protocolType" },
            { title: "Device Type", field: "deviceType" },
            { title: "Created At", field: "createdAt", type: "datetime" },
            { title: "Updated At", field: "updatedAt", type: "datetime" },
          ]}
          data={filtered}
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
              emptyDataSourceMessage: loadingMeters
                ? "Loading meters..."
                : "No meters found. Click 'Add' to create your first meter.",
            },
          }}
        />
      </div>

      {/* MODAL */}
{showModal && (
  <div className="fixed inset-0 bg-black/40 flex items-center justify-center">
    <div className="bg-white rounded-xl p-6 w-96 max-h-[80vh] overflow-y-auto space-y-3">
      <h2 className="text-lg font-semibold">
        {editingId ? "Edit Meter" : "Add Meter"}
      </h2>

      <div className="space-y-1">
        <input
          className="w-full border px-3 py-2 rounded"
          placeholder="Meter Name"
          value={form.meterName}
          onChange={(e) => setForm({ ...form, meterName: e.target.value })}
        />
      </div>

      <div className="space-y-1">
        <input
          className="w-full border px-3 py-2 rounded"
          placeholder="Meter Serial Number"
          value={form.meterSerialNumber}
          onChange={(e) =>
            setForm({ ...form, meterSerialNumber: e.target.value })
          }
        />
      </div>

      <div className="space-y-1">
        <input
          className="w-full border px-3 py-2 rounded"
          placeholder="Area Name"
          value={form.areaName}
          onChange={(e) => setForm({ ...form, areaName: e.target.value })}
        />
      </div>

      <div className="space-y-1">
        <input
          className="w-full border px-3 py-2 rounded"
          placeholder="Device ID"
          value={form.deviceId}
          onChange={(e) => setForm({ ...form, deviceId: e.target.value })}
        />
      </div>

      <div className="space-y-1">
        <input
          className="w-full border px-3 py-2 rounded"
          placeholder="Device Name"
          value={form.deviceName}
          onChange={(e) => setForm({ ...form, deviceName: e.target.value })}
        />
      </div>

      <div className="space-y-1">
        <input
          className="w-full border px-3 py-2 rounded"
          placeholder="Device Type"
          value={form.deviceType}
          onChange={(e) => setForm({ ...form, deviceType: e.target.value })}
        />
      </div>

      <div className="space-y-1">
        <select
          className="w-full border px-3 py-2 rounded"
          value={form.meterStatus}
          onChange={(e) => setForm({ ...form, meterStatus: e.target.value })}
        >
          <option value="Installed">Meter Status: Installed</option>
          <option value="Uninstalled">Meter Status: Uninstalled</option>
          <option value="Maintenance">Meter Status: Maintenance</option>
        </select>
      </div>

      <div className="space-y-1">
        <input
          className="w-full border px-3 py-2 rounded"
          placeholder="Protocol Type"
          value={form.protocolType}
          onChange={(e) => setForm({ ...form, protocolType: e.target.value })}
        />
      </div>

      <div className="space-y-1">
        <input
          className="w-full border px-3 py-2 rounded"
          placeholder="Supply Types"
          value={form.supplyTypes}
          onChange={(e) => setForm({ ...form, supplyTypes: e.target.value })}
        />
      </div>

      <div className="space-y-1">
        <input
          className="w-full border px-3 py-2 rounded"
          placeholder="Usage Analysis Type"
          value={form.usageAnalysisType}
          onChange={(e) =>
            setForm({ ...form, usageAnalysisType: e.target.value })
          }
        />
      </div>

      <div className="space-y-1">
        <input
          className="w-full border px-3 py-2 rounded"
          placeholder="Account Number (optional)"
          value={form.accountNumber ?? ""}
          onChange={(e) =>
            setForm({ ...form, accountNumber: e.target.value || null })
          }
        />
      </div>

      <div className="space-y-1">
        <input
          className="w-full border px-3 py-2 rounded"
          placeholder="User Name (optional)"
          value={form.userName ?? ""}
          onChange={(e) =>
            setForm({ ...form, userName: e.target.value || null })
          }
        />
      </div>

      <div className="space-y-1">
        <input
          className="w-full border px-3 py-2 rounded"
          placeholder="User Address (optional)"
          value={form.userAddress ?? ""}
          onChange={(e) =>
            setForm({ ...form, userAddress: e.target.value || null })
          }
        />
      </div>

      <div className="space-y-1">
        <input
          className="w-full border px-3 py-2 rounded"
          placeholder="Price No. (optional)"
          value={form.priceNo ?? ""}
          onChange={(e) => setForm({ ...form, priceNo: e.target.value || null })}
        />
      </div>

      <div className="space-y-1">
        <input
          className="w-full border px-3 py-2 rounded"
          placeholder="Price Name (optional)"
          value={form.priceName ?? ""}
          onChange={(e) =>
            setForm({ ...form, priceName: e.target.value || null })
          }
        />
      </div>

      <div className="space-y-1">
        <input
          className="w-full border px-3 py-2 rounded"
          placeholder="DMA Partition (optional)"
          value={form.dmaPartition ?? ""}
          onChange={(e) =>
            setForm({ ...form, dmaPartition: e.target.value || null })
          }
        />
      </div>

      <div className="space-y-1">
        <input
          type="datetime-local"
          className="w-full border px-3 py-2 rounded"
          value={
            form.installedTime
              ? new Date(form.installedTime).toISOString().slice(0, 16)
              : ""
          }
          onChange={(e) =>
            setForm({ ...form, installedTime: new Date(e.target.value).toISOString() })
          }
        />
      </div>

      <div className="flex justify-end gap-2 pt-3">
        <button onClick={() => setShowModal(false)}>Cancel</button>
        <button
          onClick={handleSave}
          className="bg-[#4c5f9e] text-white px-4 py-2 rounded"
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
