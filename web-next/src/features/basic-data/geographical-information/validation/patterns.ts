export const englishLettersAndSpacesPattern = /^[A-Za-z\s]+$/;
export const arabicLettersAndSpacesPattern = /^[\p{Script=Arabic}\s]+$/u;
export const isoAlpha2CodePattern = /^[A-Za-z]{2}$/;
export const isoAlpha3CodePattern = /^[A-Za-z]{3}$/;
export const internationalPhoneCodePattern = /^\+?\d{1,10}$/;
export const currencyCodePattern = /^[A-Za-z]{3}$/;
export const stateCodePattern = /^[A-Za-z0-9-]{2,10}$/;
