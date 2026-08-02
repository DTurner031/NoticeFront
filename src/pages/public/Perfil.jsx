import { useMemo, useState } from "react";

import { ProfileInfoForm } from "../../components/profile/ProfileInfoForm";
import { ProfileSummaryCard } from "../../components/profile/ProfileSummaryCard";
import { SubscriptionPreferences } from "../../components/profile/SubscriptionPreferences";
import { PersonalizedRecommendations } from "../../components/profile/PersonalizedRecommendations";
import { AcademicProfileSection } from "../../components/profile/AcademicProfileSection";
import { useAuth } from "../../context/auth/useAuth";
import { useToast } from "../../context/toast/useToast";
import { useNoticias } from "../../context/noticias/useNoticias";
import { useEventos } from "../../context/eventos/useEventos";
import { useDocumentos } from "../../context/documentos/useDocumentos";
import { normalizeSubscriptions } from "../../constants/subscriptions";
import {
  hasValidationErrors,
  normalizeFormValues,
  validatePerfil,
} from "../../utils/validation";
import { getPersonalizedRecommendations } from "../../utils/recommendations";

export const Perfil = () => {
  const { user, updateUserProfile } = useAuth();
  const { success, error } = useToast();
  const { noticias } = useNoticias();
  const { eventos } = useEventos();
  const { documentos } = useDocumentos();

  const [errors, setErrors] = useState({});
  const [formData, setFormData] = useState(() => ({
    nombre: user?.nombre ?? "",
    correo: user?.correo ?? "",
    boleta: user?.boleta ?? "",
    carrera: user?.carrera ?? "",
    semestre: user?.semestre ?? "",
  }));
  const [subscriptions, setSubscriptions] = useState(() =>
    normalizeSubscriptions(user?.subscriptions)
  );

  const recomendaciones = useMemo(
    () =>
      getPersonalizedRecommendations({
        noticias,
        eventos,
        documentos,
        user: user
          ? {
              ...user,
              subscriptions,
            }
          : null,
        limit: 5,
      }),
    [noticias, documentos, eventos, subscriptions, user]
  );

  if (!user) return null;

  const usuarioPreview = {
    ...user,
    ...formData,
    subscriptions,
  };

  const handleInfoChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  const handleSubmitInfo = (e) => {
    e.preventDefault();

    const datosNormalizados = normalizeFormValues(formData);
    const validationErrors = validatePerfil(datosNormalizados);

    if (hasValidationErrors(validationErrors)) {
      setErrors(validationErrors);
      error("Revisa los campos del perfil");
      return;
    }

    try {
      updateUserProfile(datosNormalizados);
      success("Perfil actualizado correctamente");
    } catch (err) {
      error(err.message || "No se pudo actualizar el perfil");
    }
  };

  const handleToggleTopic = (topicValue) => {
    setSubscriptions((prev) => {
      const topics = prev.topics.includes(topicValue)
        ? prev.topics.filter((topic) => topic !== topicValue)
        : [...prev.topics, topicValue];

      return {
        ...prev,
        topics,
      };
    });
  };

  const handleToggleChannel = (channelName) => {
    setSubscriptions((prev) => ({
      ...prev,
      [channelName]: !prev[channelName],
    }));
  };

  const handleAcademicProfileSave = (datosActualizados) => {
    updateUserProfile(datosActualizados);

    setFormData((prev) => ({
      ...prev,
      carrera: datosActualizados.carrera ?? prev.carrera,
      semestre: datosActualizados.semestre ?? prev.semestre,
    }));
  };

  const handleSubmitSubscriptions = (e) => {
    e.preventDefault();

    try {
      updateUserProfile({ subscriptions });
      success("Preferencias guardadas correctamente");
    } catch (err) {
      error(err.message || "No se pudieron guardar las preferencias");
    }
  };

  return (
    <section className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-slate-800 dark:text-white">
          Mi Perfil
        </h1>
        <p className="mt-2 text-slate-500 dark:text-slate-400">
          Administra tu información académica y tus preferencias de comunicación.
        </p>
      </div>

      <ProfileSummaryCard usuario={usuarioPreview} />

      <div className="grid gap-8 xl:grid-cols-[1.2fr_0.8fr]">
        <div className="space-y-8">
          <ProfileInfoForm
            formData={formData}
            errors={errors}
            onChange={handleInfoChange}
            onSubmit={handleSubmitInfo}
          />

          <AcademicProfileSection
            user={user}
            onSaveAcademicProfile={handleAcademicProfileSave}
          />

          <SubscriptionPreferences
            subscriptions={subscriptions}
            onToggleTopic={handleToggleTopic}
            onToggleChannel={handleToggleChannel}
            onSubmit={handleSubmitSubscriptions}
          />
        </div>

        <PersonalizedRecommendations items={recomendaciones} />
      </div>
    </section>
  );
};
