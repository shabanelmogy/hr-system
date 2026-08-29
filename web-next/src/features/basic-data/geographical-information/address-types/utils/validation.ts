import { z } from "zod";
import { createGeographicalNameSchema } from "@/features/basic-data/geographical-information/validation/nameValidation";
import type { TFunction } from "i18next";

export type AddressTypeValidationSchema = z.infer<ReturnType<typeof getAddressTypeValidationSchema>>;

export const getAddressTypeValidationSchema = (t: TFunction) => {
  return z.object({
    // Required: Arabic Name
    nameAr: createGeographicalNameSchema(t),

    // Required: English Name
    nameEn: createGeographicalNameSchema(t),
  });
};

export default getAddressTypeValidationSchema;
