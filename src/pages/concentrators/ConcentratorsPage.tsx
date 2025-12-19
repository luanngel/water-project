import { useState, useEffect, useMemo } from "react";
import { Plus, Trash2, Pencil, RefreshCcw } from "lucide-react";
import MaterialTable from "@material-table/core";
import { fetchProjectNames } from "../../api/projects";
import { createConcentrator } from "./concentrators.api";

/* ================= TYPES ================= */
interface Concentrator {
  "Area Name": string;
  "Device S/N": string;
  "Device Name": string;
  "Device Time": string;
  "Device Status": string;
  "Operator": string;
  "Installed Time": string;
  "Communication Time": string;
  "Instruction Manual": string;
}

interface User {
  name: string;
  role: "SUPER_ADMIN" | "USER";
  project?: string; // asignado si no es superadmin
}

/* ================= COMPONENT ================= */
export default function ConcentratorsPage() {
  // Simulación de usuario actual
  const currentUser: User = {
    name: "Admin GRH",
    role: "SUPER_ADMIN", // cambiar a USER para probar otro caso
    project: "CESPT",
  };

  const [allProjects, setAllProjects] = useState<string[]>([]);
  const [loadingProjects, setLoadingProjects] = useState(true);

  useEffect(() => {
    const loadProjects = async () => {
      try {
        const projects = await fetchProjectNames();
        setAllProjects(projects);
      } catch (error) {
        console.error('Error loading projects:', error);
        setAllProjects(["GRH (PADRE)", "CESPT", "Proyecto A", "Proyecto B"]);
      } finally {
        setLoadingProjects(false);
      }
    };

    loadProjects();
  }, []);

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
    if (visibleProjects.length > 0 && !selectedProject) {
      setSelectedProject(visibleProjects[0]);
    }
  }, [visibleProjects, selectedProject]);

  const [concentrators, setConcentrators] = useState<Concentrator[]>([
    {
      "Area Name": "GRH (PADRE)",
      "Device S/N": "SN001",
      "Device Name": "Concentrador A",
      "Device Time": "2025-12-17T10:00:00Z",
      "Device Status": "ACTIVE",
      "Operator": "Operador 1",
      "Installed Time": "2025-12-17",
      "Communication Time": "2025-12-17T10:30:00Z",
      "Instruction Manual": "Manual A",
    },
    {
      "Area Name": "CESPT",
      "Device S/N": "SN002",
      "Device Name": "Concentrador B",
      "Device Time": "2025-12-16T11:00:00Z",
      "Device Status": "INACTIVE",
      "Operator": "Operador 2",
      "Installed Time": "2025-12-16",
      "Communication Time": "2025-12-16T11:30:00Z",
      "Instruction Manual": "Manual B",
    },
    {
      "Area Name": "Proyecto A",
      "Device S/N": "SN003",
      "Device Name": "Concentrador C",
      "Device Time": "2025-12-15T12:00:00Z",
      "Device Status": "ACTIVE",
      "Operator": "Operador 3",
      "Installed Time": "2025-12-15",
      "Communication Time": "2025-12-15T12:30:00Z",
      "Instruction Manual": "Manual C",
    },
  ]);

  const [activeConcentrator, setActiveConcentrator] = useState<Concentrator | null>(null);
  const [search, setSearch] = useState("");

  const [showModal, setShowModal] = useState(false);
  const [editingSerial, setEditingSerial] = useState<string | null>(null);

  const getEmptyConcentrator = (): Omit<Concentrator, "id"> => ({
    "Area Name": selectedProject,
    "Device S/N": "",
    "Device Name": "",
    "Device Time": new Date().toISOString(),
    "Device Status": "ACTIVE",
    "Operator": "",
    "Installed Time": new Date().toISOString().slice(0, 10),
    "Communication Time": new Date().toISOString(),
    "Instruction Manual": "",
  });

  const [form, setForm] = useState<Omit<Concentrator, "id">>(getEmptyConcentrator());

  /* ================= CRUD ================= */
  const handleSave = async () => {
    try {
      if (editingSerial) {
        setConcentrators((prev) =>
          prev.map((c) =>
            c["Device S/N"] === editingSerial ? { ...form } : c
          )
        );
      } else {
        await createConcentrator(form);
        setConcentrators((prev) => [...prev, { ...form }]);
      }
      setShowModal(false);
      setEditingSerial(null);
      setForm({ ...getEmptyConcentrator(), "Area Name": selectedProject });
      setActiveConcentrator(null);
    } catch (error) {
      console.error('Error saving concentrator:', error);
      setConcentrators((prev) => [...prev, { ...form }]);
      setShowModal(false);
      setEditingSerial(null);
      setForm({ ...getEmptyConcentrator(), "Area Name": selectedProject });
      setActiveConcentrator(null);
    }
  };

  const handleDelete = () => {
    if (!activeConcentrator) return;
    setConcentrators((prev) =>
      prev.filter((c) => c["Device S/N"] !== activeConcentrator["Device S/N"])
    );
    setActiveConcentrator(null);
  };

  /* ================= FILTER ================= */
  const filtered = concentrators.filter(
    (c) =>
      (c["Device Name"].toLowerCase().includes(search.toLowerCase()) ||
        c["Device S/N"].toLowerCase().includes(search.toLowerCase())) &&
      c["Area Name"] === selectedProject
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
          style={{ background: "linear-gradient(135deg, #4c5f9e, #2a355d, #566bb8)" }}
        >
          <div>
            <h1 className="text-2xl font-bold">Concentrator Management</h1>
            <p className="text-sm text-blue-100">Concentradores registrados</p>
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => {
                setForm({ ...getEmptyConcentrator(), "Area Name": selectedProject });
                setEditingSerial(null);
                setShowModal(true);
              }}
              disabled={!selectedProject || visibleProjects.length === 0}
              className="flex items-center gap-2 px-4 py-2 bg-white text-[#4c5f9e] rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Plus size={16} /> Add
            </button>

            <button
              onClick={() => {
                if (!activeConcentrator) return;
                setEditingSerial(activeConcentrator["Device S/N"]);
                setForm(activeConcentrator);
                setShowModal(true);
              }}
              disabled={!activeConcentrator}
              className="flex items-center gap-2 px-4 py-2 border border-white/40 rounded-lg disabled:opacity-60"
            >
              <Pencil size={16} /> Edit
            </button>

            <button
              onClick={handleDelete}
              disabled={!activeConcentrator}
              className="flex items-center gap-2 px-4 py-2 border border-white/40 rounded-lg disabled:opacity-60"
            >
              <Trash2 size={16} /> Delete
            </button>

            <button
              onClick={() => setConcentrators([...concentrators])}
              className="flex items-center gap-2 px-4 py-2 border border-white/40 rounded-lg"
            >
              <RefreshCcw size={16} /> Refresh
            </button>
          </div>
        </div>

        {/* SEARCH */}
        <input
          className="bg-white rounded-lg shadow px-4 py-2 text-sm"
          placeholder="Search concentrator..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        {/* TABLE */}
        <MaterialTable
          title="Concentrators"
          columns={[
            { title: "Device Name", field: "Device Name" },
            { title: "Device S/N", field: "Device S/N" },
            {
              title: "Device Status",
              field: "Device Status",
              render: (rowData) => (
                <span
                  className={`px-3 py-1 rounded-full text-xs font-semibold border ${
                    rowData["Device Status"] === "ACTIVE"
                      ? "text-blue-600 border-blue-600"
                      : "text-red-600 border-red-600"
                  }`}
                >
                  {rowData["Device Status"]}
                </span>
              ),
            },
            { title: "Operator", field: "Operator" },
            { title: "Area Name", field: "Area Name" },
            { title: "Installed Time", field: "Installed Time", type: "date" },
          ]}
          data={filtered}
          onRowClick={(_, rowData) => setActiveConcentrator(rowData as Concentrator)}
          options={{
            actionsColumnIndex: -1,
            search: false,
            paging: true,
            sorting: true,
            rowStyle: (rowData) => ({
              backgroundColor:
                activeConcentrator?.["Device S/N"] === (rowData as Concentrator)["Device S/N"]
                  ? "#EEF2FF"
                  : "#FFFFFF",
            }),
          }}
        />
      </div>

      {/* MODAL */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center">
          <div className="bg-white rounded-xl p-6 w-96 space-y-3">
            <h2 className="text-lg font-semibold">
              {editingSerial ? "Edit Concentrator" : "Add Concentrator"}
            </h2>

            <div className="space-y-1">
              <label className="block text-sm font-medium text-gray-700">Device Name</label>
              <input
                className="w-full border px-3 py-2 rounded"
                placeholder="Enter device name"
                value={form["Device Name"]}
                onChange={(e) => setForm({ ...form, "Device Name": e.target.value })}
              />
            </div>

            <div className="space-y-1">
              <label className="block text-sm font-medium text-gray-700">Device S/N</label>
              <input
                className="w-full border px-3 py-2 rounded"
                placeholder="Enter device serial number"
                value={form["Device S/N"]}
                onChange={(e) => setForm({ ...form, "Device S/N": e.target.value })}
              />
            </div>

            <div className="space-y-1">
              <label className="block text-sm font-medium text-gray-700">Operator</label>
              <input
                className="w-full border px-3 py-2 rounded"
                placeholder="Enter operator name"
                value={form["Operator"]}
                onChange={(e) => setForm({ ...form, "Operator": e.target.value })}
              />
            </div>

            <div className="space-y-1">
              <label className="block text-sm font-medium text-gray-700">Instruction Manual</label>
              <input
                className="w-full border px-3 py-2 rounded"
                placeholder="Enter instruction manual"
                value={form["Instruction Manual"]}
                onChange={(e) => setForm({ ...form, "Instruction Manual": e.target.value })}
              />
            </div>

            <div className="space-y-1">
              <label className="block text-sm font-medium text-gray-700">Device Status</label>
              <button
                onClick={() =>
                  setForm({
                    ...form,
                    "Device Status": form["Device Status"] === "ACTIVE" ? "INACTIVE" : "ACTIVE",
                  })
                }
                className="w-full border rounded px-3 py-2 hover:bg-gray-50"
              >
                Status: {form["Device Status"]}
              </button>
            </div>

            <div className="space-y-1">
              <label className="block text-sm font-medium text-gray-700">Installed Time</label>
              <input
                type="date"
                className="w-full border px-3 py-2 rounded"
                value={form["Installed Time"]}
                onChange={(e) => setForm({ ...form, "Installed Time": e.target.value })}
              />
            </div>

            <div className="space-y-1">
              <label className="block text-sm font-medium text-gray-700">Device Time</label>
              <input
                type="datetime-local"
                className="w-full border px-3 py-2 rounded"
                value={form["Device Time"].slice(0, 16)}
                onChange={(e) => setForm({ ...form, "Device Time": new Date(e.target.value).toISOString() })}
              />
            </div>

            <div className="space-y-1">
              <label className="block text-sm font-medium text-gray-700">Communication Time</label>
              <input
                type="datetime-local"
                className="w-full border px-3 py-2 rounded"
                value={form["Communication Time"].slice(0, 16)}
                onChange={(e) => setForm({ ...form, "Communication Time": new Date(e.target.value).toISOString() })}
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
