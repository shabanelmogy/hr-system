namespace HrManagementSystem.Shared.Consts
{
    public static class RegexPattern
    {
        public const string Password = "(?=(.*[0-9]))(?=.*[\\!@#$%^&*()\\\\[\\]{}\\-_+=~`|:;\"'<>,./?])(?=.*[a-z])(?=(.*[A-Z]))(?=(.*)).{8,}";
        public const string Username = "^[a-zA-Z0-9-._@+]*$";
        public const string CharactersOnly_Eng = "^[a-zA-Z-_ ]*$";
        public const string CharactersOnly_Ar = "^[\u0600-\u065F\u066A-\u06EF\u06FA-\u06FF ]*$";
        public const string NumbersAndChrOnly_ArEng = "^(?=.*[\u0600-\u065F\u066A-\u06EF\u06FA-\u06FFa-zA-Z])[\u0600-\u065F\u066A-\u06EF\u06FA-\u06FFa-zA-Z0-9 _-]+$";
        public const string DenySpecialCharacters = "^[^<>!#%$]*$";
        public const string MobileNumber = "^01[0,1,2,5]{1}[0-9]{8}$";
        public const string NationalId = "^[2,3]{1}[0-9]{13}$";
        public const string Email = "^[a-zA-Z0-9._%+]+@[a-zA-Z0-9]+(\\.[a-zA-Z]{2,})+$";
        public const string UploadedFile = "^[A-Za-z0-9_\\-.]*$";
        public const string EnglishLettersAndSpaces = "^[A-Za-z\\s]+$";
        public const string ArabicLettersAndSpaces = "^[\\p{IsArabic}\\s]+$";
        public const string IsoAlpha2Code = "^[A-Za-z]{2}$";
        public const string IsoAlpha3Code = "^[A-Za-z]{3}$";
        public const string InternationalPhoneCode = "^\\+?\\d{1,10}$";
        public const string CurrencyCode = "^[A-Za-z]{3}$";
        public const string StateCode = "^[A-Za-z0-9-]{2,10}$";
    }
}
