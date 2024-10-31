import React, { useState, useEffect } from "react";
import UseCrud from "../../hook/UseCrud";
import { Link } from "react-router-dom";
import Header from "./Header";
import { useAuth } from '../../AuthContext';

const Solicitudes = () => {
    const BASEURL = 'http://localhost:3000/solicitudes/getSolicitudes';
    const BASEURL2 = 'http://localhost:3000/solicitudes/getSolicitud';
    const BASEURL3 = 'http://localhost:3000/solicitudes/patchSolicitud';
    const BASEURL4 = 'http://localhost:3000/domiciliarios/getDomiciliarios';
    const BASEURL5 = 'http://localhost:3000/solicitudes/patchEstadoSolicitud';
    const BASEURL6 = 'http://localhost:3000/solicitudes/getSolicitudesByUsuario';
    const BASEURL7 = 'http://localhost:3000/solicitudes/patchCancelarSolicitud';
    
    const { auth } = useAuth();
    const [tipoUsuario] = useState(auth.user?.tipo_usuario);

    const { getApi, response, error, loading } = UseCrud(BASEURL);
    const { 
        getApiById, 
        responseById,
        error: error2, 
        loading: loading2 
    } = UseCrud(BASEURL2);
    const [selectedSolicitud, setSelectedSolicitud] = useState(null); 
    const [searchId, setSearchId] = useState('');
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [editFormData, setEditFormData] = useState(null);
    const [domiciliariosDisponibles, setDomiciliariosDisponibles] = useState([]);
    const { getApi: getDomiciliarios, response: responseDomiciliarios } = UseCrud(BASEURL4);
    const { 
        updateApi, 
        error: errorUpdate, 
        loading: loadingUpdate 
    } = UseCrud(BASEURL3);
    const { updateApi: updateEstado } = UseCrud(BASEURL5);
    const { updateApi: cancelarSolicitud } = UseCrud(BASEURL7);
    const { 
        getApiById: getSolicitudesUsuario, 
        responseById: responseSolicitudesUsuario 
    } = UseCrud(BASEURL6);

    React.useEffect(() => {
        if (['particular', 'negocio'].includes(tipoUsuario)) {
            console.log('Auth context:', auth);
            console.log('Usuario:', auth.user);
            console.log('ID Usuario:', auth.user?.id_usuario);
            
            if (auth.user?.id_usuario) {
                console.log('URL de solicitud:', `${BASEURL6}/${auth.user.id_usuario}`);
                getSolicitudesUsuario(`/${auth.user.id_usuario}`);
            } else {
                console.error('No se encontró el ID del usuario');
            }
        } else {
            getApi();
        }
    }, [auth.user]);

    useEffect(() => {
        if (isEditModalOpen) {
            getDomiciliarios();
        }
    }, [isEditModalOpen]);

    useEffect(() => {
        if (responseDomiciliarios) {
            setDomiciliariosDisponibles(responseDomiciliarios);
        }
    }, [responseDomiciliarios]);

    const handleDetailsClick = (solicitud) => {
        setSelectedSolicitud(solicitud);
    };

    const closeDetails = () => {
        setSelectedSolicitud(null);
    };

    const handleSearch = async (e) => {
        e.preventDefault();
        try {
            if (searchId) {
                console.log('Buscando solicitud con ID:', searchId);
                console.log('URL de consulta:', `${BASEURL2}/${searchId}`);
                
                const result = await getApiById(`/${searchId}`);
                console.log('Resultado de la búsqueda:', result);
                
                if (!result) {
                    console.log('No se encontró la solicitud');
                }
            } else {
                console.log('Cargando todas las solicitudes');
                await getApi();
            }
        } catch (error) {
            console.error('Error en la búsqueda:', error);
            if (error.response?.status !== 401) {
                alert('Error al realizar la búsqueda');
            }
        }
    };

    const handleEditClick = (solicitud) => {
        setEditFormData({
            id_solicitud: solicitud.id_solicitud,
            id_cliente: solicitud.id_cliente,
            cliente_nombre: solicitud.cliente_nombre,
            id_domiciliario: solicitud.id_domiciliario,
            direccion_recogida: solicitud.direccion_recogida,
            direccion_entrega: solicitud.direccion_entrega,
            fecha_hora: solicitud.fecha_hora,
            estado: solicitud.estado,
        });
        setIsEditModalOpen(true);
    };

    const handleEditSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editFormData.estado === 'completado') {
                const response = await updateEstado(
                    { estado: editFormData.estado },
                    `/${editFormData.id_solicitud}`
                );
                
                if (response) {
                    setIsEditModalOpen(false);
                    if (searchId) {
                        await getApiById(`/${searchId}`);
                    } else {
                        await getApi();
                    }
                }
            } else {
                const dataToUpdate = {
                    direccion_recogida: editFormData.direccion_recogida,
                    direccion_entrega: editFormData.direccion_entrega,
                    estado: editFormData.estado,
                    id_domiciliario: editFormData.id_domiciliario
                };
                
                const response = await updateApi(dataToUpdate, `/${editFormData.id_solicitud}`);
                
                if (response) {
                    setIsEditModalOpen(false);
                    if (searchId) {
                        await getApiById(`/${searchId}`);
                    } else {
                        await getApi();
                    }
                }
            }
        } catch (error) {
            console.error('Error al actualizar:', error);
        }
    };

    const handleCancelarSolicitud = async (id_solicitud) => {
        try {
            console.log('Iniciando cancelación de solicitud...');
            console.log('ID de solicitud a cancelar:', id_solicitud);
            console.log('URL de cancelación:', `${BASEURL7}/${id_solicitud}`);

           
            if (window.confirm('¿Está seguro que desea cancelar esta solicitud?')) {
                const response = await cancelarSolicitud(
                    { estado: 'cancelado' }, // Enviar el nuevo estado
                    `/${id_solicitud}`
                );
                
                console.log('Respuesta de cancelación:', response);
                
                if (response) {
                    console.log('Solicitud cancelada exitosamente');
                    if (auth.user?.id_usuario) {
                        await getSolicitudesUsuario(`/${auth.user.id_usuario}`);
                    }
                    alert('Solicitud cancelada exitosamente');
                }
            }
        } catch (error) {
            console.error('Error detallado al cancelar la solicitud:', error);
            alert('Error al cancelar la solicitud');
        }
    };

    return (
        <>
            <Header title="Pedidos" />
            <h1 className="text-2xl font-bold mb-4 text-center">Pedidos</h1>
            <div>
                <div className="flex justify-end mb-4 mr-4">
                    <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg">
                        <Link to="/solicitud">Crear Solicitud</Link>
                    </button>
                </div>
            </div>
            {(['administrador'].includes(tipoUsuario)) && (
                <div className="mb-4 flex justify-center">
                    <form onSubmit={handleSearch} className="flex gap-2">
                        <input
                            type="text"
                            value={searchId}
                            onChange={(e) => setSearchId(e.target.value)}
                            placeholder="Buscar por ID de solicitud"
                            className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        <button
                            type="submit"
                            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg"
                            disabled={loading2}
                        >
                            {loading2 ? 'Buscando...' : 'Buscar'}
                        </button>
                        {searchId && (
                            <button
                                type="button"
                                onClick={(e) => {
                                    e.preventDefault();
                                    setSearchId('');
                                    getApi();
                                }}
                                className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded-lg"
                            >
                                Limpiar
                            </button>
                        )}
                    </form>
                </div>
            )}

            {loading2 && <p className="text-center">Buscando...</p>}
            {error2 && <p className="text-center text-red-500">Error: Usuario no encontrado</p>}
            
            <div className="flex justify-center items-center  bg-gray-100">
                <div className="w-full max-w-4xl bg-white shadow-lg rounded-lg overflow-hidden">
                    <table className="w-full table-auto">
                        <thead className="bg-gray-200 text-gray-700">
                            <tr>
                                <th className="px-4 py-2">ID</th>
                                <th className="px-4 py-2">Dirección recogida</th>
                                <th className="px-4 py-2">Dirección entrega</th>
                                <th className="px-4 py-2">Fecha</th>
                                <th className="px-4 py-2">Estado</th>
                                <th className="px-4 py-2">Detalles</th>
                                <th className="px-4 py-2">Acciones</th>

                            </tr>
                        </thead>
                        <tbody className="text-gray-600">
                            {searchId && responseById ? (
                                Array.isArray(responseById) ? 
                                    responseById.map((solicitud, index) => (
                                        <tr key={solicitud.id_solicitud || index} className="border-b hover:bg-gray-50">
                                            <td className="px-4 py-2 text-center">{solicitud.id_solicitud}</td>
                                            <td className="px-4 py-2">{solicitud.direccion_recogida}</td>
                                            <td className="px-4 py-2">{solicitud.direccion_entrega}</td>
                                            <td className="px-4 py-2 text-center">{new Date(solicitud.fecha_hora).toLocaleDateString()}</td>
                                            <td className="px-4 py-2 text-center">
                                                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                                    solicitud.estado === 'completado' ? 'bg-green-100 text-green-800' :
                                                    solicitud.estado === 'en curso' ? 'bg-yellow-100 text-yellow-800' :
                                                    'bg-red-100 text-red-800'
                                                }`}>
                                                    {solicitud.estado}
                                                </span>
                                            </td>
                                            <td className="px-4 py-2 text-center">
                                                <button 
                                                    className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-1 px-2 rounded text-xs"
                                                    onClick={() => handleDetailsClick(solicitud)}
                                                >
                                                    Ver detalles
                                                </button>
                                            </td>
                                            <td className="px-4 py-2 text-center">
                                                <div className="flex gap-2 justify-center">
                                                    {!['particular', 'negocio'].includes(tipoUsuario) && (
                                                        <button 
                                                            className="bg-yellow-500 hover:bg-yellow-700 text-white font-bold py-1 px-2 rounded text-xs"
                                                            onClick={() => handleEditClick(solicitud)}
                                                        >
                                                            Editar
                                                        </button>
                                                    )}
                                                    {(['particular', 'negocio'].includes(tipoUsuario)) && (
                                                        <button 
                                                            className={`
                                                                bg-red-500 hover:bg-red-700 
                                                                text-white font-bold py-1 px-2 
                                                                rounded text-xs
                                                                ${(solicitud.estado === 'cancelado' || solicitud.estado === 'completado') 
                                                                    ? 'opacity-50 cursor-not-allowed' 
                                                                    : ''
                                                                }
                                                            `}
                                                            onClick={() => handleCancelarSolicitud(solicitud.id_solicitud)}
                                                            disabled={solicitud.estado === 'cancelado' || solicitud.estado === 'completado'}
                                                        >
                                                            Cancelar
                                                        </button>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    )) : 
                                    [responseById].map((solicitud, index) => (
                                        <tr key={solicitud.id_solicitud || index} className="border-b hover:bg-gray-50">
                                            <td className="px-4 py-2 text-center">{solicitud.id_solicitud}</td>
                                            <td className="px-4 py-2">{solicitud.direccion_recogida}</td>
                                            <td className="px-4 py-2">{solicitud.direccion_entrega}</td>
                                            <td className="px-4 py-2 text-center">{new Date(solicitud.fecha_hora).toLocaleDateString()}</td>
                                            <td className="px-4 py-2 text-center">
                                                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                                    solicitud.estado === 'completado' ? 'bg-green-100 text-green-800' :
                                                    solicitud.estado === 'en curso' ? 'bg-yellow-100 text-yellow-800' :
                                                    'bg-red-100 text-red-800'
                                                }`}>
                                                    {solicitud.estado}
                                                </span>
                                            </td>
                                            <td className="px-4 py-2 text-center">
                                                <button 
                                                    className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-1 px-2 rounded text-xs"
                                                    onClick={() => handleDetailsClick(solicitud)}
                                                >
                                                    Ver detalles
                                                </button>
                                            </td>
                                            <td className="px-4 py-2 text-center">
                                                <div className="flex gap-2 justify-center">
                                                    {!['particular', 'negocio'].includes(tipoUsuario) && (
                                                        <button 
                                                            className="bg-yellow-500 hover:bg-yellow-700 text-white font-bold py-1 px-2 rounded text-xs"
                                                            onClick={() => handleEditClick(solicitud)}
                                                        >
                                                            Editar
                                                        </button>
                                                    )}
                                                    {(['particular', 'negocio'].includes(tipoUsuario)) && (
                                                        <button 
                                                            className={`
                                                                bg-red-500 hover:bg-red-700 
                                                                text-white font-bold py-1 px-2 
                                                                rounded text-xs
                                                                ${(solicitud.estado === 'cancelado' || solicitud.estado === 'completado') 
                                                                    ? 'opacity-50 cursor-not-allowed' 
                                                                    : ''
                                                                }
                                                            `}
                                                            onClick={() => handleCancelarSolicitud(solicitud.id_solicitud)}
                                                            disabled={solicitud.estado === 'cancelado' || solicitud.estado === 'completado'}
                                                        >
                                                            Cancelar
                                                        </button>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                            ) : (
                                (['particular', 'negocio'].includes(tipoUsuario) 
                                    ? responseSolicitudesUsuario 
                                    : response
                                )?.map((solicitud, index) => (
                                    <tr key={solicitud.id_solicitud || index} className="border-b hover:bg-gray-50">
                                        <td className="px-4 py-2 text-center">{solicitud.id_solicitud}</td>
                                        <td className="px-4 py-2">{solicitud.direccion_recogida}</td>
                                        <td className="px-4 py-2">{solicitud.direccion_entrega}</td>
                                        <td className="px-4 py-2 text-center">{new Date(solicitud.fecha_hora).toLocaleDateString()}</td>
                                        <td className="px-4 py-2 text-center">
                                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                                solicitud.estado === 'completado' ? 'bg-green-100 text-green-800' :
                                                solicitud.estado === 'en curso' ? 'bg-yellow-100 text-yellow-800' :
                                                'bg-red-100 text-red-800'
                                            }`}>
                                                {solicitud.estado}
                                            </span>
                                        </td>
                                        <td className="px-4 py-2 text-center">
                                            <button 
                                                className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-1 px-2 rounded text-xs"
                                                onClick={() => handleDetailsClick(solicitud)}
                                            >
                                                Ver detalles
                                            </button>
                                        </td>
                                        <td className="px-4 py-2 text-center">
                                            <div className="flex gap-2 justify-center">
                                                {!['particular', 'negocio'].includes(tipoUsuario) && (
                                                    <button 
                                                        className="bg-yellow-500 hover:bg-yellow-700 text-white font-bold py-1 px-2 rounded text-xs"
                                                        onClick={() => handleEditClick(solicitud)}
                                                    >
                                                        Editar
                                                    </button>
                                                )}
                                                {(['particular', 'negocio'].includes(tipoUsuario)) && (
                                                    <button 
                                                        className={`
                                                            bg-red-500 hover:bg-red-700 
                                                            text-white font-bold py-1 px-2 
                                                            rounded text-xs
                                                            ${(solicitud.estado === 'cancelado' || solicitud.estado === 'completado') 
                                                                ? 'opacity-50 cursor-not-allowed' 
                                                                : ''
                                                            }
                                                        `}
                                                        onClick={() => handleCancelarSolicitud(solicitud.id_solicitud)}
                                                        disabled={solicitud.estado === 'cancelado' || solicitud.estado === 'completado'}
                                                    >
                                                        Cancelar
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {selectedSolicitud && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
                    <div className="bg-white rounded-lg p-6 w-11/12 max-w-2xl max-h-[80vh] overflow-y-auto">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-xl font-bold text-center w-full">Detalles de la Solicitud</h2>
                            <button 
                                onClick={closeDetails}
                                className="text-gray-500 hover:text-gray-700 text-2xl font-bold"
                            >
                                &times;
                            </button>
                        </div>
                        <div className="space-y-3">
                            <p className="text-gray-700">
                                <span className="font-semibold">ID Solicitud:</span> {selectedSolicitud.id_solicitud}
                            </p>
                            {!['particular', 'negocio'].includes(tipoUsuario) && (
                                <>
                                    <p className="text-gray-700">
                                        <span className="font-semibold">ID Cliente:</span> {selectedSolicitud.id_cliente}
                                    </p>
                                    <p className="text-gray-700">
                                        <span className="font-semibold">Cliente:</span> {selectedSolicitud.cliente_nombre}
                                    </p>
                                </>
                            )}
                            <p className="text-gray-700">
                                <span className="font-semibold">Domiciliario:</span> {
                                    selectedSolicitud.estado === 'pendiente' ? 
                                    'No asignado' : 
                                    (selectedSolicitud.domiciliario_nombre || 'Juan Manuel')
                                }
                            </p>
                            <p className="text-gray-700">
                                <span className="font-semibold">Dirección de recogida:</span> {selectedSolicitud.direccion_recogida}
                            </p>
                            <p className="text-gray-700">
                                <span className="font-semibold">Dirección de entrega:</span> {selectedSolicitud.direccion_entrega}
                            </p>
                            <p className="text-gray-700">
                                <span className="font-semibold">Fecha y Hora:</span> {
                                    selectedSolicitud.fecha_hora ? 
                                    new Date(selectedSolicitud.fecha_hora).toLocaleString('es-ES', {
                                        year: 'numeric',
                                        month: '2-digit',
                                        day: '2-digit',
                                        hour: '2-digit',
                                        minute: '2-digit',
                                        second: '2-digit'
                                    }) : 'N/A'
                                }
                            </p>
                            <p className="text-gray-700">
                                <span className="font-semibold">Estado:</span> {selectedSolicitud.estado}
                            </p>
                        </div>
                    </div>
                </div>
            )}

            {isEditModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
                    <div className="bg-white rounded-lg p-6 w-11/12 max-w-2xl max-h-[80vh] overflow-y-auto">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-xl font-bold">Editar Solicitud</h2>
                            <button 
                                onClick={() => setIsEditModalOpen(false)}
                                className="text-gray-500 hover:text-gray-700 text-2xl font-bold"
                            >
                                &times;
                            </button>
                        </div>
                        <form onSubmit={handleEditSubmit} className="space-y-4">
                            <div>
                                <label className="block text-gray-700 text-sm font-bold mb-2">
                                    ID Solicitud
                                </label>
                                <input
                                    type="text"
                                    value={editFormData?.id_solicitud || ''}
                                    disabled
                                    className="w-full px-3 py-2 border rounded-lg bg-gray-100"
                                />
                            </div>
                            <div>
                                <label className="block text-gray-700 text-sm font-bold mb-2">
                                    Nombre Cliente
                                </label>
                                <input
                                    type="text"
                                    value={editFormData?.cliente_nombre || ''}
                                    disabled
                                    className="w-full px-3 py-2 border rounded-lg bg-gray-100"
                                />
                            </div>
                            <div>
                                <label className="block text-gray-700 text-sm font-bold mb-2">
                                    Fecha y Hora
                                </label>
                                <input
                                    type="text"
                                    value={editFormData?.fecha_hora ? new Date(editFormData.fecha_hora).toLocaleString('es-ES', {
                                        year: 'numeric',
                                        month: '2-digit',
                                        day: '2-digit',
                                        hour: '2-digit',
                                        minute: '2-digit',
                                        second: '2-digit'
                                    }) : ''}
                                    disabled
                                    className="w-full px-3 py-2 border rounded-lg bg-gray-100"
                                />
                            </div>
                            <div>
                                <label className="block text-gray-700 text-sm font-bold mb-2">
                                    Dirección de Recogida
                                </label>
                                <input
                                    type="text"
                                    value={editFormData?.direccion_recogida || ''}
                                    onChange={(e) => setEditFormData({
                                        ...editFormData,
                                        direccion_recogida: e.target.value
                                    })}
                                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                            <div>
                                <label className="block text-gray-700 text-sm font-bold mb-2">
                                    Dirección de Entrega
                                </label>
                                <input
                                    type="text"
                                    value={editFormData?.direccion_entrega || ''}
                                    onChange={(e) => setEditFormData({
                                        ...editFormData,
                                        direccion_entrega: e.target.value
                                    })}
                                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                            <div>
                                <label className="block text-gray-700 text-sm font-bold mb-2">
                                    Estado
                                </label>
                                <select
                                    value={editFormData?.estado || ''}
                                    onChange={(e) => setEditFormData({
                                        ...editFormData,
                                        estado: e.target.value
                                    })}
                                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                >
                                    <option value="en curso">En curso</option>
                                    <option value="completado">Completado</option>
                                    <option value="cancelado">Cancelado</option>
                                    <option value="para reasignar">Para reasignar</option>
                                    <option value="asignado">Asignado</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-gray-700 text-sm font-bold mb-2">
                                    Domiciliario
                                </label>
                                <select
                                    value={editFormData?.id_domiciliario || ''}
                                    onChange={(e) => setEditFormData({
                                        ...editFormData,
                                        id_domiciliario: e.target.value
                                    })}
                                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                >
                                    <option value={editFormData?.id_domiciliario}>
                                        {editFormData?.domiciliario_nombre || 'Seleccionar domiciliario'}
                                    </option>
                                    {Array.isArray(domiciliariosDisponibles) && domiciliariosDisponibles.map(domiciliario => (
                                        <option 
                                            key={domiciliario.id_domiciliario} 
                                            value={domiciliario.id_domiciliario}
                                        >
                                            {domiciliario.nombre}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div className="flex justify-end gap-2 mt-6">
                                <button
                                    type="button"
                                    onClick={() => setIsEditModalOpen(false)}
                                    className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded"
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
                                >
                                    Guardar Cambios
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </>
    );
};

export default Solicitudes;
