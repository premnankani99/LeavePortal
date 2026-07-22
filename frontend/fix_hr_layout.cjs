const fs = require('fs');

// 1. Fix Layout.jsx HR Leave History link
let layoutContent = fs.readFileSync('src/components/layout/Layout.jsx', 'utf8');
layoutContent = layoutContent.replace(/<Link to="\/hr\/leaves"/g, '<Link to="/hr/history"');
layoutContent = layoutContent.replace(/isActive\('\/hr\/leaves'\)/g, "isActive('/hr/history')");
fs.writeFileSync('src/components/layout/Layout.jsx', layoutContent, 'utf8');
console.log('Fixed Layout.jsx HR link');

