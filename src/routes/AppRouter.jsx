import { Routes, Route } from "react-router-dom";

/* Layout principal */
import { Layout } from "../components/layout/Layout";

/* Páginas públicas */
import { Home } from "../pages/public/Home";

import { Noticias } from "../pages/public/Noticias";
import { NoticiaDetalle } from "../pages/public/NoticiaDetalle";

import { Eventos } from "../pages/public/Eventos";
import { EventoDetalle } from "../pages/public/EventoDetalle";

import { Calendario } from "../pages/public/Calendario";

import { Documentos } from "../pages/public/Documentos";
import { DocumentoDetalle } from "../pages/public/DocumentoDetalle";

import { Perfil } from "../pages/public/Perfil";
import { Notificaciones } from "../pages/public/Notificaciones";
import { DocentePublicaciones } from "../pages/docente/DocentePublicaciones";
import { NoAutorizado } from "../pages/NoAutorizado";

/* Autenticación */
import { Login } from "../pages/auth/Login";

/* Administración */
import { PanelAdmin } from "../pages/PanelAdmin";

import { AdminNoticias } from "../pages/admin/noticias/AdminNoticias";
import { AdminNuevoNoticia } from "../pages/admin/noticias/AdminNuevoNoticia";
import { AdminEditarNoticia } from "../pages/admin/noticias/AdminEditarNoticia";

import { AdminEventos } from "../pages/admin/eventos/AdminEventos";
import { AdminNuevoEvento } from "../pages/admin/eventos/AdminNuevoEvento";
import { AdminEditarEvento } from "../pages/admin/eventos/AdminEditarEvento";

import { AdminDocumentos } from "../pages/admin/documentos/AdminDocumentos";
import { AdminNuevoDocumento } from "../pages/admin/documentos/AdminNuevoDocumento";
import { AdminEditarDocumento } from "../pages/admin/documentos/AdminEditarDocumento";

import { AdminUsuarios } from "../pages/admin/usuarios/AdminUsuarios";
import { AdminNuevoUsuario } from "../pages/admin/usuarios/AdminNuevoUsuario";
import { AdminEditarUsuario } from "../pages/admin/usuarios/AdminEditarUsuario";
import { AdminAcademico } from "../pages/admin/academico/AdminAcademico";

/* Rutas protegidas */
import { PrivateRoute } from "./PrivateRoute";
import { AdminRoute } from "./AdminRoute";
import { RoleRoute } from "./RoleRoute";
import { ROUTES } from "../constants/routes";
import { ROLES } from "../constants/roles";

/* Error 404 */
import { NotFound } from "../pages/NotFound";

