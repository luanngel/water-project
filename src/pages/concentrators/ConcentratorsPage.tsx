// src/pages/concentrators/ConcentratorsPage.tsx
import { useMemo, useState } from "react";
import { Plus, Trash2, Pencil, RefreshCcw } from "lucide-react";

import ConfirmModal from "../../components/layout/common/ConfirmModal";

import { createConcentrator, deleteConcentrator, updateConcentrator, type Concentrator } from "../../api/concentrators";

// ✅ hook es named export y pide currentUser
import { useConcentrators } from "./useConcentrators";

// ✅ UI pieces
import ConcentratorsSidebar from "./ConcentratorsSidebar";
import ConcentratorsTable from "./ConcentratorsTable";
import ConcentratorsModal from "./ConcentratorsModal";


export type SampleView = "GENERAL" | "LORA" | "LORAWAN" | "GRANDES";
export type ProjectStatus = "ACTIVO" | "INACTIVO";
export type ProjectCard = {
  name: string;
  region: string;
  projects: number;
  concentrators: number;
  activeAlerts: number;
  lastSync: string;
  contact: string;
  status: ProjectStatus;
};

type User = {
  role: "SUPER_ADMIN" | "USER";
  project?: string;
};

export type GatewayData = {
  "Gateway ID": number;
  "Gateway EUI": string;
  "Gateway Name": string;
  "Gateway Description": string;
  "Antenna Placement": "Indoor" | "Outdoor";
  concentratorId?: string;
};

