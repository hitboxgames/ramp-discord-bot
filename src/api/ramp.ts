import axios, { AxiosHeaders, InternalAxiosRequestConfig } from "axios";
import { AppConfig } from "../config";

let rampAccessToken: string | null = null;
let tokenExpiresAt: number | null = null;

async function fetchRampAccessToken() {
  try {
    const headers = {
      Accept: "application/json",
      Authorization: `Basic ${btoa(
        `${AppConfig.RAMP_CLIENT_ID}:${AppConfig.RAMP_CLIENT_SECRET}`
      )}`,
      "Content-Type": "application/x-www-form-urlencoded",
    };

    const requestBody = new URLSearchParams({
      grant_type: "client_credentials",
      scope: "users:read users:write transactions:read",
    });

    const response = await axios.post(
      "https://demo-api.ramp.com/developer/v1/token",
      requestBody.toString(),
      {
        headers: headers,
      }
    );
    const { access_token, expires_in } = response.data;
    rampAccessToken = access_token;
    tokenExpiresAt = Date.now() + expires_in * 1000;
    console.log("Ramp Access Token fetched successfully");
    return access_token;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error("Failed to fetch Ramp Access Token:", {
        status: error.response?.status,
        data: error.response?.data,
        message: error.message,
      });
    } else {
      console.error("Failed to fetch Ramp Access Token:", error);
    }
    throw error;
  }
}

async function getValidRampAccessToken() {
  if (!rampAccessToken || (tokenExpiresAt && Date.now() >= tokenExpiresAt)) {
    await fetchRampAccessToken();
  }
  return rampAccessToken;
}

const apiClient = axios.create({
  baseURL: "https://demo-api.ramp.com/developer/v1/",
});

apiClient.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    const token = await getValidRampAccessToken();

    if (token) {
      config.headers = AxiosHeaders.from(config.headers);
      config.headers.set("Authorization", `Bearer ${token}`);
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default apiClient;
