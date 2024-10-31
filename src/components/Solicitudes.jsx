import React, { useState, useEffect } from 'react';
import UseCrud from '../../hook/UseCrud';
import { useAuth } from '../../AuthContext';

const Solicitudes = () => {
  const { auth } = useAuth();
  const userRole = auth?.user?.tipo_usuario;
  const userId = auth?.user?.id_usuario;

  const BASEURL = 'http://localhost:3000/solicitudes/getSolicitudes';
  const BASEURL_USER = `http://localhost:3000/solicitudes/getSolicitudesByUsuario/${userId}`;
  
  const { getApi: getAllSolicitudes, response: allSolicitudes } = UseCrud(BASEURL);
  const { getApi: getUserSolicitudes, response: userSolicitudes } = UseCrud(BASEURL_USER);
  
  const [solicitudes, setSolicitudes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSolicitudes = async () => {
      setLoading(true);
      try {
        if (userRole === 'particular' || userRole === 'negocio') {
          await getUserSolicitudes();
        } else {
          await getAllSolicitudes();
        }
      } catch (error) {
        console.error('Error al cargar solicitudes:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchSolicitudes();
  }, [userRole]);

  useEffect(() => {
    if (userRole === 'particular' || userRole === 'negocio') {
      setSolicitudes(userSolicitudes || []);
    } else {
      setSolicitudes(allSolicitudes || []);
    }
  }, [userSolicitudes, allSolicitudes]);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800">
            {userRole === 'administrador' ? 'Todas las Solicitudes' : 'Mis Solicitudes'}
          </h2>
          
          {(userRole === 'administrador' || userRole === 'domiciliario') && (
            <div className="flex gap-4">
              <input
                type="text"
                placeholder="Buscar por ID..."
                className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
              <button className="px-4 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600">
                Buscar
              </button>
            </div>
          )}
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500"></div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Cliente
                  </th>
                  {userRole === 'administrador' && (
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Domiciliario
                    </th>
                  )}
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Estado
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Fecha
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {solicitudes.map((solicitud) => (
                  <tr key={solicitud.id_solicitud}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {solicitud.id_solicitud}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {solicitud.cliente_nombre}
                    </td>
                    {userRole === 'administrador' && (
                      <td className="px-6 py-4 whitespace-nowrap">
                        {solicitud.domiciliario_nombre}
                      </td>
                    )}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                        ${solicitud.estado === 'completado' ? 'bg-green-100 text-green-800' : 
                          solicitud.estado === 'en curso' ? 'bg-yellow-100 text-yellow-800' : 
                          'bg-red-100 text-red-800'}`}>
                        {solicitud.estado}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {new Date(solicitud.fecha_hora).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button className="text-emerald-600 hover:text-emerald-900">
                        Ver detalles
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default Solicitudes; 