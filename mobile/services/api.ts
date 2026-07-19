import axios from "axios";

function resolveBaseUrl(): string {
  const raw = (process.env.EXPO_PUBLIC_BACK || "").trim();

  if (!raw) {
    console.warn(
      "EXPO_PUBLIC_BACK is not set. API calls will fail until mobile/.env is configured."
    );
    return "";
  }

  const withProtocol = /^https?:\/\//i.test(raw) ? raw : `https://${raw}`;
  const withSlash = withProtocol.endsWith("/") ? withProtocol : `${withProtocol}/`;
  return `${withSlash}api`;
}

export const BASE_URL = resolveBaseUrl();

export const api = axios.create({
  baseURL: BASE_URL || undefined,
  timeout: 45000, // Render free tier cold starts can be slow
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.code === "ECONNABORTED") {
      error.message =
        "Request timed out. The backend may be waking up — try again in a few seconds.";
    } else if (!error.response) {
      error.message =
        error.message ||
        "Network error. Check EXPO_PUBLIC_BACK and that the backend is online.";
    }
    return Promise.reject(error);
  }
);

if (__DEV__) {
  console.log("API base URL:", BASE_URL || "(missing EXPO_PUBLIC_BACK)");
}
