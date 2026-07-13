/* eslint-disable no-undef */
import apiRoutes from "@/routes/apiRoutes";
import axios from "axios";
import i18n from "i18next";

class ApiService {
  constructor() {
    this.api = axios.create({
      baseURL: this.getBaseURL(),
      headers: {
        "Content-Type": "application/json",
      },
    });

    this.isRefreshing = false;
    this.refreshSubscribers = [];

    this.api.interceptors.request.use(
      (config) => {
        if (config.skipAuthInterceptor) {
          return config;
        }

        const token = sessionStorage.getItem("token");
        if (
          token &&
          !config.url?.includes(apiRoutes.auth.login) &&
          !config.url?.includes(apiRoutes.auth.refreshToken)
        ) {
          config.headers["Authorization"] = `Bearer ${token}`;
        }
        config.headers["Culture"] = i18n.language || "en";
        return config;
      },
      (error) => Promise.reject(error)
    );

    this.api.interceptors.response.use(
      (response) => response,
      async (error) => this.handleResponseError(error)
    );
  }

  getBaseURL() {
    const envUrl =
      import.meta.env.VITE_API_URL && import.meta.env.VITE_API_URL.trim();

    const lsUrl = localStorage.getItem("baseApiUrl");

    if (lsUrl) {
      return lsUrl;
    } else {
      return envUrl;
    }
  }

  async handleResponseError(error) {
    const originalRequest = error.config;
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      if (!this.isRefreshing) {
        this.isRefreshing = true;
        try {
          await this.refreshToken();
          this.isRefreshing = false;

          this.refreshSubscribers.forEach((callback) =>
            callback(sessionStorage.getItem("token"))
          );
          this.refreshSubscribers = [];

          originalRequest.headers[
            "Authorization"
          ] = `Bearer ${sessionStorage.getItem("token")}`;
          return this.api(originalRequest);
        } catch (refreshError) {
          this.isRefreshing = false;
          this.refreshSubscribers = [];
          return Promise.reject(refreshError);
        }
      }

      return new Promise((resolve) => {
        this.refreshSubscribers.push((newToken) => {
          originalRequest.headers["Authorization"] = `Bearer ${newToken}`;
          resolve(this.api(originalRequest));
        });
      });
    }

    return Promise.reject(error);
  }

  async refreshToken() {
    const token = sessionStorage.getItem("token");
    const refreshToken = sessionStorage.getItem("refreshToken");

    if (!refreshToken || !token) {
      this.logout();
      this.navigateToLogin();
      throw new Error("No refresh token available");
    }

    try {
      const response = await this.api.post(apiRoutes.auth.refreshToken, {
        token,
        refreshToken,
      });

      const { token: newToken, refreshToken: newRefreshToken } = response.data;

      if (!newToken || !newRefreshToken) {
        throw new Error("Invalid refresh token response");
      }

      sessionStorage.setItem("token", newToken);
      sessionStorage.setItem("refreshToken", newRefreshToken);
    } catch {
      this.logout();
      this.navigateToLogin();
    }
  }

  async request(method, endpoint, data, headers = {}) {
    try {
      const response = await this.api({ method, url: endpoint, data, headers });
      return response.data;
    } catch (error) {
      console.log("Error in API request:", error);
      if (
        error.response?.status === 401 &&
        !endpoint.includes(apiRoutes.auth.refreshToken)
      ) {
        this.logout();
        this.navigateToLogin();
      }
      throw this.processError(error);
    }
  }

  processError(error) {
    if (!error.response) {
      return {
        status: 0,
        title: "Network Error",
        message: "Failed to connect to the server",
      };
    }

    const { status, data } = error.response;
    return {
      status,
      title: data?.title || "Error",
      errors: data?.errors ? Object.values(data.errors).flat() : null,
      message: data?.title || `Request failed with status ${status}`,
    };
  }

  async get(endpoint, params = {}) {
    return this.request("get", endpoint, { params });
  }

  async post(endpoint, data, customHeaders = {}) {
    const headers = {
      ...(data instanceof FormData
        ? {}
        : { "Content-Type": "application/json" }),
      ...customHeaders,
    };
    return this.request("post", endpoint, data, headers);
  }

  async put(endpoint, data) {
    return this.request("put", endpoint, data);
  }

  async delete(endpoint) {
    return this.request("delete", endpoint);
  }

  logout() {
    sessionStorage.removeItem("token");
    sessionStorage.removeItem("refreshToken");
    this.isRefreshing = false;
    this.refreshSubscribers = [];
  }

  setNavigateFunction(navigate) {
    this.navigate = navigate;
  }

  navigateToLogin() {
    if (this.navigate) {
      this.navigate("/login", { replace: true });
    } else {
      window.location.href = "/login";
    }
  }

  async externalAuth(endpoint, data) {
    try {
      const response = await this.api({
        method: "post",
        url: endpoint,
        data,
        headers: {
          "Content-Type": "application/json",
          Culture: i18n.language || "en",
        },
        skipAuthInterceptor: true,
      });
      return response.data;
    } catch (error) {
      console.log("Error in external auth request:", error);
      throw this.processError(error);
    }
  }
}

const apiService = new ApiService();

export default apiService;
