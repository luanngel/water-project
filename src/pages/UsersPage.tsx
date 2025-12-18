import { useState, useEffect } from "react";
import { Plus, Trash2, Pencil, RefreshCcw } from "lucide-react";
import MaterialTable from "@material-table/core";
import { Role } from "./RolesPage"; // Importa los tipos de roles

interface User {
  id: string;
  name: string;
  email: string;
  roleId: string;
  roleName: string;
  status: "ACTIVE" | "INACTIVE";
  createdAt: string;
}

export default function UsersPage() {
  const initialRoles: Role[] = [
    { id: "1", name: "SUPER_ADMIN", description: "Full access", status: "ACTIVE", createdAt: "2025-12-17" },
    { id: "2", name: "USER", description: "Regular user", status: "ACTIVE", createdAt: "2025-12-16" },
  ];

  const initialUsers: User[] = [
    { id: "1", name: "Admin GRH", email: "grh@domain.com", roleId: "1", roleName: "SUPER_ADMIN", status: "ACTIVE", createdAt: "2025-12-17" },
    { id: "2", name: "User CESPT", email: "cespt@domain.com", roleId: "2", roleName: "USER", status: "ACTIVE", createdAt: "2025-12-16" },
  ];

  const [users, setUsers] = useState<User[]>(initialUsers);
  const [activeUser, setActiveUser] = useState<User | null>(null);
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [roles, setRoles] = useState<Role[]>(initialRoles);

  const emptyUser: Omit<User, "id" | "roleName"> = { name: "", email: "", roleId: "", status: "ACTIVE", createdAt: new Date().toISOString().slice(0,10) };
  const [form, setForm] = useState<Omit<User, "id" | "roleName">>(emptyUser);

  const handleSave = () => {
    const roleName = roles.find(r => r.id === form.roleId)?.name || "";
    if (editingId) {
      setUsers(prev => prev.map(u => u.id === editingId ? { id: editingId, roleName, ...form } : u));
    } else {
      const newId = Date.now().toString();
      setUsers(prev => [...prev, { id: newId, roleName, ...form }]);
    }
    setShowModal(false);
    setEditingId(null);
    setForm(emptyUser);
  };

  const handleDelete = () => {
    if (!activeUser) return;
    setUsers(prev => prev.filter(u => u.id !== activeUser.id));
    setActiveUser(null);
  };

  const filtered = users.filter(u => u.name.toLowerCase().includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="flex gap-6 p-6 w-full bg-gray-100">
      {/* LEFT INFO SIDEBAR */}
      <div className="w-72 bg-white rounded-xl shadow p-4">
        <h3 className="text-xs font-semibold text-gray-500 mb-3">Project Information</h3>
        <p className="text-sm text-gray-700">Usuarios disponibles y sus roles.</p>
        <select value={form.roleId} onChange={e => setForm({...form, roleId: e.target.value})} className="w-full border px-3 py-2 rounded mt-2">
          <option value="">Select Role</option>
          {roles.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
        </select>
      </div>

      {/* MAIN */}
      <div className="flex-1 flex flex-col gap-6">
        {/* HEADER */}
        <div className="rounded-xl shadow p-6 text-white flex justify-between items-center"
             style={{ background: "linear-gradient(135deg, #4c5f9e, #2a355d, #566bb8)" }}>
          <div>
            <h1 className="text-2xl font-bold">User Management</h1>
            <p className="text-sm text-blue-100">Usuarios registrados</p>
          </div>
          <div className="flex gap-3">
            <button onClick={() => { setForm(emptyUser); setEditingId(null); setShowModal(true); }} className="flex items-center gap-2 px-4 py-2 bg-white text-[#4c5f9e] rounded-lg"><Plus size={16} /> Add</button>
            <button onClick={() => { if(!activeUser) return; setEditingId(activeUser.id); setForm({...activeUser}); setShowModal(true); }} disabled={!activeUser} className="flex items-center gap-2 px-4 py-2 border border-white/40 rounded-lg disabled:opacity-60"><Pencil size={16}/> Edit</button>
            <button onClick={handleDelete} disabled={!activeUser} className="flex items-center gap-2 px-4 py-2 border border-white/40 rounded-lg disabled:opacity-60"><Trash2 size={16}/> Delete</button>
            <button onClick={() => setUsers([...users])} className="flex items-center gap-2 px-4 py-2 border border-white/40 rounded-lg"><RefreshCcw size={16}/> Refresh</button>
          </div>
        </div>

        {/* SEARCH */}
        <input className="bg-white rounded-lg shadow px-4 py-2 text-sm" placeholder="Search user..." value={search} onChange={e => setSearch(e.target.value)} />

        {/* TABLE */}
        <MaterialTable
          title="Users"
          columns={[
            { title: "Name", field: "name" },
            { title: "Email", field: "email" },
            { title: "Role", field: "roleName" },
            { title: "Status", field: "status", render: rowData => <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${rowData.status === "ACTIVE" ? "text-blue-600 border-blue-600" : "text-red-600 border-red-600"}`}>{rowData.status}</span> },
            { title: "Created", field: "createdAt", type: "date" }
          ]}
          data={filtered}
          onRowClick={(_, rowData) => setActiveUser(rowData as User)}
          options={{ actionsColumnIndex: -1, search: false, paging: true, sorting: true, rowStyle: rowData => ({ backgroundColor: activeUser?.id === (rowData as User).id ? "#EEF2FF" : "#FFFFFF" }) }}
        />
      </div>

      {/* MODAL */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center">
          <div className="bg-white rounded-xl p-6 w-96 space-y-3">
            <h2 className="text-lg font-semibold">{editingId ? "Edit User" : "Add User"}</h2>
            <input className="w-full border px-3 py-2 rounded" placeholder="Name" value={form.name} onChange={e => setForm({...form, name: e.target.value})} />
            <input className="w-full border px-3 py-2 rounded" placeholder="Email" value={form.email} onChange={e => setForm({...form, email: e.target.value})} />
            <select value={form.roleId} onChange={e => setForm({...form, roleId: e.target.value})} className="w-full border px-3 py-2 rounded mt-2">
              <option value="">Select Role</option>
              {roles.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
            </select>
            <button onClick={() => setForm({...form, status: form.status === "ACTIVE" ? "INACTIVE" : "ACTIVE"})} className="w-full border rounded px-3 py-2">Status: {form.status}</button>
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
