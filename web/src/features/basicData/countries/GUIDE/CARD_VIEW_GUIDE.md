# 📋 Card View Implementation Guide - Countries Feature

## 🎯 Overview

This guide provides a comprehensive walkthrough for implementing card views in the HR Management system, using the Countries feature as a reference implementation. The card view provides an intuitive, visual way to display and interact with data records.

---

## 📁 File Structure

```
src/features/basicData/countries/components/
├── countriesCardView.tsx           # Main card view container
└── cardView/
    ├── index.ts                    # Barrel exports
    ├── CountryCard.tsx             # Individual card component
    ├── CountryCard.types.ts        # TypeScript interfaces
    ├── CardViewHeader.tsx          # Search, sort, filter header
    ├── CardViewPagination.tsx      # Pagination controls
    ├── CountryCardChips.tsx        # Status/info chips
    ├── CountryCardFooter.tsx       # Action buttons
    ├── CountryCardUtils.ts         # Utility functions
    ├── CountryDetails.tsx          # Card content details
    ├��─ CountryStatesSection.tsx    # Related data section
    ├── EmptyState.tsx              # No data state
    ├── LoadingState.tsx            # Loading state
    └── NoResultsState.tsx          # No search results state
```

---

## 🏗️ Architecture Overview

### **1. Main Container Component**
The main card view component (`countriesCardView.tsx`) orchestrates:
- **Data Processing**: Search, filter, sort operations
- **State Management**: Pagination, UI states, highlighting
- **Responsive Design**: Adaptive layouts and items per page
- **User Interactions**: Search, navigation, CRUD operations

### **2. Individual Card Component**
Each card (`CountryCard.tsx`) represents a single data record with:
- **Visual Design**: Consistent styling and layout
- **Interactive Elements**: Hover effects, action buttons
- **Data Display**: Structured information presentation
- **Status Indicators**: Quality scores, badges, chips

### **3. Supporting Components**
Specialized components handle specific functionality:
- **Header**: Search, sort, and filter controls
- **Pagination**: Navigation between pages
- **States**: Loading, empty, and no results scenarios

---

## 🚀 Implementation Steps

## **Step 1: Create Type Definitions**

Create `CountryCard.types.ts` with comprehensive interfaces:

```typescript
import { SelectChangeEvent } from "@mui/material";
import type { Country } from "../../types/Country";

export interface CountryCardProps {
  country: Country;
  index: number;
  isHovered: boolean;
  isHighlighted: boolean;
  highlightLabel?: string | null;
  onEdit: (country: Country) => void;
  onDelete: (country: Country) => void;
  onView: (country: Country) => void;
  onHover: (id: string | number | null) => void;
  t: (key: string) => string;
}

export interface CardViewHeaderProps {
  searchTerm: string;
  sortBy: string;
  sortOrder: string;
  filterBy: string;
  processedCountriesLength: number;
  page: number;
  onSearchChange: (value: string) => void;
  onSortByChange: (value: string) => void;
  onSortOrderChange: (value: string) => void;
  onFilterByChange: (value: string) => void;
  onClearSearch: () => void;
  onReset: () => void;
}

export interface CountriesCardViewProps {
  countries: Country[];
  loading: boolean;
  onEdit: (country: Country) => void;
  onDelete: (country: Country) => void;
  onView: (country: Country) => void;
  onAdd: () => void;
  t: (key: string) => string;
  lastAddedId?: string | number | null;
  lastEditedId?: string | number | null;
  lastDeletedIndex?: number | null;
}
```

## **Step 2: Create Individual Card Component**

Build `CountryCard.tsx` using the unified card system:

