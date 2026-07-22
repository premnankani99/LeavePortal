const fs = require('fs');

let content = fs.readFileSync('src/hooks/useAdminDashboardStats.js', 'utf8');

// Use a regex to filter allRequests at the very beginning of the hook
const newContent = content.replace(
    'const { data: allRequests = [], isLoading: loadingReq } = useAllRequests();',
    `const { data: rawAllRequests = [], isLoading: loadingReq } = useAllRequests();
  const allRequests = useMemo(() => rawAllRequests.filter(r => r.status !== 'withdrawn' && r.status !== 'cancelled'), [rawAllRequests]);`
);

// We need to revert the specific allRequests.filter...length change we did earlier since allRequests is now already filtered
const revertedContent = newContent.replace(
    "value: allRequests.filter(r => r.status !== 'withdrawn' && r.status !== 'cancelled').length, icon: FileText,",
    "value: allRequests.length, icon: FileText,"
);

fs.writeFileSync('src/hooks/useAdminDashboardStats.js', revertedContent, 'utf8');
console.log('Fixed allRequests globally in the hook');
