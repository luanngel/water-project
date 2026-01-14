// src/pages/concentrators/ConcentratorsTable.tsx
import MaterialTable from "@material-table/core";
import type { Concentrator } from "../../api/concentrators";

type Props = {
  isLoading: boolean;          // ✅ ahora se llama así (como en Page)
  data: Concentrator[];
  activeRowId?: string;
  onRowClick: (row: Concentrator) => void;
  emptyMessage: string;        // ✅ mensaje ya viene resuelto desde Page
};

export default function ConcentratorsTable({
  isLoading,
  data,
  activeRowId,
  onRowClick,
  emptyMessage,
}: Props) {
  return (
    <MaterialTable
      title="Concentrators"
      isLoading={isLoading}
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
      data={data}
      onRowClick={(_, rowData) => onRowClick(rowData as Concentrator)}
      options={{
        actionsColumnIndex: -1,
        search: false,
        paging: true,
        sorting: true,
        rowStyle: (rowData) => ({
          backgroundColor:
            activeRowId === (rowData as Concentrator).id
              ? "#EEF2FF"
              : "#FFFFFF",
        }),
      }}
      localization={{
        body: { emptyDataSourceMessage: emptyMessage },
      }}
    />
  );
}