```typescript
import { CardView } from "@/shared/components/cardView";
import { useTheme } from "@mui/material";
import { format } from "date-fns";
import CountryCardChips from "./CountryCardChips";
import {
  BadgePercentage,
  CountryDetails,
  CreatedDateRow,
  HighlightBadge,
  QualityMeter,
} from "@/shared/components/common/cardView/cardBody/UnifiedCardParts";
import CountryCardFooter from "./CountryCardFooter";
import CountryStatesSection from "./CountryStatesSection";
import { getQualityScore, getQualityLevel } from "./CountryCardUtils";
import type { CountryCardProps } from "./CountryCard.types";

const CountryCard = ({
  country,
  index,
  isHovered,
  isHighlighted,
  highlightLabel,
  onEdit,
  onDelete,
  onView,
  onHover,
  t,
}: CountryCardProps) => {
  const theme = useTheme();

  // Calculate quality metrics
  const qualityScore = getQualityScore(country);
  const qualityInfo = getQualityLevel(qualityScore, theme);

  // Define card elements
  const topRightBadge = (
    <BadgePercentage
      value={qualityScore}
      highlighted={isHighlighted}
      color={qualityInfo.color}
    />
  );

  const leftBadge = isHighlighted && highlightLabel ? (
    <HighlightBadge label={highlightLabel} />
  ) : undefined;

  const chips = <CountryCardChips country={country} />;

  const content = (
    <>
      <CountryDetails
        phoneCode={country.phoneCode}
        currencyCode={country.currencyCode}
      />
      <CountryStatesSection country={country} t={t} />
      <QualityMeter score={qualityScore} title="Data Quality" />
      <CreatedDateRow
        date={country.createdOn ? new Date(country.createdOn) : null}
        formatter={(d) => format(d, "MMM dd, yyyy")}
      />
    </>
  );

  const footer = (
    <CountryCardFooter
      country={country}
      onView={onView}
      onEdit={onEdit}
      onDelete={onDelete}
      t={t}
    />
  );

  return (
    <CardView
      index={index}
      highlighted={isHighlighted}
      isHovered={isHovered}
      onMouseEnter={() => onHover(country.id)}
      onMouseLeave={() => onHover(null)}
      height={420}
      topRightBadge={topRightBadge}
      leftBadge={leftBadge}
      title={country.nameEn || "N/A"}
      subtitle={country.nameAr || undefined}
      chips={chips}
      content={content}
      footer={footer}
    />
  );
};

export default CountryCard;
```

## **Step 3: Create Header Component**

Build `CardViewHeader.tsx` for search, sort, and filter functionality:

```typescript
import UnifiedCardViewHeader from "@/shared/components/common/cardView/cardHeader/UnifiedCardViewHeader";
import { useTranslation } from "react-i18next";
import { CardViewHeaderProps } from "./CountryCard.types";

const CardViewHeader = ({
  searchTerm,
  sortBy,
  sortOrder,
  filterBy,
  processedCountriesLength,
  page,
  onSearchChange,
  onSortByChange,
  onSortOrderChange,
  onFilterByChange,
  onClearSearch,
  onReset,
}: CardViewHeaderProps) => {
  const { t } = useTranslation();
  
  return (
    <UnifiedCardViewHeader
      title={t("countries.mainTitle")}
      subtitle={`${t("countries.browseAndManage")} ${processedCountriesLength} ${t("countries.browseDescription")}`}
      mainChipLabel={`${processedCountriesLength} ${t("countries.country")}`}
      page={page}

      // Search configuration
      searchTerm={searchTerm}
      searchPlaceholder={t("countries.searchPlaceHolder")}
      onSearchChange={onSearchChange}
      onClearSearch={onClearSearch}

      // Sort configuration
      sortBy={sortBy}
      sortByOptions={[
        { value: "name", label: t("countries.name") },
        { value: "alpha2", label: t("countries.alpha2Code") },
        { value: "alpha3", label: t("countries.alpha3Code") },
        { value: "phone", label: t("countries.phoneCode") },
        { value: "currency", label: t("countries.currencyCode") },
        { value: "created", label: t("countries.createdDate") },
      ]}
      onSortByChange={onSortByChange}

      sortOrder={sortOrder as "asc" | "desc"}
      onSortOrderChange={onSortOrderChange}

      // Filter configuration
      filterBy={filterBy}
      filterOptions={[
        { value: "all", label: t("countries.all") },
        { value: "recent", label: t("countries.recent30Days") },
        { value: "hasPhone", label: t("countries.hasPhone") },
        { value: "hasCurrency", label: t("countries.hasCurrency") },
      ]}
      onFilterByChange={onFilterByChange}

      onReset={onReset}
    />
  );
};

export default CardViewHeader;
```

