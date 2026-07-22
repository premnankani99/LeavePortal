const fs = require('fs');

let content = fs.readFileSync('src/hooks/useAdminDashboardStats.js', 'utf8');

// Replace the previous filter with one that excludes both withdrawn and cancelled
content = content.replace(
    "value: allRequests.filter(r => r.status !== 'withdrawn').length, icon: FileText,",
    "value: allRequests.filter(r => r.status !== 'withdrawn' && r.status !== 'cancelled').length, icon: FileText,"
);

fs.writeFileSync('src/hooks/useAdminDashboardStats.js', content, 'utf8');
console.log('Fixed Total Requests count to exclude withdrawn and cancelled');
