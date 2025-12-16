import { useState } from "react";

interface OperatorManagementProps {
  subPage: string;
}

export default function OperatorManagement({ subPage }: OperatorManagementProps) {
  const [search, setSearch] = useState("");

  const users = [
    { id: 1, name: "Neil Sims", email: "neil.sims@flowbite.com", role: "React Developer", status: "Online", img: "https://randomuser.me/api/portraits/men/1.jpg" },
    { id: 2, name: "Bonnie Green", email: "bonnie@flowbite.com", role: "Designer", status: "Online", img: "https://randomuser.me/api/portraits/women/2.jpg" },
    { id: 3, name: "Jese Leos", email: "jese@flowbite.com", role: "Vue JS Developer", status: "Online", img: "https://randomuser.me/api/portraits/men/3.jpg" },
    { id: 4, name: "Thomas Lean", email: "thames@flowbite.com", role: "UI/UX Engineer", status: "Online", img: "https://randomuser.me/api/portraits/men/4.jpg" },
    { id: 5, name: "Leslie Livingston", email: "leslie@flowbite.com", role: "SEO Specialist", status: "Offline", img: "https://randomuser.me/api/portraits/women/5.jpg" },
  ];

  const filteredUsers = users.filter(
    (user) =>
      user.name.toLowerCase().includes(search.toLowerCase()) ||
      user.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="flex flex-col gap-6 p-6">
      {/* HEADER ANIMADO */}
      <div className="flex flex-col md:flex-row justify-between items-center p-5 rounded-xl relative overflow-hidden"
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
        <h1 className="text-2xl font-medium mb-3 md:mb-0">Gestión de Usuarios</h1>

        {/* BOTONES ESTILO GHOST */}
        <div className="flex gap-3">
          <button className="px-4 py-2 border border-white/40 rounded-lg text-white hover:bg-white/15 hover:border-white transition">
            Agregar
          </button>
          <button className="px-4 py-2 border border-white/40 rounded-lg text-white hover:bg-white/15 hover:border-white transition">
            Borrar
          </button>
          <button className="px-4 py-2 border border-white/40 rounded-lg text-white hover:bg-white/15 hover:border-white transition">
            Refrescar
          </button>
        </div>
      </div>

      {/* TABLA */}
      <div className="relative overflow-x-auto shadow-sm rounded-lg border border-gray-300 bg-white">
        {/* SEARCH */}
        <div className="flex flex-col md:flex-row items-center justify-between p-4 space-y-4 md:space-y-0">
          <div className="relative w-full max-w-xs">
            <input
              type="text"
              placeholder="Search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded shadow-sm text-gray-700 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
            />
            <div className="absolute inset-y-0 left-2 flex items-center pointer-events-none">
              <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-3.5-3.5M17 10a7 7 0 1 1-14 0 7 7 0 0 1 14 0Z" />
              </svg>
            </div>
          </div>
        </div>

        <table className="w-full text-sm text-left text-gray-700">
          <thead className="bg-gray-200 border-b border-gray-300">
            <tr>
              <th className="p-4">
                <input type="checkbox" className="w-4 h-4 border rounded" />
              </th>
              <th className="px-6 py-3 font-medium">Nombre</th>
              <th className="px-6 py-3 font-medium">Rol</th>
              <th className="px-6 py-3 font-medium">Estado</th>
              <th className="px-6 py-3 font-medium">Acción</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.map((user, index) => (
              <tr
                key={user.id}
                className={`border-b border-gray-300 ${index % 2 === 0 ? "bg-gray-50" : "bg-white"} hover:bg-gray-100`}
              >
                <td className="p-4">
                  <input type="checkbox" className="w-4 h-4 border rounded" />
                </td>
                <th className="flex items-center px-6 py-4 font-medium whitespace-nowrap">
                  <img className="w-10 h-10 rounded-full" src={user.img} alt={user.name} />
                  <div className="ml-3">
                    <div className="text-base font-semibold">{user.name}</div>
                    <div className="text-gray-500 text-sm">{user.email}</div>
                  </div>
                </th>
                <td className="px-6 py-4">{user.role}</td>
                <td className="px-6 py-4">
                  <div className="flex items-center">
                    <div
                      className={`h-2.5 w-2.5 rounded-full mr-2 ${user.status === "Online" ? "bg-green-500" : "bg-red-500"}`}
                    ></div>
                    {user.status}
                  </div>
                </td>
                <td className="px-6 py-4">
                  <button className="text-blue-600 font-medium hover:underline">Editar</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
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