## **Step 4: Create Main Container Component**

Build `countriesCardView.tsx` with comprehensive functionality:

```typescript
import { Box, Grid, useMediaQuery, useTheme } from "@mui/material";
import type { SelectChangeEvent } from "@mui/material/Select";
import { useEffect, useMemo, useState } from "react";
import { useCountrySearch } from "../hooks/useCountryQueries";
import type { Country } from "../types/Country";
import {
  CardViewHeader,
  CardViewPagination,
  CountryCard,
  EmptyState,
  LoadingState,
  NoResultsState
} from "./cardView";

const CountriesCardView = ({
  countries,
  loading,
  onEdit,
  onDelete,
  onView,
  onAdd,
  t,
  lastAddedId,
  lastEditedId,
  lastDeletedIndex,
}: CountriesCardViewProps) => {
  const theme = useTheme();
  
  // State management
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("created");
  const [sortOrder, setSortOrder] = useState("asc");
  const [filterBy, setFilterBy] = useState("all");
  const [hoveredCard, setHoveredCard] = useState<string | number | null>(null);
  const [highlightedCard, setHighlightedCard] = useState<string | number | null>(null);
  const [highlightLabel, setHighlightLabel] = useState<string | null>(null);

  // Responsive breakpoints
  const isXs = useMediaQuery(theme.breakpoints.down('sm'));
  const isSm = useMediaQuery(theme.breakpoints.between('sm', 'md'));
  const isMd = useMediaQuery(theme.breakpoints.between('md', 'lg'));
  const isLg = useMediaQuery(theme.breakpoints.between('lg', 'xl'));
  const isXl = useMediaQuery(theme.breakpoints.up('xl'));

  // Responsive pagination
  const getResponsiveItemsPerPage = () => {
    if (isXs) return 6;   // Mobile: 1 column
    if (isSm) return 8;   // Small tablet: 2 columns
    if (isMd) return 12;  // Medium tablet: 3 columns
    if (isLg) return 12;  // Desktop: 4 columns
    if (isXl) return 12;  // Large desktop: 5+ columns
    return 12; // Default
  };

  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(() => getResponsiveItemsPerPage());

  // Search integration
  const normalizedSearch = useMemo(() => {
    const s = searchTerm.trim();
    return s.startsWith("+") ? s.slice(1) : s;
  }, [searchTerm]);
  
  const searchedCountries = useCountrySearch(normalizedSearch, countries || []);

  // Data processing pipeline
  const processedCountries = useMemo(() => {
    if (!countries) return [];

    let filteredCountries = [...searchedCountries];

    // Apply filters
    if (filterBy !== "all") {
      switch (filterBy) {
        case "recent":
          const thirtyDaysAgo = new Date();
          thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
          filteredCountries = filteredCountries.filter(country =>
            country.createdOn && new Date(country.createdOn) > thirtyDaysAgo
          );
          break;
        case "hasPhone":
          filteredCountries = filteredCountries.filter(country => country.phoneCode);
          break;
        case "hasCurrency":
          filteredCountries = filteredCountries.filter(country => country.currencyCode);
          break;
      }
    }

    // Apply sorting
    filteredCountries.sort((a, b) => {
      let comparison = 0;
      switch (sortBy) {
        case "name":
          comparison = (a.nameEn || "").localeCompare(b.nameEn || "");
          break;
        case "alpha2":
          comparison = (a.alpha2Code || "").localeCompare(b.alpha2Code || "");
          break;
        case "phone":
          const phoneA = Number(a.phoneCode) || 0;
          const phoneB = Number(b.phoneCode) || 0;
          comparison = phoneA - phoneB;
          break;
        case "created":
          comparison = new Date(a.createdOn || 0).getTime() - new Date(b.createdOn || 0).getTime();
          break;
        default:
          comparison = 0;
      }
      return sortOrder === "asc" ? comparison : -comparison;
    });

    return filteredCountries;
  }, [searchedCountries, sortBy, sortOrder, filterBy]);

  // Pagination
  const paginatedCountries = useMemo(() => {
    const startIndex = page * rowsPerPage;
    return processedCountries.slice(startIndex, startIndex + rowsPerPage);
  }, [processedCountries, page, rowsPerPage]);

  // Event handlers
  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: SelectChangeEvent<number>) => {
    setRowsPerPage(Number(event.target.value));
    setPage(0);
  };

  // Render logic
  if (loading) {
    return <LoadingState />;
  }

  if (!countries || countries.length === 0) {
    return <EmptyState onAdd={onAdd} />;
  }

  return (
    <Box>
      <CardViewHeader
        searchTerm={searchTerm}
        sortBy={sortBy}
        sortOrder={sortOrder}
        filterBy={filterBy}
        processedCountriesLength={processedCountries.length}
        page={page}
        onSearchChange={setSearchTerm}
        onSortByChange={setSortBy}
        onSortOrderChange={setSortOrder}
        onFilterByChange={setFilterBy}
        onClearSearch={() => setSearchTerm('')}
        onReset={() => {
          setSearchTerm('');
          setSortBy('created');
          setSortOrder('asc');
          setFilterBy('all');
          setPage(0);
        }}
      />

      <Grid container spacing={3}>
        {paginatedCountries.map((country, index) => (
          <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }} key={country.id}>
            <CountryCard
              country={country}
              index={index}
              isHovered={hoveredCard === country.id}
              isHighlighted={highlightedCard === country.id}
              highlightLabel={highlightedCard === country.id ? highlightLabel ?? undefined : undefined}
              onEdit={onEdit}
              onDelete={onDelete}
              onView={onView}
              onHover={setHoveredCard}
              t={t}
            />
          </Grid>
        ))}
      </Grid>

      {processedCountries.length > 0 && (
        <CardViewPagination
          page={page}
          rowsPerPage={rowsPerPage}
          totalItems={processedCountries.length}
          itemsPerPageOptions={[6, 12, 24, 36]}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      )}

      {searchTerm && processedCountries.length === 0 && (
        <NoResultsState
          searchTerm={searchTerm}
          onClearSearch={() => setSearchTerm('')}
          onClearFilters={filterBy !== 'all' ? () => setFilterBy('all') : undefined}
          onRefresh={() => window.location.reload()}
        />
      )}
    </Box>
  );
};

export default CountriesCardView;
```

