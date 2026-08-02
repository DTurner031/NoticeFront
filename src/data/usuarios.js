import { ROLES } from "../constants/roles";

export const usuarios = [
  {
    id: 1,
    nombre: "Administrador",
    correo: "admin@esime.mx",
    password: "admin",
    rol: ROLES.ADMIN,
    boleta: "ADMIN-001",
    carrera: "Administración del Portal",
    semestre: "N/A",
  },
  {
    id: 2,
    nombre: "Alumno",
    correo: "usuario@esime.mx",
    password: "123456",
    rol: ROLES.ALUMNO,
    boleta: "2023630000",
    carrera: "Ingeniería en Comunicaciones y Electrónica",
    semestre: "2° Semestre",
    academicProfile: {
      plan: "2024",
      periodo: "2026-1",
      grupoId: "grp-2cm1",
      materiasIds: ["mat-2024-2-programacion-avanzada"],
      inscripciones: [
        {
          id: "insc-demo-alumno-programacion-avanzada-2cm1",
          plan: "2024",
          periodo: "2026-1",
          materiaId: "mat-2024-2-programacion-avanzada",
          grupoId: "grp-2cm1",
        },
      ],
    },
  },
  {
    id: 3,
    nombre: "Docente Demo",
    correo: "docente@esime.mx",
    password: "123456",
    rol: ROLES.DOCENTE,
    boleta: "DOC-001",
    carrera: "Ingeniería en Comunicaciones y Electrónica",
    semestre: "N/A",
  },
  {
    id: 4,
    nombre: "Personal Administrativo Demo",
    correo: "personal@esime.mx",
    password: "123456",
    rol: ROLES.PERSONAL,
    boleta: "ADM-002",
    carrera: "Servicios Escolares",
    semestre: "N/A",
  },
];