export default function ConcentratorsPage() {
  // ✅ Simulación de usuario actual 
  const currentUser: User = {
    role: "SUPER_ADMIN",
    project: "CESPT",
  };

  // ✅ Hook (solo cubre: projects + fetch + sampleView + selectedProject + loading + projectsData)
  const c = useConcentrators(currentUser);


  const [typesMenuOpen, setTypesMenuOpen] = useState(false);

  const [search, setSearch] = useState("");
  const [activeConcentrator, setActiveConcentrator] = useState<Concentrator | null>(null);

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const [showModal, setShowModal] = useState(false);
  const [editingSerial, setEditingSerial] = useState<string | null>(null);

  const getEmptyConcentrator = (): Omit<Concentrator, "id"> => ({
    "Area Name": c.selectedProject,
    "Device S/N": "",
    "Device Name": "",
    "Device Time": new Date().toISOString(),
    "Device Status": "ACTIVE",
    Operator: "",
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

  // ✅ Tabla filtrada por search (usa lo que YA filtró el hook por proyecto)
  const searchFiltered = useMemo(() => {
    if (!c.isGeneral) return [];
    return c.filteredConcentrators.filter((row) => {
      const q = search.trim().toLowerCase();
      if (!q) return true;
      const name = (row["Device Name"] ?? "").toLowerCase();
      const sn = (row["Device S/N"] ?? "").toLowerCase();
      return name.includes(q) || sn.includes(q);
    });
  }, [c.filteredConcentrators, c.isGeneral, search]);

  // =========================
  // CRUD (solo GENERAL)
  // =========================
  const validateForm = () => {
    const next: { [key: string]: boolean } = {};

    if (!form["Device Name"].trim()) next["Device Name"] = true;
    if (!form["Device S/N"].trim()) next["Device S/N"] = true;
    if (!form["Operator"].trim()) next["Operator"] = true;
    if (!form["Instruction Manual"].trim()) next["Instruction Manual"] = true;
    if (!form["Installed Time"]) next["Installed Time"] = true;
    if (!form["Device Time"]) next["Device Time"] = true;
    if (!form["Communication Time"]) next["Communication Time"] = true;

    if (!gatewayForm["Gateway ID"] || gatewayForm["Gateway ID"] === 0) next["Gateway ID"] = true;
    if (!gatewayForm["Gateway EUI"].trim()) next["Gateway EUI"] = true;
    if (!gatewayForm["Gateway Name"].trim()) next["Gateway Name"] = true;
    if (!gatewayForm["Gateway Description"].trim()) next["Gateway Description"] = true;

    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSave = async () => {
    if (!c.isGeneral) return;
    if (!validateForm()) return;

    try {
      if (editingSerial) {
        const toUpdate = c.concentrators.find((x) => x["Device S/N"] === editingSerial);
        if (!toUpdate) throw new Error("Concentrator not found");

        const updated = await updateConcentrator(toUpdate.id, form);

        // actualiza en memoria (el hook expone setConcentrators)
        c.setConcentrators((prev) => prev.map((x) => (x.id === toUpdate.id ? updated : x)));
      } else {
        const created = await createConcentrator(form);
        c.setConcentrators((prev) => [...prev, created]);
      }

      setShowModal(false);
      setEditingSerial(null);
      setForm({ ...getEmptyConcentrator(), "Area Name": c.selectedProject });
      setGatewayForm(getEmptyGatewayData());
      setErrors({});
      setActiveConcentrator(null);
    } catch (err) {
      console.error(err);
      alert(`Error saving concentrator: ${err instanceof Error ? err.message : "Please try again."}`);
    }
  };

  const handleDelete = async () => {
    if (!c.isGeneral) return;
    if (!activeConcentrator) return;

    try {
      await deleteConcentrator(activeConcentrator.id);
      c.setConcentrators((prev) => prev.filter((x) => x.id !== activeConcentrator.id));
      setActiveConcentrator(null);
    } catch (err) {
      console.error(err);
      alert(`Error deleting concentrator: ${err instanceof Error ? err.message : "Please try again."}`);
    }
  };

  // =========================
  // Date helpers para modal
  // =========================
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
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) return "";
    return d.toISOString();
  }

  return (
    <div className="flex gap-6 p-6 w-full bg-gray-100">
      <aside className="w-[420px] shrink-0">
        <ConcentratorsSidebar
          loadingProjects={c.loadingProjects}
          sampleView={c.sampleView}
          sampleViewLabel={c.sampleViewLabel}
          typesMenuOpen={typesMenuOpen}
          setTypesMenuOpen={setTypesMenuOpen}
          onChangeSampleView={(next: SampleView) => {
            c.setSampleView(next);
            setTypesMenuOpen(false);

            // resets UI
            c.setSelectedProject("");
            setActiveConcentrator(null);
            setSearch("");
          }}
          selectedProject={c.selectedProject}
          onSelectProject={(name) => {
            c.setSelectedProject(name);
            setActiveConcentrator(null);
            setSearch("");
          }}
          projects={c.projectsData}
          onRefresh={c.loadConcentrators}
          refreshDisabled={c.loadingProjects || !c.isGeneral}
        />
      </aside>

      <main className="flex-1 flex flex-col gap-6 min-w-0">
        <div
          className="rounded-xl shadow p-6 text-white flex justify-between items-center"
          style={{ background: "linear-gradient(135deg, #4c5f9e, #2a355d, #566bb8)" }}
        >
          <div>
            <h1 className="text-2xl font-bold">Concentrator Management</h1>
            <p className="text-sm text-blue-100">
              {!c.isGeneral
                ? `Vista: ${c.sampleViewLabel} (mock)`
                : c.selectedProject
                ? `Proyecto: ${c.selectedProject}`
                : "Selecciona un proyecto desde el panel izquierdo"}
            </p>
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => {
                if (!c.isGeneral) return;
                if (!c.selectedProject) return;

                setForm({ ...getEmptyConcentrator(), "Area Name": c.selectedProject });
                setGatewayForm(getEmptyGatewayData());
                setErrors({});
                setEditingSerial(null);
                setShowModal(true);
              }}
              disabled={!c.isGeneral || !c.selectedProject}
              className="flex items-center gap-2 px-4 py-2 bg-white text-[#4c5f9e] rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Plus size={16} /> Agregar
            </button>

            <button
              onClick={() => {
                if (!c.isGeneral) return;
                if (!activeConcentrator) return;

                const a = activeConcentrator;
                setEditingSerial(a["Device S/N"]);

                setForm({
                  "Area Name": a["Area Name"],
                  "Device S/N": a["Device S/N"],
                  "Device Name": a["Device Name"],
                  "Device Time": a["Device Time"],
                  "Device Status": a["Device Status"],
                  Operator: a["Operator"],
                  "Installed Time": a["Installed Time"],
                  "Communication Time": a["Communication Time"],
                  "Instruction Manual": a["Instruction Manual"],
                });

                setGatewayForm(getEmptyGatewayData());
                setErrors({});
                setShowModal(true);
              }}
              disabled={!c.isGeneral || !activeConcentrator}
              className="flex items-center gap-2 px-4 py-2 border border-white/40 rounded-lg disabled:opacity-60"
            >
              <Pencil size={16} /> Editar
            </button>

            <button
              onClick={() => setConfirmOpen(true)}
              disabled={!c.isGeneral || !activeConcentrator}
              className="flex items-center gap-2 px-4 py-2 border border-white/40 rounded-lg disabled:opacity-60"
            >
              <Trash2 size={16} /> Eliminar
            </button>

            <button
              onClick={c.loadConcentrators}
              disabled={!c.isGeneral}
              className="flex items-center gap-2 px-4 py-2 border border-white/40 rounded-lg disabled:opacity-60"
            >
              <RefreshCcw size={16} /> Actualizar
            </button>
          </div>
        </div>

        <input
          className="bg-white rounded-lg shadow px-4 py-2 text-sm"
          placeholder={c.isGeneral ? "Search concentrator..." : "Search disabled in mock views"}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          disabled={!c.isGeneral || !c.selectedProject}
        />

        <div className={!c.isGeneral || !c.selectedProject ? "opacity-60 pointer-events-none" : ""}>
          <ConcentratorsTable
            isLoading={c.isGeneral ? c.loadingConcentrators : false}
            data={c.isGeneral ? searchFiltered : []}
            activeRowId={activeConcentrator?.id}
            onRowClick={(row) => setActiveConcentrator(row)}
            emptyMessage={
              !c.isGeneral
                ? `Vista "${c.sampleViewLabel}" está en modo mock (sin backend todavía).`
                : !c.selectedProject
                ? "Select a project to view concentrators."
                : c.loadingConcentrators
                ? "Loading concentrators..."
                : "No concentrators found. Click 'Add' to create your first concentrator."
            }
          />
        </div>

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
            if (!c.isGeneral) return;
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

      {showModal && c.isGeneral && (
        <ConcentratorsModal
          editingSerial={editingSerial}
          form={form}
          setForm={setForm}
          gatewayForm={gatewayForm}
          setGatewayForm={setGatewayForm}
          errors={errors}
          setErrors={setErrors}
          toDatetimeLocalValue={toDatetimeLocalValue}
          fromDatetimeLocalValue={fromDatetimeLocalValue}
          onClose={() => {
            setShowModal(false);
            setGatewayForm(getEmptyGatewayData());
            setErrors({});
          }}
          onSave={handleSave}
        />
      )}
    </div>
  );
}
