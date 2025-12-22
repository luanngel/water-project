import { useState, useEffect, useMemo } from "react";
import { Plus, Trash2, Pencil, RefreshCcw } from "lucide-react";
import MaterialTable from "@material-table/core";
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

interface GatewayData {
  "Gateway ID": number;
  "Gateway EUI": string;
  "Gateway Name": string;
  "Gateway Description": string;
  "Antenna Placement": "Indoor" | "Outdoor";
  concentratorId?: string;
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
      const projectsArray = [...new Set(data.map((record) => record["Area Name"]))];
      setAllProjects(projectsArray);
      setConcentrators(data);
    } catch (error) {
      console.error("Error loading concentrators:", error);
      setAllProjects([]);
      setConcentrators([]);
    } finally {
      setLoadingConcentrators(false);
      setLoadingProjects(false);
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

  const getEmptyGatewayData = (): GatewayData => ({
    "Gateway ID": 0,
    "Gateway EUI": "",
    "Gateway Name": "",
    "Gateway Description": "",
    "Antenna Placement": "Indoor",
  });

  const [form, setForm] = useState<Omit<Concentrator, "id">>(getEmptyConcentrator());
  const [gatewayForm, setGatewayForm] = useState<GatewayData>(getEmptyGatewayData());
  const [errors, setErrors] = useState<{ [key: string]: boolean }>({});

  /* ================= CRUD ================= */
  const createOrUpdateGateway = async (gatewayData: GatewayData): Promise<void> => {
  //await fetch('/api/gateways', { method: 'POST', body: JSON.stringify(gatewayData) })
    
    return new Promise((resolve) => {
      setTimeout(() => {
        console.log('Gateway data that would be sent to API:', gatewayData);
        resolve();
      }, 500);
    });
  };

  const validateForm = (): boolean => {
    const newErrors: { [key: string]: boolean } = {};

    if (!form["Device Name"].trim()) newErrors["Device Name"] = true;
    if (!form["Device S/N"].trim()) newErrors["Device S/N"] = true;
    if (!form["Operator"].trim()) newErrors["Operator"] = true;
    if (!form["Instruction Manual"].trim()) newErrors["Instruction Manual"] = true;
    if (!form["Installed Time"]) newErrors["Installed Time"] = true;
    if (!form["Device Time"]) newErrors["Device Time"] = true;
    if (!form["Communication Time"]) newErrors["Communication Time"] = true;

    if (!gatewayForm["Gateway ID"] || gatewayForm["Gateway ID"] === 0) {
      newErrors["Gateway ID"] = true;
    }
    if (!gatewayForm["Gateway EUI"].trim()) newErrors["Gateway EUI"] = true;
    if (!gatewayForm["Gateway Name"].trim()) newErrors["Gateway Name"] = true;
    if (!gatewayForm["Gateway Description"].trim()) newErrors["Gateway Description"] = true;

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm()) {
      return;
    }

    try {
      let savedConcentrator: Concentrator;

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
        savedConcentrator = updatedConcentrator;
      } else {
        const newConcentrator = await createConcentrator(form);
        setConcentrators((prev) => [...prev, newConcentrator]);
        savedConcentrator = newConcentrator;
      }

      try {
        const gatewayDataWithRef = {
          ...gatewayForm,
          concentratorId: savedConcentrator.id,
        };
        await createOrUpdateGateway(gatewayDataWithRef);
        console.log('Gateway data saved successfully');
      } catch (gatewayError) {
        console.error('Error saving gateway data:', gatewayError);
        alert('Concentrator saved, but there was an error saving gateway data.');
      }

      setShowModal(false);
      setEditingSerial(null);
      setForm({ ...getEmptyConcentrator(), "Area Name": selectedProject });
      setGatewayForm(getEmptyGatewayData());
      setErrors({});
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
                setGatewayForm(getEmptyGatewayData());
                setErrors({});
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
                setGatewayForm(getEmptyGatewayData());
                setErrors({});
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
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-[600px] max-h-[90vh] overflow-y-auto space-y-4">
            <h2 className="text-lg font-semibold">
              {editingSerial ? "Edit Concentrator" : "Add Concentrator"}
            </h2>

            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-gray-700 border-b pb-2">
                Concentrator Information
              </h3>
              
              <div>
                <input
                  className={`w-full border px-3 py-2 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors["Device Name"] ? "border-red-500" : ""
                  }`}
                  placeholder="Device Name *"
                  value={form["Device Name"]}
                  onChange={(e) => {
                    setForm({ ...form, "Device Name": e.target.value });
                    if (errors["Device Name"]) {
                      setErrors({ ...errors, "Device Name": false });
                    }
                  }}
                  required
                />
                {errors["Device Name"] && (
                  <p className="text-red-500 text-xs mt-1">This field is required</p>
                )}
              </div>

              <div>
                <input
                  className={`w-full border px-3 py-2 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors["Device S/N"] ? "border-red-500" : ""
                  }`}
                  placeholder="Device S/N *"
                  value={form["Device S/N"]}
                  onChange={(e) => {
                    setForm({ ...form, "Device S/N": e.target.value });
                    if (errors["Device S/N"]) {
                      setErrors({ ...errors, "Device S/N": false });
                    }
                  }}
                  required
                />
                {errors["Device S/N"] && (
                  <p className="text-red-500 text-xs mt-1">This field is required</p>
                )}
              </div>

              <div>
                <input
                  className={`w-full border px-3 py-2 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors["Operator"] ? "border-red-500" : ""
                  }`}
                  placeholder="Operator *"
                  value={form["Operator"]}
                  onChange={(e) => {
                    setForm({ ...form, "Operator": e.target.value });
                    if (errors["Operator"]) {
                      setErrors({ ...errors, "Operator": false });
                    }
                  }}
                  required
                />
                {errors["Operator"] && (
                  <p className="text-red-500 text-xs mt-1">This field is required</p>
                )}
              </div>

              <div>
                <input
                  className={`w-full border px-3 py-2 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors["Instruction Manual"] ? "border-red-500" : ""
                  }`}
                  placeholder="Instruction Manual *"
                  value={form["Instruction Manual"]}
                  onChange={(e) => {
                    setForm({ ...form, "Instruction Manual": e.target.value });
                    if (errors["Instruction Manual"]) {
                      setErrors({ ...errors, "Instruction Manual": false });
                    }
                  }}
                  required
                />
                {errors["Instruction Manual"] && (
                  <p className="text-red-500 text-xs mt-1">This field is required</p>
                )}
              </div>

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
                Device Status: {form["Device Status"]} *
              </button>

              <div>
                <input
                  type="date"
                  className={`w-full border px-3 py-2 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors["Installed Time"] ? "border-red-500" : ""
                  }`}
                  placeholder="Installed Time *"
                  value={form["Installed Time"]}
                  onChange={(e) => {
                    setForm({ ...form, "Installed Time": e.target.value });
                    if (errors["Installed Time"]) {
                      setErrors({ ...errors, "Installed Time": false });
                    }
                  }}
                  required
                />
                {errors["Installed Time"] && (
                  <p className="text-red-500 text-xs mt-1">This field is required</p>
                )}
              </div>

              <div>
                <input
                  type="datetime-local"
                  className={`w-full border px-3 py-2 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors["Device Time"] ? "border-red-500" : ""
                  }`}
                  placeholder="Device Time *"
                  value={form["Device Time"].slice(0, 16)}
                  onChange={(e) => {
                    setForm({
                      ...form,
                      "Device Time": new Date(e.target.value).toISOString(),
                    });
                    if (errors["Device Time"]) {
                      setErrors({ ...errors, "Device Time": false });
                    }
                  }}
                  required
                />
                {errors["Device Time"] && (
                  <p className="text-red-500 text-xs mt-1">This field is required</p>
                )}
              </div>

              <div>
                <input
                  type="datetime-local"
                  className={`w-full border px-3 py-2 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors["Communication Time"] ? "border-red-500" : ""
                  }`}
                  placeholder="Communication Time *"
                  value={form["Communication Time"].slice(0, 16)}
                  onChange={(e) => {
                    setForm({
                      ...form,
                      "Communication Time": new Date(e.target.value).toISOString(),
                    });
                    if (errors["Communication Time"]) {
                      setErrors({ ...errors, "Communication Time": false });
                    }
                  }}
                  required
                />
                {errors["Communication Time"] && (
                  <p className="text-red-500 text-xs mt-1">This field is required</p>
                )}
              </div>
            </div>

            <div className="space-y-3 pt-4">
              <h3 className="text-sm font-semibold text-gray-700 border-b pb-2">
                Gateway Information
              </h3>

              <div>
                <input
                  type="number"
                  className={`w-full border px-3 py-2 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors["Gateway ID"] ? "border-red-500" : ""
                  }`}
                  placeholder="Gateway ID *"
                  value={gatewayForm["Gateway ID"] || ""}
                  onChange={(e) => {
                    setGatewayForm({
                      ...gatewayForm,
                      "Gateway ID": parseInt(e.target.value) || 0,
                    });
                    if (errors["Gateway ID"]) {
                      setErrors({ ...errors, "Gateway ID": false });
                    }
                  }}
                  required
                  min="1"
                />
                {errors["Gateway ID"] && (
                  <p className="text-red-500 text-xs mt-1">This field is required</p>
                )}
              </div>

              <div>
                <input
                  className={`w-full border px-3 py-2 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors["Gateway EUI"] ? "border-red-500" : ""
                  }`}
                  placeholder="Gateway EUI *"
                  value={gatewayForm["Gateway EUI"]}
                  onChange={(e) => {
                    setGatewayForm({ ...gatewayForm, "Gateway EUI": e.target.value });
                    if (errors["Gateway EUI"]) {
                      setErrors({ ...errors, "Gateway EUI": false });
                    }
                  }}
                  required
                />
                {errors["Gateway EUI"] && (
                  <p className="text-red-500 text-xs mt-1">This field is required</p>
                )}
              </div>

              <div>
                <input
                  className={`w-full border px-3 py-2 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors["Gateway Name"] ? "border-red-500" : ""
                  }`}
                  placeholder="Gateway Name *"
                  value={gatewayForm["Gateway Name"]}
                  onChange={(e) => {
                    setGatewayForm({ ...gatewayForm, "Gateway Name": e.target.value });
                    if (errors["Gateway Name"]) {
                      setErrors({ ...errors, "Gateway Name": false });
                    }
                  }}
                  required
                />
                {errors["Gateway Name"] && (
                  <p className="text-red-500 text-xs mt-1">This field is required</p>
                )}
              </div>

              <div>
                <input
                  className={`w-full border px-3 py-2 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors["Gateway Description"] ? "border-red-500" : ""
                  }`}
                  placeholder="Gateway Description *"
                  value={gatewayForm["Gateway Description"]}
                  onChange={(e) => {
                    setGatewayForm({
                      ...gatewayForm,
                      "Gateway Description": e.target.value,
                    });
                    if (errors["Gateway Description"]) {
                      setErrors({ ...errors, "Gateway Description": false });
                    }
                  }}
                  required
                />
                {errors["Gateway Description"] && (
                  <p className="text-red-500 text-xs mt-1">This field is required</p>
                )}
              </div>

              <select
                className="w-full border px-3 py-2 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={gatewayForm["Antenna Placement"]}
                onChange={(e) =>
                  setGatewayForm({
                    ...gatewayForm,
                    "Antenna Placement": e.target.value as "Indoor" | "Outdoor",
                  })
                }
                required
              >
                <option value="Indoor">Indoor</option>
                <option value="Outdoor">Outdoor</option>
              </select>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t">
              <button
                onClick={() => {
                  setShowModal(false);
                  setGatewayForm(getEmptyGatewayData());
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
