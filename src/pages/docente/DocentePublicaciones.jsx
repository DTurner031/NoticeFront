import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  BookOpen,
  Calendar,
  FileText,
  Megaphone,
  Pencil,
  Send,
  Trash2,
  Users,
  X,
} from "lucide-react";

import { EmptyState } from "../../components/common/EmptyState";
import { FormError } from "../../components/common/FormError";
import { PageHeader } from "../../components/common/PageHeader";
import { StatusBadge } from "../../components/common/StatusBadge";
import { getPlanLabel } from "../../constants/academic";
import { PRIORITY_OPTIONS, TARGET_CATEGORY_OPTIONS } from "../../constants/audience";
import { ROLES, normalizeRole } from "../../constants/roles";
import { ROUTES, buildRoute } from "../../constants/routes";
import { useAcademico } from "../../context/academico/useAcademico";
import { useAuth } from "../../context/auth/useAuth";
import { useNoticias } from "../../context/noticias/useNoticias";
import { useDocumentos } from "../../context/documentos/useDocumentos";
import { useEventos } from "../../context/eventos/useEventos";
import { useToast } from "../../context/toast/useToast";
import { useUsuarios } from "../../context/usuarios/useUsuarios";
import { DOCUMENT_TYPES, getDocumentTitle } from "../../utils/documentTypes";
import {
  buildAsignacionDetalle,
  getAsignacionesPorDocente,
} from "../../utils/academicProfile";
import {
  hasValidationErrors,
  normalizeFormValues,
  validateNoticia,
  validateDocumento,
  validateEvento,
} from "../../utils/validation";

const cardClass =
  "rounded-2xl border border-slate-200 bg-white p-5 shadow-md dark:border-slate-700 dark:bg-slate-800 sm:p-6";

const inputClass =
  "w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-sm text-slate-800 outline-none transition focus:ring-2 focus:ring-[#6F1D46] dark:border-slate-600 dark:bg-slate-700 dark:text-white";

const labelClass = "text-sm font-semibold text-slate-700 dark:text-slate-200";

const PUBLICATION_TYPES = [
  {
    value: "noticia",
    label: "Noticia",
    description: "Comunica una indicación o recordatorio para un grupo.",
    icon: Megaphone,
  },
  {
    value: "evento",
    label: "Evento",
    description: "Registra una clase especial, práctica, entrega o actividad.",
    icon: Calendar,
  },
  {
    value: "documento",
    label: "Documento",
    description: "Comparte material, guía, rúbrica o enlace de apoyo.",
    icon: FileText,
  },
];

const createInitialForm = () => ({
  tipoPublicacion: "noticia",
  asignacionId: "",
  titulo: "",
  fecha: new Date().toISOString().slice(0, 10),
  descripcion: "",
  lugar: "",
  categoria: "academico",
  prioridad: "normal",
  tipoDocumento: "PDF",
  url: "",
});

const Field = ({ label, error, children }) => (
  <label className="space-y-2">
    <span className={labelClass}>{label}</span>
    {children}
    <FormError message={error} />
  </label>
);

const TypeButton = ({ type, active, onClick, disabled = false }) => {
  const Icon = type.icon;

  return (
    <button
      type="button"
      onClick={() => onClick(type.value)}
      disabled={disabled}
      className={`rounded-2xl border p-4 text-left transition disabled:cursor-not-allowed disabled:opacity-60 ${
        active
          ? "border-[#6F1D46] bg-[#6F1D46] text-white shadow-md"
          : "border-slate-200 bg-white text-slate-700 hover:border-[#6F1D46]/50 hover:bg-[#6F1D46]/5 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
      }`}
    >
      <div className="flex items-center gap-3">
        <span
          className={`rounded-xl p-2 ${
            active ? "bg-white/15 text-white" : "bg-[#6F1D46]/10 text-[#6F1D46]"
          }`}
        >
          <Icon size={20} />
        </span>
        <span className="font-bold">{type.label}</span>
      </div>
      <p className="mt-2 text-sm opacity-80">{type.description}</p>
    </button>
  );
};

