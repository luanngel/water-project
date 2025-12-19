import { useEffect, useState } from "react";
import { Plus, Trash2, Pencil, RefreshCcw } from "lucide-react";
import MaterialTable from "@material-table/core";

/* ================= TYPES ================= */
interface Project {
  id: string;
  areaName: string;
  deviceSN: string;
  deviceName: string;
  deviceType: string;
  deviceStatus: "ACTIVE" | "INACTIVE";
  operator: string;
  installedTime: string;
  communicationTime: string;
  instructionManual: string;
}

/* ================= API ================= */
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
const API_URL = `${API_BASE_URL}/api/v3/data/ppfu31vhv5gf6i0/m05u6wpquvdbv3c/records`;
const API_TOKEN = import.meta.env.VITE_API_TOKEN;

const getAuthHeaders = () => ({
  Authorization: `Bearer ${API_TOKEN}`,
  "Content-Type": "application/json",
});

interface ProjectApiRecord {
  id: number;
  fields: {
    "Area name"?: string;
    "Device S/N"?: string;
    "Device Name"?: string;
    "Device Type"?: string;
    "Device Status"?: string;
    Operator?: string;
    "Installed Time"?: string;
    "Communication Time"?: string;
    "Instruction Manual"?: string | null;
  };
}

const fetchProjects = async (): Promise<Project[]> => {
  const res = await fetch(API_URL, {
    method: "GET",
    headers: getAuthHeaders(),
  });
  const data = await res.json();

  return data.records.map((r: ProjectApiRecord) => ({
    id: r.id.toString(),
    areaName: r.fields["Area name"] ?? "",
    deviceSN: r.fields["Device S/N"] ?? "",
    deviceName: r.fields["Device Name"] ?? "",
    deviceType: r.fields["Device Type"] ?? "",
    deviceStatus:
      r.fields["Device Status"] === "Installed" ? "ACTIVE" : "INACTIVE",
    operator: r.fields["Operator"] ?? "",
    installedTime: r.fields["Installed Time"] ?? "",
    communicationTime: r.fields["Communication Time"] ?? "",
    instructionManual: r.fields["Instruction Manual"] ?? "",
  }));
};

