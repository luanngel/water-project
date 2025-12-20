import { useState, useEffect, useMemo } from "react";
import { Plus, Trash2, Pencil, RefreshCcw } from "lucide-react";
import MaterialTable from "@material-table/core";
import { fetchProjectNames } from "../../api/projects";
import {
  fetchConcentrators,
  createConcentrator,
  updateConcentrator,
  deleteConcentrator,
  type Concentrator,
} from "../../api/concentrators";

/* ================= TYPES ================= */

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
  const [loadingConcentrators, setLoadingConcentrators] = useState(true);

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
  const [concentrators, setConcentrators] = useState<Concentrator[]>([]);

  useEffect(() => {
    if (visibleProjects.length > 0 && !selectedProject) {
      setSelectedProject(visibleProjects[0]);
    }
  }, [visibleProjects, selectedProject]);

  const loadConcentrators = async () => {
    setLoadingConcentrators(true);
    try {
      const data = await fetchConcentrators();
      setConcentrators(data);
    } catch (error) {
      console.error("Error loading concentrators:", error);
      setConcentrators([]);
    } finally {
      setLoadingConcentrators(false);
    }
  };

  useEffect(() => {
    loadConcentrators();
  }, []);

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
        const concentratorToUpdate = concentrators.find(c => c["Device S/N"] === editingSerial);
        if (!concentratorToUpdate) {
          throw new Error("Concentrator to update not found");
        }

        const updatedConcentrator = await updateConcentrator(concentratorToUpdate.id, form);
        setConcentrators((prev) =>
          prev.map((c) =>
            c.id === concentratorToUpdate.id ? updatedConcentrator : c
          )
        );
      } else {
        const newConcentrator = await createConcentrator(form);
        setConcentrators((prev) => [...prev, newConcentrator]);
      }
      setShowModal(false);
      setEditingSerial(null);
      setForm({ ...getEmptyConcentrator(), "Area Name": selectedProject });
      setActiveConcentrator(null);
    } catch (error) {
      console.error('Error saving concentrator:', error);
      alert(
        `Error saving concentrator: ${
          error instanceof Error ? error.message : "Please try again."
        }`
      );
    }
  };

  const handleDelete = async () => {
    if (!activeConcentrator) return;

    const confirmDelete = window.confirm(
      `Are you sure you want to delete the concentrator "${activeConcentrator["Device Name"]}"?`
    );

    if (!confirmDelete) return;

    try {
      await deleteConcentrator(activeConcentrator.id);
      setConcentrators((prev) => prev.filter((c) => c.id !== activeConcentrator.id));
      setActiveConcentrator(null);
    } catch (error) {
      console.error("Error deleting concentrator:", error);
      alert(
        `Error deleting concentrator: ${
          error instanceof Error ? error.message : "Please try again."
        }`
      );
    }
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
                setForm({
                  "Area Name": activeConcentrator["Area Name"],
                  "Device S/N": activeConcentrator["Device S/N"],
                  "Device Name": activeConcentrator["Device Name"],
                  "Device Time": activeConcentrator["Device Time"],
                  "Device Status": activeConcentrator["Device Status"],
                  "Operator": activeConcentrator["Operator"],
                  "Installed Time": activeConcentrator["Installed Time"],
                  "Communication Time": activeConcentrator["Communication Time"],
                  "Instruction Manual": activeConcentrator["Instruction Manual"],
                });
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
              onClick={loadConcentrators}
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
          isLoading={loadingConcentrators}
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
                activeConcentrator?.id === (rowData as Concentrator).id
                  ? "#EEF2FF"
                  : "#FFFFFF",
            }),
          }}
          localization={{
            body: {
              emptyDataSourceMessage: loadingConcentrators
                ? "Loading concentrators..."
                : "No concentrators found. Click 'Add' to create your first concentrator.",
            },
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

            <div className="space-y-3">
  <input
    className="w-full border px-3 py-2 rounded"
    placeholder="Device Name"
    value={form["Device Name"]}
    onChange={(e) =>
      setForm({ ...form, "Device Name": e.target.value })
    }
  />

  <input
    className="w-full border px-3 py-2 rounded"
    placeholder="Device S/N"
    value={form["Device S/N"]}
    onChange={(e) =>
      setForm({ ...form, "Device S/N": e.target.value })
    }
  />

  <input
    className="w-full border px-3 py-2 rounded"
    placeholder="Operator"
    value={form["Operator"]}
    onChange={(e) =>
      setForm({ ...form, "Operator": e.target.value })
    }
  />

  <input
    className="w-full border px-3 py-2 rounded"
    placeholder="Instruction Manual"
    value={form["Instruction Manual"]}
    onChange={(e) =>
      setForm({ ...form, "Instruction Manual": e.target.value })
    }
  />

  <button
    onClick={() =>
      setForm({
        ...form,
        "Device Status":
          form["Device Status"] === "ACTIVE" ? "INACTIVE" : "ACTIVE",
      })
    }
    className="w-full border rounded px-3 py-2 hover:bg-gray-50 text-left"
  >
    Device Status: {form["Device Status"]}
  </button>

  <input
    type="date"
    className="w-full border px-3 py-2 rounded"
    value={form["Installed Time"]}
    onChange={(e) =>
      setForm({ ...form, "Installed Time": e.target.value })
    }
  />

  <input
    type="datetime-local"
    className="w-full border px-3 py-2 rounded"
    value={form["Device Time"].slice(0, 16)}
    onChange={(e) =>
      setForm({
        ...form,
        "Device Time": new Date(e.target.value).toISOString(),
      })
    }
  />

  <input
    type="datetime-local"
    className="w-full border px-3 py-2 rounded"
    value={form["Communication Time"].slice(0, 16)}
    onChange={(e) =>
      setForm({
        ...form,
        "Communication Time": new Date(e.target.value).toISOString(),
      })
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
