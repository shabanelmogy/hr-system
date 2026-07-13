# Countries Reports Documentation

## Overview

The Countries Reports feature provides comprehensive reporting capabilities for country data. It includes a flexible report viewer with customizable parameters, responsive design, and integration with external reporting services.

## Report File

**File**: `reports/CountryReport.jsx`

**Note**: The current implementation shows a Company Report template that can be adapted for Country reporting.

## CompanyReport Component

### Purpose
Provides a responsive report viewer interface with customizable search parameters and real-time report generation.

### Key Features

#### 1. Responsive Design
- **Desktop**: Side-by-side layout with collapsible sidebar
- **Mobile**: Stacked layout with expandable search options
- **Adaptive**: Automatically adjusts based on screen size

#### 2. Dynamic Report Generation
- Real-time report URL generation
- Customizable parameters
- External report service integration

#### 3. Interactive Sidebar
- Collapsible/expandable search panel
- Form-based parameter input
- Search trigger functionality

## Component Structure

### State Management

```javascript
const [reportRequest, setReportRequest] = useState({
  nameAr: "",
  nameEn: "",
});
const [reportApiBaseUrl] = useState(localStorage.getItem("reportApiUrl") || "https://localhost:44341/");
const [reportUrl, setReportUrl] = useState("");
const [loading, setLoading] = useState(false);
const [sidebarOpen, setSidebarOpen] = useState(true);
```

**State Variables**:
- `reportRequest`: Form data for report parameters
- `reportApiBaseUrl`: Base URL for report service (configurable)
- `reportUrl`: Generated report URL for iframe
- `loading`: Loading state for report generation
- `sidebarOpen`: Sidebar visibility state

### Responsive Behavior

```javascript
const theme = useTheme();
const lang = theme.direction === "rtl" ? "ar" : "en";
const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

// Constants
const SIDEBAR_WIDTH = 280;
const TOP_OFFSET = isMobile ? 60 : 120;
const MARGIN_BETWEEN = 8;
const MOBILE_HEADER_HEIGHT = 48;
```

**Responsive Features**:
- Language detection from theme direction
- Mobile breakpoint detection
- Dynamic sizing constants
- Automatic sidebar behavior on mobile

### Report URL Generation

```javascript
const generateReportUrl = (request) => {
  const reportParams = {
    ReportPath: "Reports",
    ReportFileName: "Company", // Would be "Country" for country reports
    ExportFilename: "Company", // Would be "Country" for country reports
    LogoName: "Logo1",
    Lang: lang,
    NameAr: request.nameAr,
    NameEn: request.nameEn,
  };

  const queryString = Object.entries(reportParams)
    .filter(([, value]) => value)
    .map(([key, value]) => `${key}=${encodeURIComponent(value)}`)
    .join("&");

  return `${reportApiBaseUrl}report/generate?${queryString}&rc:Toolbar=true`;
};
```

**Features**:
- Dynamic parameter building
- URL encoding for safety
- Filtering empty values
- Toolbar inclusion for report controls

## Layout Components

### Mobile Header

```javascript
{isMobile && (
  <Box
    sx={{
      width: "100%",
      height: MOBILE_HEADER_HEIGHT,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      bgcolor: "#1976d2",
      color: "white",
      cursor: "pointer",
      zIndex: 11,
    }}
    onClick={toggleSidebar}
  >
    <Box sx={{ flexGrow: 1, pl: 2 }}>Search Options</Box>
    <IconButton color="inherit" size="small" sx={{ mr: 1 }}>
      {sidebarOpen ? <KeyboardArrowUp /> : <KeyboardArrowDown />}
    </IconButton>
  </Box>
)}
```

**Purpose**: Mobile-friendly header for toggling search options.

### Sidebar Panel

```javascript
<Paper
  elevation={3}
  sx={{
    width: isMobile ? "100%" : sidebarOpen ? SIDEBAR_WIDTH : 0,
    height: isMobile ? (sidebarOpen ? "auto" : "0px") : "100%",
    display: isMobile && !sidebarOpen ? "none" : "flex",
    transition: isMobile
      ? "height 0.3s ease-in-out"
      : "width 0.3s ease-in-out",
    overflow: "hidden",
    borderRadius: 0,
    position: "relative",
    zIndex: 10,
    flexDirection: "column",
    marginRight: isMobile ? 0 : sidebarOpen ? MARGIN_BETWEEN : 0,
  }}
>
```

**Features**:
- Responsive width/height transitions
- Smooth animations
- Proper z-index layering
- Conditional display logic

### Search Form

