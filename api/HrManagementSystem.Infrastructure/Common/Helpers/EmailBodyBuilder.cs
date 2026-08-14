namespace HrManagementSystem.Infrastructure.Common.Helpers
{
    public static class EmailBodyBuilder
    {
        public static string GenerateEmailBody(string template, Dictionary<string, string> templateModel)
        {
            var templatePath = Path.Combine(AppContext.BaseDirectory, "Templates", $"{template}.html");
            string body;
            using (var streamReader = new StreamReader(templatePath))
            {
                body = streamReader.ReadToEnd();
            }

            foreach (var item in templateModel)
                body = body.Replace(item.Key, item.Value);

            return body;
        }
    }
}
