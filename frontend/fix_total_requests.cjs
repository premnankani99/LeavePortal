const fs = require('fs');

let content = fs.readFileSync('src/hooks/useAdminDashboardStats.js', 'utf8');

// Replace allRequests.length with allRequests.filter(r => r.status !== 'withdrawn').length for Total Requests KPI
content = content.replace(
    "value: allRequests.length, icon: FileText,",
    "value: allRequests.filter(r => r.status !== 'withdrawn').length, icon: FileText,"
);

fs.writeFileSync('src/hooks/useAdminDashboardStats.js', content, 'utf8');
console.log('Fixed Total Requests count to exclude withdrawn');
