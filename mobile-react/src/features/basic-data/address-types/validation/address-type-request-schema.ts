import type { TFunction } from 'i18next';
import { z } from 'zod';
import { createGeographicalNameSchema } from '../../validation/geographical-name';
export function createAddressTypeRequestSchema(t: TFunction) { return z.object({ nameAr: createGeographicalNameSchema(t), nameEn: createGeographicalNameSchema(t) }); }
