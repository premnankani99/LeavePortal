const fs = require('fs');
const path = require('path');

let content = fs.readFileSync(path.join(__dirname, 'src', 'App.jsx'), 'utf8');

if (!content.includes('import { SocketProvider }')) {
    content = content.replace("import { AuthProvider, useAuth } from './context/AuthContext';", 
        "import { AuthProvider, useAuth } from './context/AuthContext';\nimport { SocketProvider } from './context/SocketContext';\nimport { useSocketInvalidation } from './hooks/useSocketInvalidation';");
}

if (!content.includes('const SocketListener = ()')) {
    content = content.replace("const queryClient = new QueryClient(",
        "const SocketListener = () => { useSocketInvalidation(); return null; };\n\nconst queryClient = new QueryClient(");
}

if (!content.includes('<SocketProvider>')) {
    content = content.replace("<AuthProvider>", "<SocketProvider>\n          <SocketListener />\n          <AuthProvider>");
    content = content.replace("</AuthProvider>", "</AuthProvider>\n        </SocketProvider>");
}

fs.writeFileSync(path.join(__dirname, 'src', 'App.jsx'), content, 'utf8');
console.log('App.jsx patched successfully');
