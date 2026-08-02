import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import { useEventos } from "../../../context/eventos/useEventos";
import { useToast } from "../../../context/toast/useToast";
import { EventoForm } from "../../../components/eventos/EventoForm";
import { ROUTES } from "../../../constants/routes";
import { mismoId } from "../../../utils/id";
import {
  hasValidationErrors,
  normalizeFormValues,
  validateEvento,
} from "../../../utils/validation";
import { normalizeAudience } from "../../../utils/audience";

export const AdminEditarEvento = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const { eventos, editarEvento } = useEventos();
  const { success, error } = useToast();

  const evento = eventos.find((item) => mismoId(item.id, id));

  const [formulario, setFormulario] = useState(
    evento || {
      titulo: "",
      fecha: "",
      lugar: "",
      categoria: "",
      descripcion: "",
      audiencia: normalizeAudience(),
    }
  );
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    setFormulario({
      ...formulario,
      [e.target.name]: e.target.value,
    });

    if (errors[e.target.name]) {
      setErrors({
        ...errors,
        [e.target.name]: "",
      });
    }
  };

  const handleAudienceChange = (field, value) => {
    setFormulario((prev) => {
      const audienciaActual = normalizeAudience(prev.audiencia);

      return {
        ...prev,
        audiencia: {
          ...audienciaActual,
          [field]: value,
        },
      };
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const datosNormalizados = normalizeFormValues(formulario);
    const validationErrors = validateEvento(datosNormalizados);

    if (hasValidationErrors(validationErrors)) {
      setErrors(validationErrors);
      error("Revisa los campos marcados");
      return;
    }

    editarEvento(id, datosNormalizados);
    success("Evento actualizado correctamente");
    navigate(ROUTES.ADMIN_EVENTOS);
  };

  if (!evento) {
    return (
      <section>
        <h2 className="text-red-600 font-bold text-xl">
          Evento no encontrado
        </h2>
      </section>
    );
  }

  return (
    <section className="space-y-6">
      <header>
        <h1 className="text-3xl font-bold text-slate-800 dark:text-white">
          Editar Evento
        </h1>
      </header>

      <EventoForm
        formulario={formulario}
        handleChange={handleChange}
        handleSubmit={handleSubmit}
        buttonText="Actualizar Evento"
        errors={errors}
        handleAudienceChange={handleAudienceChange}
      />
    </section>
  );
};
