export const fiscalYearEndpoints = {
  base: 'fiscal-years', lookup: 'fiscal-years/lookup', byId: (id: number) => `fiscal-years/${id}`,
  restore: (id: number) => `fiscal-years/${id}/restore`, open: (id: number) => `fiscal-years/${id}/open`,
  beginClosing: (id: number) => `fiscal-years/${id}/begin-closing`, close: (id: number) => `fiscal-years/${id}/close`, lock: (id: number) => `fiscal-years/${id}/lock`,
} as const;
