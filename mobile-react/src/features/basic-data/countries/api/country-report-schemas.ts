import { z } from 'zod';

export const countryReportInfoSchema = z.object({
  Id: z.string().min(1),
  ReportPath: z.string().min(1),
  Title: z.string().min(1),
  Subject: z.string().min(1),
});

export type CountryReportInfo = z.infer<typeof countryReportInfoSchema>;
