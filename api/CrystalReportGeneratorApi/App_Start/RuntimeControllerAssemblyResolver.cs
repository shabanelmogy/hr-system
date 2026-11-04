using System.Collections.Generic;
using System.Reflection;
using System.Web.Http.Dispatcher;

namespace CrystalReportGeneratorApi
{
    // Deployment-owned template directories may survive publication. Other old
    // assemblies must never contribute legacy controllers to this internal API.
    internal sealed class RuntimeControllerAssemblyResolver : IAssembliesResolver
    {
        public ICollection<Assembly> GetAssemblies() => new[] { typeof(WebApiConfig).Assembly };
    }
}
