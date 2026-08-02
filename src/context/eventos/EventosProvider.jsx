import { useCallback, useEffect, useMemo, useState } from "react";

import {
  obtenerEventos,
  guardarEventos,
  agregarEventoLista,
  editarEventoLista,
  eliminarEventoLista,
} from "../../services/eventosService";
import { EventosContext } from "./EventosContext";

export const EventosProvider = ({ children }) => {
  const [eventos, setEventos] = useState(() => obtenerEventos());

  useEffect(() => {
    guardarEventos(eventos);
  }, [eventos]);

  const agregarEvento = useCallback((nuevoEvento) => {
    setEventos((prev) => agregarEventoLista(prev, nuevoEvento));
  }, []);

  const eliminarEvento = useCallback((id) => {
    setEventos((prev) => eliminarEventoLista(prev, id));
  }, []);

  const editarEvento = useCallback((id, datosActualizados) => {
    setEventos((prev) => editarEventoLista(prev, id, datosActualizados));
  }, []);

  const value = useMemo(
    () => ({
      eventos,
      agregarEvento,
      eliminarEvento,
      editarEvento,
    }),
    [eventos, agregarEvento, eliminarEvento, editarEvento]
  );

  return (
    <EventosContext.Provider value={value}>
      {children}
    </EventosContext.Provider>
  );
};
