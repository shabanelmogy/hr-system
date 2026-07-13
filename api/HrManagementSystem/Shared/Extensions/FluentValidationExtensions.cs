namespace HrManagementSystem.Shared.Extensions;

public static class FluentValidationExtensions
{
    public static IRuleBuilderOptions<T, string> Trimmed<T>(this IRuleBuilder<T, string> ruleBuilder)
    {
        return (IRuleBuilderOptions<T, string>)ruleBuilder.Custom((value, context) => // Fix for CS0266: Explicit cast added
        {
            if (value != null && context.PropertyPath is not null) // Fix for CS0618: Replaced PropertyName with PropertyPath
            {
                var instance = context.InstanceToValidate;
                var instanceType = typeof(T);
                var property = instanceType.GetProperty(context.PropertyPath); // Fix for CS0618: Replaced PropertyName with PropertyPath
                if (property != null && property.CanWrite)
                {
                    var trimmed = value.Trim();
                    property.SetValue(instance, trimmed);
                }
            }
        });
    }
}


