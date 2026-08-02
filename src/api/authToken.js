import { appConfig } from "../config/appConfig";

const canUseStorage = () => typeof window !== "undefined" && window.localStorage;

export const getAuthToken = () => {
  if (!canUseStorage()) return null;
  return window.localStorage.getItem(appConfig.authTokenKey);
};

export const setAuthToken = (token) => {
  if (!canUseStorage()) return;

  if (!token) {
    window.localStorage.removeItem(appConfig.authTokenKey);
    return;
  }

  window.localStorage.setItem(appConfig.authTokenKey, token);
};

export const clearAuthToken = () => setAuthToken(null);
