export const fiscalYearEndpoints = {
  base: 'fiscal-years', lookup: 'fiscal-years/lookup', context: 'fiscal-years/context', byId: (id: number) => `fiscal-years/${id}`,
  restore: (id: number) => `fiscal-years/${id}/restore`, open: (id: number) => `fiscal-years/${id}/open`,
  beginClosing: (id: number) => `fiscal-years/${id}/begin-closing`, close: (id: number) => `fiscal-years/${id}/close`, lock: (id: number) => `fiscal-years/${id}/lock`, reopen: (id: number) => `fiscal-years/${id}/reopen`, setCurrent: (id: number) => `fiscal-years/${id}/set-current`,
} as const;
