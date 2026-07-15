using HrManagementSystem.Features.Catalog.Categories.Contracts;
using HrManagementSystem.Features.Catalog.Categories.Entities;
using HrManagementSystem.Features.Catalog.SubCategories.Contracts;
using HrManagementSystem.Features.Catalog.SubCategories.Entities;
using HrManagementSystem.Features.Security.Authentication.Entities;
using HrManagementSystem.Features.Security.Users.Contracts;

namespace HrManagementSystem.Infrastructure.Mapping;

public class MappingConfigurations : IRegister
{
    public void Register(TypeAdapterConfig config)
    {
        config.NewConfig<(ApplicationUser user, IList<string> roles), UserResponse>()
            .Map(dest => dest, src => src.user)
            .Map(dest => dest.Roles, src => src.roles);

        config.NewConfig<CreateUserRequest, ApplicationUser>()
            .Map(dest => dest.EmailConfirmed, src => true);

        config.NewConfig<Category, CategoryResponse>()
              .Map(dest => dest.SubCategories, src => src.CategorySubcategories.Select(cs => cs.SubCategory));

        //config.NewConfig<Category, CategoryResponse>()
        //      .Map(dest => dest.SubCategories, src => src.CategorySubcategories
        //      .Select(cs => cs.SubCategory)
        //      .Where(sc => !sc.IsDeleted));

        // Configure this in your startup or wherever you initialize Mapster
        config.NewConfig<SubCategory, SubCategoryResponse>()
            .Map(dest => dest.Categories, src => src.CategorySubcategories.Select(cs => cs.Category).ToList());


        // Configure this in your startup or wherever you initialize Mapster
        config.NewConfig<SubCategoryRequest, SubCategory>()
            .Map(dest => dest.CategorySubcategories,
                src => (src.CategoryIds != null && src.CategoryIds.Count > 0)
                ? src.CategoryIds.Select(id => new CategorySubcategory { CategoryId = id }).ToList()
                : new List<CategorySubcategory>());

        config.NewConfig<ApplicationUser, UserResponse>();

        //config.NewConfig<UpdateUserRequest, ApplicationUser>()
        //    .Map(dest => dest.NormalizedUserName, src => src.UserName.ToUpper())
        //    .Map(dest => dest.NormalizedEmail, src => src.Email.ToUpper());

    }
}
