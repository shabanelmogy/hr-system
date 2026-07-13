import i18n from "i18next";

class ReportApiService {
  constructor(baseURL) {
    this.baseURL = baseURL;
    this.defaultHeaders = {
      "Content-Type": "application/json",
      "X-ApiKey": "company",
    };
  }

  getHeaders() {
    return {
      ...this.defaultHeaders,
      Culture: i18n.language || "en",
    };
  }

  processError(error, response) {
    if (!response) {
      return {
        status: 0,
        title: "Network Error",
        message: "Failed to connect to the server",
      };
    }

    const status = response.status;

    return response
      .json()
      .then((data) => ({
        status,
        title: data?.title || "Error",
        errors: data?.errors ? Object.values(data.errors).flat() : null,
        message: data?.title || `Request failed with status ${status}`,
      }))
      .catch(() => ({
        status,
        title: "Error",
        message: `Request failed with status ${status}`,
      }));
  }

  async get(endpoint, params = {}) {
    try {
      // Convert params object to URLSearchParams
      const queryParams = new URLSearchParams();
      for (const [key, value] of Object.entries(params)) {
        if (value !== undefined && value !== null) {
          queryParams.append(key, value);
        }
      }

      // Construct full URL with query string
      const safeEndpoint = endpoint.startsWith("/") ? endpoint : `/${endpoint}`;
      const url = `${this.baseURL}${safeEndpoint}${
        queryParams.toString() ? `?${queryParams.toString()}` : ""
      }`;

      // Perform fetch
      const response = await fetch(url, {
        method: "GET",
      });

      if (!response.ok) {
        throw await this.processError(null, response);
      }

      return response;
    } catch (error) {
      console.error("GET error:", error);
      throw error;
    }
  }

  async post(endpoint, data, customHeaders = {}) {
    try {
      // Determine if we need to adjust headers based on data type
      let headers = {
        ...this.getHeaders(),
        ...customHeaders,
      };

      // Remove Content-Type if FormData is being sent
      if (data instanceof FormData) {
        delete headers["Content-Type"];
      }

      const safeEndpoint = endpoint.startsWith("/") ? endpoint : `/${endpoint}`;
      const response = await fetch(`${this.baseURL}${safeEndpoint}`, {
        method: "POST",
        headers,
        body: data instanceof FormData ? data : JSON.stringify(data),
      });

      if (!response.ok) {
        throw await this.processError(null, response);
      }

      return response;
    } catch (error) {
      console.log("POST error:", error);
      throw error;
    }
  }
}

// Create specialized report service
const reportEnvUrl =
  import.meta.env.VITE_REPORT_API_URL &&
  import.meta.env.VITE_REPORT_API_URL.trim();

const reportLsUrl = localStorage.getItem("reportApiUrl");
const reportBaseUrl = reportLsUrl || reportEnvUrl;

const reportApiService = new ReportApiService(reportBaseUrl);

export default reportApiService;
