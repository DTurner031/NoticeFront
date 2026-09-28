import { useCallback, useEffect, useMemo, useState } from "react";

import { useUsuarios } from "../usuarios/useUsuarios";
import {
  autenticarUsuario,
  registrarUsuario,
  obtenerSesion,
  guardarSesion,
  cerrarSesion,
} from "../../services/authService";
import { hasRole, canAccessAdmin } from "../../utils/permissions";
import { normalizeSubscriptions } from "../../constants/subscriptions";
import { normalizeAcademicProfile } from "../../utils/academicProfile";
import { AuthContext } from "./AuthContext";

export const AuthProvider = ({ children }) => {
  const { editarUsuario } = useUsuarios();

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

  // Ahora es asíncrono porque llama al backend real.
  // Devuelve { ok: true } o { ok: false, mensaje } en vez de solo true/false,
  // para poder mostrar el motivo real del rechazo (ej. "Correo o contraseña incorrectos").
  const login = useCallback(async (correo, password) => {
    try {
      const usuario = await autenticarUsuario(correo, password);
      setUser({
        ...usuario,
        subscriptions: normalizeSubscriptions(usuario.subscriptions),
        academicProfile: usuario.academicProfile
          ? normalizeAcademicProfile(usuario.academicProfile)
          : null,
      });
      return { ok: true };
    } catch (error) {
      return { ok: false, mensaje: error.message || "Credenciales incorrectas" };
    }
  }, []);

  const register = useCallback(async (nuevoUsuario) => {
    try {
      const usuarioCreado = await registrarUsuario(nuevoUsuario);
      setUser(usuarioCreado);
      return { ok: true };
    } catch (error) {
      return { ok: false, mensaje: error.message || "No se pudo completar el registro" };
    }
  }, []);

  // Nota: esto sigue actualizando el perfil solo en el almacenamiento local (mock).
  // Cuando se conecte el módulo de Usuarios al backend, este método debe llamar
  // a PUT /api/usuarios/{id} en su lugar.
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
