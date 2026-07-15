export interface District {
  id: string | number;
  nameAr: string;
  nameEn: string;
  code: string;
  stateId: number;
  state?: SimpleState;
  createdOn: string;
  updatedOn: string;
  isDeleted: boolean;
}

export interface SimpleState {
  id: string | number;
  nameAr: string;
  nameEn: string;
  code?: string;
  isDeleted: boolean;
}

export interface CreateDistrictRequest {
  nameAr: string;
  nameEn: string;
  code: string;
  stateId: number;
}

export interface UpdateDistrictRequest extends CreateDistrictRequest {
  id: string | number;
}
