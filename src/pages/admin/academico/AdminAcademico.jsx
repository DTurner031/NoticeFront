import { useMemo, useState } from "react";
import {
  BookOpen,
  ClipboardList,
  GraduationCap,
  Layers3,
  Plus,
  Search,
  Trash2,
  Users,
} from "lucide-react";

import { AdminStatCard } from "../../../components/admin/AdminStatCard";
import { AcademicFlowReview } from "../../../components/admin/AcademicFlowReview";
import { AdminTableWrapper } from "../../../components/common/AdminTableWrapper";
import { EmptyState } from "../../../components/common/EmptyState";
import { FormError } from "../../../components/common/FormError";
import { PageHeader } from "../../../components/common/PageHeader";
import { SearchInput } from "../../../components/common/SearchInput";
import { StatusBadge } from "../../../components/common/StatusBadge";
import {
  getPlanLabel,
  PERIODOS_ACADEMICOS,
  PLANES_ESTUDIO,
  SEMESTRES_ACADEMICOS,
} from "../../../constants/academic";
import { ROLES, getRoleLabel, normalizeRole } from "../../../constants/roles";
import { useAcademico } from "../../../context/academico/useAcademico";
import { useNoticias } from "../../../context/noticias/useNoticias";
import { useDocumentos } from "../../../context/documentos/useDocumentos";
import { useEventos } from "../../../context/eventos/useEventos";
import { useToast } from "../../../context/toast/useToast";
import { useUsuarios } from "../../../context/usuarios/useUsuarios";
import {
  asignacionCoincideConPlan,
  getGrupoFormatoAyuda,
  materiaCoincideConPlan,
  parseGrupoNombre,
} from "../../../utils/academic";
import { matchesSearch } from "../../../utils/search";

const crearGrupoVacio = {
  nombre: "",
};

const crearAsignacionVacia = (plan = "2024") => ({
  plan,
  profesorId: "",
  materiaId: "",
  grupoId: "",
  periodo: PERIODOS_ACADEMICOS[0],
});

const inputClass =
  "w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-sm text-slate-800 outline-none transition focus:ring-2 focus:ring-[#6F1D46] dark:border-slate-600 dark:bg-slate-700 dark:text-white";

const labelClass = "text-sm font-semibold text-slate-700 dark:text-slate-200";

const Field = ({ label, error, children }) => (
  <label className="space-y-2">
    <span className={labelClass}>{label}</span>
    {children}
    <FormError message={error} />
  </label>
);

const TabButton = ({ active, children, onClick }) => (
  <button
    type="button"
    onClick={onClick}
    className={`rounded-xl px-4 py-3 text-sm font-semibold transition ${
      active
        ? "bg-[#6F1D46] text-white shadow-sm"
        : "bg-white text-slate-600 hover:bg-slate-100 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
    }`}
  >
    {children}
  </button>
);

const PlanButton = ({ active, plan, count, onClick }) => (
  <button
    type="button"
    onClick={onClick}
    className={`rounded-2xl border px-5 py-4 text-left transition ${
      active
        ? "border-[#6F1D46] bg-[#6F1D46] text-white shadow-md"
        : "border-slate-200 bg-white text-slate-700 hover:border-[#6F1D46]/50 hover:bg-[#6F1D46]/5 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
    }`}
  >
    <span className="block text-xs font-bold uppercase tracking-[0.18em] opacity-80">
      Plan de estudios
    </span>
    <span className="mt-1 block text-xl font-bold">{getPlanLabel(plan)}</span>
    <span className="mt-1 block text-sm opacity-80">{count} materias en catálogo</span>
  </button>
);

const OptionList = ({ options }) =>
  options.map((option) => (
    <option key={option} value={option}>
      {option}
    </option>
  ));

const getNombreProfesor = (usuarios, profesorId) =>
  usuarios.find((usuario) => String(usuario.id) === String(profesorId))?.nombre ||
  "Docente no encontrado";

const getCorreoProfesor = (usuarios, profesorId) =>
  usuarios.find((usuario) => String(usuario.id) === String(profesorId))?.correo || "";

