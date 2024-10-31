import React, { useState, useEffect } from 'react';
import UseCrud from '../../hook/UseCrud';
import { useAuth } from '../../AuthContext';

const ReportesIncidencia = () => {
    const BASEURL = 'http://localhost:3000/reporteIncidentes/getReporteIncidente';
    const BASEURL3 = 'http://localhost:3000/reporteIncidentes/putReporteIncidente';
    const BASEURL4 = 'http://localhost:3000/reporteIncidentes/getReportesResueltos';
    const BASEURL5 = 'http://localhost:3000/reporteIncidentes/getReporteTipoIncidencia';
    
    const BASEURL6 = 'http://localhost:3000/solicitudes/getSolicitudesByUsuario';
    const BASEURL7 = 'http://localhost:3000/reporteIncidentes/postReporteIncidente';

    const { auth } = useAuth();
    const [tipoUsuario, setTipoUsuario] = useState(null);

    const { getApi, response: reportesPendientes, loading } = UseCrud(BASEURL);
    const { updateApi } = UseCrud(BASEURL3);
    const { getApi: getReportesResueltos, response: reportesResueltos } = UseCrud(BASEURL4);
    const { getApiById: getReportesPorTipo } = UseCrud(BASEURL5);
    const [selectedReporte, setSelectedReporte] = useState(null);
    const [detalleReporte, setDetalleReporte] = useState(null);
    const [mostrarResueltos, setMostrarResueltos] = useState(false);
    const [tipoIncidencia, setTipoIncidencia] = useState('');
    const [reportesFiltrados, setReportesFiltrados] = useState([]);

    const tiposIncidencia = [
        'entrega fallida',
        'producto dañado',
        'retraso',
        'otro'
    ];

    const [solicitudesUsuario, setSolicitudesUsuario] = useState([]);
    const [formData, setFormData] = useState({
        id_solicitud: '',
        tipo_incidencia: '',
        descripcion: ''
    });

    const { getApiById: getSolicitudesUsuario } = UseCrud(BASEURL6);
    const { postApiById: crearReporte } = UseCrud(BASEURL7);

    useEffect(() => {
        if (auth && auth.user) {
            setTipoUsuario(auth.user.tipo_usuario);
        }
    }, [auth]);

    useEffect(() => {
        if (auth && auth.user && ['particular', 'negocio'].includes(auth.user.tipo_usuario)) {
            cargarSolicitudesUsuario();
        }
    }, [auth]);

    useEffect(() => {
        if (tipoUsuario === 'administrador') {
            getApi();
            getReportesResueltos();
        }
    }, [tipoUsuario]);

    const handleFiltrarPorTipo = async (tipo) => {
        setTipoIncidencia(tipo);
        if (tipo) {
            try {
                const reportes = await getReportesPorTipo(tipo);
                setReportesFiltrados(reportes || []);
            } catch (error) {
                console.error('Error al filtrar por tipo:', error);
                setReportesFiltrados([]);
            }
        } else {
            setReportesFiltrados([]);
        }
    };

    const toggleTipoReportes = () => {
        setMostrarResueltos(!mostrarResueltos);
    };

    const handleVerDetalle = (reporte) => {
        setSelectedReporte(reporte.id_reporte);
        setDetalleReporte(reporte);
    };

    const handleMarcarResuelto = async (id_reporte) => {
        try {
            await updateApi({ estado: 'resuelto' }, `/${id_reporte}`);
            alert('Reporte marcado como resuelto');
            getApi();
        } catch (error) {
            console.error('Error al marcar como resuelto:', error);
            alert('Error al marcar como resuelto');
        }
    };

    const obtenerReportesActuales = () => {
        if (tipoIncidencia && reportesFiltrados.length > 0) {
            return reportesFiltrados;
        }
        return mostrarResueltos ? reportesResueltos : reportesPendientes || [];
    };

    const cargarSolicitudesUsuario = async () => {
        try {
            const response = await getSolicitudesUsuario(`/${auth.user.id_usuario}`);
            if (response) {
                setSolicitudesUsuario(response);
            }
        } catch (error) {
            console.error('Error al cargar solicitudes:', error);
        }
    };

    const handleSubmitReporte = async (e) => {
        e.preventDefault();
        try {
            const response = await crearReporte(formData, auth.user.id_usuario);
            if (response) {
                alert('Reporte creado exitosamente');
                setFormData({
                    id_solicitud: '',
                    tipo_incidencia: '',
                    descripcion: ''
                });
            }
        } catch (error) {
            console.error('Error al crear reporte:', error);
            alert('Error al crear el reporte');
        }
    };

    if (tipoUsuario === 'particular' || tipoUsuario === 'negocio') {
        return (
            <div className="container mx-auto px-4 py-8">
                <h2 className="text-2xl font-bold mb-6">Reportes de Incidencias</h2>
                
                <form onSubmit={handleSubmitReporte} className="max-w-lg mx-auto bg-white shadow-lg rounded-lg p-6">
                    <div className="space-y-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Seleccione la Solicitud
                            </label>
                            <select
                                value={formData.id_solicitud}
                                onChange={(e) => setFormData({...formData, id_solicitud: e.target.value})}
                                className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                                required
                            >
                                <option value="">Seleccione una solicitud</option>
                                {solicitudesUsuario.map(solicitud => (
                                    <option key={solicitud.id_solicitud} value={solicitud.id_solicitud}>
                                        Solicitud #{solicitud.id_solicitud} - {new Date(solicitud.fecha_hora).toLocaleString()}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Tipo de Incidencia
                            </label>
                            <select
                                value={formData.tipo_incidencia}
                                onChange={(e) => setFormData({...formData, tipo_incidencia: e.target.value})}
                                className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                                required
                            >
                                <option value="">Seleccione el tipo</option>
                                {tiposIncidencia.map(tipo => (
                                    <option key={tipo} value={tipo}>
                                        {tipo.charAt(0).toUpperCase() + tipo.slice(1)}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Descripción de la Incidencia
                            </label>
                            <textarea
                                value={formData.descripcion}
                                onChange={(e) => setFormData({...formData, descripcion: e.target.value})}
                                className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                                rows="4"
                                placeholder="Describa detalladamente la incidencia..."
                                required
                            />
                        </div>

                        <button
                            type="submit"
                            className="w-full bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600 transition-colors"
                        >
                            Enviar Reporte
                        </button>
                    </div>
                </form>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold">
                    Reportes de Incidencias {mostrarResueltos ? 'Resueltos' : 'Pendientes'}
                </h2>
                
                <div className="flex gap-4">
                    <select
                        value={tipoIncidencia}
                        onChange={(e) => handleFiltrarPorTipo(e.target.value)}
                        className="px-4 py-2 border rounded-lg"
                    >
                        <option value="">Todos los tipos</option>
                        {tiposIncidencia.map(tipo => (
                            <option key={tipo} value={tipo}>
                                {tipo.charAt(0).toUpperCase() + tipo.slice(1)}
                            </option>
                        ))}
                    </select>
                    <button
                        onClick={toggleTipoReportes}
                        className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
                            mostrarResueltos
                                ? 'bg-yellow-500 hover:bg-yellow-600 text-white'
                                : 'bg-green-500 hover:bg-green-600 text-white'
                        }`}
                    >
                        {mostrarResueltos ? 'Ver Pendientes' : 'Ver Resueltos'}
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white rounded-lg shadow p-6">
                    <h3 className="text-xl font-semibold mb-4">Lista de Reportes</h3>
                    {loading ? (
                        <p className="text-center">Cargando reportes...</p>
                    ) : (
                        <div className="space-y-4">
                            {obtenerReportesActuales()?.map((reporte) => (
                                <div 
                                    key={reporte.id_reporte}
                                    className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                                        selectedReporte === reporte.id_reporte
                                            ? 'bg-blue-50 border-blue-500'
                                            : 'hover:bg-gray-50'
                                    }`}
                                    onClick={() => handleVerDetalle(reporte)}
                                >
                                    <div className="flex justify-between items-center">
                                        <div>
                                            <p className="font-semibold">Usuario: {reporte.nombre_usuario}</p>
                                            <p className="text-sm text-gray-600">
                                                Tipo: {reporte.tipo_incidencia}
                                            </p>
                                            <p className="text-sm text-gray-600">
                                                Fecha: {new Date(reporte.fecha_reporte).toLocaleString()}
                                            </p>
                                        </div>
                                        <span className={`px-3 py-1 text-xs font-semibold rounded-full ${
                                            reporte.estado === 'resuelto'
                                                ? 'bg-green-100 text-green-800'
                                                : 'bg-yellow-100 text-yellow-800'
                                        }`}>
                                            {reporte.estado}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {selectedReporte && detalleReporte && (
                    <div className="bg-white rounded-lg shadow p-6">
                        <h3 className="text-xl font-semibold mb-4">Detalles del Reporte</h3>
                        <div className="space-y-4">
                            <p><span className="font-semibold">ID Reporte:</span> {detalleReporte.id_reporte}</p>
                            <p><span className="font-semibold">Usuario:</span> {detalleReporte.nombre_usuario}</p>
                            <p><span className="font-semibold">Tipo:</span> {detalleReporte.tipo_incidencia}</p>
                            <p><span className="font-semibold">Descripción:</span> {detalleReporte.descripcion}</p>
                            <p><span className="font-semibold">Fecha:</span> {new Date(detalleReporte.fecha_reporte).toLocaleString()}</p>
                            
                            {detalleReporte.estado !== 'resuelto' && (
                                <button
                                    onClick={() => handleMarcarResuelto(detalleReporte.id_reporte)}
                                    className="w-full bg-green-500 text-white py-2 px-4 rounded-lg hover:bg-green-600 transition-colors"
                                >
                                    Marcar como Resuelto
                                </button>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ReportesIncidencia;