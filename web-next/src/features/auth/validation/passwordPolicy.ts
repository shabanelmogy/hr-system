// Mirrors Shared.Consts.RegexPattern.Password in the API.
export const passwordPolicyPattern =
  /^(?=.*\d)(?=.*[!@#$%^&*()[\]{}\-_+=~`|:;"'<>,./?])(?=.*[a-z])(?=.*[A-Z]).{8,}$/;
