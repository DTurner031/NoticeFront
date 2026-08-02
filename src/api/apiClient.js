import { appConfig } from "../config/appConfig";
import { getAuthToken } from "./authToken";
import { ApiError } from "./apiError";

const normalizeBaseUrl = (url) => String(url || "").replace(/\/$/, "");

const buildUrl = (path) => {
  const normalizedPath = String(path || "").startsWith("/") ? path : `/${path}`;
  return `${normalizeBaseUrl(appConfig.apiUrl)}${normalizedPath}`;
};

const buildHeaders = (headers = {}, hasJsonBody = false) => {
  const token = getAuthToken();
  const finalHeaders = new Headers(headers);

  if (hasJsonBody && !finalHeaders.has("Content-Type")) {
    finalHeaders.set("Content-Type", "application/json");
  }

  if (token && !finalHeaders.has("Authorization")) {
    finalHeaders.set("Authorization", `Bearer ${token}`);
  }

  return finalHeaders;
};

const parseResponse = async (response) => {
  const contentType = response.headers.get("content-type") || "";

  if (response.status === 204) return null;

  if (contentType.includes("application/json")) {
    return response.json();
  }

  return response.text();
};

export const apiClient = async (path, options = {}) => {
  const { body, headers, ...requestOptions } = options;
  const hasBody = body !== undefined && body !== null;
  const isFormData = typeof FormData !== "undefined" && body instanceof FormData;
  const hasJsonBody = hasBody && !isFormData && typeof body !== "string";

  const response = await fetch(buildUrl(path), {
    ...requestOptions,
    headers: buildHeaders(headers, hasJsonBody),
    body: hasJsonBody ? JSON.stringify(body) : body,
  });

  const data = await parseResponse(response);

  if (!response.ok) {
    const message =
      data?.message ||
      data?.error ||
      `Error HTTP ${response.status} al consultar el servidor.`;

    throw new ApiError(message, response.status, data);
  }

  return data;
};

export const get = (path) => apiClient(path, { method: "GET" });
export const post = (path, body) => apiClient(path, { method: "POST", body });
export const put = (path, body) => apiClient(path, { method: "PUT", body });
export const patch = (path, body) => apiClient(path, { method: "PATCH", body });
export const remove = (path) => apiClient(path, { method: "DELETE" });
