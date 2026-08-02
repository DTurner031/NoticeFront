import { AudienceFields } from "../common/AudienceFields";
import { FormError } from "../common/FormError";

export const EventoForm = ({
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
      className="w-full bg-white dark:bg-slate-800 rounded-xl shadow-md p-4 sm:p-6 space-y-4"
    >
      <div>
        <label className="block mb-2 font-medium">Título</label>
        <input
          type="text"
          name="titulo"
          value={formulario.titulo ?? ""}
          onChange={handleChange}
          className={inputClass("titulo")}
        />
        <FormError message={errors.titulo} />
      </div>

      <div>
        <label className="block mb-2 font-medium">Fecha</label>
        <input
          type="date"
          name="fecha"
          value={formulario.fecha ?? ""}
          onChange={handleChange}
          className={inputClass("fecha")}
        />
        <FormError message={errors.fecha} />
      </div>

      <div>
        <label className="block mb-2 font-medium">Lugar</label>
        <input
          type="text"
          name="lugar"
          value={formulario.lugar ?? ""}
          onChange={handleChange}
          className={inputClass("lugar")}
        />
        <FormError message={errors.lugar} />
      </div>

      <div>
        <label className="block mb-2 font-medium">Categoría</label>
        <input
          type="text"
          name="categoria"
          value={formulario.categoria ?? ""}
          onChange={handleChange}
          className={inputClass("categoria")}
        />
        <FormError message={errors.categoria} />
      </div>

      <div>
        <label className="block mb-2 font-medium">Descripción</label>
        <textarea
          name="descripcion"
          value={formulario.descripcion ?? ""}
          onChange={handleChange}
          rows="5"
          className={inputClass("descripcion")}
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
