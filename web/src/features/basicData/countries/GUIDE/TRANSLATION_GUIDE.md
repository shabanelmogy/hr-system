# Countries Translation Guide

## Overview

This guide provides comprehensive documentation for all translation keys used in the Countries feature. The application uses `react-i18next` for internationalization with support for English and Arabic languages.

## Translation Structure

### File Locations
- **English**: `src/locales/en/translation.json`
- **Arabic**: `src/locales/ar/translation.json`

### Usage Pattern
```typescript
import { useTranslation } from "react-i18next";

const { t } = useTranslation();
const translatedText = t("countries.title"); // Returns "Countries" or "الدول"
```

## Countries Translation Keys

### Core Country Keys

#### Basic Information
```json
{
  "countries": {
    "title": "Countries",                    // "الدول"
    "subTitle": "List of countries",         // "قائمة الدول"
    "viewTitle": "Countries Management",     // "إدارة الدول"
    "country": "Country",                    // "دولة"
    "name": "Country Name",                  // "اسم الدولة"
    "code": "Country Code",                  // "رمز الدولة"
    "flag": "Country Flag"                   // "علم الدولة"
  }
}
```

#### Country Codes
```json
{
  "countries": {
    "alpha2Code": "Alpha-2 Code",           // "الكود الثنائى"
    "alpha3Code": "Alpha-3 Code",           // "الكود الثلاثى"
    "phoneCode": "Phone Code",              // "كود الهاتف"
    "currencyCode": "Currency Code"         // "كود العملة"
  }
}
```

#### CRUD Operations
```json
{
  "countries": {
    "view": "View Country",                 // "اظهار الدولة"
    "add": "Add Country",                   // "إضافة دولة"
    "edit": "Edit Country",                 // "تعديل دولة"
    "delete": "Delete Country",             // "حذف دولة"
    "list": "Country List",                 // "قائمة الدول"
    "details": "Country Details"            // "تفاصيل الدولة"
  }
}
```

#### Status Messages
```json
{
  "countries": {
    "created": "Country created successfully",        // "تم إنشاء الدولة بنجاح"
    "updated": "Country updated successfully",        // "تم تحديث الدولة بنجاح"
    "deleted": "Country deleted successfully",        // "تم حذف الدولة بنجاح"
    "fetched": "Country list fetched successfully"    // "تم تحميل قائمة الدول بنجاح"
  }
}
```

#### Error Messages
```json
{
  "countries": {
    "notFound": "Country not found",                    // "الدولة غير موجودة"
    "invalidCode": "Invalid country code",              // "رمز الدولة غير صالح"
    "invalidPhoneCode": "Invalid phone code",           // "رمز الهاتف للدولة غير صالح"
    "invalidCurrency": "Invalid country currency",      // "عملة الدولة غير صالحة"
    "invalidAlpha2Code": "Invalid Alpha-2 code",        // "رمز ألفا 2 للدولة غير صالح"
    "invalidAlpha3Code": "Invalid Alpha-3 code",        // "رمز ألفا 3 للدولة غير صالح"
    "fetchError": "Failed to fetch countries",          // "فشل في جلب الدول"
    "createError": "Failed to create country",          // "فشل في إنشاء الدولة"
    "updateError": "Failed to update country",          // "فشل في تحديث الدولة"
    "deleteError": "Failed to delete country",          // "فشل في حذف الدولة"
    "errorMessage": "Failed to load countries"          // "فشل في تحميل الدول"
  }
}
```

#### Loading States
```json
{
  "countries": {
    "creatingCountry": "Creating new country",      // "جارى انشاء دولة جديدة"
    "updatingCountry": "Updating country",          // "جارى تحديث بيانات الدولة"
    "deletingCountry": "Deleting country",          // "جارى حذف بيانات الدولة"
    "savingCountry": "Saving country"               // "جارى حفظ بيانات الدولة"
  }
}
```

### Form and Dialog Keys

