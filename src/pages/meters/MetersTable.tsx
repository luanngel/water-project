import MaterialTable from "@material-table/core";
import type { Meter } from "../../api/meters";

type Props = {
  data: Meter[];
  isLoading: boolean;

  isMockMode: boolean;
  selectedProject: string;

  activeMeter: Meter | null;
  onRowClick: (row: Meter) => void;
};

export default function MetersTable({
  data,
  isLoading,
  isMockMode,
  selectedProject,
  activeMeter,
  onRowClick,
}: Props) {
  const disabled = isMockMode || !selectedProject;

  return (
    <div className={disabled ? "opacity-60 pointer-events-none" : ""}>
      <MaterialTable
        title="Meters"
        isLoading={isLoading}
        columns={[
          { title: "Area Name", field: "areaName", render: (r: any) => r.areaName || "-" },
          { title: "Account Number", field: "accountNumber", render: (r: any) => r.accountNumber || "-" },
          { title: "User Name", field: "userName", render: (r: any) => r.userName || "-" },
          { title: "User Address", field: "userAddress", render: (r: any) => r.userAddress || "-" },
          { title: "Meter S/N", field: "meterSerialNumber", render: (r: any) => r.meterSerialNumber || "-" },
          { title: "Meter Name", field: "meterName", render: (r: any) => r.meterName || "-" },
          { title: "Protocol Type", field: "protocolType", render: (r: any) => r.protocolType || "-" },
          { title: "Device ID", field: "deviceId", render: (r: any) => r.deviceId || "-" },
          { title: "Device Name", field: "deviceName", render: (r: any) => r.deviceName || "-" },
        ]}
        data={disabled ? [] : data}
        onRowClick={(_, rowData) => onRowClick(rowData as Meter)}
        options={{
          actionsColumnIndex: -1,
          search: false,
          paging: true,
          sorting: true,
          rowStyle: (rowData) => ({
            backgroundColor:
              activeMeter?.id === (rowData as Meter).id ? "#EEF2FF" : "#FFFFFF",
          }),
        }}
        localization={{
          body: {
            emptyDataSourceMessage: isMockMode
              ? "Modo demo: selecciona 'General' para ver datos reales."
              : !selectedProject
              ? "Select a project to view meters."
              : isLoading
              ? "Loading meters..."
              : "No meters found. Click 'Add' to create your first meter.",
          },
        }}
      />
    </div>
  );
}
