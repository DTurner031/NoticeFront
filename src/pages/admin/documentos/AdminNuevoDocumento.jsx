import { useState } from "react";
import { useNavigate } from "react-router-dom";

import { DocumentoForm } from "../../../components/documentos/DocumentoForm";
import { useDocumentos } from "../../../context/documentos/useDocumentos";
import { useToast } from "../../../context/toast/useToast";
import { ROUTES } from "../../../constants/routes";
import {
  hasValidationErrors,
  normalizeFormValues,
  validateDocumento,
} from "../../../utils/validation";
import { normalizeAudience } from "../../../utils/audience";
import { inferDocumentTypeFromFile } from "../../../utils/documentTypes";

export const AdminNuevoDocumento = () => {
  const navigate = useNavigate();

  const { agregarDocumento } = useDocumentos();
  const { success, error } = useToast();

  const [formulario, setFormulario] = useState({
    titulo: "",
    tipo: "",
    fecha: "",
    descripcion: "",
    archivoNombre: "",
    archivoTipo: "",
    archivoTamaño: "",
    url: "",
    audiencia: normalizeAudience(),
  });
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value, files, type } = e.target;

    if (type === "file") {
      const file = files?.[0];

      if (!file) return;

      setFormulario({
        ...formulario,
        tipo: formulario.tipo || inferDocumentTypeFromFile(file.name),
        archivoNombre: file.name,
        archivoTipo: file.type,
        archivoTamaño: file.size,
      });

      if (errors.tipo) {
        setErrors({
          ...errors,
          tipo: "",
        });
      }

      return;
    }

    setFormulario({
      ...formulario,
      [name]: value,
    });

    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: "",
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
    const validationErrors = validateDocumento(datosNormalizados);

    if (hasValidationErrors(validationErrors)) {
      setErrors(validationErrors);
      error("Revisa los campos marcados");
      return;
    }

    try {
      agregarDocumento(datosNormalizados);
      success("Documento creado correctamente");
      navigate(ROUTES.ADMIN_DOCUMENTOS);
    } catch {
      error("Error al crear documento");
    }
  };

  return (
    <section className="space-y-6">
      <h1 className="text-3xl font-bold">Nuevo Documento</h1>

      <DocumentoForm
        formulario={formulario}
        handleChange={handleChange}
        handleSubmit={handleSubmit}
        buttonText="Guardar Documento"
        errors={errors}
        handleAudienceChange={handleAudienceChange}
      />
    </section>
  );
};
