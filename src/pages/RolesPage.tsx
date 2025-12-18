import { useState, useEffect } from "react";
import { Plus, Trash2, Pencil, RefreshCcw } from "lucide-react";
import MaterialTable from "@material-table/core";

export interface Role {
  id: string;
  name: string;
  description: string;
  status: "ACTIVE" | "INACTIVE";
  createdAt: string;
}

export default function RolesPage() {
  const initialRoles: Role[] = [
    { id: "1", name: "SUPER_ADMIN", description: "Full access", status: "ACTIVE", createdAt: "2025-12-17" },
    { id: "2", name: "USER", description: "Regular user", status: "ACTIVE", createdAt: "2025-12-16" },
  ];

  const [roles, setRoles] = useState<Role[]>(initialRoles);
  const [activeRole, setActiveRole] = useState<Role | null>(null);
  const [search, setSearch] = useState("");

  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const emptyRole: Omit<Role, "id"> = {
    name: "",
    description: "",
    status: "ACTIVE",
    createdAt: new Date().toISOString().slice(0, 10),
  };

  const [form, setForm] = useState<Omit<Role, "id">>(emptyRole);

  const handleSave = () => {
    if (editingId) {
      setRoles(prev => prev.map(r => r.id === editingId ? { id: editingId, ...form } : r));
    } else {
      const newId = Date.now().toString();
      setRoles(prev => [...prev, { id: newId, ...form }]);
    }
    setShowModal(false);
    setEditingId(null);
    setForm(emptyRole);
  };

  const handleDelete = () => {
    if (!activeRole) return;
    setRoles(prev => prev.filter(r => r.id !== activeRole.id));
    setActiveRole(null);
  };

  const filtered = roles.filter(r => r.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="flex gap-6 p-6 w-full bg-gray-100">
      {/* LEFT INFO SIDEBAR */}
      <div className="w-72 bg-white rounded-xl shadow p-4">
        <h3 className="text-xs font-semibold text-gray-500 mb-3">Role Information</h3>
        <p className="text-sm text-gray-700">Aquí se listan los roles disponibles en el sistema.</p>
      </div>

      {/* MAIN */}
      <div className="flex-1 flex flex-col gap-6">
        {/* HEADER */}
        <div className="rounded-xl shadow p-6 text-white flex justify-between items-center"
             style={{ background: "linear-gradient(135deg, #4c5f9e, #2a355d, #566bb8)" }}>
          <div>
            <h1 className="text-2xl font-bold">Role Management</h1>
            <p className="text-sm text-blue-100">Roles registrados</p>
          </div>
          <div className="flex gap-3">
            <button onClick={() => { setForm(emptyRole); setEditingId(null); setShowModal(true); }}
                    className="flex items-center gap-2 px-4 py-2 bg-white text-[#4c5f9e] rounded-lg">
              <Plus size={16} /> Add
            </button>
            <button onClick={() => { if (!activeRole) return; setEditingId(activeRole.id); setForm({...activeRole}); setShowModal(true); }}
                    disabled={!activeRole}
                    className="flex items-center gap-2 px-4 py-2 border border-white/40 rounded-lg disabled:opacity-60">
              <Pencil size={16} /> Edit
            </button>
            <button onClick={handleDelete}
                    disabled={!activeRole}
                    className="flex items-center gap-2 px-4 py-2 border border-white/40 rounded-lg disabled:opacity-60">
              <Trash2 size={16} /> Delete
            </button>
            <button onClick={() => setRoles([...roles])}
                    className="flex items-center gap-2 px-4 py-2 border border-white/40 rounded-lg">
              <RefreshCcw size={16} /> Refresh
            </button>
          </div>
        </div>

        {/* SEARCH */}
        <input className="bg-white rounded-lg shadow px-4 py-2 text-sm"
               placeholder="Search role..."
               value={search}
               onChange={e => setSearch(e.target.value)} />

        {/* TABLE */}
        <MaterialTable
          title="Roles"
          columns={[
            { title: "Name", field: "name" },
            { title: "Description", field: "description" },
            {
              title: "Status",
              field: "status",
              render: (rowData) => (
                <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${rowData.status === "ACTIVE" ? "text-blue-600 border-blue-600" : "text-red-600 border-red-600"}`}>
                  {rowData.status}
                </span>
              )
            },
            { title: "Created", field: "createdAt", type: "date" }
          ]}
          data={filtered}
          onRowClick={(_, rowData) => setActiveRole(rowData as Role)}
          options={{
            actionsColumnIndex: -1,
            search: false,
            paging: true,
            sorting: true,
            rowStyle: (rowData) => ({ backgroundColor: activeRole?.id === (rowData as Role).id ? "#EEF2FF" : "#FFFFFF" })
          }}
        />
      </div>

      {/* MODAL */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center">
          <div className="bg-white rounded-xl p-6 w-96 space-y-3">
            <h2 className="text-lg font-semibold">{editingId ? "Edit Role" : "Add Role"}</h2>
            <input className="w-full border px-3 py-2 rounded" placeholder="Name" value={form.name} onChange={e => setForm({...form, name: e.target.value})} />
            <input className="w-full border px-3 py-2 rounded" placeholder="Description" value={form.description} onChange={e => setForm({...form, description: e.target.value})} />
            <button onClick={() => setForm({...form, status: form.status === "ACTIVE" ? "INACTIVE" : "ACTIVE"})} className="w-full border rounded px-3 py-2">
              Status: {form.status}
            </button>
            <input type="date" className="w-full border px-3 py-2 rounded" value={form.createdAt} onChange={e => setForm({...form, createdAt: e.target.value})} />
            <div className="flex justify-end gap-2 pt-3">
              <button onClick={() => setShowModal(false)}>Cancel</button>
              <button onClick={handleSave} className="bg-[#4c5f9e] text-white px-4 py-2 rounded">Save</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
