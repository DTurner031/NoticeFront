import { crearId, mismoId } from "../utils/id";
import { normalizeAudience } from "../utils/audience";
import {
  obtenerEventosStorage,
  guardarEventosStorage,
} from "../storage/eventosStorage";

export const obtenerEventos = () => obtenerEventosStorage();


const normalizeContent = (content) => ({
  ...content,
  audiencia: normalizeAudience(content.audiencia),
});

export const guardarEventos = (eventos) => guardarEventosStorage(eventos);

export const crearEvento = (nuevoEvento) => ({
  ...normalizeContent(nuevoEvento),
  id: crearId(),
  createdAt: new Date().toISOString(),
});

export const agregarEventoLista = (eventos, nuevoEvento) => [
  crearEvento(nuevoEvento),
  ...eventos,
];

export const editarEventoLista = (eventos, id, datosActualizados) =>
  eventos.map((evento) =>
    mismoId(evento.id, id)
      ? {
          ...evento,
          ...normalizeContent(datosActualizados),
          updatedAt: new Date().toISOString(),
        }
      : evento
  );

export const eliminarEventoLista = (eventos, id) =>
  eventos.filter((evento) => !mismoId(evento.id, id));
