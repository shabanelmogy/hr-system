# Expo HAS CHANGED

Read the exact versioned docs at https://docs.expo.dev/versions/v54.0.0/ before writing any code.

# Mobile styling

Before adding or changing mobile UI styles, read `docs/MOBILE_STYLE_GUIDE.md` completely.
Keep design tokens in `src/core/theme`, reusable domain-neutral UI in `src/shared/components`,
and feature-specific styles beside their owning component. Do not create a global
`shared/styles` dumping folder.

# Mobile feature architecture

Before adding or restructuring a feature, read `docs/MOBILE_ARCHITECTURE.md` and
`docs/MOBILE_FEATURE_GUIDE.md` completely. Keep Expo Router files thin, import other
features only through curated public APIs, use controlled server-list state for paged
business data, and run `npm run check` before handoff.
