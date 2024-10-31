import "./App.css";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "./components/Login";
import SolicitudesPanel from "./components/SolicitudesPanel";
import Desautorizado from "../Desautorizado";
import ProtectRouter from "../ProtectRouter";
import { AuthProvider } from "../AuthContext";
import Solicitud from "./components/Solicitud";
import Usuarios from "./components/Usuarios";
import Novedades from "./components/Novedades";
import ReportesIncidencia from "./components/ReportesIncidencia";
import LogsActividad from "./components/LogsActividad";
import Home from "./components/Home";
import Registro from "./components/Registro";
import DomiciliarioPanel from "./components/DomiciliarioPanel";
import { SocketProvider } from './context/SocketContext';

function App() {
  return (
    <>
     <AuthProvider>
      <SocketProvider>
        <Router>
         
          <Routes>
            <Route path="/" element={<Login />} />
            <Route path="/desautorizado" element={<Desautorizado />} />
            <Route
              path="/solicitudes"
              element={
                <ProtectRouter
                role={[
                    "administrador",
                    "negocio",
                    "domiciliario",
                    "particular",
                  ]}
                >
                  <SolicitudesPanel />
                </ProtectRouter>
              }
            />
            <Route path="/solicitud" element={
              <ProtectRouter
                role={[
                  "administrador",
                  "negocio",
                  "particular",
                ]}
              >
                <Solicitud />
              </ProtectRouter>
            } />
            <Route path="/usuarios" element={
              <ProtectRouter
                role={[
                  "administrador",
                ]}
              >
                <Usuarios />
              </ProtectRouter>
            } />
            <Route path="/novedades" element={
              <ProtectRouter
                role={[
                  "administrador",
                  "domiciliario",
                  "negocio",
                  "particular",
                ]}
              >
                <Novedades />
              </ProtectRouter>
            } />
            <Route path="/reportes" element={
              <ProtectRouter
                role={[
                  "administrador",
                  "negocio",
                  "particular"
                ]}
              >
                <ReportesIncidencia />
              </ProtectRouter>
            } />
            <Route path="/logs" element={
              <ProtectRouter
                role={[
                  "administrador",
                ]}
              >
                <LogsActividad />
              </ProtectRouter>
            } />
            <Route path="/home" element={
              <ProtectRouter
                role={[
                  "administrador",
                  "domiciliario",
                  "negocio",
                  "particular",
                ]}
              >
                <Home />
              </ProtectRouter>
            } />
            <Route path="/registro" element={<Registro />} />
            <Route path="/domiciliario" element={
              <ProtectRouter
                role={[
                  "domiciliario",
                ]}
              >
                <DomiciliarioPanel />
              </ProtectRouter>
            } />
          </Routes>
        </Router>
      </SocketProvider>
      </AuthProvider>
    </>
  );
}

export default App;