## **Step 5: Create Supporting Components**

### **A. Card Footer with Actions**
```typescript
// CountryCardFooter.tsx
import { CardActions, IconButton, Tooltip } from "@mui/material";
import { Delete, Edit, Visibility } from "@mui/icons-material";
import type { Country } from "../../types/Country";

interface CountryCardFooterProps {
  country: Country;
  onView: (country: Country) => void;
  onEdit: (country: Country) => void;
  onDelete: (country: Country) => void;
  t: (key: string) => string;
}

const CountryCardFooter = ({ country, onView, onEdit, onDelete, t }: CountryCardFooterProps) => {
  return (
    <CardActions sx={{ justifyContent: 'space-between', px: 2, pb: 2 }}>
      <Tooltip title={t("actions.view")}>
        <IconButton size="small" onClick={() => onView(country)}>
          <Visibility />
        </IconButton>
      </Tooltip>
      <Tooltip title={t("actions.edit")}>
        <IconButton size="small" onClick={() => onEdit(country)}>
          <Edit />
        </IconButton>
      </Tooltip>
      <Tooltip title={t("actions.delete")}>
        <IconButton size="small" onClick={() => onDelete(country)}>
          <Delete />
        </IconButton>
      </Tooltip>
    </CardActions>
  );
};

export default CountryCardFooter;
```

