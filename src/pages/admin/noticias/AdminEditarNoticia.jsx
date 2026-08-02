import { useState } from "react";

import { useNavigate, useParams } from "react-router-dom";

import { useNoticias } from "../../../context/noticias/useNoticias";
import { useToast } from "../../../context/toast/useToast";
import { NoticiaForm } from "../../../components/noticias/NoticiaForm";
import { ROUTES } from "../../../constants/routes";
import { mismoId } from "../../../utils/id";
import {
  hasValidationErrors,
  normalizeFormValues,
  validateNoticia,
} from "../../../utils/validation";
import { normalizeAudience } from "../../../utils/audience";

export const AdminEditarNoticia = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const { noticias, editarNoticia } = useNoticias();
  const { success, error } = useToast();

  const noticia = noticias.find((item) => mismoId(item.id, id));

  const [formData, setFormData] = useState(
    noticia || {
      titulo: "",
      fecha: "",
      descripcion: "",
      audiencia: normalizeAudience(),
    }
  );
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

    editarNoticia(id, datosNormalizados);
    success("Noticia actualizado correctamente");
    navigate(ROUTES.ADMIN_NOTICIAS);
  };

  if (!noticia) {
    return (
      <section>
        <h2 className="text-red-600 font-bold text-xl">
          Noticia no encontrado
        </h2>
      </section>
    );
  }

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
        Editar Noticia
      </h1>

      <NoticiaForm
        formData={formData}
        handleChange={handleChange}
        handleSubmit={handleSubmit}
        buttonText="Actualizar Noticia"
        errors={errors}
        handleAudienceChange={handleAudienceChange}
      />
    </section>
  );
};