const getMateria = (materias, materiaId) =>
  materias.find((materia) => String(materia.id) === String(materiaId));

const getGrupo = (grupos, grupoId) =>
  grupos.find((grupo) => String(grupo.id) === String(grupoId));

const getMateriaNombre = (materia) => materia?.nombre || "Materia no encontrada";

const getSemestreMateria = (materia) => materia?.semestreNumero || null;

const getSemestreGrupo = (grupo) => grupo?.semestreNumero || null;

const ordenarMaterias = (materias) =>
  [...materias].sort((a, b) => {
    const semestre = (a.semestreNumero || 99) - (b.semestreNumero || 99);
    if (semestre !== 0) return semestre;
    return String(a.nombre || "").localeCompare(String(b.nombre || ""), "es");
  });

const ordenarGrupos = (grupos) =>
  [...grupos].sort((a, b) => {
    const semestre = (a.semestreNumero || 99) - (b.semestreNumero || 99);
    if (semestre !== 0) return semestre;
    const turno = String(a.turnoCodigo || "").localeCompare(String(b.turnoCodigo || ""));
    if (turno !== 0) return turno;
    return (a.numeroGrupo || 99) - (b.numeroGrupo || 99);
  });

const validateGrupo = (grupo) => ({
  nombre: !parseGrupoNombre(grupo.nombre) ? getGrupoFormatoAyuda() : "",
});

const validateAsignacion = (asignacion, materia, grupo) => ({
  plan: !asignacion.plan ? "Selecciona un plan" : "",
  profesorId: !asignacion.profesorId ? "Selecciona un docente" : "",
  materiaId: !asignacion.materiaId ? "Selecciona una materia" : "",
  grupoId: !asignacion.grupoId ? "Selecciona un grupo compatible" : "",
  compatibilidad:
    materia && grupo && getSemestreMateria(materia) !== getSemestreGrupo(grupo)
      ? "El grupo no corresponde al semestre de la materia"
      : "",
});

const hasErrors = (errors) => Object.values(errors).some(Boolean);

const getAsignacionDetalle = (asignacion, materias, grupos, usuarios) => {
  const materia = getMateria(materias, asignacion.materiaId);
  const grupo = getGrupo(grupos, asignacion.grupoId);

  return {
    ...asignacion,
    materia,
    grupo,
    profesor: getNombreProfesor(usuarios, asignacion.profesorId),
    correoProfesor: getCorreoProfesor(usuarios, asignacion.profesorId),
    materiaNombre: getMateriaNombre(materia),
    grupoNombre: grupo?.nombre || "Grupo no encontrado",
    semestre: grupo?.semestre || materia?.semestre || "Semestre no definido",
    semestreNumero: grupo?.semestreNumero || materia?.semestreNumero || null,
    turno: grupo?.turno || "Turno no definido",
    plan: asignacion.plan || materia?.plan || "",
  };
};

