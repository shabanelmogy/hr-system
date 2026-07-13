import { apiRoutes } from "@/routes";
import { apiService } from "@/shared/services";
import { saveAs } from "file-saver";
import { useState } from "react";

const usePdfExport = ({
  apiRef,
  defaultFileName = "Export",
  defaultCulture = "en",
  reportPdfHeader = "ReportHeader",
  excludeColumnsFromExport = [], // Default columns to exclude
}) => {
  const [isExporting, setIsExporting] = useState(false);

  /**
   * Get visible/exportable columns from the grid
   */
  const getExportableColumns = (excludeColumns = []) => {
    try {
      const allColumns = apiRef?.current?.getAllColumns?.() || [];
      
      // Merge default exclusions with provided ones
      const allExcludeColumns = [
        ...excludeColumnsFromExport,
        ...excludeColumns,
        // Always exclude these problematic columns
        'profilePicture', 'avatar', 'image', 'photo', 'thumbnail'
      ];
      
      const visibleColumns = allColumns.filter(column => {
        // Exclude hidden columns
        if (!column.visible) return false;
        
        // Exclude specified columns (case-insensitive)
        if (allExcludeColumns.some(excludeCol => 
          excludeCol.toLowerCase() === column.field.toLowerCase())) {
          console.log(`Excluding column: ${column.field}`);
          return false;
        }
        
        // Exclude common non-data columns
        const systemColumns = ['__check__', 'actions', '__detail_panel__'];
        if (systemColumns.includes(column.field)) return false;
        
        return true;
      });
      
      console.log(`Found ${visibleColumns.length} exportable columns:`, 
        visibleColumns.map(col => col.field));
      console.log(`Excluded columns:`, allExcludeColumns);
      
      return visibleColumns.map(col => col.field);
    } catch (error) {
      console.warn("Could not get column information:", error);
      return [];
    }
  };

  /**
   * Filter row data to include only specified columns and sanitize data
   */
  const filterRowColumns = (row, includeColumns) => {
    // Define problematic column patterns that should always be excluded
    const problematicPatterns = [
      /picture/i, /image/i, /photo/i, /avatar/i, /thumbnail/i,
      /binary/i, /blob/i, /file/i
    ];
    
    // Merge exclusions
    const allExcludeColumns = [
      ...excludeColumnsFromExport,
      '__check__', 'actions', '__detail_panel__',
      'profilePicture', 'avatar', 'image', 'photo', 'thumbnail'
    ];
    
    if (!includeColumns || includeColumns.length === 0) {
      // If no column filter specified, exclude problematic columns
      const filteredRow = {};
      
      Object.keys(row).forEach(key => {
        // Skip if in exclude list
        if (allExcludeColumns.some(excludeCol => 
          excludeCol.toLowerCase() === key.toLowerCase())) {
          return;
        }
        
        // Skip if matches problematic patterns
        if (problematicPatterns.some(pattern => pattern.test(key))) {
          console.log(`Excluding problematic column: ${key}`);
          return;
        }
        
        // Sanitize the value
        const sanitizedValue = sanitizeValue(row[key], key);
        if (sanitizedValue !== undefined) {
          filteredRow[key] = sanitizedValue;
        }
      });
      
      return filteredRow;
    }
    
    // Use include columns approach
    const filteredRow = {};
    includeColumns.forEach(columnField => {
      if (row.hasOwnProperty(columnField)) {
        const sanitizedValue = sanitizeValue(row[columnField], columnField);
        if (sanitizedValue !== undefined) {
          filteredRow[columnField] = sanitizedValue;
        }
      }
    });
    
    return filteredRow;
  };

  /**
   * Sanitize individual values to ensure they can be serialized
   */
  const sanitizeValue = (value, fieldName) => {
    // Handle null/undefined
    if (value === null || value === undefined) {
      return null;
    }
    
    // Handle primitive types
    if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
      return value;
    }
    
    // Handle dates
    if (value instanceof Date) {
      return value.toISOString();
    }
    
    // Handle arrays (but be careful with large arrays)
    if (Array.isArray(value)) {
      if (value.length > 100) {
        console.warn(`Large array in field ${fieldName}, truncating`);
        return `[Array with ${value.length} items]`;
      }
      return value.map(item => sanitizeValue(item, `${fieldName}[]`));
    }
    
    // Handle objects
    if (typeof value === 'object') {
      // Check for common problematic object types
      if (value instanceof File || value instanceof Blob) {
        console.log(`Excluding File/Blob in field: ${fieldName}`);
        return undefined; // Don't include
      }
      
      // Check for image/binary data patterns
      if (fieldName.toLowerCase().includes('picture') || 
          fieldName.toLowerCase().includes('image') ||
          fieldName.toLowerCase().includes('photo')) {
        console.log(`Excluding image data in field: ${fieldName}`);
        return undefined;
      }
      
      // For other objects, try to stringify but limit size
      try {
        const stringified = JSON.stringify(value);
        if (stringified.length > 1000) {
          console.warn(`Large object in field ${fieldName}, truncating`);
          return `[Object - ${stringified.length} chars]`;
        }
        return value;
      } catch (error) {
        console.warn(`Could not serialize object in field ${fieldName}:`, error);
        return `[Unserializable Object]`;
      }
    }
    
    // For functions or other types, exclude them
    console.log(`Excluding non-serializable value in field ${fieldName}:`, typeof value);
    return undefined;
  };

  /**
   * Export data to PDF based on current grid state
   */
  const exportToPdf = async ({
    fileName = defaultFileName,
    reportHeader = reportPdfHeader,
    culture = defaultCulture,
    excludeColumns = excludeColumnsFromExport,
    includeColumns = null, // If provided, only these columns will be included
  } = {}) => {
    setIsExporting(true);

    try {
      let data = [];
      let exportType = "";

      // STEP 1: Determine which columns to export
      let exportColumns = [];
      if (includeColumns && Array.isArray(includeColumns)) {
        exportColumns = includeColumns;
        console.log("Using specified include columns:", exportColumns);
      } else {
        exportColumns = getExportableColumns(excludeColumns);
        console.log("Using auto-detected columns, excluding:", excludeColumns);
      }

      // STEP 2: Check if any rows are selected
      const selectedRows = apiRef?.current?.getSelectedRows?.();
      if (selectedRows?.size > 0) {
        data = Array.from(selectedRows.values());
        exportType = "selected";
        console.log(`Exporting ${data.length} SELECTED rows`);
      } else {
        console.log("No rows selected, checking for filtered data...");

        // STEP 3: Get the filter model and check for active filters
        const filterModel = apiRef?.current?.state?.filter?.filterModel || {};
        const hasActiveFilters =
          filterModel.items?.length > 0 ||
          filterModel.quickFilterValues?.length > 0;
        console.log("Filter model:", JSON.stringify(filterModel, null, 2));
        console.log("Has active filters:", hasActiveFilters);

        if (hasActiveFilters) {
          // STEP 4: Check filter mode (client-side or server-side)
          const filterMode = apiRef?.current?.props?.filterMode || "client";
          console.log("Filter mode:", filterMode);

          if (filterMode === "server") {
            console.warn(
              "Server-side filtering detected. Client-side APIs may not reflect filtered rows."
            );
            const allRows = apiRef?.current?.getRowModels?.();
            if (allRows instanceof Map) {
              data = Array.from(allRows.values());
              exportType = "filtered (server)";
              console.log(
                `Exporting ${data.length} FILTERED rows (server-side, using all visible rows)`
              );
            } else {
              console.warn("No rows available in server-side mode");
              return false;
            }
          } else {
            // Client-side filtering
            // Try getVisibleRowIds first (more reliable for filtered rows)
            let rowIds = apiRef?.current?.getVisibleRowIds?.();
            const allRows = apiRef?.current?.getRowModels?.();
            console.log("Visible row IDs count:", rowIds?.length);
            console.log(
              "Total rows in grid:",
              allRows instanceof Map ? allRows.size : "unknown"
            );

            if (
              !rowIds ||
              rowIds.length === 0 ||
              rowIds.length === allRows?.size
            ) {
              console.log("Falling back to getSortedRowIds...");
              rowIds = apiRef?.current?.getSortedRowIds?.();
              console.log("Sorted row IDs count:", rowIds?.length);
            }

            if (rowIds?.length > 0 && allRows instanceof Map) {
              data = rowIds
                .map((id) => allRows.get(id))
                .filter((row) => row !== undefined);
              exportType = "filtered";
              console.log(
                `Exporting ${data.length} FILTERED rows (client-side, rowIds method)`
              );
              console.log("Sample filtered row:", data[0]);

              // STEP 5: Manual filter check as fallback
              if (
                data.length === allRows.size &&
                filterModel.items?.length > 0
              ) {
                console.warn(
                  "Row IDs match total rows, applying manual filter for nameAr..."
                );
                const nameArFilter = filterModel.items.find(
                  (item) => item.field === "nameAr"
                );
                if (nameArFilter && nameArFilter.operator === "contains") {
                  const filterValue = nameArFilter.value.toLowerCase();
                  data = data.filter((row) =>
                    row.nameAr?.toLowerCase().includes(filterValue)
                  );
                  exportType = "filtered (manual)";
                  console.log(
                    `Manually filtered to ${data.length} rows for nameAr containing "${filterValue}"`
                  );
                }
              }
            } else {
              console.warn("No filtered rows found, falling back to all rows");
            }
          }
        }

        // STEP 6: Fallback to all rows if no filtered data
        if (data.length === 0) {
          const allRows = apiRef?.current?.getRowModels?.();
          if (allRows instanceof Map) {
            data = Array.from(allRows.values());
            exportType = "all";
            console.log(
              `Exporting ${data.length} ALL rows (no filters or fallback)`
            );
          } else {
            console.warn("No rows available to export");
            return false;
          }
        }
      }

      // STEP 7: Format and validate data with column filtering
      if (!data || data.length === 0) {
        console.warn("No data to export");
        return false;
      }

      console.log("Sample raw row before filtering:", data[0]);

      const formattedData = data.map((row, index) => {
        if (!row || typeof row !== "object") {
          throw new Error(`Invalid row data at index ${index}`);
        }
        
        // Filter columns based on export settings
        const filteredRow = filterRowColumns(row, exportColumns);
        
        // Additional safety check - ensure no problematic data remains
        Object.keys(filteredRow).forEach(key => {
          if (key.toLowerCase().includes('picture') || 
              key.toLowerCase().includes('image') ||
              key.toLowerCase().includes('photo')) {
            console.warn(`Found potentially problematic field after filtering: ${key}`);
            delete filteredRow[key];
          }
        });
        
        return filteredRow;
      });

      // Validate that we have some data after column filtering
      if (formattedData.some((row) => Object.keys(row).length === 0)) {
        console.warn("Some rows became empty after column filtering");
      }
      
      // Final validation - ensure data is serializable
      try {
        JSON.stringify(formattedData);
        console.log("Data serialization test passed");
      } catch (serializationError) {
        console.error("Data serialization failed:", serializationError);
        throw new Error("Export data contains non-serializable content");
      }

      // STEP 8: Make API call
      const baseUrl = apiRoutes.export.pdf;
      const apiUrl = `${baseUrl}/${fileName}/${reportHeader}/${culture}`;
      console.log(
        `Making API call to: ${apiUrl} with ${formattedData.length} rows (${exportType})`
      );
      console.log("Export columns:", exportColumns);
      console.log("Sample export data:", formattedData[0]);

      const response = await apiService.api({
        method: "post",
        url: apiUrl,
        data: formattedData,
        responseType: "blob",
      });

      // STEP 9: Save the file
      const blob = new Blob([response.data], {
        type: "application/pdf",
      });

      if (blob.size === 0) {
        throw new Error("Server returned empty file");
      }

      const fileNameWithExt = fileName.endsWith(".pdf")
        ? fileName
        : `${fileName}.pdf`;
      saveAs(blob, fileNameWithExt);
      console.log(
        `Successfully exported ${formattedData.length} rows with ${exportColumns.length} columns as ${fileNameWithExt}`
      );
      return true;
    } catch (error) {
      console.error("Export error:", error);
      throw error;
    } finally {
      setIsExporting(false);
    }
  };

  return {
    exportToPdf,
    isExporting,
    getExportableColumns, // Expose for debugging or UI purposes
  };
};

export default usePdfExport;