import { useState } from "react";
import { DataGrid, GridColDef } from "@mui/x-data-grid";
import { Add, Delete, Refresh, Edit } from "@mui/icons-material";
import { Button, IconButton, Dialog, DialogTitle, DialogContent, DialogActions, TextField, CircularProgress } from "@mui/material";

interface Device {
  id: number;
  areaName: string;
  deviceSn: string;
  deviceName: string;
  deviceType: string;
  deviceStatus: string;
  operator: string;
  installedTime: string;
  communicationTime: string;
}

interface DeviceManagementProps {
  subPage: string;
}

export default function DeviceManagement({ subPage: _subPage }: DeviceManagementProps) {
  const [rows, setRows] = useState<Device[]>([
    {
      id: 1,
      areaName: "Operaciones",
      deviceSn: "DEV001",
      deviceName: "Water Meter A1",
      deviceType: "Flow Sensor",
      deviceStatus: "Installed",
      operator: "Juan Pérez",
      installedTime: "2024-01-15 10:30:00",
      communicationTime: "2024-12-16 14:25:00"
    },
    {
      id: 2,
      areaName: "Calidad",
      deviceSn: "DEV002",
      deviceName: "Pressure Monitor B2",
      deviceType: "Pressure Sensor",
      deviceStatus: "Installed",
      operator: "María García",
      installedTime: "2024-02-20 09:15:00",
      communicationTime: "2024-12-16 13:45:00"
    },
    {
      id: 3,
      areaName: "Mantenimiento",
      deviceSn: "DEV003",
      deviceName: "Temperature Sensor C3",
      deviceType: "Temp Sensor",
      deviceStatus: "Uninstalled",
      operator: "Carlos López",
      installedTime: "2024-03-10 11:00:00",
      communicationTime: "2024-12-15 16:30:00"
    },
  ]);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [currentDevice, setCurrentDevice] = useState<Device>({
    id: 0,
    areaName: "",
    deviceSn: "",
    deviceName: "",
    deviceType: "",
    deviceStatus: "",
    operator: "",
    installedTime: "",
    communicationTime: "",
  });

  const [loading, setLoading] = useState(false);

  const columns: GridColDef[] = [
    { field: "areaName", headerName: "Area Name", width: 150 },
    { field: "deviceSn", headerName: "Device S/N", width: 130 },
    { field: "deviceName", headerName: "Device Name", width: 180 },
    { field: "deviceType", headerName: "Device Type", width: 130 },
    { field: "deviceStatus", headerName: "Device Status", width: 130 },
    { field: "operator", headerName: "Operator", width: 150 },
    { field: "installedTime", headerName: "Installed Time", width: 180 },
    { field: "communicationTime", headerName: "Communication Time", width: 180 },
    {
      field: "actions",
      headerName: "Actions",
      width: 150,
      renderCell: (params) => (
        <div className="flex gap-2">
          <IconButton color="primary" size="small" onClick={() => handleEdit(params.row)}>
            <Edit fontSize="small" />
          </IconButton>
          <IconButton color="error" size="small" onClick={() => handleDelete(params.row.id)}>
            <Delete fontSize="small" />
          </IconButton>
        </div>
      ),
    },
  ];

  const handleDelete = (id: number) => {
    if (confirm("¿Deseas eliminar este dispositivo?")) {
      setRows(rows.filter(row => row.id !== id));
    }
  };

  const handleEdit = (device: Device) => {
    setCurrentDevice(device);
    setEditMode(true);
    setDialogOpen(true);
  };

  const handleAdd = () => {
    const newId = rows.length ? Math.max(...rows.map(r => r.id)) + 1 : 1;
    setRows([...rows, { ...currentDevice, id: newId }]);
    setDialogOpen(false);
    resetForm();
  };

  const handleUpdate = () => {
    setRows(rows.map(r => (r.id === currentDevice.id ? currentDevice : r)));
    setDialogOpen(false);
    resetForm();
  };

  const resetForm = () => {
    setCurrentDevice({
      id: 0,
      areaName: "",
      deviceSn: "",
      deviceName: "",
      deviceType: "",
      deviceStatus: "",
      operator: "",
      installedTime: "",
      communicationTime: "",
    });
    setEditMode(false);
  };

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
        <h1 className="text-xl font-bold">Device Management</h1>
        <div className="flex gap-3">
          <Button
            variant="outlined"
            startIcon={<Add />}
            sx={{
              color: "white",
              borderColor: "rgba(255,255,255,0.4)",
              "&:hover": { borderColor: "white", background: "rgba(255,255,255,0.15)" },
            }}
            onClick={() => setDialogOpen(true)}
          >
            Agregar
          </Button>

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

      <Dialog open={dialogOpen} onClose={() => { setDialogOpen(false); resetForm(); }}>
        <DialogTitle>{editMode ? "Editar Dispositivo" : "Agregar Nuevo Dispositivo"}</DialogTitle>
        <DialogContent className="flex flex-col gap-3 min-w-[400px]">
          {["areaName","deviceSn","deviceName","deviceType","deviceStatus","operator","installedTime","communicationTime"].map((field) => (
            <TextField
              key={field}
              label={field.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
              type="text"
              value={String(currentDevice[field as keyof Device] || "")}
              onChange={(e) => setCurrentDevice({ ...currentDevice, [field]: e.target.value })}
              fullWidth
            />
          ))}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => { setDialogOpen(false); resetForm(); }}>Cancelar</Button>
          <Button variant="contained" onClick={editMode ? handleUpdate : handleAdd}>
            {editMode ? "Actualizar" : "Agregar"}
          </Button>
        </DialogActions>
      </Dialog>

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
