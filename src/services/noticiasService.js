import { crearId, mismoId } from "../utils/id";
import { normalizeAudience } from "../utils/audience";
import {
  obtenerNoticiasStorage,
  guardarNoticiasStorage,
} from "../storage/noticiasStorage";

export const obtenerNoticias = () => obtenerNoticiasStorage();


const normalizeContent = (content) => ({
  ...content,
  audiencia: normalizeAudience(content.audiencia),
});

export const guardarNoticias = (noticias) => guardarNoticiasStorage(noticias);

export const crearNoticia = (nuevoNoticia) => ({
  ...normalizeContent(nuevoNoticia),
  id: crearId(),
  createdAt: new Date().toISOString(),
});

export const agregarNoticiaLista = (noticias, nuevoNoticia) => [
  crearNoticia(nuevoNoticia),
  ...noticias,
];

export const editarNoticiaLista = (noticias, id, datosActualizados) =>
  noticias.map((noticia) =>
    mismoId(noticia.id, id)
      ? {
          ...noticia,
          ...normalizeContent(datosActualizados),
          updatedAt: new Date().toISOString(),
        }
      : noticia
  );

export const eliminarNoticiaLista = (noticias, id) =>
  noticias.filter((noticia) => !mismoId(noticia.id, id));
