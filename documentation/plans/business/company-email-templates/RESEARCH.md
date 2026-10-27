# Company email templates — Research

2026-10-20: installed React 19.3.0/Next 16.3.5; npm registry Tiptap 3.32.0 supports React 19. Official client initialization requires immediatelyRender:false: https://tiptap.dev/docs/editor/getting-started/install/react and https://tiptap.dev/docs/editor/getting-started/install/nextjs . Lazy-load editor outside shared application shell.
NuGet index stable HtmlSanitizer 9.2.1039; parser/allowlist semantics: https://github.com/mganss/HtmlSanitizer . Defaults permit relative URLs, so explicitly reject relative/protocol-relative/unsafe links and restrict tags/attributes. Placeholder/action-link policy and value encoding remain independently mandatory. Installation/verification will be recorded as actual evidence, not assumed from this research.


2026-10-21 verification research:
- Tiptap useEditorState supplies reactive toolbar state without recreating the editor: https://tiptap.dev/docs/guides/performance . Implemented/tested active formatting and undo/redo.
- MUI action columns and fixed dimensions: https://mui.com/x/react-data-grid/column-definition/ and https://mui.com/x/react-data-grid/column-dimensions/ . Reused current Countries icon actions after the initial visual audit found long buttons overlapping.
- Expo57 WebView recommendation and inline HTML/navigation semantics: https://docs.expo.dev/versions/v57.0.0/sdk/webview/ ; https://github.com/react-native-webview/react-native-webview/blob/v13.16.1/docs/Reference.md ; https://github.com/react-native-webview/react-native-webview/blob/v13.16.1/docs/Guide.md . Static HTML requires wildcard originWhitelist; independent about:blank-only navigation callback and disabled JS/resources provide the preview fence.
- MimeKit text/newline behavior: https://mimekit.net/docs/html/P_MimeKit_FormatOptions_NewLineFormat.htm and https://mimekit.net/docs/html/P_MimeKit_TextPart_Text.htm . Capture assertions normalize CRLF for semantic comparison, preserving actual message serialization.
- Mobile viewport: https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/meta/name/viewport . Final server HTML includes width=device-width, initial-scale=1 to avoid a wide virtual viewport shrinking native content.

No web research is used as proof of our runtime; exact source/tests/live checks are in the feature evidence ledger. No real SMTP send was made.