/* ================= COMPONENT ================= */
export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeProject, setActiveProject] = useState<Project | null>(null);
  const [search, setSearch] = useState("");

  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const emptyProject: Omit<Project, "id"> = {
    areaName: "",
    deviceSN: "",
    deviceName: "",
    deviceType: "",
    deviceStatus: "ACTIVE",
    operator: "",
    installedTime: "",
    communicationTime: "",
    instructionManual: "",
  };

  const [form, setForm] = useState<Omit<Project, "id">>(emptyProject);

  /* ================= LOAD ================= */
  const loadProjects = async () => {
    setLoading(true);
    try {
      const data = await fetchProjects();
      setProjects(data);
    } catch (error) {
      console.error("Error loading projects:", error);
      setProjects([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProjects();
  }, []);

  /* ================= CRUD ================= */
  const createProject = async (
    projectData: Omit<Project, "id">
  ): Promise<Project> => {
    const res = await fetch(API_URL, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify({
        fields: {
          "Area name": projectData.areaName,
          "Device S/N": projectData.deviceSN,
          "Device Name": projectData.deviceName,
          "Device Type": projectData.deviceType,
          "Device Status":
            projectData.deviceStatus === "ACTIVE" ? "Installed" : "Inactive",
          Operator: projectData.operator,
          "Installed Time": projectData.installedTime,
          "Communication Time": projectData.communicationTime,
          "Instruction Manual": projectData.instructionManual,
        },
      }),
    });

    if (!res.ok) {
      throw new Error(
        `Failed to create project: ${res.status} ${res.statusText}`
      );
    }

    const data = await res.json();

    const createdRecord = data.records?.[0];
    if (!createdRecord) {
      throw new Error("Invalid response format: no record returned");
    }

    return {
      id: createdRecord.id.toString(),
      areaName: createdRecord.fields["Area name"] ?? projectData.areaName,
      deviceSN: createdRecord.fields["Device S/N"] ?? projectData.deviceSN,
      deviceName: createdRecord.fields["Device Name"] ?? projectData.deviceName,
      deviceType: createdRecord.fields["Device Type"] ?? projectData.deviceType,
      deviceStatus:
        createdRecord.fields["Device Status"] === "Installed"
          ? "ACTIVE"
          : "INACTIVE",
      operator: createdRecord.fields["Operator"] ?? projectData.operator,
      installedTime:
        createdRecord.fields["Installed Time"] ?? projectData.installedTime,
      communicationTime:
        createdRecord.fields["Communication Time"] ??
        projectData.communicationTime,
      instructionManual:
        createdRecord.fields["Instruction Manual"] ??
        projectData.instructionManual,
    };
  };

  const updateProject = async (
    id: string,
    projectData: Omit<Project, "id">
  ): Promise<Project> => {
    const res = await fetch(API_URL, {
      method: "PATCH",
      headers: getAuthHeaders(),
      body: JSON.stringify({
        id: parseInt(id),
        fields: {
          "Area name": projectData.areaName,
          "Device S/N": projectData.deviceSN,
          "Device Name": projectData.deviceName,
          "Device Type": projectData.deviceType,
          "Device Status":
            projectData.deviceStatus === "ACTIVE" ? "Installed" : "Inactive",
          Operator: projectData.operator,
          "Installed Time": projectData.installedTime,
          "Communication Time": projectData.communicationTime,
          "Instruction Manual": projectData.instructionManual,
        },
      }),
    });

    if (!res.ok) {
      if (res.status === 400) {
        const errorData = await res.json();
        throw new Error(
          `Bad Request: ${errorData.msg || "Invalid data provided"}`
        );
      }
      throw new Error(
        `Failed to update project: ${res.status} ${res.statusText}`
      );
    }

    const data = await res.json();

    const updatedRecord = data.records?.[0];
    if (!updatedRecord) {
      throw new Error("Invalid response format: no record returned");
    }

    return {
      id: updatedRecord.id.toString(),
      areaName: updatedRecord.fields["Area name"] ?? projectData.areaName,
      deviceSN: updatedRecord.fields["Device S/N"] ?? projectData.deviceSN,
      deviceName: updatedRecord.fields["Device Name"] ?? projectData.deviceName,
      deviceType: updatedRecord.fields["Device Type"] ?? projectData.deviceType,
      deviceStatus:
        updatedRecord.fields["Device Status"] === "Installed"
          ? "ACTIVE"
          : "INACTIVE",
      operator: updatedRecord.fields["Operator"] ?? projectData.operator,
      installedTime:
        updatedRecord.fields["Installed Time"] ?? projectData.installedTime,
      communicationTime:
        updatedRecord.fields["Communication Time"] ??
        projectData.communicationTime,
      instructionManual:
        updatedRecord.fields["Instruction Manual"] ??
        projectData.instructionManual,
    };
  };

  const deleteProject = async (id: string): Promise<void> => {
    const res = await fetch(API_URL, {
      method: "DELETE",
      headers: getAuthHeaders(),
      body: JSON.stringify({
        id: id,
      }),
    });

    if (!res.ok) {
      if (res.status === 400) {
        const errorData = await res.json();
        throw new Error(
          `Bad Request: ${errorData.msg || "Invalid data provided"}`
        );
      }
      throw new Error(
        `Failed to delete project: ${res.status} ${res.statusText}`
      );
    }
  };

  const handleSave = async () => {
    try {
      if (editingId) {
        const updatedProject = await updateProject(editingId, form);
        setProjects((prev) =>
          prev.map((p) => (p.id === editingId ? updatedProject : p))
        );
      } else {
        const newProject = await createProject(form);
        setProjects((prev) => [...prev, newProject]);
      }

      setShowModal(false);
      setEditingId(null);
      setForm(emptyProject);
      setActiveProject(null);
    } catch (error) {
      console.error("Error saving project:", error);
      alert(
        `Error saving project: ${
          error instanceof Error ? error.message : "Please try again."
        }`
      );
    }
  };

  const handleDelete = async () => {
    if (!activeProject) return;

    const confirmDelete = window.confirm(
      `Are you sure you want to delete the project "${activeProject.deviceName}"?`
    );

    if (!confirmDelete) return;

    try {
      await deleteProject(activeProject.id);
      setProjects((prev) => prev.filter((p) => p.id !== activeProject.id));
      setActiveProject(null);
    } catch (error) {
      console.error("Error deleting project:", error);
      alert(
        `Error deleting project: ${
          error instanceof Error ? error.message : "Please try again."
        }`
      );
    }
  };

  /* ================= FILTER ================= */
  const filtered = projects.filter((p) =>
    `${p.areaName} ${p.deviceName} ${p.deviceSN}`
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  /* ================= UI ================= */
  return (
    <div className="flex gap-6 p-6 w-full bg-gray-100">
      <div className="flex-1 flex flex-col gap-6">
        {/* HEADER */}
        <div
          className="rounded-xl shadow p-6 text-white flex justify-between items-center"
          style={{
            background: "linear-gradient(135deg, #4c5f9e, #2a355d, #566bb8)",
          }}
        >
          <div>
            <h1 className="text-2xl font-bold">Project Management</h1>
            <p className="text-sm text-blue-100">Projects registered</p>
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => {
                setForm(emptyProject);
                setEditingId(null);
                setShowModal(true);
              }}
              className="flex items-center gap-2 px-4 py-2 bg-white text-[#4c5f9e] rounded-lg"
            >
              <Plus size={16} /> Add
            </button>

            <button
              onClick={() => {
                if (!activeProject) return;
                setEditingId(activeProject.id);
                setForm({
                  areaName: activeProject.areaName,
                  deviceSN: activeProject.deviceSN,
                  deviceName: activeProject.deviceName,
                  deviceType: activeProject.deviceType,
                  deviceStatus: activeProject.deviceStatus,
                  operator: activeProject.operator,
                  installedTime: activeProject.installedTime,
                  communicationTime: activeProject.communicationTime,
                  instructionManual: activeProject.instructionManual,
                });
                setShowModal(true);
              }}
              disabled={!activeProject}
              className="flex items-center gap-2 px-4 py-2 border border-white/40 rounded-lg disabled:opacity-60"
            >
              <Pencil size={16} /> Edit
            </button>

            <button
              onClick={handleDelete}
              disabled={!activeProject}
              className="flex items-center gap-2 px-4 py-2 border border-white/40 rounded-lg disabled:opacity-60"
            >
              <Trash2 size={16} /> Delete
            </button>

            <button
              onClick={loadProjects}
              className="flex items-center gap-2 px-4 py-2 border border-white/40 rounded-lg"
            >
              <RefreshCcw size={16} /> Refresh
            </button>
          </div>
        </div>

        {/* SEARCH */}
        <input
          className="bg-white rounded-lg shadow px-4 py-2 text-sm"
          placeholder="Search project..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        {/* TABLE */}
        <MaterialTable
          title="Projects"
          isLoading={loading}
          columns={[
            { title: "Area Name", field: "areaName" },
            { title: "Device S/N", field: "deviceSN" },
            { title: "Device Name", field: "deviceName" },
            { title: "Device Type", field: "deviceType" },
            {
              title: "Status",
              field: "deviceStatus",
              render: (rowData) => (
                <span
                  className={`px-3 py-1 rounded-full text-xs font-semibold border ${
                    rowData.deviceStatus === "ACTIVE"
                      ? "text-blue-600 border-blue-600"
                      : "text-red-600 border-red-600"
                  }`}
                >
                  {rowData.deviceStatus}
                </span>
              ),
            },
            { title: "Operator", field: "operator" },
            { title: "Installed Time", field: "installedTime" },
            { title: "Communication Time", field: "communicationTime" },
            { title: "Instruction Manual", field: "instructionManual" },
          ]}
          data={filtered}
          onRowClick={(_, rowData) => setActiveProject(rowData as Project)}
          options={{
            search: false,
            paging: true,
            sorting: true,
            rowStyle: (rowData) => ({
              backgroundColor:
                activeProject?.id === (rowData as Project).id
                  ? "#EEF2FF"
                  : "#FFFFFF",
            }),
          }}
          localization={{
            body: {
              emptyDataSourceMessage: loading
                ? "Loading projects..."
                : "No projects found. Click 'Add' to create your first project.",
            },
          }}
        />
      </div>

      {/* MODAL */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center">
          <div className="bg-white rounded-xl p-6 w-96 space-y-3">
            <h2 className="text-lg font-semibold">
              {editingId ? "Edit Project" : "Add Project"}
            </h2>

            <input
              className="w-full border px-3 py-2 rounded"
              placeholder="Area Name"
              value={form.areaName}
              onChange={(e) => setForm({ ...form, areaName: e.target.value })}
            />

            <input
              className="w-full border px-3 py-2 rounded"
              placeholder="Device S/N"
              value={form.deviceSN}
              onChange={(e) => setForm({ ...form, deviceSN: e.target.value })}
            />

            <input
              className="w-full border px-3 py-2 rounded"
              placeholder="Device Name"
              value={form.deviceName}
              onChange={(e) => setForm({ ...form, deviceName: e.target.value })}
            />

            <input
              className="w-full border px-3 py-2 rounded"
              placeholder="Device Type"
              value={form.deviceType}
              onChange={(e) => setForm({ ...form, deviceType: e.target.value })}
            />

            <input
              className="w-full border px-3 py-2 rounded"
              placeholder="Operator"
              value={form.operator}
              onChange={(e) => setForm({ ...form, operator: e.target.value })}
            />

            <input
              className="w-full border px-3 py-2 rounded"
              placeholder="Installed Time"
              value={form.installedTime}
              onChange={(e) =>
                setForm({ ...form, installedTime: e.target.value })
              }
            />

            <input
              className="w-full border px-3 py-2 rounded"
              placeholder="Communication Time"
              value={form.communicationTime}
              onChange={(e) =>
                setForm({ ...form, communicationTime: e.target.value })
              }
            />

            <input
              className="w-full border px-3 py-2 rounded"
              placeholder="Instruction Manual"
              value={form.instructionManual}
              onChange={(e) =>
                setForm({ ...form, instructionManual: e.target.value })
              }
            />

            <button
              onClick={() =>
                setForm({
                  ...form,
                  deviceStatus:
                    form.deviceStatus === "ACTIVE" ? "INACTIVE" : "ACTIVE",
                })
              }
              className="w-full border rounded px-3 py-2"
            >
              Status: {form.deviceStatus}
            </button>

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
