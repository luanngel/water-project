import { useEffect, useState } from "react";
import { Plus, Trash2, Pencil, RefreshCcw } from "lucide-react";
import MaterialTable from "@material-table/core";

interface Device {
  id: string;
  "Area Name": string;
  "Account Number": string;
  "User Name": string;
  "User Address": string;
  "Meter S/N": string;
  "Meter Name": string;
  "Meter Status": string;
  "Protocol Type": string;
  "Price No.": string;
  "Price Name": string;
  "DMA Partition": string;
  "Supply Types": string;
  "Device ID": string;
  "Device Name": string;
  "Device Type": string;
  "Usage Analysis Type": string;
  "Installed Time": string;
}

interface ApiResponse {
  records: Device[];
  next?: string;
  prev?: string;
  nestedNext?: string;
  nestedPrev?: string;
}

export default function DeviceManagement() {
  const [devices, setDevices] = useState<Device[]>([]);
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [activeDevice, setActiveDevice] = useState<Device | null>(null);
  const [loading, setLoading] = useState(false);

  const emptyDevice: Omit<Device, "id"> = {
    "Area Name": "",
    "Account Number": "",
    "User Name": "",
    "User Address": "",
    "Meter S/N": "",
    "Meter Name": "",
    "Meter Status": "",
    "Protocol Type": "",
    "Price No.": "",
    "Price Name": "",
    "DMA Partition": "",
    "Supply Types": "",
    "Device ID": "",
    "Device Name": "",
    "Device Type": "",
    "Usage Analysis Type": "",
    "Installed Time": "",
  };

  const [form, setForm] = useState<Omit<Device, "id">>(emptyDevice);

  const loadData = async () => {
    setLoading(true);
    try {
      const response = await fetch(
        "/api/v3/data/ppfu31vhv5gf6i0/mp1izvcpok5rk6s/records"
      );
      const data: ApiResponse = await response.json();
      setDevices(data.records);
      setActiveDevice(null);
    } catch (error) {
      console.error("Error loading devices:", error);
      const mockData: Device[] = [
        {
          id: "1",
          "Area Name": "Operaciones",
          "Account Number": "ACC001",
          "User Name": "Juan Pérez",
          "User Address": "Calle Principal 123",
          "Meter S/N": "DEV001",
          "Meter Name": "Water Meter A1",
          "Meter Status": "Active",
          "Protocol Type": "MQTT",
          "Price No.": "P001",
          "Price Name": "Standard Rate",
          "DMA Partition": "Zone A",
          "Supply Types": "Water",
          "Device ID": "D001",
          "Device Name": "Flow Sensor",
          "Device Type": "Flow Sensor",
          "Usage Analysis Type": "Daily",
          "Installed Time": "2024-01-15 10:30:00",
        },
        {
          id: "2",
          "Area Name": "Calidad",
          "Account Number": "ACC002",
          "User Name": "María García",
          "User Address": "Avenida Central 456",
          "Meter S/N": "DEV002",
          "Meter Name": "Pressure Monitor B2",
          "Meter Status": "Active",
          "Protocol Type": "LoRa",
          "Price No.": "P002",
          "Price Name": "Premium Rate",
          "DMA Partition": "Zone B",
          "Supply Types": "Water",
          "Device ID": "D002",
          "Device Name": "Pressure Sensor",
          "Device Type": "Pressure Sensor",
          "Usage Analysis Type": "Hourly",
          "Installed Time": "2024-02-20 09:15:00",
        },
      ];
      setDevices(mockData);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSave = () => {
    if (editingId) {
      setDevices((prev) =>
        prev.map((device) =>
          device.id === editingId ? { ...device, ...form } : device
        )
      );
    } else {
      const newDevice: Device = {
        id: Date.now().toString(),
        ...form,
      };
      setDevices((prev) => [...prev, newDevice]);
    }

    setShowModal(false);
    setEditingId(null);
    setForm(emptyDevice);
  };

  const handleEdit = () => {
    if (!activeDevice) return;
    setEditingId(activeDevice.id);
    setForm({ ...activeDevice });
    setShowModal(true);
  };

  const handleDelete = () => {
    if (!activeDevice) return;

    if (confirm("¿Deseas eliminar este dispositivo?")) {
      setDevices((prev) =>
        prev.filter((device) => device.id !== activeDevice.id)
      );
      setActiveDevice(null);
    }
  };

  const filteredDevices = devices.filter((device) => {
    const q = search.toLowerCase();
    return (
      device["Area Name"].toLowerCase().includes(q) ||
      device["User Name"].toLowerCase().includes(q) ||
      device["Meter S/N"].toLowerCase().includes(q) ||
      device["Device Name"].toLowerCase().includes(q)
    );
  });

  return (
    <div className="flex gap-6 p-6 w-full bg-gray-100">
      <div className="flex-1 flex flex-col gap-6">
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
            <h1 className="text-2xl font-bold">Device Management</h1>
            <p className="text-sm text-blue-100">Water Meter Devices</p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                setForm(emptyDevice);
                setEditingId(null);
                setShowModal(true);
              }}
              className="flex items-center gap-2 px-4 py-2 bg-white text-[#4c5f9e] rounded-lg"
            >
              <Plus size={16} /> Add
            </button>

            <button
              onClick={handleEdit}
              disabled={!activeDevice}
              className={`flex items-center gap-2 px-4 py-2 border border-white/40 rounded-lg
      ${!activeDevice ? "opacity-70 cursor-not-allowed" : "hover:bg-white/10"}`}
            >
              <Pencil size={16} /> Edit
            </button>

            <button
              onClick={handleDelete}
              disabled={!activeDevice}
              className={`flex items-center gap-2 px-4 py-2 border border-white/40 rounded-lg
      ${!activeDevice ? "opacity-70 cursor-not-allowed" : "hover:bg-white/10"}`}
            >
              <Trash2 size={16} /> Delete
            </button>

            <button
              onClick={loadData}
              className="flex items-center gap-2 px-4 py-2 border border-white/40 rounded-lg hover:bg-white/10"
            >
              <RefreshCcw size={16} /> Refresh
            </button>
          </div>
        </div>

        <input
          className="bg-white rounded-lg shadow px-4 py-2 text-sm"
          placeholder="Search devices..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <MaterialTable
          title="Devices"
          columns={[
            { title: "Area Name", field: "Area Name" },
            { title: "Account Number", field: "Account Number" },
            { title: "User Name", field: "User Name" },
            { title: "User Address", field: "User Address" },
            { title: "Meter S/N", field: "Meter S/N" },
            { title: "Meter Name", field: "Meter Name" },
            {
              title: "Meter Status",
              field: "Meter Status",
              render: (rowData) => (
                <span
                  className={`px-3 py-1 rounded-full text-xs font-semibold border ${
                    rowData["Meter Status"] === "Active"
                      ? "text-blue-600 border-blue-600"
                      : "text-red-600 border-red-600"
                  }`}
                >
                  {rowData["Meter Status"]}
                </span>
              ),
            },
            { title: "Protocol Type", field: "Protocol Type" },
            { title: "Price No.", field: "Price No." },
            { title: "Price Name", field: "Price Name" },
            { title: "DMA Partition", field: "DMA Partition" },
            { title: "Supply Types", field: "Supply Types" },
            { title: "Device ID", field: "Device ID" },
            { title: "Device Name", field: "Device Name" },
            { title: "Device Type", field: "Device Type" },
            { title: "Usage Analysis Type", field: "Usage Analysis Type" },
            {
              title: "Installed Time",
              field: "Installed Time",
              type: "datetime",
            },
          ]}
          data={filteredDevices}
          onRowClick={(_event, rowData) => {
            setActiveDevice(rowData as Device);
          }}
          actions={[
            {
              icon: () => <Pencil size={16} />,
              tooltip: "Edit Device",
              onClick: (_event, rowData) => {
                setActiveDevice(rowData as Device);
                setEditingId((rowData as Device).id);
                setForm({ ...(rowData as Device) });
                setShowModal(true);
              },
            },
            {
              icon: () => <Trash2 size={16} />,
              tooltip: "Delete Device",
              onClick: (_event, rowData) => {
                setActiveDevice(rowData as Device);
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
            maxBodyHeight: "500px",
            tableLayout: "fixed",
            rowStyle: (rowData) => ({
              backgroundColor:
                activeDevice?.id === (rowData as Device).id
                  ? "#EEF2FF"
                  : "#FFFFFF",
            }),
          }}
          isLoading={loading}
        />
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center">
          <div className="bg-white rounded-xl p-6 w-[600px] max-h-[80vh] overflow-y-auto space-y-3">
            <h2 className="text-lg font-semibold">
              {editingId ? "Edit Device" : "Add Device"}
            </h2>

            <div className="grid grid-cols-2 gap-3">
              <input
                className="w-full border px-3 py-2 rounded"
                placeholder="Area Name"
                value={form["Area Name"]}
                onChange={(e) =>
                  setForm({ ...form, "Area Name": e.target.value })
                }
              />

              <input
                className="w-full border px-3 py-2 rounded"
                placeholder="Account Number"
                value={form["Account Number"]}
                onChange={(e) =>
                  setForm({ ...form, "Account Number": e.target.value })
                }
              />

              <input
                className="w-full border px-3 py-2 rounded"
                placeholder="User Name"
                value={form["User Name"]}
                onChange={(e) =>
                  setForm({ ...form, "User Name": e.target.value })
                }
              />

              <input
                className="w-full border px-3 py-2 rounded"
                placeholder="User Address"
                value={form["User Address"]}
                onChange={(e) =>
                  setForm({ ...form, "User Address": e.target.value })
                }
              />

              <input
                className="w-full border px-3 py-2 rounded"
                placeholder="Meter S/N"
                value={form["Meter S/N"]}
                onChange={(e) =>
                  setForm({ ...form, "Meter S/N": e.target.value })
                }
              />

              <input
                className="w-full border px-3 py-2 rounded"
                placeholder="Meter Name"
                value={form["Meter Name"]}
                onChange={(e) =>
                  setForm({ ...form, "Meter Name": e.target.value })
                }
              />

              <select
                className="w-full border px-3 py-2 rounded"
                value={form["Meter Status"]}
                onChange={(e) =>
                  setForm({ ...form, "Meter Status": e.target.value })
                }
              >
                <option value="">Select Status</option>
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
                <option value="Maintenance">Maintenance</option>
              </select>

              <input
                className="w-full border px-3 py-2 rounded"
                placeholder="Protocol Type"
                value={form["Protocol Type"]}
                onChange={(e) =>
                  setForm({ ...form, "Protocol Type": e.target.value })
                }
              />

              <input
                className="w-full border px-3 py-2 rounded"
                placeholder="Price No."
                value={form["Price No."]}
                onChange={(e) =>
                  setForm({ ...form, "Price No.": e.target.value })
                }
              />

              <input
                className="w-full border px-3 py-2 rounded"
                placeholder="Price Name"
                value={form["Price Name"]}
                onChange={(e) =>
                  setForm({ ...form, "Price Name": e.target.value })
                }
              />

              <input
                className="w-full border px-3 py-2 rounded"
                placeholder="DMA Partition"
                value={form["DMA Partition"]}
                onChange={(e) =>
                  setForm({ ...form, "DMA Partition": e.target.value })
                }
              />

              <input
                className="w-full border px-3 py-2 rounded"
                placeholder="Supply Types"
                value={form["Supply Types"]}
                onChange={(e) =>
                  setForm({ ...form, "Supply Types": e.target.value })
                }
              />

              <input
                className="w-full border px-3 py-2 rounded"
                placeholder="Device ID"
                value={form["Device ID"]}
                onChange={(e) =>
                  setForm({ ...form, "Device ID": e.target.value })
                }
              />

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
                placeholder="Device Type"
                value={form["Device Type"]}
                onChange={(e) =>
                  setForm({ ...form, "Device Type": e.target.value })
                }
              />

              <input
                className="w-full border px-3 py-2 rounded"
                placeholder="Usage Analysis Type"
                value={form["Usage Analysis Type"]}
                onChange={(e) =>
                  setForm({ ...form, "Usage Analysis Type": e.target.value })
                }
              />

              <input
                type="datetime-local"
                className="w-full border px-3 py-2 rounded"
                value={form["Installed Time"]}
                onChange={(e) =>
                  setForm({ ...form, "Installed Time": e.target.value })
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

      <style>
        {`
          @keyframes gradientMove {
            0% {background-position: 0% 50%;}
            50% {background-position: 100% 50%;}
            100% {background-position: 0% 50%;}
          }
        `}
      </style>
    </div>
  );
}
