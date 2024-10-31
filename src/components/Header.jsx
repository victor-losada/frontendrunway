import React, { useState, useEffect } from 'react';
import { FaBell, FaCog, FaSignOutAlt } from 'react-icons/fa';
import { useAuth } from '../../AuthContext';
import { useSocket } from '../context/SocketContext';

const Header = ({ title = "Panel de Control" }) => {
  const { auth, logout } = useAuth();
  const { socket } = useSocket();
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (socket && auth?.user) {
      console.log('Socket configurado para usuario:', auth.user);
      
      const handlePedidoAsignado = (data) => {
        console.log('Notificación recibida:', data);
        const newNotification = {
          id: Date.now(),
          ...data,
          timestamp: new Date(),
          read: false,
          type: 'pedido'
        };
        setNotifications(prev => [newNotification, ...prev]);
        setUnreadCount(prev => prev + 1);
      };

      socket.on('pedidoAsignado', handlePedidoAsignado);
      
      // Agregar listener para todos los eventos (debugging)
      socket.onAny((eventName, ...args) => {
        console.log('Evento Socket.IO recibido:', eventName, args);
      });

      return () => {
        socket.off('pedidoAsignado');
        socket.offAny();
      };
    }
  }, [socket, auth]);

  const handleNotificationClick = () => {
    setShowNotifications(!showNotifications);
    if (!showNotifications) {
      setUnreadCount(0);
      setNotifications(prev => prev.map(notif => ({ ...notif, read: true })));
    }
  };

  const formatTimestamp = (timestamp) => {
    return new Date(timestamp).toLocaleString('es-ES', {
      hour: '2-digit',
      minute: '2-digit',
      day: '2-digit',
      month: '2-digit'
    });
  };

  const renderNotificationContent = (notification) => {
    switch (notification.type) {
      case 'pedido':
        return (
          <>
            <p className="text-sm font-medium text-gray-800">{notification.message}</p>
            {notification.direccion_recogida && (
              <p className="text-xs text-gray-600 mt-1">
                Recogida: {notification.direccion_recogida}
              </p>
            )}
            {notification.direccion_entrega && (
              <p className="text-xs text-gray-600">
                Entrega: {notification.direccion_entrega}
              </p>
            )}
          </>
        );
      case 'novedad':
        return (
          <p className="text-sm font-medium text-gray-800">{notification.message}</p>
        );
      default:
        return null;
    }
  };

  return (
    <header className="bg-slate-300 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
          <div className="flex items-center gap-4">
            <div className="relative">
              <button 
                className="p-2 rounded-full hover:bg-gray-500 relative"
                onClick={handleNotificationClick}
              >
                <FaBell className="w-5 h-5 text-gray-600" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    {unreadCount}
                  </span>
                )}
              </button>

              {showNotifications && (
                <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg z-50 max-h-96 overflow-y-auto">
                  <div className="p-3 border-b border-gray-200">
                    <h3 className="text-lg font-semibold text-gray-800">Notificaciones</h3>
                  </div>
                  <div className="divide-y divide-gray-200">
                    {notifications.length > 0 ? (
                      notifications.map(notification => (
                        <div 
                          key={notification.id}
                          className={`p-3 hover:bg-gray-50 ${!notification.read ? 'bg-blue-50' : ''}`}
                        >
                          {renderNotificationContent(notification)}
                          <p className="text-xs text-gray-400 mt-2">
                            {formatTimestamp(notification.timestamp)}
                          </p>
                        </div>
                      ))
                    ) : (
                      <div className="p-4 text-center text-gray-500">
                        No hay notificaciones
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
            <button className="p-2 rounded-full hover:bg-gray-100">
              <FaCog className="w-5 h-5 text-gray-600" />
            </button>
            <div className="flex items-center gap-3 pl-4 border-l">
              <span className="text-sm font-medium text-gray-700">
                {auth?.user?.nombre || 'Usuario'}
              </span>
              <button 
                onClick={logout}
                className="p-2 rounded-full hover:bg-gray-100 text-red-500"
              >
                <FaSignOutAlt className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header; 