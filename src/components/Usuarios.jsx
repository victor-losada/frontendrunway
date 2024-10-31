import React, { useState, useEffect } from 'react';
import UseCrud from '../../hook/UseCrud';
import Header from './Header';

const Usuarios = () => {
    const BASEURL = 'http://localhost:3000/users/getUser';
    const BASEURL2 = 'http://localhost:3000/users/getUserByid';
    const BASEURL3 = 'http://localhost:3000/users/patchUser';
    const BASEURL4 = 'http://localhost:3000/users/postUser';
    const BASEURL5 = 'http://localhost:3000/users/putUser';
    const BASEURL6 = 'http://localhost:3000/users/getUserTipeUser';
    const BASEURL7 = 'http://localhost:3000/users/getUserInactivo';
    const BASEURL8 = 'http://localhost:3000/users/patchActivoUser';

    const { getApi, response: usuarios, error, loading } = UseCrud(BASEURL);
    const { getApiById, responseById, error: error2, loading: loading2 } = UseCrud(BASEURL2);
    const { updateApi } = UseCrud(BASEURL3);
    const { postApi } = UseCrud(BASEURL4);
    const { updateApi: putApi } = UseCrud(BASEURL5);
    const { getApiById: getByTipo, response: usuariosPorTipo } = UseCrud(BASEURL6);
    const { getApi: getUsuariosInactivos, response: usuariosInactivos } = UseCrud(BASEURL7);
    const { updateApi: activarUsuario } = UseCrud(BASEURL8);

    const [selectedUsuario, setSelectedUsuario] = useState(null);
    const [searchId, setSearchId] = useState('');
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [editFormData, setEditFormData] = useState(null);
    const [filtroTipo, setFiltroTipo] = useState('todos');
    const [usuariosFiltrados, setUsuariosFiltrados] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [mostrarInactivos, setMostrarInactivos] = useState(false);

    useEffect(() => {
        console.log('Iniciando carga de usuarios');
        getApi();
    }, []);

    useEffect(() => {
        if (filtroTipo === 'todos') {
            getApi();
        } else {
            handleFiltroTipo(filtroTipo);
        }
    }, []);

    useEffect(() => {
        console.log('usuariosPorTipo actualizado:', usuariosPorTipo);
        if (usuariosPorTipo) {
            setUsuariosFiltrados(usuariosPorTipo);
        }
    }, [usuariosPorTipo]);

    useEffect(() => {
        const cargarDatos = async () => {
            if (filtroTipo === 'todos') {
                await getApi();
            } else {
                await handleFiltroTipo(filtroTipo);
            }
        };
        cargarDatos();
    }, [filtroTipo]);

    const handleFiltroTipo = async (tipo) => {
        setFiltroTipo(tipo);
        setMostrarInactivos(false);
        try {
            if (tipo === 'todos') {
                await getApi();
            } else {
                const response = await getByTipo(tipo);
                if (response) {
                    setUsuariosFiltrados(response);
                }
            }
        } catch (error) {
            console.error('Error al filtrar:', error);
        }
    };

    const handleDetailsClick = (usuario) => {
        setSelectedUsuario(usuario);
    };

    const closeDetails = () => {
        setSelectedUsuario(null);
    };

    const handleSearch = async (e) => {
        e.preventDefault();
        if (searchId) {
            try {
                await getApiById(searchId);
            } catch (error) {
                console.error('Error en la búsqueda:', error);
            }
        } else {
            try {
                await getApi();
            } catch (error) {
                console.error('Error al cargar todos los datos:', error);
            }
        }
    };

    const handleEditClick = (usuario) => {
        setEditFormData({
            id_usuario: usuario.id_usuario,
            nombre: usuario.nombre,
            tipo_usuario: usuario.tipo_usuario,
            email: usuario.email,
            telefono: usuario.telefono,
            estado: usuario.estado
        });
        setIsEditModalOpen(true);
    };

    const handleEditSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await putApi(editFormData, `/${editFormData.id_usuario}`);
            if (response) {
                alert('Usuario actualizado correctamente');
                setIsEditModalOpen(false);
                await getApi();
                setEditFormData(null);
            }
        } catch (error) {
            alert('Error al actualizar usuario');
            console.error('Error al actualizar:', error);
        }
    };

    const confirmarDesactivacion = async (id_usuario) => {
        if (!window.confirm('¿Estás seguro de desactivar este usuario?')) return;

        try {
            setIsLoading(true);
            console.log('Iniciando desactivación del usuario:', id_usuario);
            
            const response = await updateApi(null, `/${id_usuario}`);
            
            if (response) {
                console.log('Usuario desactivado exitosamente');
                alert('Usuario desactivado correctamente');
                
                // Recargar datos según el filtro actual
                if (filtroTipo === 'todos') {
                    await getApi();
                } else {
                    await handleFiltroTipo(filtroTipo);
                }
            }
        } catch (error) {
            console.error('Error al desactivar:', error);
            alert('Error al desactivar usuario');
        } finally {
            setIsLoading(false);
        }
    };

    const handleMostrarInactivos = async () => {
        console.log('Toggle mostrar inactivos:', !mostrarInactivos);
        setMostrarInactivos(!mostrarInactivos);
        
        try {
            if (!mostrarInactivos) {
                console.log('Obteniendo usuarios inactivos...');
                await getUsuariosInactivos();
                console.log('Usuarios inactivos cargados:', usuariosInactivos);
            } else {
                console.log('Volviendo a usuarios activos');
                await getApi();
                console.log('Usuarios activos cargados:', usuarios);
            }
        } catch (error) {
            console.error('Error:', error);
        }
    };

    const confirmarActivacion = async (id_usuario) => {
        if (!window.confirm('¿Estás seguro de activar este usuario?')) return;

        try {
            setIsLoading(true);
            console.log('Iniciando activación del usuario:', id_usuario);
            
            const response = await activarUsuario(null, `/${id_usuario}`);
            
            if (response) {
                console.log('Usuario activado exitosamente');
                alert('Usuario activado correctamente');
                
                if (mostrarInactivos) {
                    await getUsuariosInactivos();
                } else {
                    await getApi();
                }
            }
        } catch (error) {
            console.error('Error al activar:', error);
            alert('Error al activar usuario');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <>
            <Header title="Gestión de Usuarios" />
            <h1 className="text-2xl font-bold mb-4 text-center">Gestión de Usuarios</h1>
            
            <div className="mb-4 flex justify-center gap-4">
                <form onSubmit={handleSearch} className="flex gap-2">
                    <input
                        type="text"
                        value={searchId}
                        onChange={(e) => setSearchId(e.target.value)}
                        placeholder="Buscar por ID de usuario"
                        className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <button
                        type="submit"
                        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg"
                    >
                        Buscar
                    </button>
                    {searchId && (
                        <button
                            type="button"
                            onClick={() => {
                                setSearchId('');
                                getApi();
                            }}
                            className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded-lg"
                        >
                            Limpiar
                        </button>
                    )}
                </form>

                <select
                    value={filtroTipo}
                    onChange={(e) => handleFiltroTipo(e.target.value)}
                    className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    disabled={mostrarInactivos}
                >
                    <option value="todos">Todos los tipos</option>
                    <option value="administrador">Administrador</option>
                    <option value="negocio">Negocio</option>
                    <option value="domiciliario">Domiciliario</option>
                    <option value="particular">Particular</option>
                </select>

                <button
                    onClick={handleMostrarInactivos}
                    className={`px-4 py-2 rounded-lg font-semibold ${
                        mostrarInactivos 
                        ? 'bg-red-500 hover:bg-red-700 text-white' 
                        : 'bg-gray-500 hover:bg-gray-700 text-white'
                    }`}
                >
                    {mostrarInactivos ? 'Mostrar Activos' : 'Mostrar Inactivos'}
                </button>
            </div>

            <div className="flex justify-center items-center  bg-gray-100">
                <div className="w-full max-w-4xl bg-white shadow-lg rounded-lg overflow-hidden">
                    <table className="w-full table-auto">
                        <thead className="bg-gray-200 text-gray-700">
                            <tr>
                                <th className="px-4 py-2">ID</th>
                                <th className="px-4 py-2">Nombre</th>
                                <th className="px-4 py-2">Tipo Usuario</th>
                                <th className="px-4 py-2">Email</th>
                                <th className="px-4 py-2">Estado</th>
                                <th className="px-4 py-2">Detalles</th>
                                <th className="px-4 py-2">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="text-gray-600">
                            {console.log('Renderizando con:', {
                                mostrarInactivos,
                                usuariosInactivos,
                                usuarios,
                                filtroTipo
                            })}
                            
                            {searchId ? (
                                responseById && Array.isArray(responseById) && responseById.length > 0 ? (
                                    <tr key={`search-${responseById[0].id_usuario || 'no-id'}`}>
                                        <td className="px-4 py-2 text-center">{responseById[0].id_usuario}</td>
                                        <td className="px-4 py-2">{responseById[0].nombre}</td>
                                        <td className="px-4 py-2">{responseById[0].tipo_usuario}</td>
                                        <td className="px-4 py-2">{responseById[0].email}</td>
                                        <td className="px-4 py-2 text-center">
                                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                                responseById[0].estado === 'activo' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                                            }`}>
                                                {responseById[0].estado}
                                            </span>
                                        </td>
                                        <td className="px-4 py-2 text-center">
                                            <button 
                                                className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-1 px-2 rounded text-xs"
                                                onClick={() => handleDetailsClick(responseById[0])}
                                            >
                                                Ver detalles
                                            </button>
                                        </td>
                                        <td className="px-4 py-2 text-center">
                                            <button 
                                                key={`edit-${responseById[0].id_usuario}`}
                                                className="bg-yellow-500 hover:bg-yellow-700 text-white font-bold py-1 px-2 rounded text-xs mr-2"
                                                onClick={() => handleEditClick(responseById[0])}
                                            >
                                                Editar
                                            </button>
                                            {responseById[0].estado === 'activo' ? (
                                                <button 
                                                    key={`deactivate-${responseById[0].id_usuario}`}
                                                    className="bg-red-500 hover:bg-red-700 text-white font-bold py-1 px-2 rounded text-xs"
                                                    onClick={() => confirmarDesactivacion(responseById[0].id_usuario)}
                                                    disabled={isLoading}
                                                >
                                                    {isLoading ? 'Procesando...' : 'Desactivar'}
                                                </button>
                                            ) : (
                                                <button 
                                                    key={`activate-${responseById[0].id_usuario}`}
                                                    className="bg-green-500 hover:bg-green-700 text-white font-bold py-1 px-2 rounded text-xs"
                                                    onClick={() => confirmarActivacion(responseById[0].id_usuario)}
                                                    disabled={isLoading}
                                                >
                                                    {isLoading ? 'Procesando...' : 'Activar'}
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                ) : (
                                    <tr key="no-results-search">
                                        <td colSpan="7" className="px-4 py-2 text-center">
                                            No se encontró ningún usuario con ese ID
                                        </td>
                                    </tr>
                                )
                            ) : (
                                <>
                                    {mostrarInactivos 
                                        ? usuariosInactivos?.map((usuario, index) => (
                                            <tr key={`inactivo-${usuario.id_usuario || index}`}>
                                                <td className="px-4 py-2 text-center">{usuario.id_usuario}</td>
                                                <td className="px-4 py-2">{usuario.nombre}</td>
                                                <td className="px-4 py-2">{usuario.tipo_usuario}</td>
                                                <td className="px-4 py-2">{usuario.email}</td>
                                                <td className="px-4 py-2 text-center">
                                                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">
                                                        {usuario.estado}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-2 text-center">
                                                    <button 
                                                        onClick={() => handleDetailsClick(usuario)}
                                                        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-1 px-2 rounded text-xs"
                                                    >
                                                        Ver detalles
                                                    </button>
                                                </td>
                                                <td className="px-4 py-2 text-center">
                                                    <button 
                                                        onClick={() => handleEditClick(usuario)}
                                                        className="bg-yellow-500 hover:bg-yellow-700 text-white font-bold py-1 px-2 rounded text-xs mr-2"
                                                    >
                                                        Editar
                                                    </button>
                                                    <button 
                                                        onClick={() => confirmarActivacion(usuario.id_usuario)}
                                                        disabled={isLoading}
                                                        className="bg-green-500 hover:bg-green-700 text-white font-bold py-1 px-2 rounded text-xs"
                                                    >
                                                        {isLoading ? 'Procesando...' : 'Activar'}
                                                    </button>
                                                </td>
                                            </tr>
                                        ))
                                        : (filtroTipo === 'todos' ? usuarios : usuariosFiltrados)?.map((usuario, index) => (
                                            <tr key={`usuario-${usuario.id_usuario || index}-${usuario.estado || 'estado-desconocido'}`}>
                                                <td className="px-4 py-2 text-center">{usuario.id_usuario}</td>
                                                <td className="px-4 py-2">{usuario.nombre}</td>
                                                <td className="px-4 py-2">{usuario.tipo_usuario}</td>
                                                <td className="px-4 py-2">{usuario.email}</td>
                                                <td className="px-4 py-2 text-center">
                                                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                                        usuario.estado === 'activo' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                                                    }`}>
                                                        {usuario.estado || 'N/A'}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-2 text-center">
                                                    <button 
                                                        onClick={() => handleDetailsClick(usuario)}
                                                        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-1 px-2 rounded text-xs"
                                                    >
                                                        Ver detalles
                                                    </button>
                                                </td>
                                                <td className="px-4 py-2 text-center">
                                                    <button 
                                                        onClick={() => handleEditClick(usuario)}
                                                        className="bg-yellow-500 hover:bg-yellow-700 text-white font-bold py-1 px-2 rounded text-xs mr-2"
                                                    >
                                                        Editar
                                                    </button>
                                                    {usuario.estado === 'activo' ? (
                                                        <button 
                                                            onClick={() => confirmarDesactivacion(usuario.id_usuario)}
                                                            disabled={isLoading}
                                                            className="bg-red-500 hover:bg-red-700 text-white font-bold py-1 px-2 rounded text-xs"
                                                        >
                                                            {isLoading ? 'Procesando...' : 'Desactivar'}
                                                        </button>
                                                    ) : (
                                                        <button 
                                                            onClick={() => confirmarActivacion(usuario.id_usuario)}
                                                            disabled={isLoading}
                                                            className="bg-green-500 hover:bg-green-700 text-white font-bold py-1 px-2 rounded text-xs"
                                                        >
                                                            {isLoading ? 'Procesando...' : 'Activar'}
                                                        </button>
                                                    )}
                                                </td>
                                            </tr>
                                        ))}
                                    
                                    {((mostrarInactivos && (!usuariosInactivos || usuariosInactivos.length === 0)) ||
                                      (!mostrarInactivos && (!usuarios || usuarios.length === 0))) && (
                                        <tr key="no-data">
                                            <td colSpan="7" className="px-4 py-2 text-center">
                                                {loading 
                                                    ? 'Cargando...' 
                                                    : `No hay usuarios ${mostrarInactivos ? 'inactivos' : ''} para mostrar`
                                                }
                                            </td>
                                        </tr>
                                    )}
                                </>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Modal de Detalles */}
            {selectedUsuario && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
                    <div className="bg-white rounded-lg p-6 w-11/12 max-w-2xl max-h-[80vh] overflow-y-auto">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-xl font-bold text-center w-full">Detalles del Usuario</h2>
                            <button 
                                onClick={closeDetails}
                                className="text-gray-500 hover:text-gray-700 text-2xl font-bold"
                            >
                                &times;
                            </button>
                        </div>
                        <div className="space-y-3">
                            <p className="text-gray-700"><span className="font-semibold">ID:</span> {selectedUsuario.id_usuario}</p>
                            <p className="text-gray-700"><span className="font-semibold">Nombre:</span> {selectedUsuario.nombre}</p>
                            <p className="text-gray-700"><span className="font-semibold">Tipo Usuario:</span> {selectedUsuario.tipo_usuario}</p>
                            <p className="text-gray-700"><span className="font-semibold">Email:</span> {selectedUsuario.email}</p>
                            <p className="text-gray-700"><span className="font-semibold">Teléfono:</span> {selectedUsuario.telefono}</p>
                            <p className="text-gray-700"><span className="font-semibold">Estado:</span> {selectedUsuario.estado}</p>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal de Edición */}
            {isEditModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
                    <div className="bg-white rounded-lg p-6 w-11/12 max-w-2xl">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-xl font-bold">Editar Usuario</h2>
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
                                    Nombre
                                </label>
                                <input
                                    type="text"
                                    value={editFormData?.nombre || ''}
                                    onChange={(e) => setEditFormData({
                                        ...editFormData,
                                        nombre: e.target.value
                                    })}
                                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                            <div>
                                <label className="block text-gray-700 text-sm font-bold mb-2">
                                    Tipo Usuario
                                </label>
                                <select
                                    value={editFormData?.tipo_usuario || ''}
                                    onChange={(e) => setEditFormData({
                                        ...editFormData,
                                        tipo_usuario: e.target.value
                                    })}
                                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                >
                                    <option value="administrador">Administrador</option>
                                    <option value="negocio">Negocio</option>
                                    <option value="domiciliario">Domiciliario</option>
                                    <option value="particular">Particular</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-gray-700 text-sm font-bold mb-2">
                                    Email
                                </label>
                                <input
                                    type="email"
                                    value={editFormData?.email || ''}
                                    onChange={(e) => setEditFormData({
                                        ...editFormData,
                                        email: e.target.value
                                    })}
                                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                            <div>
                                <label className="block text-gray-700 text-sm font-bold mb-2">
                                    Teléfono
                                </label>
                                <input
                                    type="text"
                                    value={editFormData?.telefono || ''}
                                    onChange={(e) => setEditFormData({
                                        ...editFormData,
                                        telefono: e.target.value
                                    })}
                                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                            <div className="flex justify-end gap-2">
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

export default Usuarios;