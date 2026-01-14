import type React from "react";
import type { Meter } from "../../api/meters";
import type { DeviceData } from "./MeterPage";

type Props = {
  editingId: string | null;

  form: Omit<Meter, "id">;
  setForm: React.Dispatch<React.SetStateAction<Omit<Meter, "id">>>;

  deviceForm: DeviceData;
  setDeviceForm: React.Dispatch<React.SetStateAction<DeviceData>>;

  errors: Record<string, boolean>;
  setErrors: React.Dispatch<React.SetStateAction<Record<string, boolean>>>;

  onClose: () => void;
  onSave: () => void | Promise<void>;
};

export default function MetersModal({
  editingId,
  form,
  setForm,
  deviceForm,
  setDeviceForm,
  errors,
  setErrors,
  onClose,
  onSave,
}: Props) {
  const title = editingId ? "Edit Meter" : "Add Meter";

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-6 w-[700px] max-h-[90vh] overflow-y-auto space-y-4">
        <h2 className="text-lg font-semibold">{title}</h2>

        {/* FORM */}
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-gray-700 border-b pb-2">
            Meter Information
          </h3>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <input
                className={`w-full border px-3 py-2 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors["areaName"] ? "border-red-500" : ""
                }`}
                placeholder="Area Name *"
                value={form.areaName}
                onChange={(e) => {
                  setForm({ ...form, areaName: e.target.value });
                  if (errors["areaName"]) setErrors({ ...errors, areaName: false });
                }}
                required
              />
              {errors["areaName"] && <p className="text-red-500 text-xs mt-1">This field is required</p>}
            </div>

            <div>
              <input
                className="w-full border px-3 py-2 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Account Number (optional)"
                value={form.accountNumber ?? ""}
                onChange={(e) =>
                  setForm({ ...form, accountNumber: e.target.value || null })
                }
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <input
                className="w-full border px-3 py-2 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="User Name (optional)"
                value={form.userName ?? ""}
                onChange={(e) =>
                  setForm({ ...form, userName: e.target.value || null })
                }
              />
            </div>

            <div>
              <input
                className="w-full border px-3 py-2 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="User Address (optional)"
                value={form.userAddress ?? ""}
                onChange={(e) =>
                  setForm({ ...form, userAddress: e.target.value || null })
                }
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <input
                className={`w-full border px-3 py-2 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors["meterSerialNumber"] ? "border-red-500" : ""
                }`}
                placeholder="Meter S/N *"
                value={form.meterSerialNumber}
                onChange={(e) => {
                  setForm({ ...form, meterSerialNumber: e.target.value });
                  if (errors["meterSerialNumber"])
                    setErrors({ ...errors, meterSerialNumber: false });
                }}
                required
              />
              {errors["meterSerialNumber"] && (
                <p className="text-red-500 text-xs mt-1">This field is required</p>
              )}
            </div>

            <div>
              <input
                className={`w-full border px-3 py-2 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors["meterName"] ? "border-red-500" : ""
                }`}
                placeholder="Meter Name *"
                value={form.meterName}
                onChange={(e) => {
                  setForm({ ...form, meterName: e.target.value });
                  if (errors["meterName"]) setErrors({ ...errors, meterName: false });
                }}
                required
              />
              {errors["meterName"] && <p className="text-red-500 text-xs mt-1">This field is required</p>}
            </div>
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
                  if (errors["protocolType"]) setErrors({ ...errors, protocolType: false });
                }}
                required
              />
              {errors["protocolType"] && <p className="text-red-500 text-xs mt-1">This field is required</p>}
            </div>

            <div>
              <input
                className="w-full border px-3 py-2 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Device ID (optional)"
                value={form.deviceId ?? ""}
                onChange={(e) => setForm({ ...form, deviceId: e.target.value || "" })}
              />
            </div>
          </div>

          <div>
            <input
              className={`w-full border px-3 py-2 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                errors["deviceName"] ? "border-red-500" : ""
              }`}
              placeholder="Device Name *"
              value={form.deviceName}
              onChange={(e) => {
                setForm({ ...form, deviceName: e.target.value });
                if (errors["deviceName"]) setErrors({ ...errors, deviceName: false });
              }}
              required
            />
            {errors["deviceName"] && <p className="text-red-500 text-xs mt-1">This field is required</p>}
          </div>
        </div>

        {/* DEVICE CONFIG */}
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
                  setDeviceForm({ ...deviceForm, "Device ID": parseInt(e.target.value) || 0 });
                  if (errors["Device ID"]) setErrors({ ...errors, "Device ID": false });
                }}
                required
                min={1}
              />
              {errors["Device ID"] && <p className="text-red-500 text-xs mt-1">This field is required</p>}
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
                  if (errors["Device EUI"]) setErrors({ ...errors, "Device EUI": false });
                }}
                required
              />
              {errors["Device EUI"] && <p className="text-red-500 text-xs mt-1">This field is required</p>}
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
                if (errors["Join EUI"]) setErrors({ ...errors, "Join EUI": false });
              }}
              required
            />
            {errors["Join EUI"] && <p className="text-red-500 text-xs mt-1">This field is required</p>}
          </div>

          <div>
            <input
              className={`w-full border px-3 py-2 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                errors["AppKey"] ? "border-red-500" : ""
              }`}
              placeholder="AppKey *"
              value={deviceForm["AppKey"]}
              onChange={(e) => {
                setDeviceForm({ ...deviceForm, AppKey: e.target.value });
                if (errors["AppKey"]) setErrors({ ...errors, AppKey: false });
              }}
              required
            />
            {errors["AppKey"] && <p className="text-red-500 text-xs mt-1">This field is required</p>}
          </div>
        </div>

        {/* ACTIONS */}
        <div className="flex justify-end gap-2 pt-3 border-t">
          <button onClick={onClose} className="px-4 py-2 rounded hover:bg-gray-100">
            Cancel
          </button>
          <button
            onClick={onSave}
            className="bg-[#4c5f9e] text-white px-4 py-2 rounded hover:bg-[#3d4d7e]"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
}
