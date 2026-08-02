export const ROUTES = Object.freeze({
  HOME: "/",
  LOGIN: "/login",
  NO_AUTORIZADO: "/no-autorizado",
  NOT_FOUND: "/no-encontrado",
  PERFIL: "/perfil",
  NOTIFICACIONES: "/notificaciones",
  DOCENTE_PUBLICACIONES: "/docente/publicaciones",
  NOTICIAS: "/noticias",
  NOTICIA_DETALLE: "/noticias/:id",
  EVENTOS: "/eventos",
  EVENTO_DETALLE: "/eventos/:id",
  CALENDARIO: "/calendario",
  DOCUMENTOS: "/documentos",
  DOCUMENTO_DETALLE: "/documentos/:id",
  ADMIN: "/admin",
  ADMIN_NOTICIAS: "/admin/noticias",
  ADMIN_NOTICIAS_NUEVO: "/admin/noticias/nuevo",
  ADMIN_NOTICIAS_EDITAR: "/admin/noticias/editar/:id",
  ADMIN_EVENTOS: "/admin/eventos",
  ADMIN_EVENTOS_NUEVO: "/admin/eventos/nuevo",
  ADMIN_EVENTOS_EDITAR: "/admin/eventos/editar/:id",
  ADMIN_DOCUMENTOS: "/admin/documentos",
  ADMIN_DOCUMENTOS_NUEVO: "/admin/documentos/nuevo",
  ADMIN_DOCUMENTOS_EDITAR: "/admin/documentos/editar/:id",
  ADMIN_USUARIOS: "/admin/usuarios",
  ADMIN_USUARIOS_NUEVO: "/admin/usuarios/nuevo",
  ADMIN_USUARIOS_EDITAR: "/admin/usuarios/editar/:id",
  ADMIN_ACADEMICO: "/admin/academico",
});

export const buildRoute = (route, params = {}) =>
  Object.entries(params).reduce(
    (path, [key, value]) => path.replace(`:${key}`, value),
    route
  );