#### Dialog Subtitles
```json
{
  "countries": {
    "viewSubtitle": "View country details",         // "اظهار بيانات الدولة"
    "editSubtitle": "Edit country details",         // "تعديل بيانات الدولة"
    "addSubtitle": "Add new country"                // "إضافة دولة جديدة"
  }
}
```

#### Form Placeholders
```json
{
  "countries": {
    "nameArPlaceholder": "Arabic only like : مصر , السعودية",           // "أحرف عربية فقط : مصر , السعودية"
    "nameEnPlaceholder": "English only like : Egypt , Saudi Arabia"     // "أحرف انجليزية فقط : Egypt , Saudi Arabia"
  }
}
```

#### Mock Data
```json
{
  "countries": {
    "generateMockData": "Generate Mock Data"        // "توليد بيانات تجريبية"
  }
}
```

### View-Specific Keys

#### View Types
```json
{
  "countries": {
    "views": {
      "grid": "Grid",                               // "الشبكة"
      "cards": "Cards",                             // "البطاقات"
      "map": "Map",                                 // "الخريطة"
      "chart": "Chart"                              // "الرسم البياني"
    }
  }
}
```

#### Card View Keys
```json
{
  "countries": {
    "mainTitle": "Countries Card View",                           // "قائمة الدول"
    "mainSubTitle": "No Countries Available To Display",         // "لا توجد دول متاحة لعرضها"
    "browseAndManage": "Browse and manage",                       // "تصفح وادارة"
    "browseDescription": "countries with enhanced search",        // "الدول مع بحث وتصنيف"
    "searchPlaceHolder": "Search countries by name, code...",     // "ابحث باسم الدولة، الكود..."
    "noCountriesAvailable": "No countries available",            // "لا توجد دول متاحة"
    "noCountriesAvailableDescription": "Start by adding first",  // "��بدء بإضافة دولة جديدة"
    "addFirstCountry": "Add your first country"                  // "ابدء بإضافة دولة جديدة"
  }
}
```

#### Chart View Keys
```json
{
  "countries": {
    "charts": {
      "byRegion": "Countries by Region",            // "الدول حسب المنطقة"
      "regionDistribution": "Region Distribution",  // "توزيع المناطق"
      "topCurrencies": "Top Currencies",            // "أهم العملات"
      "timeline": "Countries Added Over Time",      // "الدول المضافة عبر الوقت"
      "statesByCountry": "States by Country",       // "المحافظات حسب الدولة"
      "statesByCountryDesc": "Top countries with most states", // "أهم الدول بأكثر المحافظات"
      "activeStates": "Active States",              // "المحافظات النشطة"
      "title": "Countries Analytics",               // "تحليلات الدول"
      "noData": "No Countries Data Available"       // "لا توجد بيانات دول متاحة"
    }
  }
}
```

#### Dashboard Keys
```json
{
  "countries": {
    "dashboard": {
      "totalCountries": "Total Countries",          // "الدول الكلية"
      "totalStates": "Total States",                // "إجمالي المحافظات"
      "regions": "Regions",                         // "المناطق"
      "currencies": "Currencies",                   // "العملات"
      "completedProfiles": "Complete Profiles",     // "الملفات المكتملة"
      "withAlphaCodes": "With Alpha Codes",         // "مع كود الدولة"
      "withPhoneCodes": "With Phone Codes",         // "مع كود الهاتف"
      "withCurrencies": "With Currencies",          // "مع كود العملة"
      "dataQuality": "Data Quality",                // "جودة البيانات"
      "avgPerRegion": "Avg/Region"                  // "متوسط/المنطقة"
    }
  }
}
```

### States-Related Keys

#### States Information
```json
{
  "countries": {
    "states": "States",                             // "المحافظات"
    "noStates": "No States",                        // "لا توجد محافظات"
    "active": "Active",                             // "نشط"
    "showLessStates": "Show Less States",           // "اظهار اقل المحافظات"
    "showAllStates": "Show All States"              // "اظهار كل المحافظات"
  }
}
```

