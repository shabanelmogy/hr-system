import i18n from "i18next";
import { publicReportApiUrl } from "@/config/publicEnv";

type ReportRequestValue = string | number | boolean | null | undefined;
type ReportRequest = Record<string, ReportRequestValue>;
type ReportError = {
  status: number;
  title: string;
  errors: string[] | null;
  message: string;
};

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

  async processError(response: Response): Promise<ReportError> {
    const status = response.status;

    try {
      const data: unknown = await response.json();
      const record = isRecord(data) ? data : {};
      return {
        status,
        title: asString(record.title) ?? "Error",
        errors: normalizeErrors(record.errors),
        message: asString(record.title) ?? `Request failed with status ${status}`,
      };
    } catch {
      return {
        status,
        title: "Error",
        errors: null,
        message: `Request failed with status ${status}`,
      };
    }
  }

  async get(endpoint: string, params: ReportRequest = {}) {
    try {
      // Convert params object to URLSearchParams
      const queryParams = new URLSearchParams();
      for (const [key, value] of Object.entries(params)) {
        if (value !== undefined && value !== null) {
          queryParams.append(key, String(value));
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
        throw await this.processError(response);
      }

      return response;
    } catch (error) {
      console.error("GET error:", error);
      throw error;
    }
  }

  async post(endpoint: string, data: unknown, customHeaders: Record<string, string> = {}) {
    try {
      // Determine if we need to adjust headers based on data type
      const headers: Record<string, string> = {
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
        throw await this.processError(response);
      }

      return response;
    } catch (error) {
      console.log("POST error:", error);
      throw error;
    }
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function asString(value: unknown): string | undefined {
  return typeof value === "string" && value.trim() ? value : undefined;
}

function normalizeErrors(value: unknown): string[] | null {
  if (!value) return null;
  if (Array.isArray(value)) {
    return value.flatMap((item) => normalizeErrors(item) ?? []);
  }
  if (isRecord(value)) {
    return Object.values(value).flatMap((item) => normalizeErrors(item) ?? []);
  }
  return typeof value === "string" ? [value] : null;
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
