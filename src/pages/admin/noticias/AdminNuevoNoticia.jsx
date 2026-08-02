import { useState } from "react";
import { useNavigate } from "react-router-dom";

import { useNoticias } from "../../../context/noticias/useNoticias";
import { useToast } from "../../../context/toast/useToast";
import { NoticiaForm } from "../../../components/noticias/NoticiaForm";
import { ROUTES } from "../../../constants/routes";
import {
  hasValidationErrors,
  normalizeFormValues,
  validateNoticia,
} from "../../../utils/validation";
import { normalizeAudience } from "../../../utils/audience";

export const AdminNuevoNoticia = () => {
  const navigate = useNavigate();

  const { agregarNoticia } = useNoticias();
  const { success, error } = useToast();

  const [formData, setFormData] = useState({
    titulo: "",
    fecha: "",
    descripcion: "",
    audiencia: normalizeAudience(),
  });
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    setFormData({
      ...formData,
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
    setFormData((prev) => {
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

    const datosNormalizados = normalizeFormValues(formData);
    const validationErrors = validateNoticia(datosNormalizados);

    if (hasValidationErrors(validationErrors)) {
      setErrors(validationErrors);
      error("Revisa los campos marcados");
      return;
    }

    agregarNoticia(datosNormalizados);
    success("Noticia creado correctamente");
    navigate(ROUTES.ADMIN_NOTICIAS);
  };

  return (
    <section>
      <h1
        className="
          text-3xl
          font-bold
          mb-8
          text-slate-800
          dark:text-white
        "
      >
        Nuevo Noticia
      </h1>

      <NoticiaForm
        formData={formData}
        handleChange={handleChange}
        handleSubmit={handleSubmit}
        buttonText="Guardar Noticia"
        errors={errors}
        handleAudienceChange={handleAudienceChange}
      />
    </section>
  );
};