### **B. Empty State Component**
```typescript
// EmptyState.tsx
import { Box, Button, Typography } from "@mui/material";
import { Add } from "@mui/icons-material";
import { useTranslation } from "react-i18next";

interface EmptyStateProps {
  onAdd: () => void;
}

const EmptyState = ({ onAdd }: EmptyStateProps) => {
  const { t } = useTranslation();
  
  return (
    <Box
      display="flex"
      flexDirection="column"
      alignItems="center"
      justifyContent="center"
      minHeight={400}
      textAlign="center"
    >
      <Typography variant="h5" gutterBottom>
        {t("countries.noCountriesAvailable")}
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        {t("countries.noCountriesAvailableDescription")}
      </Typography>
      <Button
        variant="contained"
        startIcon={<Add />}
        onClick={onAdd}
      >
        {t("countries.addFirstCountry")}
      </Button>
    </Box>
  );
};

export default EmptyState;
```

### **C. Barrel Export File**
```typescript
// index.ts
export { default as CountryCard } from './CountryCard';
export { default as CardViewHeader } from './CardViewHeader';
export { default as CardViewPagination } from './CardViewPagination';
export { default as EmptyState } from './EmptyState';
export { default as LoadingState } from './LoadingState';
export { default as NoResultsState } from './NoResultsState';
```

---

## 🎨 Design Patterns

### **1. Responsive Design**
- **Breakpoint-based layouts**: Adaptive grid columns
- **Dynamic pagination**: Screen-size appropriate items per page
- **Mobile-first approach**: Progressive enhancement

### **2. State Management**
- **Local state**: Search, sort, filter, pagination
- **Derived state**: Processed and paginated data
- **UI state**: Hover, highlight, loading states

### **3. Performance Optimization**
- **Memoization**: Expensive calculations cached
- **Virtual pagination**: Only render visible items
- **Debounced search**: Reduce API calls

### **4. User Experience**
- **Visual feedback**: Hover effects, highlighting
- **Progressive disclosure**: Expandable sections
- **Consistent interactions**: Standardized patterns

---

## 🔧 Key Features

### **1. Search & Filter**
- **Real-time search**: Instant results as you type
- **Multiple filters**: Date ranges, status, attributes
- **Combined operations**: Search + filter + sort

### **2. Sorting**
- **Multiple criteria**: Name, date, codes, metrics
- **Bi-directional**: Ascending/descending order
- **Visual indicators**: Sort direction arrows

### **3. Pagination**
- **Responsive sizing**: Adaptive items per page
- **Navigation controls**: First, previous, next, last
- **Page information**: Current page and total items

### **4. Visual Enhancements**
- **Quality indicators**: Data completeness scores
- **Status badges**: Visual status representation
- **Highlight system**: Recent actions feedback

---

## 📱 Responsive Breakpoints

| **Screen Size** | **Columns** | **Items/Page** | **Description** |
|-----------------|-------------|----------------|-----------------|
| **xs** (< 600px) | 1 | 6 | Mobile phones |
| **sm** (600-900px) | 2 | 8 | Small tablets |
| **md** (900-1200px) | 3 | 12 | Medium tablets |
| **lg** (1200-1536px) | 4 | 12 | Desktop |
| **xl** (> 1536px) | 5+ | 12 | Large desktop |

---

## 🚀 Integration Steps

