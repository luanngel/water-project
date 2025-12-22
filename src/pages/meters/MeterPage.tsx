import { useState, useEffect, useMemo } from "react";
import { Plus, Trash2, Pencil, RefreshCcw } from "lucide-react";
import MaterialTable from "@material-table/core";
import { fetchProjectNames } from "../../api/projects";
import {
  fetchMeters,
  createMeter,
  updateMeter,
  deleteMeter,
  type Meter,
} from "../../api/meters";

/* ================= TYPES ================= */

interface User {
  name: string;
  role: "SUPER_ADMIN" | "USER";
  project?: string; // asignado si no es superadmin
}

interface DeviceData {
  "Device ID": number;
  "Device EUI": string;
  "Join EUI": string;
  "AppKey": string;
  meterId?: string;
}

/* ================= COMPONENT ================= */
export default function MeterManagement() {
  // Simulación de usuario actual
  const currentUser: User = {
    name: "Admin GRH",
    role: "SUPER_ADMIN", // cambiar a USER para probar otro caso
    project: "CESPT",
  };

  const [allProjects, setAllProjects] = useState<string[]>([]);
  const [loadingProjects, setLoadingProjects] = useState(true);

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

  useEffect(() => {
    if (visibleProjects.length > 0 && !selectedProject) {
      setSelectedProject(visibleProjects[0]);
    }
  }, [visibleProjects, selectedProject]);

  const [meters, setMeters] = useState<Meter[]>([]);
  const [loadingMeters, setLoadingMeters] = useState(true);
  const [activeMeter, setActiveMeter] = useState<Meter | null>(null);
  const [search, setSearch] = useState("");

  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const emptyMeter: Omit<Meter, "id"> = {
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    areaName: "",
    accountNumber: null,
    userName: null,
    userAddress: null,
    meterSerialNumber: "",
    meterName: "",
    meterStatus: "Installed",
    protocolType: "",
    priceNo: null,
    priceName: null,
    dmaPartition: null,
    supplyTypes: "",
    deviceId: "",
    deviceName: "",
    deviceType: "",
    usageAnalysisType: "",
    installedTime: new Date().toISOString(),
  };

  const emptyDeviceData: DeviceData = {
    "Device ID": 0,
    "Device EUI": "",
    "Join EUI": "",
    "AppKey": "",
  };

  const [form, setForm] = useState<Omit<Meter, "id">>(emptyMeter);
  const [deviceForm, setDeviceForm] = useState<DeviceData>(emptyDeviceData);
  const [errors, setErrors] = useState<{ [key: string]: boolean }>({});

  const loadMeters = async () => {
    setLoadingMeters(true);
    try {
      const data = await fetchMeters();
      setMeters(data);
    } catch (error) {
      console.error("Error loading meters:", error);
      setMeters([]);
    } finally {
      setLoadingMeters(false);
    }
  };

  useEffect(() => {
    loadMeters();
  }, []);

  const createOrUpdateDevice = async (deviceData: DeviceData): Promise<void> => {
    //await fetch('/api/devices', { method: 'POST', body: JSON.stringify(deviceData) })
    
    return new Promise((resolve) => {
      setTimeout(() => {
        console.log('Device data that would be sent to API:', deviceData);
        resolve();
      }, 500);
    });
  };

  const validateForm = (): boolean => {
    const newErrors: { [key: string]: boolean } = {};

    if (!form.meterName.trim()) newErrors["meterName"] = true;
    if (!form.meterSerialNumber.trim()) newErrors["meterSerialNumber"] = true;
    if (!form.areaName.trim()) newErrors["areaName"] = true;
    if (!form.deviceName.trim()) newErrors["deviceName"] = true;
    if (!form.deviceType.trim()) newErrors["deviceType"] = true;
    if (!form.protocolType.trim()) newErrors["protocolType"] = true;
    if (!form.supplyTypes.trim()) newErrors["supplyTypes"] = true;
    if (!form.usageAnalysisType.trim()) newErrors["usageAnalysisType"] = true;
    if (!form.installedTime) newErrors["installedTime"] = true;

    if (!deviceForm["Device ID"] || deviceForm["Device ID"] === 0) {
      newErrors["Device ID"] = true;
    }
    if (!deviceForm["Device EUI"].trim()) newErrors["Device EUI"] = true;
    if (!deviceForm["Join EUI"].trim()) newErrors["Join EUI"] = true;
    if (!deviceForm["AppKey"].trim()) newErrors["AppKey"] = true;

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm()) {
      return;
    }

    try {
      let savedMeter: Meter;

      if (editingId) {
        const meterToUpdate = meters.find(m => m.id === editingId);
        if (!meterToUpdate) {
          throw new Error("Meter to update not found");
        }

        const updatedMeter = await updateMeter(editingId, form);
        setMeters((prev) =>
          prev.map((m) =>
            m.id === editingId ? updatedMeter : m
          )
        );
        savedMeter = updatedMeter;
      } else {
        const newMeter = await createMeter(form);
        setMeters((prev) => [...prev, newMeter]);
        savedMeter = newMeter;
      }

      try {
        const deviceDataWithRef = {
          ...deviceForm,
          meterId: savedMeter.id,
        };
        await createOrUpdateDevice(deviceDataWithRef);
        console.log('Device data saved successfully');
      } catch (deviceError) {
        console.error('Error saving device data:', deviceError);
        alert('Meter saved, but there was an error saving device data.');
      }

      setShowModal(false);
      setEditingId(null);
      setForm(emptyMeter);
      setDeviceForm(emptyDeviceData);
      setErrors({});
      setActiveMeter(null);
    } catch (error) {
      console.error('Error saving meter:', error);
      alert(
        `Error saving meter: ${
          error instanceof Error ? error.message : "Please try again."
        }`
      );
    }
  };

  const handleDelete = async () => {
    if (!activeMeter) return;

    const confirmDelete = window.confirm(
      `Are you sure you want to delete the meter "${activeMeter.meterName}" (${activeMeter.meterSerialNumber})?`
    );

    if (!confirmDelete) return;

    try {
      await deleteMeter(activeMeter.id);
      setMeters((prev) => prev.filter((m) => m.id !== activeMeter.id));
      setActiveMeter(null);
    } catch (error) {
      console.error("Error deleting meter:", error);
      alert(
        `Error deleting meter: ${
          error instanceof Error ? error.message : "Please try again."
        }`
      );
    }
  };

  const handleRefresh = () => {
    loadMeters();
    setActiveMeter(null);
  };

  /* ================= FILTER ================= */
  const filtered = meters.filter(
    (m) =>
      (m.meterName.toLowerCase().includes(search.toLowerCase()) ||
        m.meterSerialNumber.toLowerCase().includes(search.toLowerCase()) ||
        m.deviceId.toLowerCase().includes(search.toLowerCase()) ||
        m.areaName.toLowerCase().includes(search.toLowerCase()))
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
          style={{
            background:
              "linear-gradient(135deg, #4c5f9e, #2a355d, #566bb8)",
          }}
        >
          <div>
            <h1 className="text-2xl font-bold">Meter Management</h1>
            <p className="text-sm text-blue-100">Medidores registrados</p>
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => {
                setForm(emptyMeter);
                setDeviceForm(emptyDeviceData);
                setErrors({});
                setEditingId(null);
                setShowModal(true);
              }}
              disabled={!selectedProject || visibleProjects.length === 0}
              className="flex items-center gap-2 px-4 py-2 bg-white text-[#4c5f9e] rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Plus size={16} /> Add
            </button>

            <button
              onClick={() => {
                if (!activeMeter) return;
                setEditingId(activeMeter.id);
                setForm({
                  createdAt: activeMeter.createdAt,
                  updatedAt: activeMeter.updatedAt,
                  areaName: activeMeter.areaName,
                  accountNumber: activeMeter.accountNumber,
                  userName: activeMeter.userName,
                  userAddress: activeMeter.userAddress,
                  meterSerialNumber: activeMeter.meterSerialNumber,
                  meterName: activeMeter.meterName,
                  meterStatus: activeMeter.meterStatus,
                  protocolType: activeMeter.protocolType,
                  priceNo: activeMeter.priceNo,
                  priceName: activeMeter.priceName,
                  dmaPartition: activeMeter.dmaPartition,
                  supplyTypes: activeMeter.supplyTypes,
                  deviceId: activeMeter.deviceId,
                  deviceName: activeMeter.deviceName,
                  deviceType: activeMeter.deviceType,
                  usageAnalysisType: activeMeter.usageAnalysisType,
                  installedTime: activeMeter.installedTime,
                });
                setDeviceForm(emptyDeviceData);
                setErrors({});
                setShowModal(true);
              }}
              disabled={!activeMeter}
              className="flex items-center gap-2 px-4 py-2 border border-white/40 rounded-lg disabled:opacity-60"
            >
              <Pencil size={16} /> Edit
            </button>

            <button
              onClick={handleDelete}
              disabled={!activeMeter}
              className="flex items-center gap-2 px-4 py-2 border border-white/40 rounded-lg disabled:opacity-60"
            >
              <Trash2 size={16} /> Delete
            </button>

            <button
              onClick={handleRefresh}
              className="flex items-center gap-2 px-4 py-2 border border-white/40 rounded-lg"
            >
              <RefreshCcw size={16} /> Refresh
            </button>
          </div>
        </div>

        {/* SEARCH */}
        <input
          className="bg-white rounded-lg shadow px-4 py-2 text-sm"
          placeholder="Search by meter name, serial number, device ID, or area..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        {/* TABLE */}
        <MaterialTable
          title="Meters"
          isLoading={loadingMeters}
          columns={[
            { title: "Meter Name", field: "meterName" },
            { title: "Serial Number", field: "meterSerialNumber" },
            { title: "Area", field: "areaName" },
            { title: "Device ID", field: "deviceId" },
            { title: "Device Name", field: "deviceName" },
            {
              title: "Status",
              field: "meterStatus",
              render: (rowData) => (
                <span
                  className={`px-3 py-1 rounded-full text-xs font-semibold border ${
                    rowData.meterStatus === "Installed"
                      ? "text-green-600 border-green-600"
                      : "text-gray-600 border-gray-600"
                  }`}
                >
                  {rowData.meterStatus}
                </span>
              ),
            },
            { title: "Protocol", field: "protocolType" },
            { title: "Device Type", field: "deviceType" },
            { title: "Created At", field: "createdAt", type: "datetime" },
            { title: "Updated At", field: "updatedAt", type: "datetime" },
          ]}
          data={filtered}
          onRowClick={(_, rowData) => setActiveMeter(rowData as Meter)}
          options={{
            actionsColumnIndex: -1,
            search: false,
            paging: true,
            sorting: true,
            rowStyle: (rowData) => ({
              backgroundColor:
                activeMeter?.id === (rowData as Meter).id
                  ? "#EEF2FF"
                  : "#FFFFFF",
            }),
          }}
          localization={{
            body: {
              emptyDataSourceMessage: loadingMeters
                ? "Loading meters..."
                : "No meters found. Click 'Add' to create your first meter.",
            },
          }}
        />
      </div>

      {/* MODAL */}
{showModal && (
  <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
    <div className="bg-white rounded-xl p-6 w-[700px] max-h-[90vh] overflow-y-auto space-y-4">
      <h2 className="text-lg font-semibold">
        {editingId ? "Edit Meter" : "Add Meter"}
      </h2>

      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-gray-700 border-b pb-2">
          Meter Information
        </h3>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <input
              className={`w-full border px-3 py-2 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                errors["meterName"] ? "border-red-500" : ""
              }`}
              placeholder="Meter Name *"
              value={form.meterName}
              onChange={(e) => {
                setForm({ ...form, meterName: e.target.value });
                if (errors["meterName"]) {
                  setErrors({ ...errors, "meterName": false });
                }
              }}
              required
            />
            {errors["meterName"] && (
              <p className="text-red-500 text-xs mt-1">This field is required</p>
            )}
          </div>

          <div>
            <input
              className={`w-full border px-3 py-2 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                errors["meterSerialNumber"] ? "border-red-500" : ""
              }`}
              placeholder="Meter Serial Number *"
              value={form.meterSerialNumber}
              onChange={(e) => {
                setForm({ ...form, meterSerialNumber: e.target.value });
                if (errors["meterSerialNumber"]) {
                  setErrors({ ...errors, "meterSerialNumber": false });
                }
              }}
              required
            />
            {errors["meterSerialNumber"] && (
              <p className="text-red-500 text-xs mt-1">This field is required</p>
            )}
          </div>
        </div>

        <div>
          <input
            className={`w-full border px-3 py-2 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
              errors["areaName"] ? "border-red-500" : ""
            }`}
            placeholder="Area Name *"
            value={form.areaName}
            onChange={(e) => {
              setForm({ ...form, areaName: e.target.value });
              if (errors["areaName"]) {
                setErrors({ ...errors, "areaName": false });
              }
            }}
            required
          />
          {errors["areaName"] && (
            <p className="text-red-500 text-xs mt-1">This field is required</p>
          )}
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <input
              className={`w-full border px-3 py-2 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                errors["deviceName"] ? "border-red-500" : ""
              }`}
              placeholder="Device Name *"
              value={form.deviceName}
              onChange={(e) => {
                setForm({ ...form, deviceName: e.target.value });
                if (errors["deviceName"]) {
                  setErrors({ ...errors, "deviceName": false });
                }
              }}
              required
            />
            {errors["deviceName"] && (
              <p className="text-red-500 text-xs mt-1">This field is required</p>
            )}
          </div>

          <div>
            <input
              className={`w-full border px-3 py-2 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                errors["deviceType"] ? "border-red-500" : ""
              }`}
              placeholder="Device Type *"
              value={form.deviceType}
              onChange={(e) => {
                setForm({ ...form, deviceType: e.target.value });
                if (errors["deviceType"]) {
                  setErrors({ ...errors, "deviceType": false });
                }
              }}
              required
            />
            {errors["deviceType"] && (
              <p className="text-red-500 text-xs mt-1">This field is required</p>
            )}
          </div>
        </div>

        <div>
          <select
            className="w-full border px-3 py-2 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            value={form.meterStatus}
            onChange={(e) => setForm({ ...form, meterStatus: e.target.value })}
          >
            <option value="Installed">Installed</option>
            <option value="Uninstalled">Uninstalled</option>
            <option value="Maintenance">Maintenance</option>
          </select>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <input
              className={`w-full border px-3 py-2 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                errors["protocolType"] ? "border-red-500" : ""
              }`}
              placeholder="Protocol Type *"
              value={form.protocolType}
              onChange={(e) => {
                setForm({ ...form, protocolType: e.target.value });
                if (errors["protocolType"]) {
                  setErrors({ ...errors, "protocolType": false });
                }
              }}
              required
            />
            {errors["protocolType"] && (
              <p className="text-red-500 text-xs mt-1">This field is required</p>
            )}
          </div>

          <div>
            <input
              className={`w-full border px-3 py-2 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                errors["supplyTypes"] ? "border-red-500" : ""
              }`}
              placeholder="Supply Types *"
              value={form.supplyTypes}
              onChange={(e) => {
                setForm({ ...form, supplyTypes: e.target.value });
                if (errors["supplyTypes"]) {
                  setErrors({ ...errors, "supplyTypes": false });
                }
              }}
              required
            />
            {errors["supplyTypes"] && (
              <p className="text-red-500 text-xs mt-1">This field is required</p>
            )}
          </div>
        </div>

        <div>
          <input
            className={`w-full border px-3 py-2 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
              errors["usageAnalysisType"] ? "border-red-500" : ""
            }`}
            placeholder="Usage Analysis Type *"
            value={form.usageAnalysisType}
            onChange={(e) => {
              setForm({ ...form, usageAnalysisType: e.target.value });
              if (errors["usageAnalysisType"]) {
                setErrors({ ...errors, "usageAnalysisType": false });
              }
            }}
            required
          />
          {errors["usageAnalysisType"] && (
            <p className="text-red-500 text-xs mt-1">This field is required</p>
          )}
        </div>

        <div>
          <input
            type="datetime-local"
            className={`w-full border px-3 py-2 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
              errors["installedTime"] ? "border-red-500" : ""
            }`}
            placeholder="Installed Time *"
            value={
              form.installedTime
                ? new Date(form.installedTime).toISOString().slice(0, 16)
                : ""
            }
            onChange={(e) => {
              setForm({ ...form, installedTime: new Date(e.target.value).toISOString() });
              if (errors["installedTime"]) {
                setErrors({ ...errors, "installedTime": false });
              }
            }}
            required
          />
          {errors["installedTime"] && (
            <p className="text-red-500 text-xs mt-1">This field is required</p>
          )}
        </div>

        <div className="pt-2 border-t">
          <p className="text-xs text-gray-500 mb-2">Optional Fields</p>
          
          <div className="grid grid-cols-2 gap-3">
            <input
              className="w-full border px-3 py-2 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Account Number (optional)"
              value={form.accountNumber ?? ""}
              onChange={(e) =>
                setForm({ ...form, accountNumber: e.target.value || null })
              }
            />

            <input
              className="w-full border px-3 py-2 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="User Name (optional)"
              value={form.userName ?? ""}
              onChange={(e) =>
                setForm({ ...form, userName: e.target.value || null })
              }
            />
          </div>

          <input
            className="w-full border px-3 py-2 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent mt-3"
            placeholder="User Address (optional)"
            value={form.userAddress ?? ""}
            onChange={(e) =>
              setForm({ ...form, userAddress: e.target.value || null })
            }
          />

          <div className="grid grid-cols-3 gap-3 mt-3">
            <input
              className="w-full border px-3 py-2 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Price No. (optional)"
              value={form.priceNo ?? ""}
              onChange={(e) => setForm({ ...form, priceNo: e.target.value || null })}
            />

            <input
              className="w-full border px-3 py-2 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Price Name (optional)"
              value={form.priceName ?? ""}
              onChange={(e) =>
                setForm({ ...form, priceName: e.target.value || null })
              }
            />

            <input
              className="w-full border px-3 py-2 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="DMA Partition (optional)"
              value={form.dmaPartition ?? ""}
              onChange={(e) =>
                setForm({ ...form, dmaPartition: e.target.value || null })
              }
            />
          </div>
        </div>
      </div>

      <div className="space-y-3 pt-4">
        <h3 className="text-sm font-semibold text-gray-700 border-b pb-2">
          Device Configuration
        </h3>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <input
              type="number"
              className={`w-full border px-3 py-2 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                errors["Device ID"] ? "border-red-500" : ""
              }`}
              placeholder="Device ID *"
              value={deviceForm["Device ID"] || ""}
              onChange={(e) => {
                setDeviceForm({
                  ...deviceForm,
                  "Device ID": parseInt(e.target.value) || 0,
                });
                if (errors["Device ID"]) {
                  setErrors({ ...errors, "Device ID": false });
                }
              }}
              required
              min="1"
            />
            {errors["Device ID"] && (
              <p className="text-red-500 text-xs mt-1">This field is required</p>
            )}
          </div>

          <div>
            <input
              className={`w-full border px-3 py-2 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                errors["Device EUI"] ? "border-red-500" : ""
              }`}
              placeholder="Device EUI *"
              value={deviceForm["Device EUI"]}
              onChange={(e) => {
                setDeviceForm({ ...deviceForm, "Device EUI": e.target.value });
                if (errors["Device EUI"]) {
                  setErrors({ ...errors, "Device EUI": false });
                }
              }}
              required
            />
            {errors["Device EUI"] && (
              <p className="text-red-500 text-xs mt-1">This field is required</p>
            )}
          </div>
        </div>

        <div>
          <input
            className={`w-full border px-3 py-2 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
              errors["Join EUI"] ? "border-red-500" : ""
            }`}
            placeholder="Join EUI *"
            value={deviceForm["Join EUI"]}
            onChange={(e) => {
              setDeviceForm({ ...deviceForm, "Join EUI": e.target.value });
              if (errors["Join EUI"]) {
                setErrors({ ...errors, "Join EUI": false });
              }
            }}
            required
          />
          {errors["Join EUI"] && (
            <p className="text-red-500 text-xs mt-1">This field is required</p>
          )}
        </div>

        <div>
          <input
            className={`w-full border px-3 py-2 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
              errors["AppKey"] ? "border-red-500" : ""
            }`}
            placeholder="AppKey *"
            value={deviceForm["AppKey"]}
            onChange={(e) => {
              setDeviceForm({ ...deviceForm, "AppKey": e.target.value });
              if (errors["AppKey"]) {
                setErrors({ ...errors, "AppKey": false });
              }
            }}
            required
          />
          {errors["AppKey"] && (
            <p className="text-red-500 text-xs mt-1">This field is required</p>
          )}
        </div>
      </div>

      <div className="flex justify-end gap-2 pt-3 border-t">
        <button
          onClick={() => {
            setShowModal(false);
            setDeviceForm(emptyDeviceData);
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
