import { useEffect, useMemo, useState } from "react";
import { Plus, Trash2, Pencil, RefreshCcw } from "lucide-react";
import MaterialTable from "@material-table/core";
import {
  fetchConcentrators,
  createConcentrator,
  updateConcentrator,
  deleteConcentrator,
  type Concentrator,
} from "../../api/concentrators";
import ConfirmModal from "../../components/layout/common/ConfirmModal";

/* ================= TYPES ================= */

interface User {
  name: string;
  role: "SUPER_ADMIN" | "USER";
  project?: string;
}

type ProjectStatus = "ACTIVO" | "INACTIVO";

type ProjectCard = {
  name: string;
  region: string;
  projects: number;
  concentrators: number;
  activeAlerts: number;
  lastSync: string;
  contact: string;
  status: ProjectStatus;
};

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
    role: "SUPER_ADMIN",
    project: "CESPT",
  };

  // ✅ Modal confirmación delete (bonito)
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const [allProjects, setAllProjects] = useState<string[]>([]);
  const [loadingProjects, setLoadingProjects] = useState(true);
  const [loadingConcentrators, setLoadingConcentrators] = useState(true);

  const [selectedProject, setSelectedProject] = useState("");
  const [concentrators, setConcentrators] = useState<Concentrator[]>([]);
  const [filteredConcentrators, setFilteredConcentrators] = useState<
    Concentrator[]
  >([]);

  const [activeConcentrator, setActiveConcentrator] =
    useState<Concentrator | null>(null);
  const [search, setSearch] = useState("");
  const [projectQuery, setProjectQuery] = useState("");

  const [showModal, setShowModal] = useState(false);
  const [editingSerial, setEditingSerial] = useState<string | null>(null);

  /* ================= PROJECTS VISIBLE ================= */
  const visibleProjects = useMemo(
    () =>
      currentUser.role === "SUPER_ADMIN"
        ? allProjects
        : currentUser.project
        ? [currentUser.project]
        : [],
    [allProjects, currentUser.role, currentUser.project]
  );

  /* ================= LOAD ================= */
  const loadConcentrators = async () => {
    setLoadingConcentrators(true);
    setLoadingProjects(true);
    try {
      const raw = await fetchConcentrators();

      // ============================================================
      // ✅ DEBUG: Ver payload crudo y comparar por proyecto/Area Name
      // ============================================================
      console.log("RAW concentrators sample (first 5):", raw.slice(0, 5));

      const byArea = raw.reduce<Record<string, any[]>>((acc, c: any) => {
        const area = c["Area Name"] ?? "SIN AREA";
        (acc[area] ||= []).push(c);
        return acc;
      }, {});

      Object.entries(byArea).forEach(([area, rows]) => {
        const first: any = rows[0];
        console.log(`AREA=${area} COUNT=${rows.length}`);
        console.log("keys:", Object.keys(first));
        console.log("Device Name:", first["Device Name"]);
        console.log("Device S/N:", first["Device S/N"]);
        console.log("Possible alt fields:", {
          deviceName: first.deviceName,
          name: first.name,
          device_code: first["Device Code"],
          device_alias: first["Device Alias"],
          device_label: first["Device Label"],
          device_display_name: first["Device Display Name"],
          deviceDescription: first["Device Description"],
        });
      });

      // ============================================================
      // ✅ NORMALIZE: Forzar que "Device Name" sea el nombre “humano”
      //    - Prioriza posibles campos alternos
      //    - Deja el "Device Name" original al final como fallback
      // ============================================================
      const normalized = raw.map((c: any) => {
        const preferredName =
          c["Device Alias"] ||
          c["Device Label"] ||
          c["Device Display Name"] ||
          c.deviceName ||
          c.name ||
          c["Device Name"] ||
          "";

        return {
          ...c,
          "Device Name": preferredName,
        };
      });

      console.log("NORMALIZED sample (first 5):", normalized.slice(0, 5));

      const projectsArray = [
        ...new Set(normalized.map((r: any) => r["Area Name"])),
      ].filter(Boolean) as string[];

      setAllProjects(projectsArray);
      setConcentrators(normalized);

      // ✅ FIX: si no hay proyecto seleccionado, autoselecciona el primero visible
      setSelectedProject((prev) => {
        if (prev) return prev;

        // si es USER y tiene proyecto asignado, respétalo
        if (currentUser.role !== "SUPER_ADMIN" && currentUser.project) {
          return currentUser.project;
        }

        // para SUPER_ADMIN: si hay visibles, toma el primero
        return projectsArray[0] ?? "";
      });
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Si el usuario solo tiene 1 proyecto visible, lo auto-selecciona
  useEffect(() => {
    if (!selectedProject && visibleProjects.length === 1) {
      setSelectedProject(visibleProjects[0]);
    }
  }, [visibleProjects, selectedProject]);

  // ============================================================
  // ✅ MISMA LÓGICA QUE TU SEGUNDO CÓDIGO:
  // - Si hay selectedProject => filtra por Area Name
  // - Si NO hay selectedProject => muestra TODOS (no vacío)
  // ============================================================
  useEffect(() => {
    if (selectedProject) {
      const filtered = concentrators.filter(
        (c) => c["Area Name"] === selectedProject
      );
      setFilteredConcentrators(filtered);
    } else {
      setFilteredConcentrators(concentrators);
    }
  }, [selectedProject, concentrators]);

  /* ================= SIDEBAR (HOME-LIKE LIST ALWAYS OPEN) ================= */
  const projectsData: ProjectCard[] = useMemo(() => {
    const counts = concentrators.reduce<Record<string, number>>((acc, c) => {
      const area = c["Area Name"] ?? "SIN PROYECTO";
      acc[area] = (acc[area] ?? 0) + 1;
      return acc;
    }, {});

    const baseRegion = "Baja California";
    const baseContact = "Operaciones";
    const baseLastSync = "Hace 1 h";

    return visibleProjects.map((name) => ({
      name,
      region: baseRegion,
      projects: 1,
      concentrators: counts[name] ?? 0,
      activeAlerts: 0,
      lastSync: baseLastSync,
      contact: baseContact,
      status: "ACTIVO",
    }));
  }, [concentrators, visibleProjects]);

  const filteredProjects = useMemo(() => {
    const q = projectQuery.trim().toLowerCase();
    if (!q) return projectsData;
    return projectsData.filter((p) => p.name.toLowerCase().includes(q));
  }, [projectQuery, projectsData]);

  /* ================= FORM HELPERS ================= */
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

  // ✅ FIX: gatewayForm debe inicializarse con el OBJETO, no con la función
  const [form, setForm] = useState<Omit<Concentrator, "id">>(
    getEmptyConcentrator()
  );
  const [gatewayForm, setGatewayForm] = useState<GatewayData>(
    getEmptyGatewayData()
  );
  const [errors, setErrors] = useState<{ [key: string]: boolean }>({});

  /* ================= CRUD ================= */
  const createOrUpdateGateway = async (
    gatewayData: GatewayData
  ): Promise<void> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        console.log("Gateway data that would be sent to API:", gatewayData);
        resolve();
      }, 500);
    });
  };

  const validateForm = (): boolean => {
    const newErrors: { [key: string]: boolean } = {};

    if (!form["Device Name"].trim()) newErrors["Device Name"] = true;
    if (!form["Device S/N"].trim()) newErrors["Device S/N"] = true;
    if (!form["Operator"].trim()) newErrors["Operator"] = true;
    if (!form["Instruction Manual"].trim())
      newErrors["Instruction Manual"] = true;
    if (!form["Installed Time"]) newErrors["Installed Time"] = true;
    if (!form["Device Time"]) newErrors["Device Time"] = true;
    if (!form["Communication Time"]) newErrors["Communication Time"] = true;

    if (!gatewayForm["Gateway ID"] || gatewayForm["Gateway ID"] === 0)
      newErrors["Gateway ID"] = true;
    if (!gatewayForm["Gateway EUI"].trim()) newErrors["Gateway EUI"] = true;
    if (!gatewayForm["Gateway Name"].trim()) newErrors["Gateway Name"] = true;
    if (!gatewayForm["Gateway Description"].trim())
      newErrors["Gateway Description"] = true;

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm()) return;

    try {
      let savedConcentrator: Concentrator;

      // ✅ DEBUG: ver qué se manda al API
      console.log("FORM SENT:", form);
      console.log("editingSerial:", editingSerial);

      if (editingSerial) {
        const concentratorToUpdate = concentrators.find(
          (c) => c["Device S/N"] === editingSerial
        );
        if (!concentratorToUpdate) throw new Error("Concentrator not found");

        const updatedConcentrator = await updateConcentrator(
          concentratorToUpdate.id,
          form
        );

        // ✅ DEBUG: ver respuesta del API
        console.log("UPDATED RESPONSE:", updatedConcentrator);

        setConcentrators((prev) =>
          prev.map((c) =>
            c.id === concentratorToUpdate.id ? updatedConcentrator : c
          )
        );
        savedConcentrator = updatedConcentrator;
      } else {
        const newConcentrator = await createConcentrator(form);

        // ✅ DEBUG: ver respuesta del API al crear
        console.log("CREATED RESPONSE:", newConcentrator);

        setConcentrators((prev) => [...prev, newConcentrator]);
        savedConcentrator = newConcentrator;
      }

      try {
        const gatewayDataWithRef = {
          ...gatewayForm,
          concentratorId: savedConcentrator.id,
        };
        await createOrUpdateGateway(gatewayDataWithRef);
      } catch (gatewayError) {
        console.error("Error saving gateway data:", gatewayError);
        alert("Concentrator saved, but there was an error saving gateway data.");
      }

      setShowModal(false);
      setEditingSerial(null);
      setForm({ ...getEmptyConcentrator(), "Area Name": selectedProject });
      setGatewayForm(getEmptyGatewayData());
      setErrors({});
      setActiveConcentrator(null);
    } catch (error) {
      console.error("Error saving concentrator:", error);
      alert(
        `Error saving concentrator: ${
          error instanceof Error ? error.message : "Please try again."
        }`
      );
    }
  };

  // ✅ MISMA lógica de delete, solo sin window.confirm (el confirm lo hace el modal)
  const handleDelete = async () => {
    if (!activeConcentrator) return;

    try {
      await deleteConcentrator(activeConcentrator.id);
      setConcentrators((prev) =>
        prev.filter((c) => c.id !== activeConcentrator.id)
      );
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

  // ============================================================
  // ✅ MISMA LÓGICA DE TABLA/BÚSQUEDA QUE TU SEGUNDO CÓDIGO:
  // - filtra sobre filteredConcentrators (que ya puede ser "all")
  // - búsqueda case-insensitive sin romper por undefined
  // ============================================================
  const searchFiltered = filteredConcentrators.filter((c) => {
    const name = (c["Device Name"] ?? "").toLowerCase();
    const sn = (c["Device S/N"] ?? "").toLowerCase();
    const q = search.toLowerCase();
    return name.includes(q) || sn.includes(q);
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
              onClick={loadConcentrators}
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
            ) : visibleProjects.length === 0 ? (
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
                    onClick={() => {
                      setSelectedProject(p.name);
                      setActiveConcentrator(null);
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
                        <span className="text-gray-500">Concentradores</span>
                        <span className="font-medium text-gray-800">
                          {p.concentrators}
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
                          e.stopPropagation();
                          setSelectedProject(p.name);
                          setActiveConcentrator(null);
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
        {/* HEADER + ACTIONS */}
        <div
          className="rounded-xl shadow p-6 text-white flex justify-between items-center"
          style={{
            background: "linear-gradient(135deg, #4c5f9e, #2a355d, #566bb8)",
          }}
        >
          <div>
            <h1 className="text-2xl font-bold">Concentrator Management</h1>
            <p className="text-sm text-blue-100">
              {selectedProject
                ? `Proyecto: ${selectedProject}`
                : "Selecciona un proyecto desde el panel izquierdo"}
            </p>
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => {
                if (!selectedProject) return;
                setForm({
                  ...getEmptyConcentrator(),
                  "Area Name": selectedProject,
                });
                setGatewayForm(getEmptyGatewayData());
                setErrors({});
                setEditingSerial(null);
                setShowModal(true);
              }}
              disabled={!selectedProject || visibleProjects.length === 0}
              className="flex items-center gap-2 px-4 py-2 bg-white text-[#4c5f9e] rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Plus size={16} /> Agregar
            </button>

            {/* ✅ EDIT */}
            <button
              onClick={() => {
                if (!activeConcentrator) return;

                // ✅ DEBUG: ver qué trae el row seleccionado
                console.log("EDIT CLICK - activeConcentrator:", activeConcentrator);

                setEditingSerial(activeConcentrator["Device S/N"]);
                setForm({
                  "Area Name": activeConcentrator["Area Name"],
                  "Device S/N": activeConcentrator["Device S/N"],
                  "Device Name": activeConcentrator["Device Name"],
                  "Device Time": activeConcentrator["Device Time"],
                  "Device Status": activeConcentrator["Device Status"],
                  Operator: activeConcentrator["Operator"],
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
              <Pencil size={16} /> Editar
            </button>

            {/* ✅ Delete confirm modal */}
            <button
              onClick={() => setConfirmOpen(true)}
              disabled={!activeConcentrator}
              className="flex items-center gap-2 px-4 py-2 border border-white/40 rounded-lg disabled:opacity-60"
            >
              <Trash2 size={16} /> Eliminar
            </button>

            <button
              onClick={loadConcentrators}
              className="flex items-center gap-2 px-4 py-2 border border-white/40 rounded-lg"
            >
              <RefreshCcw size={16} /> Actualizar
            </button>
          </div>
        </div>

        {/* SEARCH */}
        <input
          className="bg-white rounded-lg shadow px-4 py-2 text-sm"
          placeholder="Search concentrator..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          disabled={!selectedProject}
        />

        {/* TABLE */}
        <div className={!selectedProject ? "opacity-60 pointer-events-none" : ""}>
          <MaterialTable
            title="Concentrators"
            isLoading={loadingConcentrators}
            columns={[
              {
                title: "Device Name",
                field: "Device Name",
                render: (rowData: any) => rowData["Device Name"] || "-",
              },
              {
                title: "Device S/N",
                field: "Device S/N",
                render: (rowData: any) => rowData["Device S/N"] || "-",
              },
              {
                title: "Device Status",
                field: "Device Status",
                render: (rowData: any) => (
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-semibold border ${
                      rowData["Device Status"] === "ACTIVE"
                        ? "text-blue-600 border-blue-600"
                        : "text-red-600 border-red-600"
                    }`}
                  >
                    {rowData["Device Status"] || "-"}
                  </span>
                ),
              },
              {
                title: "Operator",
                field: "Operator",
                render: (rowData: any) => rowData["Operator"] || "-",
              },
              {
                title: "Area Name",
                field: "Area Name",
                render: (rowData: any) => rowData["Area Name"] || "-",
              },
              {
                title: "Installed Time",
                field: "Installed Time",
                type: "date",
                render: (rowData: any) => rowData["Installed Time"] || "-",
              },
            ]}
            data={searchFiltered}
            onRowClick={(_, rowData) =>
              setActiveConcentrator(rowData as Concentrator)
            }
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
                emptyDataSourceMessage: !selectedProject
                  ? "Select a project to view concentrators."
                  : loadingConcentrators
                  ? "Loading concentrators..."
                  : "No concentrators found. Click 'Add' to create your first concentrator.",
              },
            }}
          />
        </div>

        {/* ✅ ConfirmModal bonito */}
        <ConfirmModal
          open={confirmOpen}
          title="Eliminar concentrador"
          message={`¿Estás seguro que quieres eliminar "${
            activeConcentrator?.["Device Name"] ?? "este concentrador"
          }"? Esta acción no se puede deshacer.`}
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

      {/* MODAL ADD/EDIT */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-[700px] max-h-[90vh] overflow-y-auto space-y-4">
            <h2 className="text-lg font-semibold">
              {editingSerial ? "Edit Concentrator" : "Add Concentrator"}
            </h2>

            {/* ================= FORM ================= */}
            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-gray-700 border-b pb-2">
                Concentrator Information
              </h3>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <input
                    className="w-full border px-3 py-2 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50"
                    placeholder="Area Name"
                    value={form["Area Name"] ?? ""}
                    disabled
                  />
                  <p className="text-xs text-gray-400 mt-1">
                    El proyecto seleccionado define el Area Name.
                  </p>
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
                      if (errors["Device S/N"])
                        setErrors({ ...errors, "Device S/N": false });
                    }}
                    required
                  />
                  {errors["Device S/N"] && (
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
                      errors["Device Name"] ? "border-red-500" : ""
                    }`}
                    placeholder="Device Name *"
                    value={form["Device Name"]}
                    onChange={(e) => {
                      setForm({ ...form, "Device Name": e.target.value });
                      if (errors["Device Name"])
                        setErrors({ ...errors, "Device Name": false });
                    }}
                    required
                  />
                  {errors["Device Name"] && (
                    <p className="text-red-500 text-xs mt-1">
                      This field is required
                    </p>
                  )}
                </div>

                <div>
                  <select
                    className="w-full border px-3 py-2 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    value={form["Device Status"]}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        "Device Status": e.target.value as any,
                      })
                    }
                  >
                    <option value="ACTIVE">ACTIVE</option>
                    <option value="INACTIVE">INACTIVE</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <input
                    className={`w-full border px-3 py-2 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      errors["Operator"] ? "border-red-500" : ""
                    }`}
                    placeholder="Operator *"
                    value={form["Operator"]}
                    onChange={(e) => {
                      setForm({ ...form, Operator: e.target.value });
                      if (errors["Operator"])
                        setErrors({ ...errors, Operator: false });
                    }}
                    required
                  />
                  {errors["Operator"] && (
                    <p className="text-red-500 text-xs mt-1">
                      This field is required
                    </p>
                  )}
                </div>

                <div>
                  <input
                    type="date"
                    className={`w-full border px-3 py-2 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      errors["Installed Time"] ? "border-red-500" : ""
                    }`}
                    value={(form["Installed Time"] ?? "").slice(0, 10)}
                    onChange={(e) => {
                      setForm({ ...form, "Installed Time": e.target.value });
                      if (errors["Installed Time"])
                        setErrors({ ...errors, "Installed Time": false });
                    }}
                    required
                  />
                  {errors["Installed Time"] && (
                    <p className="text-red-500 text-xs mt-1">
                      This field is required
                    </p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <input
                    type="datetime-local"
                    className={`w-full border px-3 py-2 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      errors["Device Time"] ? "border-red-500" : ""
                    }`}
                    value={toDatetimeLocalValue(form["Device Time"])}
                    onChange={(e) => {
                      setForm({
                        ...form,
                        "Device Time": fromDatetimeLocalValue(e.target.value),
                      });
                      if (errors["Device Time"])
                        setErrors({ ...errors, "Device Time": false });
                    }}
                    required
                  />
                  {errors["Device Time"] && (
                    <p className="text-red-500 text-xs mt-1">
                      This field is required
                    </p>
                  )}
                </div>

                <div>
                  <input
                    type="datetime-local"
                    className={`w-full border px-3 py-2 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      errors["Communication Time"] ? "border-red-500" : ""
                    }`}
                    value={toDatetimeLocalValue(form["Communication Time"])}
                    onChange={(e) => {
                      setForm({
                        ...form,
                        "Communication Time": fromDatetimeLocalValue(
                          e.target.value
                        ),
                      });
                      if (errors["Communication Time"])
                        setErrors({ ...errors, "Communication Time": false });
                    }}
                    required
                  />
                  {errors["Communication Time"] && (
                    <p className="text-red-500 text-xs mt-1">
                      This field is required
                    </p>
                  )}
                </div>
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
                    if (errors["Instruction Manual"])
                      setErrors({ ...errors, "Instruction Manual": false });
                  }}
                  required
                />
                {errors["Instruction Manual"] && (
                  <p className="text-red-500 text-xs mt-1">
                    This field is required
                  </p>
                )}
              </div>
            </div>

            <div className="space-y-3 pt-4">
              <h3 className="text-sm font-semibold text-gray-700 border-b pb-2">
                Gateway Configuration
              </h3>

              <div className="grid grid-cols-2 gap-3">
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
                      if (errors["Gateway ID"])
                        setErrors({ ...errors, "Gateway ID": false });
                    }}
                    required
                    min={1}
                  />
                  {errors["Gateway ID"] && (
                    <p className="text-red-500 text-xs mt-1">
                      This field is required
                    </p>
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
                      setGatewayForm({
                        ...gatewayForm,
                        "Gateway EUI": e.target.value,
                      });
                      if (errors["Gateway EUI"])
                        setErrors({ ...errors, "Gateway EUI": false });
                    }}
                    required
                  />
                  {errors["Gateway EUI"] && (
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
                      errors["Gateway Name"] ? "border-red-500" : ""
                    }`}
                    placeholder="Gateway Name *"
                    value={gatewayForm["Gateway Name"]}
                    onChange={(e) => {
                      setGatewayForm({
                        ...gatewayForm,
                        "Gateway Name": e.target.value,
                      });
                      if (errors["Gateway Name"])
                        setErrors({ ...errors, "Gateway Name": false });
                    }}
                    required
                  />
                  {errors["Gateway Name"] && (
                    <p className="text-red-500 text-xs mt-1">
                      This field is required
                    </p>
                  )}
                </div>

                <div>
                  <select
                    className="w-full border px-3 py-2 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    value={gatewayForm["Antenna Placement"]}
                    onChange={(e) =>
                      setGatewayForm({
                        ...gatewayForm,
                        "Antenna Placement": e.target.value as
                          | "Indoor"
                          | "Outdoor",
                      })
                    }
                  >
                    <option value="Indoor">Indoor</option>
                    <option value="Outdoor">Outdoor</option>
                  </select>
                </div>
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
                    if (errors["Gateway Description"])
                      setErrors({ ...errors, "Gateway Description": false });
                  }}
                  required
                />
                {errors["Gateway Description"] && (
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

  function toDatetimeLocalValue(value?: string) {
    if (!value) return "";
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) return "";
    const pad = (n: number) => String(n).padStart(2, "0");
    const yyyy = d.getFullYear();
    const mm = pad(d.getMonth() + 1);
    const dd = pad(d.getDate());
    const hh = pad(d.getHours());
    const mi = pad(d.getMinutes());
    return `${yyyy}-${mm}-${dd}T${hh}:${mi}`;
  }

  function fromDatetimeLocalValue(value: string) {
    if (!value) return "";
    // interpreta como hora local del navegador y lo pasa a ISO
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) return "";
    return d.toISOString();
  }
}
