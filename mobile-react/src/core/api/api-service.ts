import type { AxiosRequestConfig } from 'axios';

import { axiosClient } from '@/src/core/api/axios-client';

export const apiService = {
  async get<Response>(url: string, config?: AxiosRequestConfig): Promise<Response> {
    const response = await axiosClient.get<Response>(url, config);
    return response.data;
  },

  async post<Response, Request = undefined>(
    url: string,
    data?: Request,
    config?: AxiosRequestConfig<Request>,
  ): Promise<Response> {
    const response = await axiosClient.post<Response>(url, data, config);
    return response.data;
  },

  async put<Response, Request>(
    url: string,
    data: Request,
    config?: AxiosRequestConfig<Request>,
  ): Promise<Response> {
    const response = await axiosClient.put<Response>(url, data, config);
    return response.data;
  },

  async patch<Response, Request>(
    url: string,
    data: Request,
    config?: AxiosRequestConfig<Request>,
  ): Promise<Response> {
    const response = await axiosClient.patch<Response>(url, data, config);
    return response.data;
  },

  async delete<Response>(url: string, config?: AxiosRequestConfig): Promise<Response> {
    const response = await axiosClient.delete<Response>(url, config);
    return response.data;
  },

  async upload<Response>(
    url: string,
    formData: FormData,
    config?: AxiosRequestConfig<FormData>,
  ): Promise<Response> {
    const response = await axiosClient.post<Response>(url, formData, config);
    return response.data;
  },
};
