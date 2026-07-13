import i18n from "i18next";
import { publicReportApiUrl } from "@/config/publicEnv";

class ReportApiService {
  private getBaseURL: () => string;
  private defaultHeaders: Record<string, string>;

  constructor(getBaseURL: () => string) {
    this.getBaseURL = getBaseURL;
    this.defaultHeaders = {
      "Content-Type": "application/json",
      "X-ApiKey": "company",
    };
  }

  buildUrl(endpoint: string) {
    const baseURL = this.getBaseURL();
    const normalizedBaseURL = baseURL.replace(/\/+$/, "");
    const normalizedEndpoint = endpoint.replace(/^\/+/, "");
    return `${normalizedBaseURL}/${normalizedEndpoint}`;
  }

  getHeaders() {
    return {
      ...this.defaultHeaders,
      Culture: i18n.language || "en",
    };
  }

  processError(error: any, response: any) {
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
      .then((data: any) => ({
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

  async get(endpoint: string, params: any = {}) {
    try {
      // Convert params object to URLSearchParams
      const queryParams = new URLSearchParams();
      for (const [key, value] of Object.entries(params)) {
        if (value !== undefined && value !== null) {
          queryParams.append(key, value as string);
        }
      }

      // Construct full URL with query string
      const url = `${this.buildUrl(endpoint)}${
        queryParams.toString() ? `?${queryParams.toString()}` : ""
      }`;

      // Perform fetch
      const response = await fetch(url, {
        method: "GET",
        headers: this.getHeaders(),
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

  async post(endpoint: string, data: any, customHeaders: any = {}) {
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

      const response = await fetch(this.buildUrl(endpoint), {
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
const getReportBaseUrl = () => {
  if (!publicReportApiUrl) {
    throw {
      status: 0,
      title: "Report API is not configured",
      message: "Set NEXT_PUBLIC_REPORT_API_URL.",
    };
  }

  return publicReportApiUrl;
};

const reportApiService = new ReportApiService(getReportBaseUrl);

export default reportApiService;
