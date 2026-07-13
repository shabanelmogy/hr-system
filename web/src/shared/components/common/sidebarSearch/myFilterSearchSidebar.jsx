/* eslint-disable react/prop-types */
import MySelect from "../Shared/MySelect";
import SelectSearchField from "../Shared/SelectSearchField";
import SelectSearchType from "../Shared/SelectSearchType";
import TextFieldWithClear from "../Shared/TextFieldWithClear";
import SearchSideBar from "../Shared/SearchSideBar";

const MyFilterSearchSidebar = ({
  open,
  loading,
  top = 180,
  categoryFilter,
  handleCategoryChange,
  categories,
  subCategoryFilter,
  handleSubCategoryChange,
  subCategories,
  searchField,
  handleSearchFieldChange,
  fieldOptions,
  searchType,
  handleSearchTypeChange,
  searchText,
  handleSearch,
  handleClearSearch,
  isRTL,
  t,
  children,
}) => {
  return (
    <SearchSideBar open={open} loading={loading} top={top}>
      {/* Category Filter */}
      {categories && handleCategoryChange && (
        <MySelect
          dataSource={categories}
          selectedItem={categoryFilter}
          handleSelectionChange={handleCategoryChange}
          loading={loading}
          label={t ? t("category") : "Category"}
          displayValue="id"
          displayMember={isRTL ? "nameAr" : "nameEn"}
        />
      )}

      {/* Subcategory Filter */}
      {subCategories && handleSubCategoryChange && (
        <MySelect
          dataSource={subCategories}
          selectedItem={subCategoryFilter}
          handleSelectionChange={handleSubCategoryChange}
          loading={loading}
          label={t ? t("subCategory") : "Subcategory"}
          displayValue="id"
          displayMember={isRTL ? "nameAr" : "nameEn"}
        />
      )}

      {/* Search Field */}
      {fieldOptions && handleSearchFieldChange && (
        <SelectSearchField
          searchField={searchField}
          handleSearchFieldChange={handleSearchFieldChange}
          loading={loading}
          fieldOptions={fieldOptions}
        />
      )}

      {/* Search Type */}
      {handleSearchTypeChange && (
        <SelectSearchType
          searchType={searchType}
          handleSearchTypeChange={handleSearchTypeChange}
          loading={loading}
        />
      )}

      {/* Search Text */}
      {handleSearch && (
        <TextFieldWithClear
          searchText={searchText}
          handleSearch={handleSearch}
          loading={loading}
          handleClearSearch={handleClearSearch}
        />
      )}

      {/* Additional filters or content */}
      {children}
    </SearchSideBar>
  );
};

export default MyFilterSearchSidebar;
