const fs = require('fs');
const file = 'e:/Portofolio Projects/HrManagementSystem/web/src/features/home/QuickInsights/index.tsx';
let content = fs.readFileSync(file, 'utf8');

// Replace Stack props
content = content.replace(/alignItems=[\"']center[\"']\s+gap=\{1\}/g, 'sx={{ alignItems: "center", gap: 1 }}');
// Replace standalone alignItems
content = content.replace(/<Stack([^>]*)alignItems=[\"']center[\"']([^>]*)>/g, function(match, p1, p2) {
    if (match.includes('sx={{')) return match; // manual fix if already has sx
    return '<Stack' + p1 + 'sx={{ alignItems: "center" }}' + p2 + '>';
});
// Replace Typography fontWeight
content = content.replace(/fontWeight=\{([0-9]+)\}/g, 'sx={{ fontWeight: $1 }}');

fs.writeFileSync(file, content);
console.log("Replaced successfully!");