const getAsignacionLabel = (asignacion) =>
  `${asignacion.materiaNombre} · ${asignacion.grupoNombre} · ${getPlanLabel(
    asignacion.plan
  )} · ${asignacion.periodo}`;

const getPublicationTitle = (item, tipo) =>
  tipo === "documento" ? getDocumentTitle(item) : item.titulo || "Sin título";

const getPublicationRoute = (item, tipo) => {
  if (tipo === "noticia") return buildRoute(ROUTES.NOTICIA_DETALLE, { id: item.id });
  if (tipo === "evento") return buildRoute(ROUTES.EVENTO_DETALLE, { id: item.id });
  return buildRoute(ROUTES.DOCUMENTO_DETALLE, { id: item.id });
};

const getPublicationAssignmentId = (item, asignaciones = []) => {
  if (item.asignacionId || item.academicTarget?.asignacionId) {
    return String(item.asignacionId || item.academicTarget.asignacionId);
  }

  const target = item.academicTarget || {};
  const match = asignaciones.find(
    (asignacion) =>
      String(asignacion.materiaId) === String(target.materiaId) &&
      String(asignacion.grupoId) === String(target.grupoId) &&
      String(asignacion.plan) === String(target.plan) &&
      String(asignacion.periodo) === String(target.periodo)
  );

  return match ? String(match.id) : "";
};

const getPublicationCategory = (item) =>
  item.categoria || item.audiencia?.categorias?.find((categoria) => categoria !== "todos") || "academico";

const getPublicationPriority = (item) => item.audiencia?.prioridad || item.prioridad || "normal";

const buildAcademicContent = ({ form, asignacion, user }) => {
  const audiencia = {
    roles: [ROLES.ALUMNO],
    carreras: [asignacion.grupo?.carrera || asignacion.materia?.carrera].filter(Boolean),
    semestres: [String(asignacion.materia?.semestreNumero || asignacion.grupo?.semestreNumero || "")].filter(Boolean),
    categorias: [form.categoria || "academico"],
    prioridad: form.prioridad || "normal",
  };

  const academicTarget = {
    asignacionId: asignacion.id,
    plan: asignacion.plan,
    periodo: asignacion.periodo,
    profesorId: user.id,
    profesorNombre: user.nombre,
    materiaId: asignacion.materiaId,
    materiaNombre: asignacion.materiaNombre,
    grupoId: asignacion.grupoId,
    grupoNombre: asignacion.grupoNombre,
    semestre: asignacion.semestre,
    turno: asignacion.turno,
  };

  const base = {
    titulo: form.titulo,
    fecha: form.fecha,
    descripcion: form.descripcion,
    categoria: form.categoria,
    audiencia,
    asignacionId: asignacion.id,
    academicTarget,
    origen: "docente",
    profesorId: user.id,
    profesorNombre: user.nombre,
  };

  if (form.tipoPublicacion === "evento") {
    return {
      ...base,
      lugar: form.lugar,
    };
  }

  if (form.tipoPublicacion === "documento") {
    return {
      ...base,
      tipo: form.tipoDocumento,
      url: form.url,
    };
  }

  return base;
};

const validatePublication = (form, content) => {
  const baseErrors = {
    asignacionId: form.asignacionId ? "" : "Selecciona una materia y grupo asignado",
  };

  const validation =
    form.tipoPublicacion === "evento"
      ? validateEvento(content)
      : form.tipoPublicacion === "documento"
        ? validateDocumento(content)
        : validateNoticia(content);

  return Object.fromEntries(
    Object.entries({
      ...baseErrors,
      ...validation,
      tipoDocumento:
        form.tipoPublicacion === "documento" && !form.tipoDocumento
          ? "Selecciona el tipo de documento"
          : "",
    }).filter(([, message]) => Boolean(message))
  );
};

