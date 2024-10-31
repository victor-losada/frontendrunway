import React, { useState, useEffect } from 'react';
import { 
  FaUsers, FaClipboardList, FaHistory, FaExclamationTriangle, 
  FaMotorcycle, FaShoppingBag, FaBell
} from 'react-icons/fa';
import { useAuth } from '../../AuthContext';
import { useNavigate } from 'react-router-dom';
import UseCrud from '../../hook/UseCrud';
import Header from './Header';

const Home = () => {
  const { auth } = useAuth();
  const navigate = useNavigate();
  const userRole = auth?.user?.tipo_usuario;

  const [stats, setStats] = useState({
    solicitudes: '0',
    reportes: '0',
    novedades: '0'
  });

  // URLs según las rutas existentes
  const BASEURL_SOLICITUDES = 'http://localhost:3000/solicitudes/getSolicitudes';
  const BASEURL_REPORTES = 'http://localhost:3000/reporteIncidentes/getReporteIncidente';
  const BASEURL_NOVEDADES = 'http://localhost:3000/novedades/getNovedadesPendientes';

  // Hooks para las estadísticas
  const { getApi: getSolicitudes, response: solicitudesResponse } = UseCrud(BASEURL_SOLICITUDES);
  const { getApi: getReportes, response: reportesResponse } = UseCrud(BASEURL_REPORTES);
  const { getApi: getNovedades, response: novedadesResponse } = UseCrud(BASEURL_NOVEDADES);

  useEffect(() => {
    const loadStats = async () => {
      try {
        switch(userRole) {
          case 'administrador':
            await Promise.all([getSolicitudes(), getReportes(), getNovedades()]);
            break;
          case 'domiciliario':
            await Promise.all([getSolicitudes(), getNovedades()]);
            break;
          default:
            await Promise.all([getSolicitudes(), getReportes()]);
        }
      } catch (error) {
        console.error('Error al cargar estadísticas:', error);
      }
    };
    loadStats();
  }, [userRole]);

  // Módulos según el rol
  const getModulesByRole = () => {
    switch(userRole) {
      case 'particular':
      case 'negocio':
        return [
          {
            title: "Mis Solicitudes",
            description: "Ver el estado de tus solicitudes",
            icon: FaClipboardList,
            path: "/solicitudes",
            stats: {
              value: solicitudesResponse?.length || '0',
              label: "solicitudes activas"
            }
          },
          {
            title: "Reportar Incidencia",
            description: "Reportar problemas con las solicitudes",
            icon: FaExclamationTriangle,
            path: "/reportes",
            stats: {
              value: reportesResponse?.length || '0',
              label: "reportes activos"
            }
          }
        ];

      case 'domiciliario':
        return [
          {
            title: "Solicitudes Asignadas",
            description: "Ver y gestionar solicitudes",
            icon: FaMotorcycle,
            path: "/solicitudes",
            stats: {
              value: solicitudesResponse?.length || '0',
              label: "solicitudes pendientes"
            }
          },
          {
            title: "Reportar Novedad",
            description: "Reportar novedades en las entregas",
            icon: FaBell,
            path: "/novedades",
            stats: {
              value: novedadesResponse?.length || '0',
              label: "novedades pendientes"
            }
          }
        ];

      case 'administrador':
        return [
          {
            title: "Gestión de Usuarios",
            description: "Administra usuarios del sistema",
            icon: FaUsers,
            path: "/usuarios",
            stats: {
              value: stats.usuarios,
              label: "usuarios activos"
            }
          },
          {
            title: "Solicitudes",
            description: "Gestiona las solicitudes",
            icon: FaClipboardList,
            path: "/solicitudes",
            stats: {
              value: solicitudesResponse?.length || '0',
              label: "solicitudes activas"
            }
          },
          {
            title: "Reportes de Incidencias",
            description: "Gestiona los reportes de incidencias",
            icon: FaExclamationTriangle,
            path: "/reportes",
            stats: {
              value: reportesResponse?.length || '0',
              label: "reportes pendientes"
            }
          },
          {
            title: "Novedades",
            description: "Gestiona las novedades del sistema",
            icon: FaBell,
            path: "/novedades",
            stats: {
              value: novedadesResponse?.length || '0',
              label: "novedades pendientes"
            }
          }
        ];

      default:
        return [];
    }
  };

  return (
    <>
    <Header/>
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
        <h2 className="text-xl font-semibold text-gray-800">
          Bienvenido, {auth?.user?.nombre}
        </h2>
        <p className="mt-1 text-gray-600">
          Accede a tus funciones disponibles
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {getModulesByRole().map((module, index) => (
          <div
            key={index}
            onClick={() => navigate(module.path)}
            className="bg-white rounded-lg shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <module.icon className="w-8 h-8 text-emerald-500" />
              <span className="text-xs font-medium text-gray-500">
                {module.stats.label}
              </span>
            </div>
            <h3 className="text-lg font-semibold text-gray-800 mb-2">
              {module.title}
            </h3>
            <p className="text-sm text-gray-600 mb-4">
              {module.description}
            </p>
            <div className="flex items-center justify-between">
              <span className="text-2xl font-bold text-gray-800">
                {module.stats.value}
              </span>
              <span className="px-4 py-2 bg-emerald-50 text-emerald-600 rounded-lg text-sm font-medium">
                Ver más
              </span>
            </div>
          </div>
        ))}
        </div>
      </div>
    </>
  );
};

export default Home;