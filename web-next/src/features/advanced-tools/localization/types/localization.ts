export interface LocalizationEntry {
  id: string;
  key: string;
  value: string;
}

export interface UpdateLocalizationRequest {
  language: string;
  key: string;
  value: string;
}
