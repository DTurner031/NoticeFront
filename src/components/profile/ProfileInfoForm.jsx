import { FormError } from "../common/FormError";

export const ProfileInfoForm = ({ formData, errors = {}, onChange, onSubmit }) => {
  const inputClass = (field) =>
    `w-full border rounded-lg px-4 py-2 bg-transparent ${
      errors[field] ? "border-red-500" : "border-slate-300 dark:border-slate-700"
    }`;

  return (
    <form onSubmit={onSubmit} noValidate className="bg-white dark:bg-slate-800 rounded-2xl shadow-md p-6 space-y-5">
      <div>
        <h2 className="text-xl font-bold text-slate-800 dark:text-white">
          Información personal
        </h2>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          Estos datos se guardan localmente por ahora y después podrán enviarse al backend.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <label className="mb-2 block font-medium">Nombre</label>
          <input name="nombre" value={formData.nombre ?? ""} onChange={onChange} className={inputClass("nombre")} />
          <FormError message={errors.nombre} />
        </div>

        <div>
          <label className="mb-2 block font-medium">Correo</label>
          <input type="email" name="correo" value={formData.correo ?? ""} onChange={onChange} className={inputClass("correo")} />
          <FormError message={errors.correo} />
        </div>

        <div>
          <label className="mb-2 block font-medium">Boleta</label>
          <input name="boleta" value={formData.boleta ?? ""} onChange={onChange} className={inputClass("boleta")} />
          <FormError message={errors.boleta} />
        </div>

        <div>
          <label className="mb-2 block font-medium">Carrera</label>
          <input name="carrera" value={formData.carrera ?? ""} onChange={onChange} className={inputClass("carrera")} />
          <FormError message={errors.carrera} />
        </div>

        <div>
          <label className="mb-2 block font-medium">Semestre</label>
          <input name="semestre" value={formData.semestre ?? ""} onChange={onChange} className={inputClass("semestre")} placeholder="Ej. 6 o 6° Semestre" />
          <FormError message={errors.semestre} />
        </div>
      </div>

      <button type="submit" className="rounded-lg bg-[#6F1D46] px-6 py-3 font-semibold text-white transition hover:opacity-90">
        Guardar perfil
      </button>
    </form>
  );
};
