export const ROLES = Object.freeze({
  SUPERADMIN: "superadmin",
  ADMIN: "admin",
  DOCENTE: "docente",
  ALUMNO: "alumno",
  PERSONAL: "personal",
});

export const LEGACY_ROLE_ALIASES = Object.freeze({
  usuario: ROLES.ALUMNO,
  editor: ROLES.PERSONAL,
});

export const ROLE_LABELS = Object.freeze({
  [ROLES.SUPERADMIN]: "Superadministrador",
  [ROLES.ADMIN]: "Administrador",
  [ROLES.DOCENTE]: "Docente",
  [ROLES.ALUMNO]: "Alumno",
  [ROLES.PERSONAL]: "Personal administrativo",
});

export const ROLE_OPTIONS = Object.freeze([
  {
    value: ROLES.ADMIN,
    label: ROLE_LABELS[ROLES.ADMIN],
  },
  {
    value: ROLES.DOCENTE,
    label: ROLE_LABELS[ROLES.DOCENTE],
  },
  {
    value: ROLES.ALUMNO,
    label: ROLE_LABELS[ROLES.ALUMNO],
  },
  {
    value: ROLES.PERSONAL,
    label: ROLE_LABELS[ROLES.PERSONAL],
  },
]);

export const normalizeRole = (rol) => {
  if (!rol) return "";

  return LEGACY_ROLE_ALIASES[rol] || rol;
};

export const getRoleLabel = (rol) => {
  const normalizedRole = normalizeRole(rol);

  return ROLE_LABELS[normalizedRole] || rol || "Sin rol";
};
