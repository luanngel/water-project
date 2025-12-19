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
    deviceId: "",
    meterAddress: "",
    manufacturerCode: "",
    forwardCumulativeFlow: 0,
    reverseCumulativeFlow: 0,
    forwardInstantaneousFlow: 0,
    waterTemperature: 0,
    voltage: 0,
    echoAmplitude: 0,
    ultrasonicFlightTime: 0,
    timestamp: new Date().toISOString(),
    alarmBytes: "",
    checksumOk: true,
    receivedAt: new Date().toISOString(),
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
      `Are you sure you want to delete the meter "${activeMeter.deviceId}"?`
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
      (m.deviceId.toLowerCase().includes(search.toLowerCase()) ||
        m.meterAddress.toLowerCase().includes(search.toLowerCase()) ||
        m.manufacturerCode.toLowerCase().includes(search.toLowerCase()))
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
                  deviceId: activeMeter.deviceId,
                  meterAddress: activeMeter.meterAddress,
                  manufacturerCode: activeMeter.manufacturerCode,
                  forwardCumulativeFlow: activeMeter.forwardCumulativeFlow,
                  reverseCumulativeFlow: activeMeter.reverseCumulativeFlow,
                  forwardInstantaneousFlow: activeMeter.forwardInstantaneousFlow,
                  waterTemperature: activeMeter.waterTemperature,
                  voltage: activeMeter.voltage,
                  echoAmplitude: activeMeter.echoAmplitude,
                  ultrasonicFlightTime: activeMeter.ultrasonicFlightTime,
                  timestamp: activeMeter.timestamp,
                  alarmBytes: activeMeter.alarmBytes,
                  checksumOk: activeMeter.checksumOk,
                  receivedAt: activeMeter.receivedAt,
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
          placeholder="Search meter..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        {/* TABLE */}
        <MaterialTable
          title="Meters"
          isLoading={loadingMeters}
          columns={[
            { title: "Device ID", field: "deviceId" },
            { title: "Meter Address", field: "meterAddress" },
            { title: "Manufacturer Code", field: "manufacturerCode" },
            {
              title: "Forward Flow",
              field: "forwardCumulativeFlow",
              render: (rowData) => `${rowData.forwardCumulativeFlow?.toFixed(3) || 0} m³`
            },
            {
              title: "Water Temp",
              field: "waterTemperature",
              render: (rowData) => `${rowData.waterTemperature?.toFixed(1) || 0}°C`
            },
            {
              title: "Voltage",
              field: "voltage",
              render: (rowData) => `${rowData.voltage || 0}V`
            },
            {
              title: "Checksum OK",
              field: "checksumOk",
              render: (rowData) => (
                <span
                  className={`px-3 py-1 rounded-full text-xs font-semibold border ${
                    rowData.checksumOk
                      ? "text-green-600 border-green-600"
                      : "text-red-600 border-red-600"
                  }`}
                >
                  {rowData.checksumOk ? "OK" : "ERROR"}
                </span>
              ),
            },
            { title: "Timestamp", field: "timestamp", type: "datetime" },
            { title: "Received At", field: "receivedAt", type: "datetime" },
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
              <label className="block text-sm font-medium text-gray-700">Device ID</label>
              <input
                className="w-full border px-3 py-2 rounded"
                placeholder="Device ID"
                value={form.deviceId}
                onChange={(e) => setForm({ ...form, deviceId: e.target.value })}
              />
            </div>

            <div className="space-y-1">
              <label className="block text-sm font-medium text-gray-700">Meter Address</label>
              <input
                className="w-full border px-3 py-2 rounded"
                placeholder="Meter Address"
                value={form.meterAddress}
                onChange={(e) => setForm({ ...form, meterAddress: e.target.value })}
              />
            </div>

            <div className="space-y-1">
              <label className="block text-sm font-medium text-gray-700">Manufacturer Code</label>
              <input
                className="w-full border px-3 py-2 rounded"
                placeholder="Manufacturer Code"
                value={form.manufacturerCode}
                onChange={(e) => setForm({ ...form, manufacturerCode: e.target.value })}
              />
            </div>

            <div className="space-y-1">
              <label className="block text-sm font-medium text-gray-700">Forward Cumulative Flow (m³)</label>
              <input
                type="number"
                step="0.001"
                className="w-full border px-3 py-2 rounded"
                placeholder="0.000"
                value={form.forwardCumulativeFlow}
                onChange={(e) => setForm({ ...form, forwardCumulativeFlow: parseFloat(e.target.value) || 0 })}
              />
            </div>

            <div className="space-y-1">
              <label className="block text-sm font-medium text-gray-700">Reverse Cumulative Flow (m³)</label>
              <input
                type="number"
                step="0.001"
                className="w-full border px-3 py-2 rounded"
                placeholder="0.000"
                value={form.reverseCumulativeFlow}
                onChange={(e) => setForm({ ...form, reverseCumulativeFlow: parseFloat(e.target.value) || 0 })}
              />
            </div>

            <div className="space-y-1">
              <label className="block text-sm font-medium text-gray-700">Forward Instantaneous Flow</label>
              <input
                type="number"
                step="0.001"
                className="w-full border px-3 py-2 rounded"
                placeholder="0.000"
                value={form.forwardInstantaneousFlow}
                onChange={(e) => setForm({ ...form, forwardInstantaneousFlow: parseFloat(e.target.value) || 0 })}
              />
            </div>

            <div className="space-y-1">
              <label className="block text-sm font-medium text-gray-700">Water Temperature (°C)</label>
              <input
                type="number"
                step="0.1"
                className="w-full border px-3 py-2 rounded"
                placeholder="0.0"
                value={form.waterTemperature}
                onChange={(e) => setForm({ ...form, waterTemperature: parseFloat(e.target.value) || 0 })}
              />
            </div>

            <div className="space-y-1">
              <label className="block text-sm font-medium text-gray-700">Voltage (V)</label>
              <input
                type="number"
                step="0.1"
                className="w-full border px-3 py-2 rounded"
                placeholder="0.0"
                value={form.voltage}
                onChange={(e) => setForm({ ...form, voltage: parseFloat(e.target.value) || 0 })}
              />
            </div>

            <div className="space-y-1">
              <label className="block text-sm font-medium text-gray-700">Echo Amplitude</label>
              <input
                type="number"
                className="w-full border px-3 py-2 rounded"
                placeholder="0"
                value={form.echoAmplitude}
                onChange={(e) => setForm({ ...form, echoAmplitude: parseInt(e.target.value) || 0 })}
              />
            </div>

            <div className="space-y-1">
              <label className="block text-sm font-medium text-gray-700">Ultrasonic Flight Time</label>
              <input
                type="number"
                className="w-full border px-3 py-2 rounded"
                placeholder="0"
                value={form.ultrasonicFlightTime}
                onChange={(e) => setForm({ ...form, ultrasonicFlightTime: parseInt(e.target.value) || 0 })}
              />
            </div>

            <div className="space-y-1">
              <label className="block text-sm font-medium text-gray-700">Timestamp</label>
              <input
                type="datetime-local"
                className="w-full border px-3 py-2 rounded"
                value={form.timestamp ? new Date(form.timestamp).toISOString().slice(0, 16) : ""}
                onChange={(e) => setForm({ ...form, timestamp: new Date(e.target.value).toISOString() })}
              />
            </div>

            <div className="space-y-1">
              <label className="block text-sm font-medium text-gray-700">Alarm Bytes</label>
              <input
                className="w-full border px-3 py-2 rounded"
                placeholder="Alarm Bytes"
                value={form.alarmBytes}
                onChange={(e) => setForm({ ...form, alarmBytes: e.target.value })}
              />
            </div>

            <div className="space-y-1">
              <label className="block text-sm font-medium text-gray-700">Checksum OK</label>
              <button
                onClick={() => setForm({ ...form, checksumOk: !form.checksumOk })}
                className="w-full border rounded px-3 py-2 hover:bg-gray-50"
              >
                Status: {form.checksumOk ? "OK" : "ERROR"}
              </button>
            </div>

            <div className="space-y-1">
              <label className="block text-sm font-medium text-gray-700">Received At</label>
              <input
                type="datetime-local"
                className="w-full border px-3 py-2 rounded"
                value={form.receivedAt ? new Date(form.receivedAt).toISOString().slice(0, 16) : ""}
                onChange={(e) => setForm({ ...form, receivedAt: new Date(e.target.value).toISOString() })}
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
