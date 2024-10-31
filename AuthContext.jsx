import { createContext, useContext, useState } from "react";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [auth, setAuth] = useState({
    isAuthenticated: false,
    user: null,
    token: null,
  });

  const login = (user, token) => {
    setAuth({
      isAuthenticated: true,
      user,
      token,
    });
    localStorage.setItem("token", token);
  };

  const logout = () => {
    setAuth({
      isAuthenticated: false, 
      user: null,
      token: null,
    });
    localStorage.removeItem("token");
  };

  return (
    <AuthContext.Provider value={{ auth, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  return useContext(AuthContext);
};

