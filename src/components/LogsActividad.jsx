import React, { useState, useEffect } from "react";
import UseCrud from "../../hook/UseCrud";
import { useAuth } from "../../AuthContext";
import Header from "./Header";

const LogsActividad = () => {
  const BASEURL = "http://localhost:3000/logsActividad/getLogs";
  const BASEURL2 = "http://localhost:3000/logsActividad/getLogsFecha";
  const BASEURL3 = "http://localhost:3000/logsActividad/postLogsActividad";

  const { auth } = useAuth();
  const { getApi, response: logs, loading } = UseCrud(BASEURL);
  const { postApi: getLogsFecha } = UseCrud(BASEURL2);
  const { postApiById: crearLog } = UseCrud(BASEURL3);

  const [fechaInicio, setFechaInicio] = useState("");
  const [fechaFin, setFechaFin] = useState("");
  const [logsActuales, setLogsActuales] = useState([]);
  const [descripcion, setDescripcion] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    getApi();
  }, []);

  useEffect(() => {
    if (logs) {
      setLogsActuales(logs);
    }
  }, [logs]);

  const handleFiltrarPorFecha = async (e) => {
    e.preventDefault();
    if (fechaInicio && fechaFin) {
      try {
        console.log("Fechas seleccionadas:", { fechaInicio, fechaFin });

        const result = await getLogsFecha({
          fecha_inicio: fechaInicio,
          fecha_fin: fechaFin,
        });

        console.log("Respuesta del servidor:", result);

        if (result) {
          setLogsActuales(result);
        }
      } catch (error) {
        console.error("Error al filtrar por fecha:", error);
      }
    }
  };

  const handleCrearLog = async (e) => {
    e.preventDefault();
    try {
      if (!auth.user || !auth.user.id_usuario) {
        console.log("Auth state:", auth);
        alert("Error: No se pudo obtener la información del usuario");
        return;
      }

      const response = await crearLog({ descripcion }, auth.user.id_usuario);
      if (response) {
        setDescripcion("");
        setIsModalOpen(false);
        getApi();
      }
    } catch (error) {
      console.error("Error al crear log:", error);
      alert("Error al crear el log. Por favor, intente nuevamente.");
    }
  };

  const limpiarFiltros = () => {
    setFechaInicio("");
    setFechaFin("");
    getApi();
  };

  if (!auth.isAuthenticated || !auth.user) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          No hay información del usuario disponible
        </div>
      </div>
    );
  }

  return (
    <>
    <Header/>
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">Logs de Actividad</h2>
          <button
            onClick={() => setIsModalOpen(true)}
            className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600"
          >
            Crear Log
          </button>
        </div>

        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Fecha Inicio
              </label>
              <input
                type="date"
                value={fechaInicio}
                onChange={(e) => setFechaInicio(e.target.value)}
                className="w-full p-2 border rounded-lg"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Fecha Fin
              </label>
              <input
                type="date"
                value={fechaFin}
                onChange={(e) => setFechaFin(e.target.value)}
                className="w-full p-2 border rounded-lg"
              />
            </div>
          </div>
          <div className="flex justify-end gap-4 mt-4">
            <button
              onClick={handleFiltrarPorFecha}
              className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600"
            >
              Filtrar por Fecha
            </button>
            <button
              onClick={limpiarFiltros}
              className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600"
            >
              Limpiar Filtros
            </button>
          </div>
        </div>

        {isModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
            <div className="bg-white p-6 rounded-lg w-full max-w-md">
              <h3 className="text-xl font-bold mb-4">Crear Nuevo Log</h3>
              <form onSubmit={handleCrearLog}>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Descripción
                  </label>
                  <textarea
                    value={descripcion}
                    onChange={(e) => setDescripcion(e.target.value)}
                    className="w-full p-2 border rounded-lg"
                    rows="4"
                    required
                  />
                </div>
                <div className="flex justify-end gap-4">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600"
                  >
                    Guardar
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        <div className="bg-white rounded-lg shadow overflow-hidden">
          {loading ? (
            <div className="p-4 text-center">Cargando...</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      ID Usuario
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Descripción
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Fecha y Hora
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {logsActuales.map((log) => (
                    <tr key={`${log.id_usuario}-${log.fecha_hora}`}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {log.id_usuario}
                      </td>
                      <td className="px-6 py-4">{log.descripcion}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {new Date(log.fecha_hora).toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default LogsActividad;
