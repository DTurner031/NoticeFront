import { crearUsuario } from "./usuariosService";
import {
  obtenerUsuarioSesion,
  guardarUsuarioSesion,
  eliminarUsuarioSesion,
} from "../storage/authStorage";

export const obtenerSesion = () => obtenerUsuarioSesion();

export const guardarSesion = (usuario) => guardarUsuarioSesion(usuario);

export const cerrarSesion = () => eliminarUsuarioSesion();

export const autenticarUsuario = (usuarios, correo, password) =>
  usuarios.find(
    (usuario) => usuario.correo === correo && usuario.password === password
  );

export const crearUsuarioRegistro = (datosRegistro) =>
  crearUsuario(datosRegistro);
