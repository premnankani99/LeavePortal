const fs = require('fs');

let code = fs.readFileSync('src/hooks/useCompOff.js', 'utf8');

// 1. Add import { useAuth }
if (!code.includes("import { useAuth } from '../context/AuthContext';")) {
    code = code.replace(
        "import { API_BASE_URL } from '../utils/config';",
        "import { API_BASE_URL } from '../utils/config';\nimport { useAuth } from '../context/AuthContext';"
    );
}

// 2. Add enabled check to usePendingCompOffRequests
const target = `export const usePendingCompOffRequests = () => {
  return useQuery({
    queryKey: ['pending_comp_offs'],
    queryFn: async () => {
      const token = localStorage.getItem('token');
      const res = await fetch(\`\${API_BASE_URL}/api/leaves/compoff/requests/pending\`, {
        headers: { 'Authorization': \`Bearer \${token}\` }
      });
      if (!res.ok) throw new Error("Failed to fetch pending requests");
      return res.json();
    }
  });
};`;

const replacement = `export const usePendingCompOffRequests = () => {
  const { role } = useAuth();
  return useQuery({
    queryKey: ['pending_comp_offs'],
    queryFn: async () => {
      const token = localStorage.getItem('token');
      const res = await fetch(\`\${API_BASE_URL}/api/leaves/compoff/requests/pending\`, {
        headers: { 'Authorization': \`Bearer \${token}\` }
      });
      if (!res.ok) throw new Error("Failed to fetch pending requests");
      return res.json();
    },
    enabled: role === 'admin' || role === 'hr'
  });
};`;

code = code.replace(target, replacement);

fs.writeFileSync('src/hooks/useCompOff.js', code);
console.log("Fixed useCompOff.js");
