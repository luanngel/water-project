import { useState } from "react";
import { DataGrid, GridColDef } from "@mui/x-data-grid";
import { Refresh } from "@mui/icons-material";
import { Button, CircularProgress } from "@mui/material";

interface DataQueryItem {
  id: number;
  sort: number;
  areaName: string;
  meterSn: string;
  communicationTime: string;
  positiveTotalFlow: number;
  batteryStatus: string;
}

interface DataQueryProps {
  subPage: string;
}

export default function DataQuery({ subPage: _subPage }: DataQueryProps) {
  const [rows, setRows] = useState<DataQueryItem[]>([
    {
      id: 1,
      sort: 1,
      areaName: "Operaciones",
      meterSn: "MTR001",
      communicationTime: "2024-12-16 14:25:00",
      positiveTotalFlow: 88.97,
      batteryStatus: "Good"
    },
    {
      id: 2,
      sort: 2,
      areaName: "Calidad",
      meterSn: "MTR002",
      communicationTime: "2024-12-16 13:45:00",
      positiveTotalFlow: 122.82,
      batteryStatus: "Low"
    },
    {
      id: 3,
      sort: 3,
      areaName: "Mantenimiento",
      meterSn: "MTR003",
      communicationTime: "2024-12-16 12:30:00",
      positiveTotalFlow: 67.45,
      batteryStatus: "Good"
    },
    {
      id: 4,
      sort: 4,
      areaName: "Operaciones",
      meterSn: "MTR004",
      communicationTime: "2024-12-16 11:15:00",
      positiveTotalFlow: 234.67,
      batteryStatus: "Critical"
    },
    {
      id: 5,
      sort: 5,
      areaName: "Calidad",
      meterSn: "MTR005",
      communicationTime: "2024-12-16 10:00:00",
      positiveTotalFlow: 156.23,
      batteryStatus: "Good"
    },
    {
      id: 6,
      sort: 6,
      areaName: "Mantenimiento",
      meterSn: "MTR006",
      communicationTime: "2024-12-16 09:30:00",
      positiveTotalFlow: 78.91,
      batteryStatus: "Low"
    },
    {
      id: 7,
      sort: 7,
      areaName: "Operaciones",
      meterSn: "MTR007",
      communicationTime: "2024-12-16 08:45:00",
      positiveTotalFlow: 189.34,
      batteryStatus: "Good"
    },
    {
      id: 8,
      sort: 8,
      areaName: "Calidad",
      meterSn: "MTR008",
      communicationTime: "2024-12-16 07:20:00",
      positiveTotalFlow: 145.78,
      batteryStatus: "Critical"
    },
  ]);

  const [loading, setLoading] = useState(false);

  const columns: GridColDef[] = [
    { field: "sort", headerName: "Sort", width: 80, type: "number" },
    { field: "areaName", headerName: "Area Name", width: 150 },
    { field: "meterSn", headerName: "Meter S/N", width: 130 },
    { field: "communicationTime", headerName: "Communication Time", width: 180 },
    { field: "positiveTotalFlow", headerName: "Positive Total Flow", width: 160, type: "number" },
    { field: "batteryStatus", headerName: "Battery Status", width: 130 },
  ];

  const handleRefresh = () => {
    setLoading(true);
    setTimeout(() => {
      setRows([...rows]);
      setLoading(false);
    }, 1000);
  };

  return (
    <div className="flex flex-col gap-6 p-6 h-full w-full">

      <div
        className="flex justify-between items-center p-5 rounded-xl w-full"
        style={{
          background: "linear-gradient(135deg, #4c5f9e, #2a355d, #566bb8, #3d4e87)",
          backgroundSize: "350% 350%",
          animation: "gradientMove 10s ease infinite",
          color: "white",
          backdropFilter: "blur(10px)",
          border: "1px solid rgba(255,255,255,0.25)",
          boxShadow: "0px 8px 22px rgba(0,0,0,0.25)",
        }}
      >
        <h1 className="text-xl font-bold">Data Query</h1>
        <div className="flex gap-3">
          <Button
            variant="outlined"
            startIcon={loading ? <CircularProgress size={18} color="inherit" /> : <Refresh />}
            sx={{
              color: "white",
              borderColor: "rgba(255,255,255,0.4)",
              "&:hover": { borderColor: "white", background: "rgba(255,255,255,0.15)" },
            }}
            onClick={handleRefresh}
          >
            {loading ? "Recargando..." : "Refrescar"}
          </Button>
        </div>
      </div>

      <div className="w-full bg-white rounded-xl overflow-hidden shadow-md">
        <DataGrid
          rows={rows}
          columns={columns}
          initialState={{
            pagination: {
              paginationModel: {
                pageSize: 5,
              },
            },
          }}
          pageSizeOptions={[5]}
          sx={{ border: "none", "& .MuiDataGrid-row:hover": { backgroundColor: "rgba(0,0,0,0.03)" } }}
        />
      </div>

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