### Filter and Search Keys

#### Filter Options
```json
{
  "countries": {
    "all": "All Countries",                         // "كل الدول"
    "recent30Days": "Recent (30 days)",             // "احدث (30 يوما)"
    "hasPhone": "Has Phone Code",                   // "مع كود الهاتف"
    "hasCurrency": "Has Currency",                  // "مع كود العملة"
    "total": "Total",                               // "الإجمالي"
    "filtered": "Filtered"                          // "تم الإختيار"
  }
}
```

#### Sort Options
```json
{
  "countries": {
    "name": "Country Name",                         // "اسم الدولة"
    "createdDate": "Created Date"                   // "تاريخ الانشاء"
  }
}
```

### Empty State Keys

#### No Data Messages
```json
{
  "countries": {
    "noData": "No countries available",             // "لا توجد دول متاحة"
    "noDataDescription": "Start by adding your first country", // "ابدأ بإضافة أول دولة"
    "addFirst": "Add Your First Country"            // "أضف أول دولة لك"
  }
}
```

## General Translation Keys

### Common Actions
```json
{
  "actions": {
    "buttons": "Actions",                           // "العمليات"
    "save": "Save Changes",                         // "حفظ التعديلات"
    "add": "Add",                                   // "اضافة"
    "edit": "Edit",                                 // "تعديل"
    "update": "Update",                             // "تحديث"
    "create": "Create",                             // "انشاء"
    "delete": "Delete",                             // "حذف"
    "cancel": "Cancel",                             // "الغاء"
    "view": "View",                                 // "إظهار"
    "exportExcel": "Export to Excel",               // "التصدير إلى اكسيل"
    "exportPdf": "Export to PDF"                    // "التصدير إلى بى دى اف"
  }
}
```

### General Fields
```json
{
  "general": {
    "id": "ID",                                     // "المرجع"
    "nameAr": "Name Arabic",                        // "الإسم بالعربى"
    "nameEn": "Name English",                       // "الإسم بالانجليزى"
    "createdOn": "Created On",                      // "تاريخ الإنشاء"
    "updatedOn": "Updated On",                      // "تاريخ التعديل"
    "search": "Search",                             // "بحث"
    "loading": "Loading...",                        // "��اري التحميل..."
    "sortBy": "Sort By",                            // "ترتيب حسب"
    "filter": "Filter By",                          // "تصفية ب"
    "ascending": "Ascending",                       // "تصاعدي"
    "descending": "Descending"                      // "تنازلي"
  }
}
```

### Validation Messages
```json
{
  "validation": {
    "required": "Required field",                   // "حقل مطلوب"
    "minLength": "Must be at least {{count}} characters", // "يجب أن يكون على الأقل {{count}} أحرف"
    "maxLength": "Must be {{count}} characters or less",  // "يجب أن يكون {{count}} أحرف أو أقل"
    "invalidArabicName": "Name must contain Arabic letters only", // "يجب أن يحتوي الاسم على حروف عربية فقط"
    "invalidEnglishName": "Name must contain English letters only" // "يجب أن يحتوي الاسم على حروف إنجليزية فقط"
  }
}
```

### Common Messages
```json
{
  "messages": {
    "success": "Success",                           // "تم بنجاح"
    "error": "Error",                               // "خطأ"
    "warning": "Warning",                           // "تحذير"
    "confirmDeletion": "Confirm Deletion",          // "تأكيد الحذف"
    "areYouSureDelete": "Are you sure you want to delete", // "هل أنت متأكد أنك تريد حذف"
    "thisActionCannotBeUndone": "This action cannot be undone" // "لا يمكن التراجع عن هذه العملية"
  }
}
```

### Common Feedback
```json
{
  "common": {
    "retry": "Retry",                               // "إعادة المحاولة"
    "refresh": "Refresh",                           // "تحديث"
    "loading": "Loading...",                        // "جاري التحميل..."
    "noResults": "No results found",                // "لا توجد نتائج"
    "tryDifferentSearch": "Try a different search term" // "جرب مصطلح بحث مختلف"
  }
}
```

