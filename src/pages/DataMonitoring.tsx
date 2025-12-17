import { useState } from "react";
import { DataGrid, GridColDef } from "@mui/x-data-grid";
import { Refresh } from "@mui/icons-material";
import { Button, CircularProgress } from "@mui/material";

interface DataMonitoringItem {
  id: number;
  sort: number;
  areaName: string;
  meterSn: string;
  communicationTime: string;
  positiveTotalFlow: number;
  batteryStatus: string;
  emDisturbance: string;
  valveStatus: string;
  positiveFlowRate: string;
  deviceId: number;
  imei: string;
  pci: string;
  snr: string;
  imsi: string;
}

interface DataMonitoringProps {
  subPage: string;
}

export default function DataMonitoring({ subPage: _subPage }: DataMonitoringProps) {
  const [rows, setRows] = useState<DataMonitoringItem[]>([
    {
      id: 1,
      sort: 1,
      areaName: "Operaciones",
      meterSn: "MTR001",
      communicationTime: "2024-12-16 14:25:00",
      positiveTotalFlow: 1250.5,
      batteryStatus: "Good",
      emDisturbance: "Normal",
      valveStatus: "Open",
      positiveFlowRate: "15.2 L/min",
      deviceId: 1001,
      imei: "351756051523999",
      pci: "100",
      snr: "12.5",
      imsi: "310260123456789"
    },
    {
      id: 2,
      sort: 2,
      areaName: "Calidad",
      meterSn: "MTR002",
      communicationTime: "2024-12-16 13:45:00",
      positiveTotalFlow: 890.3,
      batteryStatus: "Low",
      emDisturbance: "High",
      valveStatus: "Open",
      positiveFlowRate: "8.7 L/min",
      deviceId: 1002,
      imei: "351756051524000",
      pci: "101",
      snr: "10.8",
      imsi: "310260123456790"
    },
    {
      id: 3,
      sort: 3,
      areaName: "Mantenimiento",
      meterSn: "MTR003",
      communicationTime: "2024-12-16 12:30:00",
      positiveTotalFlow: 2100.8,
      batteryStatus: "Good",
      emDisturbance: "Normal",
      valveStatus: "Closed",
      positiveFlowRate: "0.0 L/min",
      deviceId: 1003,
      imei: "351756051524001",
      pci: "102",
      snr: "14.2",
      imsi: "310260123456791"
    },
    {
      id: 4,
      sort: 4,
      areaName: "Operaciones",
      meterSn: "MTR004",
      communicationTime: "2024-12-16 11:15:00",
      positiveTotalFlow: 567.2,
      batteryStatus: "Critical",
      emDisturbance: "Normal",
      valveStatus: "Open",
      positiveFlowRate: "22.1 L/min",
      deviceId: 1004,
      imei: "351756051524002",
      pci: "103",
      snr: "9.3",
      imsi: "310260123456792"
    },
    {
      id: 5,
      sort: 5,
      areaName: "Calidad",
      meterSn: "MTR005",
      communicationTime: "2024-12-16 10:00:00",
      positiveTotalFlow: 3340.1,
      batteryStatus: "Good",
      emDisturbance: "Low",
      valveStatus: "Open",
      positiveFlowRate: "18.9 L/min",
      deviceId: 1005,
      imei: "351756051524003",
      pci: "104",
      snr: "13.7",
      imsi: "310260123456793"
    },
  ]);

  const [loading, setLoading] = useState(false);

  const columns: GridColDef[] = [
    { field: "sort", headerName: "Sort", width: 80, type: "number" },
    { field: "areaName", headerName: "Area Name", width: 120 },
    { field: "meterSn", headerName: "Meter S/N", width: 120 },
    { field: "communicationTime", headerName: "Communication Time", width: 160 },
    { field: "positiveTotalFlow", headerName: "Positive Total Flow", width: 140, type: "number" },
    { field: "batteryStatus", headerName: "Battery Status", width: 120 },
    { field: "emDisturbance", headerName: "EM Disturbance", width: 120 },
    { field: "valveStatus", headerName: "Valve Status", width: 110 },
    { field: "positiveFlowRate", headerName: "Positive Flow Rate", width: 140 },
    { field: "deviceId", headerName: "Device ID", width: 100, type: "number" },
    { field: "imei", headerName: "IMEI", width: 140 },
    { field: "pci", headerName: "PCI", width: 80 },
    { field: "snr", headerName: "SNR", width: 80 },
    { field: "imsi", headerName: "IMSI", width: 140 },
  ];

  const handleRefresh = () => {
    setLoading(true);
    setTimeout(() => {
      setRows([...rows]);
      setLoading(false);
    }, 1000);
  };

  return (
    <div className="flex flex-col gap-6 p-6 h-full">

      <div
        className="flex justify-between items-center p-5 rounded-xl"
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
        <h1 className="text-xl font-bold">Data Monitoring</h1>
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

      <div className="flex-1 bg-white rounded-xl overflow-hidden shadow-md">
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
