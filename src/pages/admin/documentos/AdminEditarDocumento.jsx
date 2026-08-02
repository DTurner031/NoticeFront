import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import { DocumentoForm } from "../../../components/documentos/DocumentoForm";
import { useDocumentos } from "../../../context/documentos/useDocumentos";
import { useToast } from "../../../context/toast/useToast";
import { ROUTES } from "../../../constants/routes";
import { mismoId } from "../../../utils/id";
import {
  hasValidationErrors,
  normalizeFormValues,
  validateDocumento,
} from "../../../utils/validation";
import { normalizeAudience } from "../../../utils/audience";
import { inferDocumentTypeFromFile } from "../../../utils/documentTypes";

const documentoVacio = {
  titulo: "",
  tipo: "",
  fecha: "",
  descripcion: "",
  archivoNombre: "",
  archivoTipo: "",
  archivoTamaño: "",
  url: "",
  audiencia: normalizeAudience(),
};

export const AdminEditarDocumento = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const { documentos, editarDocumento } = useDocumentos();
  const { success, error } = useToast();

  const documento = documentos.find((item) => mismoId(item.id, id));

  const [formulario, setFormulario] = useState(() => ({
    ...documentoVacio,
    ...(documento || {}),
    titulo: documento?.titulo ?? documento?.nombre ?? "",
  }));
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
      editarDocumento(id, datosNormalizados);
      success("Documento actualizado correctamente");
      navigate(ROUTES.ADMIN_DOCUMENTOS);
    } catch {
      error("Error al actualizar documento");
    }
  };

  if (!documento) {
    return (
      <section>
        <h2 className="text-red-600 font-bold text-xl">
          Documento no encontrado
        </h2>
      </section>
    );
  }

  return (
    <section className="space-y-6">
      <h1 className="text-3xl font-bold">Editar Documento</h1>

      <DocumentoForm
        formulario={formulario}
        handleChange={handleChange}
        handleSubmit={handleSubmit}
        buttonText="Actualizar Documento"
        errors={errors}
        handleAudienceChange={handleAudienceChange}
      />
    </section>
  );
};