## Usage Examples

### Basic Translation Usage
```typescript
import { useTranslation } from "react-i18next";

const CountryComponent = () => {
  const { t } = useTranslation();

  return (
    <div>
      <h1>{t("countries.title")}</h1>
      <p>{t("countries.subTitle")}</p>
      <button>{t("countries.add")}</button>
    </div>
  );
};
```

### Translation with Parameters
```typescript
const { t } = useTranslation();

// Using interpolation
const message = t("validation.minLength", { count: 2 });
// Returns: "Must be at least 2 characters" or "يجب أن يكون على الأقل 2 أحرف"

// Using pluralization
const statesCount = t("countries.states", { count: 5 });
```

### Translation with Fallbacks
```typescript
const { t } = useTranslation();

// With fallback value
const title = t("countries.title") || "Countries";
const subtitle = t("countries.viewTitle") || "Countries Management";

// Using defaultValue option
const label = t("countries.alpha2Code", { defaultValue: "Alpha-2 Code" });
```

### Conditional Translation
```typescript
const { t } = useTranslation();

const getDialogTitle = (dialogType: string) => {
  switch (dialogType) {
    case "add":
      return t("countries.add");
    case "edit":
      return t("countries.edit");
    case "view":
      return t("countries.view");
    default:
      return t("countries.title");
  }
};
```

### Form Validation with Translation
```typescript
import * as yup from "yup";
import { useTranslation } from "react-i18next";

const useCountryValidation = () => {
  const { t } = useTranslation();

  return yup.object({
    nameEn: yup
      .string()
      .required(t("validation.required"))
      .min(2, t("validation.minLength", { count: 2 }))
      .max(100, t("validation.maxLength", { count: 100 })),
    nameAr: yup
      .string()
      .required(t("validation.required"))
      .min(2, t("validation.minLength", { count: 2 }))
      .max(100, t("validation.maxLength", { count: 100 })),
    alpha2Code: yup
      .string()
      .matches(/^[A-Z]{2}$/, t("countries.invalidAlpha2Code")),
    alpha3Code: yup
      .string()
      .matches(/^[A-Z]{3}$/, t("countries.invalidAlpha3Code"))
  });
};
```

### Toast Messages with Translation
```typescript
import { showToast } from "@/shared/components";
import { useTranslation } from "react-i18next";

const useCountryActions = () => {
  const { t } = useTranslation();

  const createCountry = async (data) => {
    try {
      await countryService.create(data);
      showToast.success(t("countries.created"));
    } catch (error) {
      showToast.error(t("countries.createError"));
    }
  };

  return { createCountry };
};
```

### Grid Column Headers
```typescript
const { t } = useTranslation();

const columns = [
  {
    field: "id",
    headerName: t("general.id"),
    flex: 0.5,
  },
  {
    field: "nameEn",
    headerName: t("general.nameEn"),
    flex: 1.5,
  },
  {
    field: "nameAr",
    headerName: t("general.nameAr"),
    flex: 1,
  },
  {
    field: "alpha2Code",
    headerName: t("countries.alpha2Code"),
    flex: 0.8,
  },
  {
    field: "phoneCode",
    headerName: t("countries.phoneCode"),
    flex: 0.8,
  }
];
```

## Best Practices

### 1. Key Naming Convention
- Use hierarchical structure: `feature.section.key`
- Use camelCase for keys: `nameEn`, `phoneCode`
- Group related keys together: `dashboard.*`, `charts.*`

### 2. Fallback Strategy
```typescript
// Always provide fallbacks for critical UI elements
const title = t("countries.title") || "Countries";

// Use defaultValue option for new keys
const newFeature = t("countries.newFeature", { 
  defaultValue: "New Feature" 
});
```

### 3. Parameter Usage
```typescript
// Use parameters for dynamic content
const message = t("countries.created", { name: country.nameEn });

// Use count for pluralization
const statesText = t("countries.states", { count: statesCount });
```