const getTeacherPublications = ({ noticias, eventos, documentos, user }) => {
  const isMine = (item) =>
    String(item?.academicTarget?.profesorId || item?.profesorId || "") === String(user?.id || "");

  return [
    ...noticias.filter(isMine).map((item) => ({ ...item, tipoPublicacion: "noticia" })),
    ...eventos.filter(isMine).map((item) => ({ ...item, tipoPublicacion: "evento" })),
    ...documentos.filter(isMine).map((item) => ({ ...item, tipoPublicacion: "documento" })),
  ].sort((a, b) =>
    String(b.updatedAt || b.createdAt || b.fecha || "").localeCompare(
      String(a.updatedAt || a.createdAt || a.fecha || "")
    )
  );
};

export const DocentePublicaciones = () => {
  const { user } = useAuth();
  const { materias, grupos, asignaciones } = useAcademico();
  const { usuarios } = useUsuarios();
  const { noticias, agregarNoticia, editarNoticia, eliminarNoticia } = useNoticias();
  const { eventos, agregarEvento, editarEvento, eliminarEvento } = useEventos();
  const { documentos, agregarDocumento, editarDocumento, eliminarDocumento } = useDocumentos();
  const { success, error } = useToast();

  const [form, setForm] = useState(createInitialForm);
  const [errors, setErrors] = useState({});
  const [editingPublication, setEditingPublication] = useState(null);

  const role = normalizeRole(user?.rol);
  const canPublish = role === ROLES.DOCENTE || role === ROLES.ADMIN || role === ROLES.SUPERADMIN;

  const misAsignaciones = useMemo(
    () =>
      getAsignacionesPorDocente({ asignaciones, docenteId: user?.id })
        .map((asignacion) => buildAsignacionDetalle({ asignacion, materias, grupos, usuarios }))
        .sort((a, b) => getAsignacionLabel(a).localeCompare(getAsignacionLabel(b), "es")),
    [asignaciones, grupos, materias, user?.id, usuarios]
  );

  const asignacionSeleccionada = useMemo(
    () => misAsignaciones.find((asignacion) => String(asignacion.id) === String(form.asignacionId)),
    [form.asignacionId, misAsignaciones]
  );

  const misPublicaciones = useMemo(
    () => getTeacherPublications({ noticias, eventos, documentos, user }),
    [noticias, documentos, eventos, user]
  );

  const handleChange = (event) => {
    const { name, value } = event.target;

    setForm((prev) => ({ ...prev, [name]: value }));

    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const handleTypeChange = (tipoPublicacion) => {
    if (editingPublication) return;

    setForm((prev) => ({
      ...prev,
      tipoPublicacion,
      lugar: tipoPublicacion === "evento" ? prev.lugar : "",
      tipoDocumento: tipoPublicacion === "documento" ? prev.tipoDocumento || "PDF" : prev.tipoDocumento,
      url: tipoPublicacion === "documento" ? prev.url : "",
    }));
    setErrors({});
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    if (!asignacionSeleccionada) {
      setErrors({ asignacionId: "Selecciona una materia y grupo asignado" });
      error("Selecciona una asignación académica");
      return;
    }

    const datosNormalizados = normalizeFormValues(form);
    const contenido = buildAcademicContent({
      form: datosNormalizados,
      asignacion: asignacionSeleccionada,
      user,
    });
    const validationErrors = validatePublication(datosNormalizados, contenido);

    if (hasValidationErrors(validationErrors)) {
      setErrors(validationErrors);
      error("Revisa los campos marcados");
      return;
    }

    if (editingPublication) {
      if (editingPublication.tipo === "evento") {
        editarEvento(editingPublication.id, contenido);
        success("Evento actualizado para tus alumnos");
      } else if (editingPublication.tipo === "documento") {
        editarDocumento(editingPublication.id, contenido);
        success("Documento actualizado para tus alumnos");
      } else {
        editarNoticia(editingPublication.id, contenido);
        success("Noticia actualizado para tus alumnos");
      }

      setEditingPublication(null);
    } else if (form.tipoPublicacion === "evento") {
      agregarEvento(contenido);
      success("Evento publicado para tu grupo");
    } else if (form.tipoPublicacion === "documento") {
      agregarDocumento(contenido);
      success("Documento publicado para tu grupo");
    } else {
      agregarNoticia(contenido);
      success("Noticia publicado para tu grupo");
    }

    setForm({
      ...createInitialForm(),
      tipoPublicacion: form.tipoPublicacion,
      asignacionId: form.asignacionId,
      categoria: form.categoria,
      prioridad: form.prioridad,
    });
    setErrors({});
  };

  const handleEditPublication = (item) => {
    const tipo = item.tipoPublicacion;
    const asignacionId = getPublicationAssignmentId(item, misAsignaciones);

    setEditingPublication({ id: item.id, tipo });
    setForm({
      tipoPublicacion: tipo,
      asignacionId,
      titulo: getPublicationTitle(item, tipo),
      fecha: item.fecha || new Date().toISOString().slice(0, 10),
      descripcion: item.descripcion || "",
      lugar: tipo === "evento" ? item.lugar || "" : "",
      categoria: getPublicationCategory(item),
      prioridad: getPublicationPriority(item),
      tipoDocumento: tipo === "documento" ? item.tipo || "PDF" : "PDF",
      url: tipo === "documento" ? item.url || "" : "",
    });
    setErrors({});
  };

  const handleCancelEdit = () => {
    setEditingPublication(null);
    setErrors({});
    setForm(createInitialForm());
  };

  const handleDeletePublication = (item) => {
    const title = getPublicationTitle(item, item.tipoPublicacion);
    const confirmed = window.confirm(
      `¿Seguro que deseas eliminar "${title}"? Los alumnos dejarán de ver esta publicación.`
    );

    if (!confirmed) return;

    if (item.tipoPublicacion === "evento") {
      eliminarEvento(item.id);
      success("Evento eliminado para tus alumnos");
    } else if (item.tipoPublicacion === "documento") {
      eliminarDocumento(item.id);
      success("Documento eliminado para tus alumnos");
    } else {
      eliminarNoticia(item.id);
      success("Noticia eliminado para tus alumnos");
    }

    if (String(editingPublication?.id) === String(item.id)) {
      handleCancelEdit();
    }
  };

  if (!canPublish) {
    return (
      <section className="space-y-6">
        <PageHeader
          title="Publicaciones docentes"
          description="Este módulo está disponible para docentes con materias y grupos asignados."
        />
        <EmptyState
          title="Acceso no disponible"
          message="Tu rol actual no puede crear publicaciones docentes."
        />
      </section>
    );
  }

  return (
    <section className="space-y-6">
      <PageHeader
        title="Mis publicaciones docentes"
        description="Crea noticias, eventos o documentos dirigidos únicamente a los alumnos de tus materias y grupos asignados."
      />

      <div className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
        <form onSubmit={handleSubmit} noValidate className={`${cardClass} space-y-6`}>
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.18em] text-[#6F1D46] dark:text-pink-200">
              {editingPublication ? "Editando publicación" : "Nueva publicación"}
            </p>
            <h2 className="mt-1 text-xl font-bold text-slate-800 dark:text-white">
              {editingPublication ? "Actualizar publicación docente" : "Publicar para una materia y grupo"}
            </h2>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              El destinatario se toma automáticamente de tu asignación académica: plan, materia, grupo y periodo.
            </p>
          </div>

          {misAsignaciones.length === 0 ? (
            <EmptyState
              title="Aún no tienes materias asignadas"
              message="Registra tus materias desde tu perfil o solicita al administrador que te asigne una materia y grupo."
              actionLabel="Ir a mi perfil"
              actionTo={ROUTES.PERFIL}
            />
          ) : (
            <>
              <div className="grid gap-3 md:grid-cols-3">
                {PUBLICATION_TYPES.map((type) => (
                  <TypeButton
                    key={type.value}
                    type={type}
                    active={form.tipoPublicacion === type.value}
                    onClick={handleTypeChange}
                    disabled={Boolean(editingPublication)}
                  />
                ))}
              </div>

              <Field label="Materia y grupo" error={errors.asignacionId}>
                <select
                  name="asignacionId"
                  value={form.asignacionId}
                  onChange={handleChange}
                  className={inputClass}
                >
                  <option value="">Selecciona una asignación</option>
                  {misAsignaciones.map((asignacion) => (
                    <option key={asignacion.id} value={asignacion.id}>
                      {getAsignacionLabel(asignacion)}
                    </option>
                  ))}
                </select>
              </Field>

              {asignacionSeleccionada && (
                <div className="grid gap-3 rounded-xl bg-slate-50 p-4 text-sm dark:bg-slate-900/40 sm:grid-cols-2">
                  <p>
                    <strong>Materia:</strong> {asignacionSeleccionada.materiaNombre}
                  </p>
                  <p>
                    <strong>Grupo:</strong> {asignacionSeleccionada.grupoNombre}
                  </p>
                  <p>
                    <strong>Plan:</strong> {getPlanLabel(asignacionSeleccionada.plan)}
                  </p>
                  <p>
                    <strong>Periodo:</strong> {asignacionSeleccionada.periodo}
                  </p>
                </div>
              )}

              <div className="grid gap-4 md:grid-cols-2">
                <Field label="Título" error={errors.titulo}>
                  <input
                    type="text"
                    name="titulo"
                    value={form.titulo}
                    onChange={handleChange}
                    className={inputClass}
                    placeholder="Ej. Entrega de práctica 2"
                  />
                </Field>

                <Field label="Fecha" error={errors.fecha}>
                  <input
                    type="date"
                    name="fecha"
                    value={form.fecha}
                    onChange={handleChange}
                    className={inputClass}
                  />
                </Field>
              </div>

              {form.tipoPublicacion === "evento" && (
                <Field label="Lugar" error={errors.lugar}>
                  <input
                    type="text"
                    name="lugar"
                    value={form.lugar}
                    onChange={handleChange}
                    className={inputClass}
                    placeholder="Ej. Laboratorio de electrónica"
                  />
                </Field>
              )}

              {form.tipoPublicacion === "documento" && (
                <div className="grid gap-4 md:grid-cols-2">
                  <Field label="Tipo de documento" error={errors.tipoDocumento || errors.tipo}>
                    <select
                      name="tipoDocumento"
                      value={form.tipoDocumento}
                      onChange={handleChange}
                      className={inputClass}
                    >
                      {DOCUMENT_TYPES.map((type) => (
                        <option key={type.value} value={type.value}>
                          {type.label}
                        </option>
                      ))}
                    </select>
                  </Field>

                  <Field label="Enlace opcional" error={errors.url}>
                    <input
                      type="url"
                      name="url"
                      value={form.url}
                      onChange={handleChange}
                      className={inputClass}
                      placeholder="https://..."
                    />
                  </Field>
                </div>
              )}

              <div className="grid gap-4 md:grid-cols-2">
                <Field label="Categoría" error={errors.categoria}>
                  <select
                    name="categoria"
                    value={form.categoria}
                    onChange={handleChange}
                    className={inputClass}
                  >
                    {TARGET_CATEGORY_OPTIONS.filter((option) => option.value !== "todos").map(
                      (option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      )
                    )}
                  </select>
                </Field>

                <Field label="Prioridad" error={errors.prioridad}>
                  <select
                    name="prioridad"
                    value={form.prioridad}
                    onChange={handleChange}
                    className={inputClass}
                  >
                    {PRIORITY_OPTIONS.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </Field>
              </div>

              <Field label="Descripción" error={errors.descripcion}>
                <textarea
                  name="descripcion"
                  value={form.descripcion}
                  onChange={handleChange}
                  rows="5"
                  className={inputClass}
                  placeholder="Escribe el contenido que verá el alumno."
                />
              </Field>

              <div className="flex flex-col gap-3 sm:flex-row">
                <button
                  type="submit"
                  className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#6F1D46] px-5 py-3 font-semibold text-white transition hover:opacity-90 sm:w-auto"
                >
                  <Send size={18} />
                  {editingPublication ? "Guardar cambios" : "Publicar para el grupo"}
                </button>

                {editingPublication && (
                  <button
                    type="button"
                    onClick={handleCancelEdit}
                    className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 px-5 py-3 font-semibold text-slate-600 transition hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-700 sm:w-auto"
                  >
                    <X size={18} />
                    Cancelar edición
                  </button>
                )}
              </div>
            </>
          )}
        </form>

        <section className={`${cardClass} space-y-4`}>
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.18em] text-[#6F1D46] dark:text-pink-200">
              Historial
            </p>
            <h2 className="mt-1 text-xl font-bold text-slate-800 dark:text-white">
              Mis publicaciones recientes
            </h2>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              Se muestran los noticias, eventos y documentos que has creado desde tus asignaciones.
            </p>
          </div>

          {misPublicaciones.length === 0 ? (
            <EmptyState
              title="Aún no tienes publicaciones"
              message="Cuando publiques para tus grupos, aparecerán en este historial y en las notificaciones de los alumnos correspondientes."
            />
          ) : (
            <div className="space-y-3">
              {misPublicaciones.slice(0, 8).map((item) => {
                const tipo = item.tipoPublicacion;
                const Icon = tipo === "noticia" ? Megaphone : tipo === "evento" ? Calendar : FileText;

                return (
                  <article
                    key={`${tipo}-${item.id}`}
                    className="rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-900/40"
                  >
                    <div className="flex items-start gap-3">
                      <span className="rounded-xl bg-white p-2 text-[#6F1D46] shadow-sm dark:bg-slate-800 dark:text-pink-200">
                        <Icon size={18} />
                      </span>
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <StatusBadge
                            label={tipo === "noticia" ? "Noticia" : tipo === "evento" ? "Evento" : "Documento"}
                            variant={tipo === "noticia" ? "info" : tipo === "evento" ? "success" : "warning"}
                          />
                          {item.academicTarget?.grupoNombre && (
                            <StatusBadge label={item.academicTarget.grupoNombre} variant="default" />
                          )}
                        </div>
                        <h3 className="mt-2 font-bold text-slate-800 dark:text-white">
                          {getPublicationTitle(item, tipo)}
                        </h3>
                        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                          {item.academicTarget?.materiaNombre || "Materia no especificada"}
                        </p>
                        {item.academicTarget?.profesorNombre && (
                          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                            Profesor: {item.academicTarget.profesorNombre}
                          </p>
                        )}

                        <div className="mt-3 flex flex-wrap gap-2">
                          <Link
                            to={getPublicationRoute(item, tipo)}
                            className="inline-flex items-center justify-center rounded-lg bg-[#6F1D46] px-3 py-2 text-xs font-semibold text-white transition hover:opacity-90"
                          >
                            Ver
                          </Link>
                          <button
                            type="button"
                            onClick={() => handleEditPublication(item)}
                            className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-600 transition hover:bg-slate-100 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-700"
                          >
                            <Pencil size={14} />
                            Editar
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeletePublication(item)}
                            className="inline-flex items-center gap-1 rounded-lg border border-red-200 px-3 py-2 text-xs font-semibold text-red-600 transition hover:bg-red-50 dark:border-red-900/60 dark:text-red-200 dark:hover:bg-red-900/30"
                          >
                            <Trash2 size={14} />
                            Eliminar
                          </button>
                        </div>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </section>
      </div>

      <section className={`${cardClass} grid gap-4 md:grid-cols-3`}>
        <div className="flex items-start gap-3">
          <BookOpen className="mt-1 text-[#6F1D46]" size={22} />
          <div>
            <h3 className="font-bold text-slate-800 dark:text-white">Materia</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Cada publicación queda vinculada a una materia del plan seleccionado.
            </p>
          </div>
        </div>
        <div className="flex items-start gap-3">
          <Users className="mt-1 text-[#6F1D46]" size={22} />
          <div>
            <h3 className="font-bold text-slate-800 dark:text-white">Grupo</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Sólo los alumnos del grupo y materia correspondiente la reciben como relevante.
            </p>
          </div>
        </div>
        <div className="flex items-start gap-3">
          <Send className="mt-1 text-[#6F1D46]" size={22} />
          <div>
            <h3 className="font-bold text-slate-800 dark:text-white">Notificaciones</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              La campana y el centro de notificaciones usan esta relación académica.
            </p>
          </div>
        </div>
      </section>
    </section>
  );
};
