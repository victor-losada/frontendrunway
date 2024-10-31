import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from './AuthContext';

const ProtectRouter = ({ children, role}) => {
  const { auth } = useAuth();

  if (!auth.isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  if (role && !role.includes(auth.user.tipo_usuario)) {
    return <Navigate to="/desautorizado" replace />;
  }

  return children;
};


export default ProtectRouter;