### 4. Context-Specific Keys
```typescript
// Create specific keys for different contexts
"countries.charts.title": "Countries Analytics"
"countries.dashboard.title": "Countries Dashboard"
"countries.form.title": "Country Form"
```

### 5. Error Message Patterns
```typescript
// Consistent error message structure
"countries.fetchError": "Failed to fetch countries"
"countries.createError": "Failed to create country"
"countries.updateError": "Failed to update country"
"countries.deleteError": "Failed to delete country"
```

## Translation Maintenance

### Adding New Keys
1. Add the key to both `en/translation.json` and `ar/translation.json`
2. Follow the existing hierarchical structure
3. Provide meaningful English and Arabic translations
4. Test with both languages

### Updating Existing Keys
1. Update both language files simultaneously
2. Check all usages in the codebase
3. Test UI in both languages
4. Verify text fits in UI components

### Key Organization
```json
{
  "countries": {
    // Core functionality
    "title": "Countries",
    "add": "Add Country",
    
    // Specific views
    "views": {
      "grid": "Grid",
      "cards": "Cards"
    },
    
    // Charts and analytics
    "charts": {
      "title": "Analytics",
      "byRegion": "By Region"
    },
    
    // Dashboard metrics
    "dashboard": {
      "totalCountries": "Total Countries"
    }
  }
}
```

## Testing Translation

### Manual Testing
1. Switch between English and Arabic
2. Verify all text displays correctly
3. Check text truncation and overflow
4. Test RTL layout with Arabic

### Automated Testing
```typescript
describe("Country Translations", () => {
  it("should display correct titles in English", () => {
    i18n.changeLanguage("en");
    render(<CountriesPage />);
    expect(screen.getByText("Countries")).toBeInTheDocument();
  });

  it("should display correct titles in Arabic", () => {
    i18n.changeLanguage("ar");
    render(<CountriesPage />);
    expect(screen.getByText("الدول")).toBeInTheDocument();
  });
});
```

## Common Issues and Solutions

### 1. Missing Translation Keys
**Problem**: Key not found in translation file
**Solution**: Add fallback values and update translation files

```typescript
const title = t("countries.newKey") || "Default Value";
```

### 2. Text Overflow
**Problem**: Arabic text longer than English
**Solution**: Use flexible layouts and test with both languages

### 3. Parameter Interpolation
**Problem**: Parameters not displaying correctly
**Solution**: Ensure parameter names match in translation files

```json
{
  "en": { "message": "Hello {{name}}" },
  "ar": { "message": "مرحبا {{name}}" }
}
```

### 4. Pluralization
**Problem**: Incorrect plural forms
**Solution**: Use i18next pluralization rules

```json
{
  "en": {
    "item_one": "{{count}} item",
    "item_other": "{{count}} items"
  },
  "ar": {
    "item_zero": "لا توجد عناصر",
    "item_one": "عنصر واحد",
    "item_two": "عنصران",
    "item_few": "{{count}} عناصر",
    "item_many": "{{count}} عنصر",
    "item_other": "{{count}} عنصر"
  }
}
```

## Future Enhancements

### 1. Namespace Organization
Consider splitting translations into namespaces:
```typescript
// countries.json
{
  "title": "Countries",
  "add": "Add Country"
}

// Usage
const { t } = useTranslation("countries");
const title = t("title");
```

### 2. Dynamic Loading
Implement lazy loading for large translation files:
```typescript
import("../locales/en/countries.json").then(translations => {
  i18n.addResourceBundle("en", "countries", translations);
});
```

### 3. Translation Management
Consider using translation management tools:
- Crowdin
- Lokalise
- Phrase

### 4. Context-Aware Translations
Implement context-aware translations for better accuracy:
```json
{
  "button_save": "Save",
  "button_save_context": "Save changes to country"
}
```

This comprehensive translation guide ensures consistent internationalization across the Countries feature and provides developers with clear patterns for implementing multilingual support.