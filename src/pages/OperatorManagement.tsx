import { useEffect, useState } from "react";
import {
  Plus,
  Trash2,
  Pencil,
  RefreshCcw,
  ChevronRight,
  ChevronDown,
} from "lucide-react";
import MaterialTable from "@material-table/core";


/* ================= TYPES ================= */
interface Operator {
  id: number;
  loginName: string;
  isSuperAdmin: boolean;
  isDisabled: boolean;
  userName: string;
  cellPhone: string;
  createdAt: string;
}

interface Area {
  id: number;
  name: string;
  operators: Operator[];
  children?: Area[];
}

/* ================= COMPONENT ================= */
export default function OperatorManagement() {
  const [areas, setAreas] = useState<Area[]>([]);
  const [selectedArea, setSelectedArea] = useState<Area | null>(null);
  const [expandedIds, setExpandedIds] = useState<number[]>([]);
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [activeOperator, setActiveOperator] = useState<Operator | null>(null);

  const emptyOperator: Omit<Operator, "id"> = {
    loginName: "",
    isSuperAdmin: false,
    isDisabled: false,
    userName: "",
    cellPhone: "",
    createdAt: new Date().toISOString().slice(0, 10),
  };

  const [form, setForm] = useState<Omit<Operator, "id">>(emptyOperator);

  /* ================= DATA ================= */
  const loadData = () => {
    const mock: Area[] = [
      {
        id: 1,
        name: "GRH",
        operators: [
          {
            id: 1,
            loginName: "admin_grh",
            isSuperAdmin: true,
            isDisabled: false,
            userName: "Juan Pérez",
            cellPhone: "664-123-4567",
            createdAt: "2024-01-10",
          },
        ],
        children: [
          {
            id: 2,
            name: "CESPT",
            operators: [
              {
                id: 2,
                loginName: "cespt_admin",
                isSuperAdmin: false,
                isDisabled: false,
                userName: "Carlos Ruiz",
                cellPhone: "664-555-8899",
                createdAt: "2024-02-02",
              },
            ],
          },
        ],
      },
    ];

    setAreas(mock);
    setSelectedArea(mock[0]);
    setExpandedIds([1]);
    setActiveOperator(null);
  };

  useEffect(() => {
    loadData();
  }, []);

  /* ================= TREE ================= */
  const toggleExpand = (id: number) => {
    setExpandedIds(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  const updateArea = (list: Area[]): Area[] =>
    list.map(area => {
      if (area.id === selectedArea?.id) {
        const operators = editingId
          ? area.operators.map(op =>
              op.id === editingId ? { ...op, ...form } : op
            )
          : [...area.operators, { id: Date.now(), ...form }];

        return { ...area, operators };
      }
      if (area.children) {
        return { ...area, children: updateArea(area.children) };
      }
      return area;
    });

  /* ================= CRUD ================= */
  const handleSave = () => {
    setAreas(prev => {
      const updated = updateArea(prev);
  
      // 🔑 volver a apuntar al área actual actualizada
      const refreshedArea = updated.find(
        a => a.id === selectedArea?.id
      ) || null;
  
      setSelectedArea(refreshedArea);
      return updated;
    });
  
    setShowModal(false);
    setEditingId(null);
    setForm(emptyOperator);
  };

  const handleEdit = () => {
    if (!activeOperator) return;
    setEditingId(activeOperator.id);
    setForm({ ...activeOperator });
    setShowModal(true);
  };

  const handleDelete = () => {
    if (!selectedArea || !activeOperator) return;

    const deleteFromTree = (list: Area[]): Area[] =>
      list.map(area => {
        if (area.id === selectedArea.id) {
          return {
            ...area,
            operators: area.operators.filter(
              op => op.id !== activeOperator.id
            ),
          };
        }
        if (area.children) {
          return { ...area, children: deleteFromTree(area.children) };
        }
        return area;
      });

    setAreas(prev => deleteFromTree(prev));
    setActiveOperator(null);
  };

  /* ================= FILTER ================= */
  const filtered =
    selectedArea?.operators.filter(
      op =>
        op.loginName.toLowerCase().includes(search.toLowerCase()) ||
        op.userName.toLowerCase().includes(search.toLowerCase())
    ) || [];

  /* ================= TREE RENDER ================= */
  const renderTree = (area: Area, level = 0) => {
    const expanded = expandedIds.includes(area.id);

    return (
      <div key={area.id}>
        <div
          className={`flex items-center gap-1 px-2 py-1 rounded cursor-pointer text-sm
          ${
            selectedArea?.id === area.id
              ? "bg-blue-50 text-blue-700 font-semibold"
              : "hover:bg-gray-50"
          }`}
          style={{ marginLeft: level * 12 }}
          onClick={() => setSelectedArea(area)}
        >
          {area.children && (
            <button onClick={() => toggleExpand(area.id)}>
              {expanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
            </button>
          )}
          {area.name}
        </div>

        {expanded &&
          area.children?.map(child => renderTree(child, level + 1))}
      </div>
    );
  };

  const filteredOperators: Operator[] =
  selectedArea?.operators.filter(op => {
    const q = search.toLowerCase();
    return (
      op.loginName.toLowerCase().includes(q) ||
      op.userName.toLowerCase().includes(q) ||
      op.cellPhone.toLowerCase().includes(q)
    );
  }) || [];

  /* ================= UI ================= */
  return (
    <div className="flex gap-6 p-6 w-full bg-gray-100">
      {/* SIDEBAR */}
      <div className="w-72 bg-white rounded-xl shadow p-4">
        <h3 className="text-xs font-semibold text-gray-500 mb-3">
          Organizational Structure
        </h3>
        {areas.map(a => renderTree(a))}
      </div>

      {/* MAIN */}
      <div className="flex-1 flex flex-col gap-6">
        {/* HEADER */}
        <div
          className="rounded-xl shadow p-6 text-white flex justify-between items-center"
          style={{
            background:
              "linear-gradient(135deg, #4c5f9e, #2a355d, #566bb8, #3d4e87)",
            backgroundSize: "350% 350%",
            animation: "gradientMove 10s ease infinite",
          }}
        >
          <div>
            <h1 className="text-2xl font-bold">Operator Management</h1>
            <p className="text-sm text-blue-100">{selectedArea?.name}</p>
          </div>

          <div className="flex items-center gap-3">
  {/* ADD */}
  <button
    onClick={() => {
      setForm(emptyOperator);
      setEditingId(null);
      setShowModal(true);
    }}
    className="flex items-center gap-2 px-4 py-2 bg-white text-[#4c5f9e] rounded-lg"
  >
    <Plus size={16} /> Add
  </button>

  {/* EDIT */}
  <button
    onClick={handleEdit}
    disabled={!activeOperator}
    className={`flex items-center gap-2 px-4 py-2 border border-white/40 rounded-lg
      ${
        !activeOperator
          ? "opacity-70 cursor-not-allowed"
          : "hover:bg-white/10"
      }`}
  >
    <Pencil size={16} /> Edit
  </button>

  {/* DELETE */}
  <button
    onClick={handleDelete}
    disabled={!activeOperator}
    className={`flex items-center gap-2 px-4 py-2 border border-white/40 rounded-lg
      ${
        !activeOperator
          ? "opacity-70 cursor-not-allowed"
          : "hover:bg-white/10"
      }`}
  >
    <Trash2 size={16} /> Delete
  </button>

  {/* REFRESH */}
  <button
    onClick={loadData}
    className="flex items-center gap-2 px-4 py-2 border border-white/40 rounded-lg hover:bg-white/10"
  >
    <RefreshCcw size={16} /> Refresh
  </button>
</div>


        </div>

        {/* SEARCH */}
        <input
          className="bg-white rounded-lg shadow px-4 py-2 text-sm"
          placeholder="Search operator..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />

<MaterialTable
  title={selectedArea?.name || "Operators"}
  
  columns={[
    { title: "Login", field: "loginName" },
    {
      title: "Super Admin",
      field: "isSuperAdmin",
      render: rowData => (
        <span
          className={`px-3 py-1 rounded-full text-xs font-semibold border ${
            rowData.isSuperAdmin
              ? "text-blue-600 border-blue-600"
              : "text-red-600 border-red-600"
          }`}
        >
          {rowData.isSuperAdmin ? "Yes" : "No"}
        </span>
      ),
    },
    {
      title: "Status",
      field: "isDisabled",
      render: rowData => (
        <span
          className={`px-3 py-1 rounded-full text-xs font-semibold border ${
            rowData.isDisabled
              ? "text-red-600 border-red-600"
              : "text-blue-600 border-blue-600"
          }`}
        >
          {rowData.isDisabled ? "Off" : "Active"}
        </span>
      ),
    },
    { title: "User", field: "userName" },
    { title: "Phone", field: "cellPhone" },
    { title: "Created", field: "createdAt", type: "date" },
  ]}
  data={filtered}
  onRowClick={(event, rowData) => {
    setActiveOperator(rowData as Operator);
  }}
  actions={[
    {
      icon: () => <Plus size={16} />,
      tooltip: "Add Operator",
      isFreeAction: true,
      onClick: () => {
        setForm(emptyOperator);
        setEditingId(null);
        setShowModal(true);
      },
    },
    {
      icon: () => <Pencil size={16} />,
      tooltip: "Edit Operator",
      onClick: (event, rowData) => {
        setActiveOperator(rowData as Operator);
        setEditingId((rowData as Operator).id);
        setForm({ ...(rowData as Operator) });
        setShowModal(true);
      },
    },
    {
      icon: () => <Trash2 size={16} />,
      tooltip: "Delete Operator",
      onClick: (event, rowData) => {
        setActiveOperator(rowData as Operator);
        handleDelete();
      },
    },
  ]}
  options={{
    actionsColumnIndex: -1,
    search: false,
    paging: true,
    sorting: true,
    headerStyle: {
      textAlign: "center",
      fontWeight: 600,
    },
    cellStyle: {
      textAlign: "center",
    },
    maxBodyHeight: "400px",
    tableLayout: "fixed",
    rowStyle: rowData => ({
      backgroundColor:
        activeOperator?.id === (rowData as Operator).id
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
              {editingId ? "Edit Operator" : "Add Operator"}
            </h2>

            <input
              className="w-full border px-3 py-2 rounded"
              placeholder="Login Name"
              value={form.loginName}
              onChange={e =>
                setForm({ ...form, loginName: e.target.value })
              }
            />

            <button
              onClick={() =>
                setForm({ ...form, isSuperAdmin: !form.isSuperAdmin })
              }
              className={`w-full border rounded px-3 py-2 ${
                form.isSuperAdmin
                  ? "text-blue-600 border-blue-600"
                  : "text-red-600 border-red-600"
              }`}
            >
              Super Admin: {form.isSuperAdmin ? "Yes" : "No"}
            </button>

            <button
              onClick={() =>
                setForm({ ...form, isDisabled: !form.isDisabled })
              }
              className={`w-full border rounded px-3 py-2 ${
                form.isDisabled
                  ? "text-red-600 border-red-600"
                  : "text-blue-600 border-blue-600"
              }`}
            >
              Status: {form.isDisabled ? "Off" : "Active"}
            </button>

            <input
              className="w-full border px-3 py-2 rounded"
              placeholder="User Name"
              value={form.userName}
              onChange={e =>
                setForm({ ...form, userName: e.target.value })
              }
            />

            <input
              className="w-full border px-3 py-2 rounded"
              placeholder="Cell Phone"
              value={form.cellPhone}
              onChange={e =>
                setForm({ ...form, cellPhone: e.target.value })
              }
            />

            <input
              type="date"
              className="w-full border px-3 py-2 rounded"
              value={form.createdAt}
              onChange={e =>
                setForm({ ...form, createdAt: e.target.value })
              }
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
