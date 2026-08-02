import { useCallback, useEffect, useMemo, useState } from "react";

import {
  obtenerNoticias,
  guardarNoticias,
  agregarNoticiaLista,
  editarNoticiaLista,
  eliminarNoticiaLista,
} from "../../services/noticiasService";
import { NoticiasContext } from "./NoticiasContext";

export const NoticiasProvider = ({ children }) => {
  const [noticias, setNoticias] = useState(() => obtenerNoticias());

  useEffect(() => {
    guardarNoticias(noticias);
  }, [noticias]);

  const agregarNoticia = useCallback((nuevoNoticia) => {
    setNoticias((prev) => agregarNoticiaLista(prev, nuevoNoticia));
  }, []);

  const eliminarNoticia = useCallback((id) => {
    setNoticias((prev) => eliminarNoticiaLista(prev, id));
  }, []);

  const editarNoticia = useCallback((id, datosActualizados) => {
    setNoticias((prev) => editarNoticiaLista(prev, id, datosActualizados));
  }, []);

  const value = useMemo(
    () => ({
      noticias,
      agregarNoticia,
      eliminarNoticia,
      editarNoticia,
    }),
    [noticias, agregarNoticia, eliminarNoticia, editarNoticia]
  );

  return (
    <NoticiasContext.Provider value={value}>
      {children}
    </NoticiasContext.Provider>
  );
};
