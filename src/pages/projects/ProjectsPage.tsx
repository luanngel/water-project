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

/* ================= MOCK DATA ================= */
const mockProjects: Project[] = [
  {
    id: "1",
    areaName: "Zona Norte",
    deviceSN: "SN-001",
    deviceName: "Sensor Alpha",
    deviceType: "Flow Meter",
    deviceStatus: "ACTIVE",
    operator: "Juan Pérez",
    installedTime: "2024-01-10",
    communicationTime: "2024-01-11",
    instructionManual: "Manual Alpha",
  },
  {
    id: "2",
    areaName: "Zona Centro",
    deviceSN: "SN-002",
    deviceName: "Sensor Beta",
    deviceType: "Pressure Meter",
    deviceStatus: "INACTIVE",
    operator: "María López",
    installedTime: "2024-02-05",
    communicationTime: "2024-02-06",
    instructionManual: "Manual Beta",
  },
  {
    id: "3",
    areaName: "Zona Sur",
    deviceSN: "SN-003",
    deviceName: "Sensor Gamma",
    deviceType: "Flow Meter",
    deviceStatus: "ACTIVE",
    operator: "Carlos Ruiz",
    installedTime: "2024-03-01",
    communicationTime: "2024-03-02",
    instructionManual: "Manual Gamma",
  },
];

/* ================= API ================= */
const API_URL = "/api/v2/tables/m05u6wpquvdbv3c/records";

const fetchProjects = async (): Promise<Project[]> => {
  const res = await fetch(API_URL);
  const data = await res.json();

  return data.records.map((r: any) => ({
    id: r.id,
    areaName: r.fields["Area Name"] ?? "",
    deviceSN: r.fields["Device S/N"] ?? "",
    deviceName: r.fields["Device Name"] ?? "",
    deviceType: r.fields["Device Type"] ?? "",
    deviceStatus:
      r.fields["Device Status"] === "INACTIVE"
        ? "INACTIVE"
        : "ACTIVE",
    operator: r.fields["Operator"] ?? "",
    installedTime: r.fields["Installed Time"] ?? "",
    communicationTime: r.fields["Communication Time"] ?? "",
    instructionManual: r.fields["Instruction Manual"] ?? "",
  }));
};

/* ================= COMPONENT ================= */
export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [activeProject, setActiveProject] =
    useState<Project | null>(null);
  const [search, setSearch] = useState("");

  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] =
    useState<string | null>(null);

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

  const [form, setForm] =
    useState<Omit<Project, "id">>(emptyProject);

  /* ================= LOAD ================= */
  const loadProjects = async () => {
    try {
      const data = await fetchProjects();
      if (data.length === 0) {
        setProjects(mockProjects);
      } else {
        setProjects(data);
      }
    } catch {
      setProjects(mockProjects);
    }
  };

  useEffect(() => {
    loadProjects();
  }, []);

  /* ================= CRUD ================= */
  const handleSave = () => {
    if (editingId) {
      setProjects((prev) =>
        prev.map((p) =>
          p.id === editingId
            ? { ...p, ...form }
            : p
        )
      );
    } else {
      setProjects((prev) => [
        ...prev,
        { id: Date.now().toString(), ...form },
      ]);
    }

    setShowModal(false);
    setEditingId(null);
    setForm(emptyProject);
    setActiveProject(null);
  };

  const handleDelete = () => {
    if (!activeProject) return;
    setProjects((prev) =>
      prev.filter(
        (p) => p.id !== activeProject.id
      )
    );
    setActiveProject(null);
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
            background:
              "linear-gradient(135deg, #4c5f9e, #2a355d, #566bb8)",
          }}
        >
          <div>
            <h1 className="text-2xl font-bold">
              Project Management
            </h1>
            <p className="text-sm text-blue-100">
              Projects registered
            </p>
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
          onRowClick={(_, rowData) =>
            setActiveProject(rowData as Project)
          }
          options={{
            search: false,
            paging: true,
            sorting: true,
            rowStyle: (rowData) => ({
              backgroundColor:
                activeProject?.id ===
                (rowData as Project).id
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
              {editingId ? "Edit Project" : "Add Project"}
            </h2>

            <input className="w-full border px-3 py-2 rounded" placeholder="Area Name"
              value={form.areaName}
              onChange={(e) => setForm({ ...form, areaName: e.target.value })} />

            <input className="w-full border px-3 py-2 rounded" placeholder="Device S/N"
              value={form.deviceSN}
              onChange={(e) => setForm({ ...form, deviceSN: e.target.value })} />

            <input className="w-full border px-3 py-2 rounded" placeholder="Device Name"
              value={form.deviceName}
              onChange={(e) => setForm({ ...form, deviceName: e.target.value })} />

            <input className="w-full border px-3 py-2 rounded" placeholder="Device Type"
              value={form.deviceType}
              onChange={(e) => setForm({ ...form, deviceType: e.target.value })} />

            <input className="w-full border px-3 py-2 rounded" placeholder="Operator"
              value={form.operator}
              onChange={(e) => setForm({ ...form, operator: e.target.value })} />

            <input className="w-full border px-3 py-2 rounded" placeholder="Installed Time"
              value={form.installedTime}
              onChange={(e) => setForm({ ...form, installedTime: e.target.value })} />

            <input className="w-full border px-3 py-2 rounded" placeholder="Communication Time"
              value={form.communicationTime}
              onChange={(e) => setForm({ ...form, communicationTime: e.target.value })} />

            <input className="w-full border px-3 py-2 rounded" placeholder="Instruction Manual"
              value={form.instructionManual}
              onChange={(e) => setForm({ ...form, instructionManual: e.target.value })} />

            <button
              onClick={() =>
                setForm({
                  ...form,
                  deviceStatus:
                    form.deviceStatus === "ACTIVE"
                      ? "INACTIVE"
                      : "ACTIVE",
                })
              }
              className="w-full border rounded px-3 py-2"
            >
              Status: {form.deviceStatus}
            </button>

            <div className="flex justify-end gap-2 pt-3">
              <button onClick={() => setShowModal(false)}>
                Cancel
              </button>
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
