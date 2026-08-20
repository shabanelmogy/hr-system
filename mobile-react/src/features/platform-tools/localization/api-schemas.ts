import { z } from 'zod';

export const localizationSchema = z.record(z.string(), z.string());
