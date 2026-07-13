import { useEffect, useRef, useState } from "react";
import { useTheme } from "@mui/material/styles";
import {
  PdfViewerComponent,
  Toolbar,
  Magnification,
  Navigation,
  LinkAnnotation,
  BookmarkView,
  ThumbnailView,
  Print,
  TextSelection,
  TextSearch,
  Inject,
  Annotation,
  FormFields,
  FormDesigner,
} from "@syncfusion/ej2-react-pdfviewer";
import "@syncfusion/ej2-base/styles/material.css";
import "@syncfusion/ej2-buttons/styles/material.css";
import "@syncfusion/ej2-dropdowns/styles/material.css";
import "@syncfusion/ej2-inputs/styles/material.css";
import "@syncfusion/ej2-navigations/styles/material.css";
import "@syncfusion/ej2-popups/styles/material.css";
import "@syncfusion/ej2-splitbuttons/styles/material.css";
import "@syncfusion/ej2-pdfviewer/styles/material.css";

interface PdfViewerProps {
  mediaUrl: string;
  onError?: (message: string) => void;
  onBack?: () => void;
}

const PdfViewer: React.FC<PdfViewerProps> = ({ mediaUrl, onError, onBack }) => {
  const viewerRef = useRef<PdfViewerComponent>(null);
  const [isComponentReady, setIsComponentReady] = useState(false);
  const theme = useTheme();

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsComponentReady(true);
    }, 1000);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const loadDocument = async () => {
      if (mediaUrl && viewerRef.current && isComponentReady) {
        try {
          const response = await fetch(mediaUrl);
          if (!response.ok) throw new Error("Failed to fetch PDF");
          
          const arrayBuffer = await response.arrayBuffer();
          const uint8Array = new Uint8Array(arrayBuffer);
          let binaryString = '';
          for (let i = 0; i < uint8Array.length; i++) {
            binaryString += String.fromCharCode(uint8Array[i]);
          }
          const base64String = btoa(binaryString);
          
          setTimeout(() => {
            viewerRef.current?.load(`data:application/pdf;base64,${base64String}`, null);
          }, 500);
          
        } catch (error) {
          console.error("Error loading PDF:", error);
          onError?.(error instanceof Error ? error.message : "Failed to load PDF");
        }
      }
    };

    loadDocument();
  }, [mediaUrl, isComponentReady, onError]);

  const handleDocumentLoad = () => {
    console.log("Document loaded successfully");
  };

  const isDarkMode = theme.palette.mode === 'dark';
  const appBarHeight = theme.mixins.toolbar.minHeight || 64;

  return (
    <div style={{ 
      height: "100vh", 
      width: "100%",
      position: "fixed",
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      overflow: "hidden",
      paddingTop: typeof appBarHeight === 'number' ? `${appBarHeight}px` : appBarHeight,
      boxSizing: "border-box",
      backgroundColor: isDarkMode ? theme.palette.background.default : '#fafafa'
    }}>
      {!isComponentReady && (
        <div style={{ 
          display: "flex", 
          justifyContent: "center", 
          alignItems: "center", 
          height: "100%",
          fontSize: "18px",
          color: theme.palette.text.primary
        }}>
          Loading PDF Viewer...
        </div>
      )}
      {isComponentReady && (
        <PdfViewerComponent
          ref={viewerRef}
          id="container"
          resourceUrl="https://cdn.syncfusion.com/ej2/26.2.11/dist/ej2-pdfviewer-lib"
          enableToolbar={true}
          enableNavigationToolbar={true}
          documentLoad={handleDocumentLoad}
          style={{ 
            height: "100%", 
            width: "100%",
            display: "block"
          }}
        >
          <Inject
            services={[
              Toolbar,
              Magnification,
              Navigation,
              LinkAnnotation,
              BookmarkView,
              ThumbnailView,
              Print,
              TextSelection,
              TextSearch,
              Annotation,
              FormFields,
              FormDesigner,
            ]}
          />
        </PdfViewerComponent>
      )}
      <style>{`
        #container_toolbarContainer {
          z-index: 999 !important;
          margin-left : 61px !important;
          margin-top: 12px !important;
        }
        #container .e-pv-page-container {
          padding-top: 25px !important;
          background-color: ${isDarkMode ? '#1a1a1a' : '#e0e0e0'} !important;
        }
        #container_viewerContainer {
          padding-top: 15px !important;
          background-color: ${isDarkMode ? '#1a1a1a' : '#fafafa'} !important;
        }
        #container .e-pv-page-div {
          margin-bottom: 20px !important;
        }
      `}</style>
    </div>
  );
};

export default PdfViewer;