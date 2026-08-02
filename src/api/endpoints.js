export const ENDPOINTS = Object.freeze({
  auth: Object.freeze({
    login: "/auth/login",
    me: "/auth/me",
    logout: "/auth/logout",
  }),
  usuarios: "/usuarios",
  roles: "/roles",
  planesEstudio: "/planes-estudio",
  materias: "/materias",
  grupos: "/grupos",
  asignacionesDocentes: "/asignaciones-docentes",
  publicaciones: "/publicaciones",
  noticias: "/noticias",
  eventos: "/eventos",
  documentos: "/documentos",
  notificaciones: "/notificaciones",
  archivos: "/archivos",
});

export const buildEndpoint = (endpoint, params = {}) => {
  const searchParams = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      searchParams.append(key, value);
    }
  });

  const queryString = searchParams.toString();
  return queryString ? `${endpoint}?${queryString}` : endpoint;
};

export const withId = (endpoint, id) => `${endpoint}/${id}`;
