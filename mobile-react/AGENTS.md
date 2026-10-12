# Expo HAS CHANGED

Read the exact versioned docs at https://docs.expo.dev/versions/v57.0.0/ before writing any code.

# Mobile styling

Before adding or changing mobile UI styles, read [`../documentation/guides/mobile/MOBILE_STYLE_GUIDE.md`](../documentation/guides/mobile/MOBILE_STYLE_GUIDE.md) completely.
Keep design tokens in `src/core/theme`, reusable domain-neutral UI in `src/shared/components`,
and feature-specific styles beside their owning component. Do not create a global
`shared/styles` dumping folder.

# Mobile feature architecture

Before adding or restructuring a feature, read [`../documentation/guides/mobile/MOBILE_ARCHITECTURE.md`](../documentation/guides/mobile/MOBILE_ARCHITECTURE.md) and
[`../documentation/guides/mobile/MOBILE_FEATURE_GUIDE.md`](../documentation/guides/mobile/MOBILE_FEATURE_GUIDE.md) completely. Keep Expo Router files thin, import other
features only through curated public APIs, use controlled server-list state for paged
business data, and run `npm run check` before handoff.

When following Countries, also read the [cross-platform master](../documentation/modules/reference-data/features/countries/countries-review.md), the [mobile applied profile](../documentation/modules/reference-data/features/countries/countries-mobile.md), and phases 03, 04, 05, and 06 under `../documentation/modules/*/features/*/generated/`. Run `../documentation/system/Generate-Documentation.ps1 -Check` when a feature contract, source manifest, or guide changes. Do not create a new `mobile-react/docs/` directory.
Use the States profiles when a parent selector or parent-dependent list contract makes them the closer reference. Do not use the unscoped Countries generated packets as evidence for a different feature.
