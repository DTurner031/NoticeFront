import { DOCUMENT_ACCEPT, DOCUMENT_TYPES, formatFileSize } from "../../utils/documentTypes";
import { AudienceFields } from "../common/AudienceFields";
import { FormError } from "../common/FormError";

export const DocumentoForm = ({
  formulario,
  handleChange,
  handleSubmit,
  buttonText,
  errors = {},
  handleAudienceChange,
}) => {
  const inputClass = (field) =>
    `w-full border rounded-lg px-4 py-2 bg-transparent ${
      errors[field] ? "border-red-500" : "border-slate-300 dark:border-slate-700"
    }`;

  return (
    <form
      onSubmit={handleSubmit}
      noValidate
      className="w-full bg-white dark:bg-slate-800 rounded-xl shadow-md p-4 sm:p-6 space-y-5"
    >
      <div>
        <label className="block mb-2 font-medium">Título</label>
        <input
          type="text"
          name="titulo"
          value={formulario.titulo ?? ""}
          onChange={handleChange}
          className={inputClass("titulo")}
          placeholder="Ej. Calendario escolar 2026"
        />
        <FormError message={errors.titulo} />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <label className="block mb-2 font-medium">Tipo de documento</label>
          <select
            name="tipo"
            value={formulario.tipo ?? ""}
            onChange={handleChange}
            className={inputClass("tipo")}
          >
            <option value="">Selecciona un tipo</option>
            {DOCUMENT_TYPES.map((type) => (
              <option key={type.value} value={type.value}>
                {type.label}
              </option>
            ))}
          </select>
          <FormError message={errors.tipo} />
        </div>

        <div>
          <label className="block mb-2 font-medium">Fecha de publicación</label>
          <input
            type="date"
            name="fecha"
            value={formulario.fecha ?? ""}
            onChange={handleChange}
            className={inputClass("fecha")}
          />
          <FormError message={errors.fecha} />
        </div>
      </div>

      <div>
        <label className="block mb-2 font-medium">Archivo</label>
        <input
          type="file"
          name="archivo"
          accept={DOCUMENT_ACCEPT}
          onChange={handleChange}
          className="w-full rounded-lg border border-dashed border-slate-300 px-4 py-3 text-sm dark:border-slate-700"
        />
        <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
          Tipos sugeridos: PDF, imagen, Word, Excel, PowerPoint o texto. Por ahora se guarda la información del archivo; la descarga real se conectará cuando exista backend.
        </p>

        {formulario.archivoNombre && (
          <div className="mt-3 rounded-lg bg-slate-100 p-3 text-sm dark:bg-slate-700">
            <p className="font-medium text-slate-800 dark:text-white">
              Archivo seleccionado: {formulario.archivoNombre}
            </p>
            {formulario.archivoTamaño && (
              <p className="text-slate-500 dark:text-slate-300">
                Tamaño: {formatFileSize(formulario.archivoTamaño)}
              </p>
            )}
          </div>
        )}
      </div>

      <div>
        <label className="block mb-2 font-medium">Enlace opcional</label>
        <input
          type="url"
          name="url"
          value={formulario.url ?? ""}
          onChange={handleChange}
          className={inputClass("url")}
          placeholder="https://..."
        />
        <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
          Puedes usarlo para documentos alojados en Drive, OneDrive o un servidor institucional.
        </p>
        <FormError message={errors.url} />
      </div>

      <div>
        <label className="block mb-2 font-medium">Descripción</label>
        <textarea
          name="descripcion"
          value={formulario.descripcion ?? ""}
          onChange={handleChange}
          rows="5"
          className={inputClass("descripcion")}
          placeholder="Explica para qué sirve el documento o quién debe consultarlo."
        />
        <FormError message={errors.descripcion} />
      </div>

      <AudienceFields
        audiencia={formulario.audiencia}
        onChange={handleAudienceChange}
      />

      <div className="flex gap-4">
        <button
          type="submit"
          className="w-full rounded-lg bg-blue-600 px-6 py-3 text-white hover:bg-blue-700 sm:w-auto"
        >
          {buttonText}
        </button>
      </div>
    </form>
  );
};