### **1. Add to Multi-View Component**
```typescript
// In countriesMultiView.tsx
case "cards":
  return (
    <CountriesCardView
      countries={displayCountries}
      loading={displayLoading}
      onEdit={onEdit}
      onDelete={onDelete}
      onView={onView}
      onAdd={onAdd}
      t={t}
      lastAddedId={lastAddedId}
      lastEditedId={lastEditedId}
      lastDeletedIndex={lastDeletedIndex}
    />
  );
```

### **2. Update Navigation Labels**
```typescript
// In MultiViewHeader
viewLabels={{
  grid: t("countries.views.grid") || "Grid",
  cards: t("countries.views.cards") || "Cards",
  chart: t("countries.views.chart") || "Chart",
}}
```

### **3. Add Translation Keys**
```json
{
  "countries": {
    "views": {
      "cards": "Cards"
    },
    "mainTitle": "Countries Card View",
    "browseAndManage": "Browse and manage",
    "browseDescription": "countries with enhanced search and filtering",
    "searchPlaceHolder": "Search countries by name, code, phone, or currency...",
    "noCountriesAvailable": "No countries available to display",
    "addFirstCountry": "Add your first country"
  }
}
```

---

## 🧪 Testing Checklist

### **Functionality Tests**
- [ ] **Search**: Real-time filtering works
- [ ] **Sort**: All sort options function correctly
- [ ] **Filter**: Each filter produces expected results
- [ ] **Pagination**: Navigation works properly
- [ ] **CRUD Operations**: Add, edit, delete, view actions
- [ ] **Responsive**: Layout adapts to screen sizes

### **Performance Tests**
- [ ] **Large datasets**: Handles 1000+ items smoothly
- [ ] **Search performance**: No lag during typing
- [ ] **Memory usage**: No memory leaks during navigation
- [ ] **Render optimization**: Minimal re-renders

### **Accessibility Tests**
- [ ] **Keyboard navigation**: All interactive elements accessible
- [ ] **Screen readers**: Proper ARIA labels and descriptions
- [ ] **Color contrast**: Meets WCAG guidelines
- [ ] **Focus management**: Clear focus indicators

---

## 🔄 Reusability Guidelines

### **1. Generic Components**
- Extract common card patterns into shared components
- Use generic type parameters for different data types
- Implement consistent prop interfaces

### **2. Configuration-Driven**
- Define sort options through configuration
- Make filter options configurable
- Allow custom card layouts

### **3. Theme Integration**
- Use theme colors and spacing consistently
- Support dark/light mode switching
- Maintain brand consistency

---

## 📚 Best Practices

### **1. Code Organization**
- **Separation of concerns**: Each component has single responsibility
- **Consistent naming**: Follow established conventions
- **Type safety**: Comprehensive TypeScript coverage

### **2. Performance**
- **Memoization**: Use React.memo and useMemo appropriately
- **Lazy loading**: Load components on demand
- **Efficient updates**: Minimize unnecessary re-renders

### **3. User Experience**
- **Loading states**: Show progress during operations
- **Error handling**: Graceful error recovery
- **Feedback**: Visual confirmation of actions

### **4. Maintainability**
- **Documentation**: Comprehensive inline comments
- **Testing**: Unit and integration test coverage
- **Modularity**: Easy to extend and modify

---

## 🎯 Summary

This card view implementation provides:

✅ **Comprehensive functionality** - Search, sort, filter, pagination
✅ **Responsive design** - Works on all device sizes  
✅ **Performance optimized** - Handles large datasets efficiently
✅ **Accessible** - Keyboard and screen reader friendly
✅ **Maintainable** - Well-structured and documented code
✅ **Reusable** - Easy to adapt for other features
✅ **User-friendly** - Intuitive interactions and feedback

Use this guide as a template for implementing card views in other features like States, Districts, or Employees. The patterns and components can be easily adapted while maintaining consistency across the application.