interface ApiResponse<T = any> {
  value?: T;
  data?: T;
  isSuccess?: boolean;
  message?: string;
  errors?: string[];
}
