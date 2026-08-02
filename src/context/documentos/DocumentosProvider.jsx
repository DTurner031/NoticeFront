import { useCallback, useEffect, useMemo, useState } from "react";

import {
  obtenerDocumentos,
  guardarDocumentos,
  agregarDocumentoLista,
  editarDocumentoLista,
  eliminarDocumentoLista,
} from "../../services/documentosService";
import { DocumentosContext } from "./DocumentosContext";

export const DocumentosProvider = ({ children }) => {
  const [documentos, setDocumentos] = useState(() => obtenerDocumentos());

  useEffect(() => {
    guardarDocumentos(documentos);
  }, [documentos]);

  const agregarDocumento = useCallback((nuevoDocumento) => {
    setDocumentos((prev) => agregarDocumentoLista(prev, nuevoDocumento));
  }, []);

  const eliminarDocumento = useCallback((id) => {
    setDocumentos((prev) => eliminarDocumentoLista(prev, id));
  }, []);

  const editarDocumento = useCallback((id, datosActualizados) => {
    setDocumentos((prev) => editarDocumentoLista(prev, id, datosActualizados));
  }, []);

  const value = useMemo(
    () => ({
      documentos,
      agregarDocumento,
      eliminarDocumento,
      editarDocumento,
    }),
    [documentos, agregarDocumento, eliminarDocumento, editarDocumento]
  );

  return (
    <DocumentosContext.Provider value={value}>
      {children}
    </DocumentosContext.Provider>
  );
};
