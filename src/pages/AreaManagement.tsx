import { useState } from "react";
import { DataGrid, GridColDef } from "@mui/x-data-grid";
import { Add, Delete, Refresh, Edit } from "@mui/icons-material";
import { Button, IconButton, Dialog, DialogTitle, DialogContent, DialogActions, TextField, CircularProgress } from "@mui/material";

interface Area {
  id: number;
  name: string;
  no: string;
  code: string;
  sort: number;
  pushAddress: string;
  note: string;
  time: string;
}

export default function AreaManagement() {
  const [rows, setRows] = useState<Area[]>([
    { id: 1, name: "Operaciones", no: "001", code: "OP01", sort: 1, pushAddress: "Calle 123", note: "Área principal", time: "08:00-17:00" },
    { id: 2, name: "Calidad", no: "002", code: "QA02", sort: 2, pushAddress: "Calle 456", note: "Revisión diaria", time: "09:00-18:00" },
    { id: 3, name: "Mantenimiento", no: "003", code: "MT03", sort: 3, pushAddress: "Calle 789", note: "Turno A", time: "07:00-15:00" },
  ]);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [currentArea, setCurrentArea] = useState<Area>({
    id: 0,
    name: "",
    no: "",
    code: "",
    sort: 0,
    pushAddress: "",
    note: "",
    time: "",
  });

  const [loading, setLoading] = useState(false);

  // Columns del DataGrid
  const columns: GridColDef[] = [
    { field: "id", headerName: "ID", width: 70 },
    { field: "name", headerName: "Área", width: 150 },
    { field: "no", headerName: "Área No.", width: 120 },
    { field: "code", headerName: "Código", width: 120 },
    { field: "sort", headerName: "Sort", width: 80 },
    { field: "pushAddress", headerName: "Push Address", width: 180 },
    { field: "note", headerName: "Notas", width: 200 },
    { field: "time", headerName: "Time", width: 120 },
    {
      field: "operate",
      headerName: "Operar",
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

  // FUNCIONES CRUD
  const handleDelete = (id: number) => {
    if (confirm("¿Deseas eliminar esta área?")) {
      setRows(rows.filter(row => row.id !== id));
    }
  };

  const handleEdit = (area: Area) => {
    setCurrentArea(area);
    setEditMode(true);
    setDialogOpen(true);
  };

  const handleAdd = () => {
    const newId = rows.length ? Math.max(...rows.map(r => r.id)) + 1 : 1;
    setRows([...rows, { ...currentArea, id: newId }]);
    setDialogOpen(false);
    resetForm();
  };

  const handleUpdate = () => {
    setRows(rows.map(r => (r.id === currentArea.id ? currentArea : r)));
    setDialogOpen(false);
    resetForm();
  };

  const resetForm = () => {
    setCurrentArea({ id: 0, name: "", no: "", code: "", sort: 0, pushAddress: "", note: "", time: "" });
    setEditMode(false);
  };

  const handleRefresh = () => {
    setLoading(true);
    setTimeout(() => {
      setRows([...rows]); // podrías reemplazar con fetch real
      setLoading(false);
    }, 1000);
  };

  return (
    <div className="flex flex-col gap-6 p-6 h-full">

      {/* HEADER */}
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
        <h1 className="text-xl font-bold">Area Management</h1>
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

      {/* TABLA */}
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

      {/* DIALOG FORM */}
      <Dialog open={dialogOpen} onClose={() => { setDialogOpen(false); resetForm(); }}>
        <DialogTitle>{editMode ? "Editar Área" : "Agregar Nueva Área"}</DialogTitle>
        <DialogContent className="flex flex-col gap-3 min-w-[400px]">
          {["name","no","code","sort","pushAddress","note","time"].map((field) => (
            <TextField
              key={field}
              label={field.charAt(0).toUpperCase() + field.slice(1)}
              type={field === "sort" ? "number" : "text"}
              value={(currentArea as any)[field]}
              onChange={(e) => setCurrentArea({ ...currentArea, [field]: field === "sort" ? Number(e.target.value) : e.target.value })}
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
