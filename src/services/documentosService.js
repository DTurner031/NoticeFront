import { crearId, mismoId } from "../utils/id";
import { normalizeAudience } from "../utils/audience";
import {
  obtenerDocumentosStorage,
  guardarDocumentosStorage,
} from "../storage/documentosStorage";

export const obtenerDocumentos = () => obtenerDocumentosStorage();


const normalizeContent = (content) => ({
  ...content,
  audiencia: normalizeAudience(content.audiencia),
});

export const guardarDocumentos = (documentos) =>
  guardarDocumentosStorage(documentos);

export const crearDocumento = (nuevoDocumento) => ({
  ...normalizeContent(nuevoDocumento),
  id: crearId(),
  createdAt: new Date().toISOString(),
});

export const agregarDocumentoLista = (documentos, nuevoDocumento) => [
  crearDocumento(nuevoDocumento),
  ...documentos,
];

export const editarDocumentoLista = (documentos, id, datosActualizados) =>
  documentos.map((documento) =>
    mismoId(documento.id, id)
      ? {
          ...documento,
          ...normalizeContent(datosActualizados),
          updatedAt: new Date().toISOString(),
        }
      : documento
  );

export const eliminarDocumentoLista = (documentos, id) =>
  documentos.filter((documento) => !mismoId(documento.id, id));