```javascript
<Box
  sx={{
    width: "100%",
    p: 2,
    display: "flex",
    flexDirection: "column",
    gap: 2,
  }}
>
  <TextField
    label="Company Name (Arabic)"
    value={reportRequest.nameAr}
    onChange={(e) =>
      setReportRequest({ ...reportRequest, nameAr: e.target.value })
    }
    fullWidth
    variant="outlined"
    size="small"
  />

  <TextField
    label="Company Name (English)"
    value={reportRequest.nameEn}
    onChange={(e) =>
      setReportRequest({ ...reportRequest, nameEn: e.target.value })
    }
    fullWidth
    variant="outlined"
    size="small"
  />

  <Button
    variant="contained"
    onClick={handleSearch}
    startIcon={<Search />}
    fullWidth
    sx={{ mt: 1 }}
  >
    SEARCH
  </Button>
</Box>
```

### Desktop Toggle Button

```javascript
{!isMobile && (
  <Box
    sx={{
      position: "absolute",
      left: sidebarOpen ? SIDEBAR_WIDTH : 0,
      top: "50%",
      transform: "translateY(-50%)",
      zIndex: 20,
      transition: "left 0.3s ease-in-out",
    }}
  >
    <IconButton
      onClick={toggleSidebar}
      size="medium"
      sx={{
        backgroundColor: "#1976d2",
        color: "white",
        "&:hover": {
          backgroundColor: "#1565c0",
        },
        boxShadow: 2,
        borderRadius: sidebarOpen ? "0 4px 4px 0" : "4px 0 0 4px",
      }}
    >
      {sidebarOpen ? <ChevronLeft /> : <ChevronRight />}
    </IconButton>
  </Box>
)}
```

### Report Viewer

```javascript
<Box
  sx={{
    flexGrow: 1,
    height: isMobile
      ? `calc(100% - ${MOBILE_HEADER_HEIGHT}px - ${
          sidebarOpen ? "auto" : "0px"
        })`
      : "100%",
    position: "relative",
    zIndex: 5,
    overflow: "hidden",
    marginTop: isMobile ? MARGIN_BETWEEN : 0,
  }}
>
  {loading ? (
    <Box
      sx={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        height: "100%",
        width: "100%",
      }}
    >
      <CircularProgress />
    </Box>
  ) : (
    <iframe
      key={reportUrl}
      src={reportUrl}
      style={{
        width: "100%",
        height: "100%",
        border: "none",
        display: "block",
      }}
      title="Report Viewer"
      allowFullScreen
    />
  )}
</Box>
```

## Event Handlers

### Search Handler

```javascript
const handleSearch = () => {
  setLoading(true);
  const url = generateReportUrl(reportRequest);
  setReportUrl(url);

  // Simulating API call delay
  setTimeout(() => {
    setLoading(false);
    // Close sidebar on mobile after search
    if (isMobile) {
      setSidebarOpen(false);
    }
  }, 1000);
};
```

### Sidebar Toggle

```javascript
const toggleSidebar = () => {
  setSidebarOpen(!sidebarOpen);
};
```

## Adaptation for Country Reports

To adapt this component for Country reports, the following changes would be needed:

### 1. Report Parameters

```javascript
// Current (Company)
const [reportRequest, setReportRequest] = useState({
  nameAr: "",
  nameEn: "",
});

// Adapted for Country
const [reportRequest, setReportRequest] = useState({
  nameAr: "",
  nameEn: "",
  alpha2Code: "",
  alpha3Code: "",
  phoneCode: "",
  currencyCode: "",
  hasStates: false,
  regionFilter: "",
  dateFrom: "",
  dateTo: "",
});
```

### 2. Form Fields

```javascript
// Additional fields for Country reports
<TextField
  label="Alpha 2 Code"
  value={reportRequest.alpha2Code}
  onChange={(e) =>
    setReportRequest({ ...reportRequest, alpha2Code: e.target.value })
  }
  fullWidth
  variant="outlined"
  size="small"
/>

<TextField
  label="Alpha 3 Code"
  value={reportRequest.alpha3Code}
  onChange={(e) =>
    setReportRequest({ ...reportRequest, alpha3Code: e.target.value })
  }
  fullWidth
  variant="outlined"
  size="small"
/>

<TextField
  label="Phone Code"
  value={reportRequest.phoneCode}
  onChange={(e) =>
    setReportRequest({ ...reportRequest, phoneCode: e.target.value })
  }
  fullWidth
  variant="outlined"
  size="small"
/>

<TextField
  label="Currency Code"
  value={reportRequest.currencyCode}
  onChange={(e) =>
    setReportRequest({ ...reportRequest, currencyCode: e.target.value })
  }
  fullWidth
  variant="outlined"
  size="small"
/>

<FormControlLabel
  control={
    <Checkbox
      checked={reportRequest.hasStates}
      onChange={(e) =>
        setReportRequest({ ...reportRequest, hasStates: e.target.checked })
      }
    />
  }
  label="Has States Only"
/>

<DatePicker
  label="Date From"
  value={reportRequest.dateFrom}
  onChange={(date) =>
    setReportRequest({ ...reportRequest, dateFrom: date })
  }
  renderInput={(params) => <TextField {...params} fullWidth size="small" />}
/>

<DatePicker
  label="Date To"
  value={reportRequest.dateTo}
  onChange={(date) =>
    setReportRequest({ ...reportRequest, dateTo: date })
  }
  renderInput={(params) => <TextField {...params} fullWidth size="small" />}
/>
```