export const AdminAcademico = () => {
  const {
    materias,
    grupos,
    asignaciones,
    agregarGrupo,
    eliminarGrupo,
    agregarAsignacion,
    eliminarAsignacion,
  } = useAcademico();
  const { usuarios } = useUsuarios();
  const { noticias } = useNoticias();
  const { eventos } = useEventos();
  const { documentos } = useDocumentos();
  const { success, error } = useToast();

  const [activeTab, setActiveTab] = useState("asignaciones");
  const [selectedPlan, setSelectedPlan] = useState("2024");
  const [search, setSearch] = useState("");
  const [grupoForm, setGrupoForm] = useState(crearGrupoVacio);
  const [grupoErrors, setGrupoErrors] = useState({});
  const [asignacionForm, setAsignacionForm] = useState(() => crearAsignacionVacia("2024"));
  const [asignacionErrors, setAsignacionErrors] = useState({});
  const [filtrosAsignacion, setFiltrosAsignacion] = useState({
    profesorId: "",
    semestre: "",
    grupo: "",
    periodo: "",
  });

  const docentes = useMemo(
    () => usuarios.filter((usuario) => normalizeRole(usuario.rol) === ROLES.DOCENTE),
    [usuarios]
  );

  const materiasDelPlan = useMemo(
    () => ordenarMaterias(materias.filter((materia) => materiaCoincideConPlan(materia, selectedPlan))),
    [materias, selectedPlan]
  );

  const materiasFiltradas = useMemo(
    () =>
      materiasDelPlan.filter((materia) =>
        matchesSearch(
          materia,
          ["clave", "nombre", "plan", "carrera", "semestre", "area", "tipo", "opcion"],
          search
        )
      ),
    [materiasDelPlan, search]
  );

  const gruposFiltrados = useMemo(
    () =>
      ordenarGrupos(
        grupos.filter((grupo) =>
          matchesSearch(
            grupo,
            ["nombre", "carrera", "semestre", "turno", "turnoCodigo", "numeroGrupo"],
            search
          )
        )
      ),
    [grupos, search]
  );

  const materiasAsignables = useMemo(
    () => ordenarMaterias(materias.filter((materia) => materiaCoincideConPlan(materia, asignacionForm.plan))),
    [asignacionForm.plan, materias]
  );

  const materiaSeleccionada = useMemo(
    () => getMateria(materias, asignacionForm.materiaId),
    [asignacionForm.materiaId, materias]
  );

  const gruposCompatibles = useMemo(() => {
    if (!materiaSeleccionada) return [];

    return ordenarGrupos(
      grupos.filter(
        (grupo) =>
          grupo.carrera === materiaSeleccionada.carrera &&
          getSemestreGrupo(grupo) === getSemestreMateria(materiaSeleccionada)
      )
    );
  }, [grupos, materiaSeleccionada]);

  const asignacionesDelPlan = useMemo(
    () =>
      asignaciones.filter((asignacion) =>
        asignacionCoincideConPlan(asignacion, materias, selectedPlan)
      ),
    [asignaciones, materias, selectedPlan]
  );

  const asignacionesDetalladas = useMemo(
    () =>
      asignacionesDelPlan.map((asignacion) =>
        getAsignacionDetalle(asignacion, materias, grupos, usuarios)
      ),
    [asignacionesDelPlan, grupos, materias, usuarios]
  );

  const asignacionesFiltradas = useMemo(() => {
    return asignacionesDetalladas.filter((asignacion) => {
      const coincideBusqueda = matchesSearch(
        asignacion,
        [
          "profesor",
          "correoProfesor",
          "materiaNombre",
          "grupoNombre",
          "semestre",
          "turno",
          "periodo",
          "plan",
        ],
        search
      );

      const coincideProfesor =
        !filtrosAsignacion.profesorId ||
        String(asignacion.profesorId) === String(filtrosAsignacion.profesorId);
      const coincideSemestre =
        !filtrosAsignacion.semestre || asignacion.semestre === filtrosAsignacion.semestre;
      const coincideGrupo =
        !filtrosAsignacion.grupo || asignacion.grupoNombre === filtrosAsignacion.grupo;
      const coincidePeriodo =
        !filtrosAsignacion.periodo || asignacion.periodo === filtrosAsignacion.periodo;

      return (
        coincideBusqueda &&
        coincideProfesor &&
        coincideSemestre &&
        coincideGrupo &&
        coincidePeriodo
      );
    });
  }, [asignacionesDetalladas, filtrosAsignacion, search]);

  const planCounts = useMemo(
    () =>
      PLANES_ESTUDIO.reduce((acc, plan) => {
        acc[plan] = materias.filter((materia) => materiaCoincideConPlan(materia, plan)).length;
        return acc;
      }, {}),
    [materias]
  );

  const grupoPreview = parseGrupoNombre(grupoForm.nombre);

  const cambiarPlan = (plan) => {
    setSelectedPlan(plan);
    setSearch("");
    setAsignacionForm(crearAsignacionVacia(plan));
    setAsignacionErrors({});
    setFiltrosAsignacion((prev) => ({ ...prev, semestre: "", grupo: "" }));
  };

  const handleGrupoChange = (event) => {
    const { value } = event.target;
    const datosGrupo = parseGrupoNombre(value);

    setGrupoForm({
      nombre: value.toUpperCase(),
      ...(datosGrupo || {}),
    });

    if (grupoErrors.nombre) setGrupoErrors((prev) => ({ ...prev, nombre: "" }));
  };

  const handleAsignacionChange = (event) => {
    const { name, value } = event.target;

    setAsignacionForm((prev) => {
      const next = { ...prev, [name]: value };

      if (name === "plan") {
        next.materiaId = "";
        next.grupoId = "";
      }

      if (name === "materiaId") {
        next.grupoId = "";
      }

      return next;
    });

    if (name === "plan") {
      setSelectedPlan(value);
    }

    if (asignacionErrors[name] || asignacionErrors.compatibilidad) {
      setAsignacionErrors((prev) => ({ ...prev, [name]: "", compatibilidad: "" }));
    }
  };

  const handleFiltroAsignacionChange = (event) => {
    const { name, value } = event.target;
    setFiltrosAsignacion((prev) => ({ ...prev, [name]: value }));
  };

  const limpiarFiltrosAsignacion = () => {
    setFiltrosAsignacion({ profesorId: "", semestre: "", grupo: "", periodo: "" });
    setSearch("");
  };

  const handleGrupoSubmit = (event) => {
    event.preventDefault();
    const validationErrors = validateGrupo(grupoForm);

    if (hasErrors(validationErrors)) {
      setGrupoErrors(validationErrors);
      error("Revisa el formato del grupo");
      return;
    }

    const datosGrupo = parseGrupoNombre(grupoForm.nombre);
    const existeGrupo = grupos.some(
      (grupo) => grupo.nombre.toUpperCase() === datosGrupo.nombre.toUpperCase()
    );

    if (existeGrupo) {
      error("Ese grupo ya existe en el catálogo");
      return;
    }

    agregarGrupo(datosGrupo);
    setGrupoForm(crearGrupoVacio);
    success("Grupo registrado correctamente");
  };

  const handleAsignacionSubmit = (event) => {
    event.preventDefault();
    const grupoSeleccionado = getGrupo(grupos, asignacionForm.grupoId);
    const validationErrors = validateAsignacion(
      asignacionForm,
      materiaSeleccionada,
      grupoSeleccionado
    );

    if (hasErrors(validationErrors)) {
      setAsignacionErrors(validationErrors);
      error("Revisa los datos de la asignación");
      return;
    }

    const existeAsignacion = asignaciones.some(
      (asignacion) =>
        String(asignacion.profesorId) === String(asignacionForm.profesorId) &&
        String(asignacion.materiaId) === String(asignacionForm.materiaId) &&
        String(asignacion.grupoId) === String(asignacionForm.grupoId) &&
        String(asignacion.plan || selectedPlan) === String(asignacionForm.plan) &&
        asignacion.periodo === asignacionForm.periodo
    );

    if (existeAsignacion) {
      error("Esa asignación ya existe para el periodo seleccionado");
      return;
    }

    agregarAsignacion(asignacionForm);
    setAsignacionForm(crearAsignacionVacia(selectedPlan));
    setAsignacionErrors({});
    success("Asignación registrada correctamente");
  };

  const resumen = [
    {
      title: `Materias ${getPlanLabel(selectedPlan)}`,
      value: materiasDelPlan.length,
      description: "Catálogo base tomado del mapa curricular",
      icon: BookOpen,
    },
    {
      title: "Grupos",
      value: grupos.length,
      description: "Formato 1CM1 a 9CV12",
      icon: Users,
    },
    {
      title: `Asignaciones ${getPlanLabel(selectedPlan)}`,
      value: asignacionesDelPlan.length,
      description: "Docente, materia, grupo y periodo",
      icon: ClipboardList,
    },
    {
      title: "Docentes",
      value: docentes.length,
      description: `${getRoleLabel(ROLES.DOCENTE)}s registrados`,
      icon: GraduationCap,
    },
  ];

  const gruposParaFiltro = ordenarGrupos(grupos);

  return (
    <section className="space-y-6">
      <PageHeader
        eyebrow="Gestión académica"
        title="Asignación docente académica"
        description="Consulta el catálogo de materias por plan y registra quién imparte cada materia, grupo y periodo."
      />

      <div className="grid gap-3 md:grid-cols-2">
        {PLANES_ESTUDIO.map((plan) => (
          <PlanButton
            key={plan}
            plan={plan}
            count={planCounts[plan] || 0}
            active={selectedPlan === plan}
            onClick={() => cambiarPlan(plan)}
          />
        ))}
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {resumen.map((item) => (
          <AdminStatCard key={item.title} {...item} />
        ))}
      </div>

      <AcademicFlowReview
        usuarios={usuarios}
        materias={materias}
        grupos={grupos}
        asignaciones={asignaciones}
        noticias={noticias}
        eventos={eventos}
        documentos={documentos}
      />

      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-800">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-wrap gap-2">
            <TabButton
              active={activeTab === "asignaciones"}
              onClick={() => setActiveTab("asignaciones")}
            >
              Asignaciones docentes
            </TabButton>
            <TabButton active={activeTab === "materias"} onClick={() => setActiveTab("materias")}>
              Catálogo de materias
            </TabButton>
            <TabButton active={activeTab === "grupos"} onClick={() => setActiveTab("grupos")}>
              Catálogo de grupos
            </TabButton>
          </div>

          <SearchInput
            value={search}
            onChange={setSearch}
            placeholder="Buscar por profesor, materia, grupo, semestre..."
            className="lg:max-w-sm"
          />
        </div>
      </div>

      {activeTab === "asignaciones" && (
        <div className="space-y-6">
          <div className="grid gap-6 xl:grid-cols-[0.85fr_1.15fr]">
            <form
              onSubmit={handleAsignacionSubmit}
              className="space-y-4 rounded-2xl bg-white p-5 shadow-md dark:bg-slate-800"
            >
              <div>
                <h2 className="text-lg font-bold text-slate-800 dark:text-white">
                  Registrar asignación docente
                </h2>
                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                  Elige un plan y una materia. El sistema mostrará únicamente grupos del semestre correspondiente.
                </p>
              </div>

              <Field label="Plan de estudios" error={asignacionErrors.plan}>
                <select
                  name="plan"
                  value={asignacionForm.plan}
                  onChange={handleAsignacionChange}
                  className={inputClass}
                >
                  <OptionList options={PLANES_ESTUDIO} />
                </select>
              </Field>

              <Field label="Materia" error={asignacionErrors.materiaId}>
                <select
                  name="materiaId"
                  value={asignacionForm.materiaId}
                  onChange={handleAsignacionChange}
                  className={inputClass}
                >
                  <option value="">Selecciona una materia</option>
                  {materiasAsignables.map((materia) => (
                    <option key={materia.id} value={materia.id}>
                      {materia.nombre} · {materia.semestre} · {materia.tipo || "Obligatoria"}
                    </option>
                  ))}
                </select>
              </Field>

              {materiaSeleccionada && (
                <div className="rounded-xl border border-blue-100 bg-blue-50 p-4 text-sm text-blue-900 dark:border-blue-900/40 dark:bg-blue-900/20 dark:text-blue-100">
                  <p className="font-semibold">Semestre detectado: {materiaSeleccionada.semestre}</p>
                  <p className="mt-1">
                    Sólo se mostrarán grupos de {materiaSeleccionada.semestre} para evitar asignaciones incorrectas.
                  </p>
                </div>
              )}

              <Field label="Grupo compatible" error={asignacionErrors.grupoId}>
                <select
                  name="grupoId"
                  value={asignacionForm.grupoId}
                  onChange={handleAsignacionChange}
                  className={inputClass}
                  disabled={!materiaSeleccionada}
                >
                  <option value="">
                    {materiaSeleccionada ? "Selecciona un grupo" : "Primero selecciona una materia"}
                  </option>
                  {gruposCompatibles.map((grupo) => (
                    <option key={grupo.id} value={grupo.id}>
                      {grupo.nombre} · {grupo.semestre} · {grupo.turno}
                    </option>
                  ))}
                </select>
              </Field>

              {materiaSeleccionada && gruposCompatibles.length === 0 && (
                <div className="rounded-xl bg-yellow-50 p-4 text-sm text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-100">
                  No hay grupos registrados para {materiaSeleccionada.semestre}. Agrega el grupo en el catálogo de grupos.
                </div>
              )}

              <Field label="Docente" error={asignacionErrors.profesorId}>
                <select
                  name="profesorId"
                  value={asignacionForm.profesorId}
                  onChange={handleAsignacionChange}
                  className={inputClass}
                >
                  <option value="">Selecciona un docente</option>
                  {docentes.map((docente) => (
                    <option key={docente.id} value={docente.id}>
                      {docente.nombre} · {docente.correo}
                    </option>
                  ))}
                </select>
              </Field>

              <Field label="Periodo" error={asignacionErrors.periodo}>
                <select
                  name="periodo"
                  value={asignacionForm.periodo}
                  onChange={handleAsignacionChange}
                  className={inputClass}
                >
                  <OptionList options={PERIODOS_ACADEMICOS} />
                </select>
              </Field>

              <FormError message={asignacionErrors.compatibilidad} />

              {docentes.length === 0 && (
                <div className="rounded-xl bg-yellow-50 p-4 text-sm text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-100">
                  No hay docentes registrados. Crea un usuario con rol docente para poder asignarlo.
                </div>
              )}

              <button
                type="submit"
                className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#6F1D46] px-5 py-3 font-semibold text-white transition hover:opacity-90 sm:w-auto"
              >
                <Layers3 size={18} />
                Guardar asignación
              </button>
            </form>

            <div className="space-y-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-md dark:border-slate-700 dark:bg-slate-800">
              <div>
                <h2 className="text-lg font-bold text-slate-800 dark:text-white">
                  Filtros de asignaciones
                </h2>
                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                  Úsalos para consultar quién imparte cada materia, plan, semestre y grupo.
                </p>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <Field label="Docente">
                  <select
                    name="profesorId"
                    value={filtrosAsignacion.profesorId}
                    onChange={handleFiltroAsignacionChange}
                    className={inputClass}
                  >
                    <option value="">Todos los docentes</option>
                    {docentes.map((docente) => (
                      <option key={docente.id} value={docente.id}>
                        {docente.nombre}
                      </option>
                    ))}
                  </select>
                </Field>

                <Field label="Semestre">
                  <select
                    name="semestre"
                    value={filtrosAsignacion.semestre}
                    onChange={handleFiltroAsignacionChange}
                    className={inputClass}
                  >
                    <option value="">Todos los semestres</option>
                    <OptionList options={SEMESTRES_ACADEMICOS} />
                  </select>
                </Field>

                <Field label="Grupo">
                  <select
                    name="grupo"
                    value={filtrosAsignacion.grupo}
                    onChange={handleFiltroAsignacionChange}
                    className={inputClass}
                  >
                    <option value="">Todos los grupos</option>
                    {gruposParaFiltro.map((grupo) => (
                      <option key={grupo.id} value={grupo.nombre}>
                        {grupo.nombre} · {grupo.turno}
                      </option>
                    ))}
                  </select>
                </Field>

                <Field label="Periodo">
                  <select
                    name="periodo"
                    value={filtrosAsignacion.periodo}
                    onChange={handleFiltroAsignacionChange}
                    className={inputClass}
                  >
                    <option value="">Todos los periodos</option>
                    <OptionList options={PERIODOS_ACADEMICOS} />
                  </select>
                </Field>
              </div>

              <button
                type="button"
                onClick={limpiarFiltrosAsignacion}
                className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-slate-300 px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-100 dark:border-slate-600 dark:text-slate-200 dark:hover:bg-slate-700 sm:w-auto"
              >
                <Search size={16} />
                Limpiar búsqueda y filtros
              </button>
            </div>
          </div>

          <AdminTableWrapper>
            <table className="w-full min-w-[1050px]">
              <thead>
                <tr className="bg-slate-100 dark:bg-slate-700">
                  <th className="p-4 text-left">Docente</th>
                  <th className="p-4 text-left">Materia</th>
                  <th className="p-4 text-left">Plan</th>
                  <th className="p-4 text-left">Semestre</th>
                  <th className="p-4 text-left">Grupo</th>
                  <th className="p-4 text-left">Periodo</th>
                  <th className="p-4 text-center">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {asignacionesFiltradas.length === 0 ? (
                  <EmptyState
                    colSpan={7}
                    title="No se encontraron asignaciones"
                    message="Registra una asignación o ajusta los filtros del plan activo."
                  />
                ) : (
                  asignacionesFiltradas.map((asignacion) => (
                    <tr key={asignacion.id} className="border-b border-slate-200 dark:border-slate-700">
                      <td className="p-4">
                        <p className="font-semibold text-slate-800 dark:text-white">
                          {asignacion.profesor}
                        </p>
                        <p className="text-sm text-slate-500 dark:text-slate-400">
                          {asignacion.correoProfesor}
                        </p>
                      </td>
                      <td className="p-4">
                        <p className="font-semibold text-slate-800 dark:text-white">
                          {asignacion.materiaNombre}
                        </p>
                        <p className="text-sm text-slate-500 dark:text-slate-400">
                          {asignacion.materia?.tipo || "Obligatoria"}
                          {asignacion.materia?.opcion ? ` · ${asignacion.materia.opcion}` : ""}
                        </p>
                      </td>
                      <td className="p-4">
                        <StatusBadge label={getPlanLabel(asignacion.plan)} variant="primary" />
                      </td>
                      <td className="p-4">
                        <StatusBadge label={asignacion.semestre} variant="info" />
                      </td>
                      <td className="p-4">
                        <div className="flex flex-col gap-1">
                          <StatusBadge label={asignacion.grupoNombre} variant="success" />
                          <span className="text-sm text-slate-500 dark:text-slate-400">
                            {asignacion.turno}
                          </span>
                        </div>
                      </td>
                      <td className="p-4 text-slate-600 dark:text-slate-300">
                        {asignacion.periodo}
                      </td>
                      <td className="p-4 text-center">
                        <button
                          type="button"
                          onClick={() => eliminarAsignacion(asignacion.id)}
                          className="inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold text-red-600 transition hover:bg-red-50 dark:text-red-300 dark:hover:bg-red-900/30"
                        >
                          <Trash2 size={16} />
                          Eliminar
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </AdminTableWrapper>
        </div>
      )}

      {activeTab === "materias" && (
        <div className="space-y-5">
          <div className="rounded-2xl border border-blue-100 bg-blue-50 p-5 text-sm text-blue-900 dark:border-blue-900/40 dark:bg-blue-900/20 dark:text-blue-100">
            <p className="font-bold">Catálogo base de materias</p>
            <p className="mt-1 leading-relaxed">
              Las materias ya están cargadas desde los planes de estudio. Esta sección es de consulta para evitar registros duplicados; las altas operativas se hacen mediante asignaciones docente-materia-grupo.
            </p>
          </div>

          <AdminTableWrapper>
            <table className="w-full min-w-[860px]">
              <thead>
                <tr className="bg-slate-100 dark:bg-slate-700">
                  <th className="p-4 text-left">Materia</th>
                  <th className="p-4 text-left">Plan</th>
                  <th className="p-4 text-left">Semestre</th>
                  <th className="p-4 text-left">Tipo</th>
                  <th className="p-4 text-left">Área / opción</th>
                </tr>
              </thead>
              <tbody>
                {materiasFiltradas.length === 0 ? (
                  <EmptyState
                    colSpan={5}
                    title="No se encontraron materias"
                    message="Cambia el plan activo o ajusta la búsqueda."
                  />
                ) : (
                  materiasFiltradas.map((materia) => (
                    <tr key={materia.id} className="border-b border-slate-200 dark:border-slate-700">
                      <td className="p-4">
                        <p className="font-semibold text-slate-800 dark:text-white">
                          {materia.nombre}
                        </p>
                        <p className="text-sm text-slate-500 dark:text-slate-400">
                          {materia.clave}
                        </p>
                      </td>
                      <td className="p-4">
                        <StatusBadge label={getPlanLabel(materia.plan)} variant="primary" />
                      </td>
                      <td className="p-4">
                        <StatusBadge label={materia.semestre} variant="info" />
                      </td>
                      <td className="p-4">
                        <StatusBadge
                          label={materia.tipo || "Obligatoria"}
                          variant={materia.tipo === "Optativa" ? "warning" : "success"}
                        />
                      </td>
                      <td className="p-4 text-slate-600 dark:text-slate-300">
                        {materia.opcion || materia.area || "Sin área"}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </AdminTableWrapper>
        </div>
      )}

      {activeTab === "grupos" && (
        <div className="grid gap-6 xl:grid-cols-[0.85fr_1.15fr]">
          <form
            onSubmit={handleGrupoSubmit}
            className="space-y-4 rounded-2xl bg-white p-5 shadow-md dark:bg-slate-800"
          >
            <div>
              <h2 className="text-lg font-bold text-slate-800 dark:text-white">
                Registrar grupo activo
              </h2>
              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                El semestre, turno y número se detectan desde el nombre del grupo.
              </p>
            </div>

            <Field label="Nombre del grupo" error={grupoErrors.nombre}>
              <input
                name="nombre"
                value={grupoForm.nombre}
                onChange={handleGrupoChange}
                className={inputClass}
                placeholder="Ej. 1CM1, 1CM12, 1CV1 o 1CV12"
              />
            </Field>

            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm dark:border-slate-700 dark:bg-slate-900/40">
              {grupoPreview ? (
                <div className="grid gap-2 sm:grid-cols-2">
                  <p><strong>Semestre:</strong> {grupoPreview.semestre}</p>
                  <p><strong>Turno:</strong> {grupoPreview.turno}</p>
                  <p><strong>Código:</strong> {grupoPreview.turnoCodigo}</p>
                  <p><strong>Número:</strong> {grupoPreview.numeroGrupo}</p>
                </div>
              ) : (
                <p className="text-slate-500 dark:text-slate-400">{getGrupoFormatoAyuda()}</p>
              )}
            </div>

            <button
              type="submit"
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#6F1D46] px-5 py-3 font-semibold text-white transition hover:opacity-90 sm:w-auto"
            >
              <Plus size={18} />
              Guardar grupo
            </button>
          </form>

          <div className="grid gap-4 md:grid-cols-2">
            {gruposFiltrados.length === 0 ? (
              <EmptyState
                title="No se encontraron grupos"
                message="Registra un grupo o cambia la búsqueda."
              />
            ) : (
              gruposFiltrados.slice(0, 60).map((grupo) => (
                <article
                  key={grupo.id}
                  className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-800"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#6F1D46] dark:text-pink-100">
                        Grupo
                      </p>
                      <h3 className="mt-1 text-2xl font-bold text-slate-800 dark:text-white">
                        {grupo.nombre}
                      </h3>
                    </div>
                    <StatusBadge label={grupo.turnoCodigo || grupo.turno} variant="success" />
                  </div>

                  <div className="mt-4 space-y-2 text-sm text-slate-600 dark:text-slate-300">
                    <p>{grupo.carrera}</p>
                    <p>{grupo.semestre} · {grupo.turno}</p>
                    <p>Número de grupo: {grupo.numeroGrupo || "No definido"}</p>
                  </div>

                  <button
                    type="button"
                    onClick={() => eliminarGrupo(grupo.id)}
                    className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-xl border border-red-200 px-4 py-2 text-sm font-semibold text-red-600 transition hover:bg-red-50 dark:border-red-900/50 dark:text-red-300 dark:hover:bg-red-900/30"
                  >
                    <Trash2 size={16} />
                    Eliminar grupo
                  </button>
                </article>
              ))
            )}
            {gruposFiltrados.length > 60 && (
              <div className="rounded-2xl bg-slate-100 p-4 text-center text-sm text-slate-600 dark:bg-slate-800 dark:text-slate-300 md:col-span-2">
                Mostrando 60 de {gruposFiltrados.length} grupos. Usa el buscador para ubicar un grupo específico.
              </div>
            )}
          </div>
        </div>
      )}
    </section>
  );
};
