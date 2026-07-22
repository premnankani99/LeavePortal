const fs = require('fs');

let code = fs.readFileSync('src/hooks/useCompOff.js', 'utf8');

// 1. Add import { useAuth }
if (!code.includes("import { useAuth } from '../context/AuthContext';")) {
    code = code.replace(
        "import { API_BASE_URL } from '../utils/config';",
        "import { API_BASE_URL } from '../utils/config';\nimport { useAuth } from '../context/AuthContext';"
    );
}

// Just find the line 'export const usePendingCompOffRequests = () => {' and replace it and the return useQuery
const regex = /export const usePendingCompOffRequests = \(\) => {\s*return useQuery\({/g;
code = code.replace(regex, `export const usePendingCompOffRequests = () => {\n  const { role } = useAuth();\n  return useQuery({\n    enabled: role === 'admin' || role === 'hr',`);

fs.writeFileSync('src/hooks/useCompOff.js', code);
console.log("Fixed useCompOff.js properly!");