export const AppRouter = () => {
return ( <Routes>

  {/* Login */}
  <Route
    path={ROUTES.LOGIN}
    element={<Login />}
  />

  <Route
    path={ROUTES.NO_AUTORIZADO}
    element={
      <Layout>
        <NoAutorizado />
      </Layout>
    }
  />

  <Route
    path={ROUTES.NOT_FOUND}
    element={
      <Layout>
        <NotFound />
      </Layout>
    }
  />

  {/* Home */}
  <Route
    path={ROUTES.HOME}
    element={
      <Layout>
        <Home />
      </Layout>
    }
  />

  {/* Noticias */}
  <Route
    path={ROUTES.NOTICIAS}
    element={
      <Layout>
        <Noticias />
      </Layout>
    }
  />

  <Route
    path={ROUTES.NOTICIA_DETALLE}
    element={
      <Layout>
        <NoticiaDetalle />
      </Layout>
    }
  />

  {/* Eventos */}
  <Route
    path={ROUTES.EVENTOS}
    element={
      <Layout>
        <Eventos />
      </Layout>
    }
  />

  <Route
    path={ROUTES.EVENTO_DETALLE}
    element={
      <Layout>
        <EventoDetalle />
      </Layout>
    }
  />

  {/* Calendario */}
  <Route
    path={ROUTES.CALENDARIO}
    element={
      <Layout>
        <Calendario />
      </Layout>
    }
  />

  {/* Documentos */}
  <Route
    path={ROUTES.DOCUMENTOS}
    element={
      <Layout>
        <Documentos />
      </Layout>
    }
  />

  <Route
    path={ROUTES.DOCUMENTO_DETALLE}
    element={
      <Layout>
        <DocumentoDetalle />
      </Layout>
    }
  />

  {/* Perfil */}
  <Route
    path={ROUTES.PERFIL}
    element={
      <PrivateRoute>
        <Layout>
          <Perfil />
        </Layout>
      </PrivateRoute>
    }
  />

  {/* Notificaciones */}
  <Route
    path={ROUTES.NOTIFICACIONES}
    element={
      <PrivateRoute>
        <Layout>
          <Notificaciones />
        </Layout>
      </PrivateRoute>
    }
  />


  {/* Publicaciones docentes */}
  <Route
    path={ROUTES.DOCENTE_PUBLICACIONES}
    element={
      <RoleRoute roles={[ROLES.DOCENTE, ROLES.ADMIN, ROLES.SUPERADMIN]}>
        <Layout>
          <DocentePublicaciones />
        </Layout>
      </RoleRoute>
    }
  />

{/* Administración */}
<Route
  path={ROUTES.ADMIN}
  element={
    <AdminRoute>
      <Layout>
        <PanelAdmin />
      </Layout>
    </AdminRoute>
  }
/>

<Route
  path={ROUTES.ADMIN_NOTICIAS}
  element={
    <AdminRoute>
      <Layout>
        <AdminNoticias />
      </Layout>
    </AdminRoute>
  }
/>

<Route
  path={ROUTES.ADMIN_NOTICIAS_NUEVO}
  element={
    <AdminRoute>
      <Layout>
        <AdminNuevoNoticia />
      </Layout>
    </AdminRoute>
  }
/>

<Route
  path={ROUTES.ADMIN_NOTICIAS_EDITAR}
  element={
    <AdminRoute>
      <Layout>
        <AdminEditarNoticia />
      </Layout>
    </AdminRoute>
  }
/>

<Route
  path={ROUTES.ADMIN_EVENTOS}
  element={
    <AdminRoute>
      <Layout>
        <AdminEventos />
      </Layout>
    </AdminRoute>
  }
/>

<Route
  path={ROUTES.ADMIN_EVENTOS_NUEVO}
  element={
    <AdminRoute>
      <Layout>
        <AdminNuevoEvento />
      </Layout>
    </AdminRoute>
  }
/>

<Route
  path={ROUTES.ADMIN_EVENTOS_EDITAR}
  element={
    <AdminRoute>
      <Layout>
        <AdminEditarEvento />
      </Layout>
    </AdminRoute>
  }
/>

<Route
  path={ROUTES.ADMIN_DOCUMENTOS}
  element={
    <AdminRoute>
      <Layout>
        <AdminDocumentos />
      </Layout>
    </AdminRoute>
  }
/>

<Route
  path={ROUTES.ADMIN_DOCUMENTOS_NUEVO}
  element={
    <AdminRoute>
      <Layout>
        <AdminNuevoDocumento />
      </Layout>
    </AdminRoute>
  }
/>

<Route
  path={ROUTES.ADMIN_DOCUMENTOS_EDITAR}
  element={
    <AdminRoute>
      <Layout>
        <AdminEditarDocumento />
      </Layout>
    </AdminRoute>
  }
/>
<Route
  path={ROUTES.ADMIN_USUARIOS}
  element={
    <AdminRoute>
      <Layout>
        <AdminUsuarios />
      </Layout>
    </AdminRoute>
  }
/>

<Route
  path={ROUTES.ADMIN_USUARIOS_NUEVO}
  element={
    <AdminRoute>
      <Layout>
        <AdminNuevoUsuario />
      </Layout>
    </AdminRoute>
  }
/>

<Route
  path={ROUTES.ADMIN_USUARIOS_EDITAR}
  element={
    <AdminRoute>
      <Layout>
        <AdminEditarUsuario />
      </Layout>
    </AdminRoute>
  }
/>

<Route
  path={ROUTES.ADMIN_ACADEMICO}
  element={
    <AdminRoute>
      <Layout>
        <AdminAcademico />
      </Layout>
    </AdminRoute>
  }
/>
<Route
  path="*"
  element={
    <Layout>
      <NotFound />
    </Layout>
  }
/>
</Routes>



);
};