### 3. Report URL Generation

```javascript
const generateCountryReportUrl = (request) => {
  const reportParams = {
    ReportPath: "Reports",
    ReportFileName: "Country",
    ExportFilename: "CountryReport",
    LogoName: "Logo1",
    Lang: lang,
    NameAr: request.nameAr,
    NameEn: request.nameEn,
    Alpha2Code: request.alpha2Code,
    Alpha3Code: request.alpha3Code,
    PhoneCode: request.phoneCode,
    CurrencyCode: request.currencyCode,
    HasStates: request.hasStates,
    RegionFilter: request.regionFilter,
    DateFrom: request.dateFrom,
    DateTo: request.dateTo,
  };

  const queryString = Object.entries(reportParams)
    .filter(([, value]) => value !== "" && value !== null && value !== undefined)
    .map(([key, value]) => `${key}=${encodeURIComponent(value)}`)
    .join("&");

  return `${reportApiBaseUrl}report/generate?${queryString}&rc:Toolbar=true`;
};
```

## Report Types

### Standard Country Report
- Basic country information
- States listing
- Creation/modification dates
- Statistical summaries

### Country Analytics Report
- Regional distribution
- Currency usage statistics
- States count analysis
- Timeline charts

### Country Export Report
- Full data export
- Multiple format support (PDF, Excel, CSV)
- Customizable columns
- Batch processing

## Configuration

### Report Service Configuration

```javascript
// Environment-based configuration
const reportConfig = {
  development: "https://localhost:44341/",
  staging: "https://staging-reports.company.com/",
  production: "https://reports.company.com/"
};

const reportApiBaseUrl = reportConfig[process.env.NODE_ENV] || 
                        localStorage.getItem("reportApiUrl") || 
                        "https://localhost:44341/";
```

### Report Parameters

```javascript
const defaultReportParams = {
  ReportPath: "Reports",
  ReportFileName: "Country",
  ExportFilename: "CountryReport",
  LogoName: "Logo1",
  ShowToolbar: true,
  Format: "PDF", // PDF, Excel, Word, CSV
  Orientation: "Portrait", // Portrait, Landscape
  PageSize: "A4", // A4, Letter, Legal
};
```

## Usage Examples

### Basic Usage

```javascript
import CountryReport from './reports/CountryReport';

const ReportsPage = () => {
  return (
    <Box sx={{ height: '100vh' }}>
      <CountryReport />
    </Box>
  );
};
```

### With Custom Configuration

```javascript
const CountryReportWithConfig = () => {
  const reportConfig = {
    apiBaseUrl: "https://custom-reports.company.com/",
    defaultParams: {
      format: "Excel",
      orientation: "Landscape"
    }
  };

  return <CountryReport config={reportConfig} />;
};
```

## Styling and Theming

### Material-UI Integration
- Uses theme breakpoints for responsiveness
- Consistent color scheme with application
- Material Design principles

### Custom Styling
```javascript
const reportStyles = {
  sidebar: {
    backgroundColor: theme.palette.background.paper,
    borderRight: `1px solid ${theme.palette.divider}`,
  },
  toggleButton: {
    backgroundColor: theme.palette.primary.main,
    '&:hover': {
      backgroundColor: theme.palette.primary.dark,
    },
  },
  iframe: {
    border: 'none',
    width: '100%',
    height: '100%',
  }
};
```

## Performance Considerations

### Loading Optimization
- Lazy loading of report iframe
- Progressive loading indicators
- Efficient re-rendering

### Memory Management
- Proper cleanup of event listeners
- Iframe memory management
- State optimization

## Security Considerations

### URL Generation
- Proper parameter encoding
- XSS prevention
- CSRF protection

### Report Access
- Authentication integration
- Authorization checks
- Secure report transmission

## Future Enhancements

### Advanced Features
- Report scheduling
- Email delivery
- Batch report generation
- Report templates
- Custom report builder

### Integration Improvements
- Real-time data updates
- Interactive reports
- Dashboard integration
- Mobile app support

## Dependencies

- **@mui/material**: UI components
- **@mui/icons-material**: Icons
- **react**: Core React functionality

## Related Files

- `components/`: Report-related UI components
- `services/countryService.ts`: Data source for reports
- `types/Country.ts`: Type definitions
- `hooks/useCountryQueries.ts`: Data fetching hooks