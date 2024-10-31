import React, { useState, useEffect } from "react";
import UseCrud from "../../hook/UseCrud";
import { useAuth } from "../../AuthContext";
import Header from "./Header";

const DomiciliarioPanel = () => {
  const BASEURL = "http://localhost:3000/solicitudes/getSolicitudesByDomiciliario";
  const BASEURL_ESTADO = "http://localhost:3000/solicitudes/patchEstadoSolicitud";
  const BASEURL_DISPONIBILIDAD = "http://localhost:3000/domiciliarios/patchStatusDomiciliario2";
  const BASEURL_NOVEDAD = "http://localhost:3000/novedades/postNovedades";
  const BASEURL_GET_DISPONIBILIDAD = "http://localhost:3000/domiciliarios/getDisponibilidad";

  const { auth } = useAuth();
  const [domiciliarioId] = useState(auth.user?.id_usuario);

  const [solicitudes, setSolicitudes] = useState([]);
  const [disponibilidad, setDisponibilidad] = useState(true);
  const [selectedSolicitud, setSelectedSolicitud] = useState(null);
  const [nuevaNovedad, setNuevaNovedad] = useState("");
  const [detallesSolicitud, setDetallesSolicitud] = useState(null);

  const { getApiById: getSolicitudesDomiciliario, responseById: responseSolicitudes } = UseCrud(BASEURL);
  const { updateApi: actualizarEstado } = UseCrud(BASEURL_ESTADO);
  const { updateApi: actualizarDisponibilidad } = UseCrud(BASEURL_DISPONIBILIDAD);
  const { getApiById: getDisponibilidad } = UseCrud(BASEURL_GET_DISPONIBILIDAD);
  const { postApiById: crearNovedad } = UseCrud(BASEURL_NOVEDAD);

  const cargarSolicitudes = async () => {
    try {
      const result = await getSolicitudesDomiciliario(`/${domiciliarioId}`);
      if (result) {
        setSolicitudes(result);
      }
    } catch (error) {
      console.error('Error al cargar solicitudes:', error);
    }
  };

  useEffect(() => {
    if (domiciliarioId) {
      cargarSolicitudes();
      cargarDisponibilidadInicial();
    }
  }, [domiciliarioId]);

  const cargarDisponibilidadInicial = async () => {
    try {
      const result = await getDisponibilidad(`/${domiciliarioId}`);
      if (result && result[0]) {
        setDisponibilidad(result[0].disponibilidad === "disponible");
      }
    } catch (error) {
      console.error("Error al cargar disponibilidad:", error);
    }
  };

  const toggleDisponibilidad = async () => {
    try {
      const nuevoEstado = !disponibilidad;
      await actualizarDisponibilidad(
        { disponibilidad: nuevoEstado ? "disponible" : "no disponible" },
        `/${domiciliarioId}`
      );
      setDisponibilidad(nuevoEstado);
    } catch (error) {
      console.error("Error al actualizar disponibilidad:", error);
    }
  };

  const verDetalles = (solicitud) => {
    setDetallesSolicitud(solicitud);
  };

  const actualizarEstadoSolicitud = async (idSolicitud, nuevoEstado) => {
    try {
      await actualizarEstado({ estado: nuevoEstado }, `/${idSolicitud}`);
      cargarSolicitudes();
      alert("Estado actualizado exitosamente");
    } catch (error) {
      console.error("Error al actualizar estado:", error);
    }
  };

  const agregarNovedad = async (e) => {
    e.preventDefault();
    if (!selectedSolicitud || !nuevaNovedad.trim()) return;

    try {
      await crearNovedad(
        {
          id_solicitud: selectedSolicitud,
          descripcion: nuevaNovedad
        },
        domiciliarioId.toString()
      );
      
      setNuevaNovedad("");
      setSelectedSolicitud(null);
      cargarSolicitudes();
      alert("Novedad agregada exitosamente");
    } catch (error) {
      console.error("Error al agregar novedad:", error);
    }
  };

  return (
    <>
      <Header/>
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Panel de Domiciliario</h1>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-600">Estado:</span>
            <select
              value={disponibilidad ? "disponible" : "no disponible"}
              onChange={(e) => toggleDisponibilidad(e.target.value === "disponible")}
              className="px-3 py-2 border rounded-lg"
            >
              <option value="disponible">Disponible</option>
              <option value="no disponible">No Disponible</option>
            </select>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Mis Solicitudes</h2>
          <div className="space-y-4">
            {solicitudes && solicitudes.length > 0 ? (
              solicitudes.map((solicitud) => (
                <div
                  key={solicitud.id_solicitud}
                  className="border rounded-lg p-4 hover:bg-gray-50"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-semibold">
                        Solicitud #{solicitud.id_solicitud}
                      </p>
                      <p className="text-sm text-gray-600">
                        Recogida: {solicitud.direccion_recogida}
                      </p>
                      <p className="text-sm text-gray-600">
                        Entrega: {solicitud.direccion_entrega}
                      </p>
                      <p className="text-sm text-gray-600">
                        Fecha: {new Date(solicitud.fecha_hora).toLocaleString()}
                      </p>
                    </div>
                    <div className="flex flex-col gap-2">
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-600">
                          Estado actual:
                        </span>
                        {solicitud.estado !== "completado" ? (
                          <select
                            value={solicitud.estado}
                            onChange={(e) =>
                              actualizarEstadoSolicitud(
                                solicitud.id_solicitud,
                                e.target.value
                              )
                            }
                            className="px-3 py-1 border rounded-lg text-sm"
                          >
                            <option value={solicitud.estado} disabled>
                              {solicitud.estado.charAt(0).toUpperCase() +
                                solicitud.estado.slice(1)}
                            </option>
                            <option value="en curso">En Curso</option>
                            <option value="completado">Completado</option>
                          </select>
                        ) : (
                          <span className="px-3 py-1 bg-green-100 text-green-800 rounded-lg text-sm">
                            {solicitud.estado.charAt(0).toUpperCase() +
                              solicitud.estado.slice(1)}
                          </span>
                        )}
                      </div>
                      <div className="flex gap-2 mt-2">
                        <button
                          onClick={() => verDetalles(solicitud)}
                          className="bg-gray-500 hover:bg-gray-600 text-white px-3 py-1 rounded-lg text-sm"
                        >
                          Ver Detalles
                        </button>
                        <button
                          onClick={() => setSelectedSolicitud(solicitud.id_solicitud)}
                          className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded-lg text-sm"
                        >
                          Agregar Novedad
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-gray-500 text-center">
                No hay solicitudes disponibles
              </p>
            )}
          </div>
        </div>

        {detallesSolicitud && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-96">
              <h3 className="text-lg font-semibold mb-4">Detalles de la Solicitud</h3>
              <div className="space-y-3">
                <p><span className="font-semibold">ID:</span> #{detallesSolicitud.id_solicitud}</p>
                <p><span className="font-semibold">Cliente:</span> {detallesSolicitud.nombre_cliente}</p>
                <p><span className="font-semibold">Dirección Recogida:</span> {detallesSolicitud.direccion_recogida}</p>
                <p><span className="font-semibold">Dirección Entrega:</span> {detallesSolicitud.direccion_entrega}</p>
                <p><span className="font-semibold">Estado:</span> {detallesSolicitud.estado}</p>
                <p><span className="font-semibold">Fecha:</span> {new Date(detallesSolicitud.fecha_hora).toLocaleString()}</p>
              </div>
              <div className="mt-4 flex justify-end">
                <button
                  onClick={() => setDetallesSolicitud(null)}
                  className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg"
                >
                  Cerrar
                </button>
              </div>
            </div>
          </div>
        )}

        {selectedSolicitud && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
            <div className="bg-white rounded-lg p-6 w-96">
              <h3 className="text-lg font-semibold mb-4">Agregar Novedad</h3>
              <form onSubmit={agregarNovedad}>
                <textarea
                  value={nuevaNovedad}
                  onChange={(e) => setNuevaNovedad(e.target.value)}
                  className="w-full p-2 border rounded-lg mb-4"
                  rows="4"
                  placeholder="Describe la novedad..."
                  required
                />
                <div className="flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setSelectedSolicitud(null)}
                    className="px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-lg"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg"
                  >
                    Guardar
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default DomiciliarioPanel;
