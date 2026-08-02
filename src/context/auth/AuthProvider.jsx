import { useCallback, useEffect, useMemo, useState } from "react";

import { useUsuarios } from "../usuarios/useUsuarios";
import {
  autenticarUsuario,
  crearUsuarioRegistro,
  obtenerSesion,
  guardarSesion,
  cerrarSesion,
} from "../../services/authService";
import { existeCorreo } from "../../services/usuariosService";
import { hasRole, canAccessAdmin } from "../../utils/permissions";
import { normalizeSubscriptions } from "../../constants/subscriptions";
import { normalizeAcademicProfile } from "../../utils/academicProfile";
import { AuthContext } from "./AuthContext";

export const AuthProvider = ({ children }) => {
  const { agregarUsuario, editarUsuario, usuarios } = useUsuarios();

  const [user, setUser] = useState(() => {
    const storedUser = obtenerSesion();

    return storedUser
      ? {
          ...storedUser,
          subscriptions: normalizeSubscriptions(storedUser.subscriptions),
          academicProfile: storedUser.academicProfile
            ? normalizeAcademicProfile(storedUser.academicProfile)
            : null,
        }
      : null;
  });

  useEffect(() => {
    guardarSesion(user);
  }, [user]);

  const login = useCallback(
    (correo, password) => {
      const usuario = autenticarUsuario(usuarios, correo, password);

      if (!usuario) return false;

      setUser({
        ...usuario,
        subscriptions: normalizeSubscriptions(usuario.subscriptions),
        academicProfile: usuario.academicProfile
          ? normalizeAcademicProfile(usuario.academicProfile)
          : null,
      });
      return true;
    },
    [usuarios]
  );

  const register = useCallback(
    (nuevoUsuario) => {
      if (existeCorreo(usuarios, nuevoUsuario.correo)) {
        return false;
      }

      const usuarioCreado = crearUsuarioRegistro(nuevoUsuario);

      agregarUsuario(usuarioCreado);
      setUser(usuarioCreado);

      return true;
    },
    [agregarUsuario, usuarios]
  );

  const updateUserProfile = useCallback(
    (datosActualizados) => {
      if (!user) return null;

      const usuarioActualizado = {
        ...user,
        ...datosActualizados,
        subscriptions: normalizeSubscriptions(
          datosActualizados.subscriptions || user.subscriptions
        ),
        academicProfile: datosActualizados.academicProfile
          ? normalizeAcademicProfile(datosActualizados.academicProfile)
          : user.academicProfile,
      };

      editarUsuario(user.id, usuarioActualizado);
      setUser(usuarioActualizado);

      return usuarioActualizado;
    },
    [editarUsuario, user]
  );

  const logout = useCallback(() => {
    setUser(null);
    cerrarSesion();
  }, []);

  const value = useMemo(
    () => ({
      user,
      login,
      logout,
      register,
      updateUserProfile,
      hasRole: (rolesPermitidos) => hasRole(user, rolesPermitidos),
      canAccessAdmin: () => canAccessAdmin(user),
    }),
    [user, login, logout, register, updateUserProfile]
  );

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
