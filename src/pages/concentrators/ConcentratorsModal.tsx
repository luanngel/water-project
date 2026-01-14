// src/pages/concentrators/ConcentratorsModal.tsx
import type React from "react";
import type { Concentrator } from "../../api/concentrators";
import type { GatewayData } from "./ConcentratorsPage";

type Props = {
  editingSerial: string | null;

  form: Omit<Concentrator, "id">;
  setForm: React.Dispatch<React.SetStateAction<Omit<Concentrator, "id">>>;

  gatewayForm: GatewayData;
  setGatewayForm: React.Dispatch<React.SetStateAction<GatewayData>>;

  errors: Record<string, boolean>;
  setErrors: React.Dispatch<React.SetStateAction<Record<string, boolean>>>;

  toDatetimeLocalValue: (value?: string) => string;
  fromDatetimeLocalValue: (value: string) => string;

  onClose: () => void;
  onSave: () => void | Promise<void>;
};

export default function ConcentratorsModal({
  editingSerial,
  form,
  setForm,
  gatewayForm,
  setGatewayForm,
  errors,
  setErrors,
  toDatetimeLocalValue,
  fromDatetimeLocalValue,
  onClose,
  onSave,
}: Props) {
  const title = editingSerial ? "Edit Concentrator" : "Add Concentrator";

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-6 w-[700px] max-h-[90vh] overflow-y-auto space-y-4">
        <h2 className="text-lg font-semibold">{title}</h2>

        {/* FORM */}
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
                    "Communication Time": fromDatetimeLocalValue(e.target.value),
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

        {/* GATEWAY */}
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
                    "Antenna Placement": e.target.value as "Indoor" | "Outdoor",
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

        {/* ACTIONS */}
        <div className="flex justify-end gap-2 pt-3 border-t">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded hover:bg-gray-100"
          >
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
