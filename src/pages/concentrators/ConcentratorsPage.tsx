import { useState } from "react";
import { Plus, Trash2, Pencil, RefreshCcw } from "lucide-react";
import MaterialTable from "@material-table/core";

/* ================= TYPES ================= */
interface Concentrator {
  id: number;
  name: string;
  location: string;
  status: "ACTIVE" | "INACTIVE";
  project: string;
  createdAt: string;
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

  // Lista de proyectos disponibles
  const allProjects = ["GRH (PADRE)", "CESPT", "Proyecto A", "Proyecto B"];

  // Proyectos visibles según el usuario
  const visibleProjects =
    currentUser.role === "SUPER_ADMIN"
      ? allProjects
      : currentUser.project
      ? [currentUser.project]
      : [];

  const [selectedProject, setSelectedProject] = useState(
    visibleProjects[0] || ""
  );

  const [concentrators, setConcentrators] = useState<Concentrator[]>([
    {
      id: 1,
      name: "Concentrador A",
      location: "Planta 1",
      status: "ACTIVE",
      project: "GRH (PADRE)",
      createdAt: "2025-12-17",
    },
    {
      id: 2,
      name: "Concentrador B",
      location: "Planta 2",
      status: "INACTIVE",
      project: "CESPT",
      createdAt: "2025-12-16",
    },
    {
      id: 3,
      name: "Concentrador C",
      location: "Planta 3",
      status: "ACTIVE",
      project: "Proyecto A",
      createdAt: "2025-12-15",
    },
  ]);

  const [activeConcentrator, setActiveConcentrator] = useState<Concentrator | null>(null);
  const [search, setSearch] = useState("");

  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);

  const emptyConcentrator: Omit<Concentrator, "id"> = {
    name: "",
    location: "",
    status: "ACTIVE",
    project: selectedProject,
    createdAt: new Date().toISOString().slice(0, 10),
  };

  const [form, setForm] = useState<Omit<Concentrator, "id">>(emptyConcentrator);

  /* ================= CRUD ================= */
  const handleSave = () => {
    if (editingId) {
      setConcentrators((prev) =>
        prev.map((c) =>
          c.id === editingId ? { id: editingId, ...form } : c
        )
      );
    } else {
      const newId = Date.now();
      setConcentrators((prev) => [...prev, { id: newId, ...form }]);
    }
    setShowModal(false);
    setEditingId(null);
    setForm({ ...emptyConcentrator, project: selectedProject });
    setActiveConcentrator(null);
  };

  const handleDelete = () => {
    if (!activeConcentrator) return;
    setConcentrators((prev) =>
      prev.filter((c) => c.id !== activeConcentrator.id)
    );
    setActiveConcentrator(null);
  };

  /* ================= FILTER ================= */
  const filtered = concentrators.filter(
    (c) =>
      (c.name.toLowerCase().includes(search.toLowerCase()) ||
        c.location.toLowerCase().includes(search.toLowerCase())) &&
      c.project === selectedProject
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
        >
          {visibleProjects.map((proj) => (
            <option key={proj} value={proj}>
              {proj}
            </option>
          ))}
        </select>
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
                setForm({ ...emptyConcentrator, project: selectedProject });
                setEditingId(null);
                setShowModal(true);
              }}
              className="flex items-center gap-2 px-4 py-2 bg-white text-[#4c5f9e] rounded-lg"
            >
              <Plus size={16} /> Add
            </button>

            <button
              onClick={() => {
                if (!activeConcentrator) return;
                setEditingId(activeConcentrator.id);
                setForm({ ...activeConcentrator });
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
            { title: "Name", field: "name" },
            {
              title: "Status",
              field: "status",
              render: (rowData) => (
                <span
                  className={`px-3 py-1 rounded-full text-xs font-semibold border ${
                    rowData.status === "ACTIVE"
                      ? "text-blue-600 border-blue-600"
                      : "text-red-600 border-red-600"
                  }`}
                >
                  {rowData.status}
                </span>
              ),
            },
            { title: "Location", field: "location" },
            { title: "Project", field: "project" },
            { title: "Created", field: "createdAt", type: "date" },
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
                activeConcentrator?.id === (rowData as Concentrator).id
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
              {editingId ? "Edit Concentrator" : "Add Concentrator"}
            </h2>

            <input
              className="w-full border px-3 py-2 rounded"
              placeholder="Name"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />

            <input
              className="w-full border px-3 py-2 rounded"
              placeholder="Location"
              value={form.location}
              onChange={(e) => setForm({ ...form, location: e.target.value })}
            />

            <button
              onClick={() =>
                setForm({
                  ...form,
                  status: form.status === "ACTIVE" ? "INACTIVE" : "ACTIVE",
                })
              }
              className="w-full border rounded px-3 py-2"
            >
              Status: {form.status}
            </button>

            <input
              type="date"
              className="w-full border px-3 py-2 rounded"
              value={form.createdAt}
              onChange={(e) => setForm({ ...form, createdAt: e.target.value })}
            />

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
