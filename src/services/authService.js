import { post } from "../api/apiClient";
import { ENDPOINTS } from "../api/endpoints";
import { setAuthToken, clearAuthToken } from "../api/authToken";
import {
  obtenerUsuarioSesion,
  guardarUsuarioSesion,
  eliminarUsuarioSesion,
} from "../storage/authStorage";

// Convierte la respuesta del backend (LoginResponseDto) a la forma que espera el resto del frontend
const mapAuthResponseToUser = (respuesta) => ({
  id: respuesta.idUsuario,
  nombre: respuesta.nombre,
  correo: respuesta.correo,
  idRol: respuesta.idRol,
  rol: respuesta.rolNombre, // ej. "Administrador", "Docente", "Alumno"
  estado: "activo",
});

export const obtenerSesion = () => obtenerUsuarioSesion();

export const guardarSesion = (usuario) => guardarUsuarioSesion(usuario);

export const cerrarSesion = () => {
  clearAuthToken();
  eliminarUsuarioSesion();
};

// Llama al backend real. Lanza ApiError si las credenciales son incorrectas.
export const autenticarUsuario = async (correo, contrasena) => {
  const respuesta = await post(ENDPOINTS.auth.login, { correo, contrasena });
  setAuthToken(respuesta.token);
  return mapAuthResponseToUser(respuesta);
};

// Registro público: siempre crea al usuario como Alumno (el backend lo decide, no el frontend)
export const registrarUsuario = async ({ nombre, boleta, correo, password }) => {
  const respuesta = await post(ENDPOINTS.auth.register, {
    nombre,
    noIdentificacion: Number(boleta),
    correo,
    contrasena: password,
  });
  setAuthToken(respuesta.token);
  return mapAuthResponseToUser(respuesta);
};
