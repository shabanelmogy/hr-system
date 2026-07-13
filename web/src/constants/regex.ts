//write suitable regex for email and password
export const email = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

export const password =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z\d]).{8,}$/;

export const englishOnly = /^[a-zA-Z0-9-_ ]*$/;

export const arabicOnly = /^[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF ]*$/;

export const uppercaseCode = (length: number) => new RegExp(`^$|^[A-Z]{${length}}$`);

export const flexNumber = {
  // Exact length
  exact: (length: number) => new RegExp(`^$|^\\d{${length}}$`),

  // Range
  range: (min: number, max: number) => new RegExp(`^$|^\\d{${min},${max}}$`),

  // Minimum length
  min: (minLength: number) => new RegExp(`^$|^\\d{${minLength},}$`),

  // Maximum length
  max: (maxLength: number) => new RegExp(`^$|^\\d{1,${maxLength}}$`),

  // Required (no empty)
  required: (min: number = 1, max: number = 10) => new RegExp(`^\\d{${min},${max}}$`),
};

//how to use
//flexNumber.exact(3);
