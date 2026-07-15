const fs = require('fs');
const path = require('path');

function addPolling(filePath) {
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Using a regex to add refetchInterval to useQuery options
    content = content.replace(/useQuery\(\{/g, "useQuery({\n    refetchInterval: 3000,");
    
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Added polling to ${filePath}`);
}

addPolling(path.join(__dirname, 'src', 'hooks', 'useLeaves.js'));
addPolling(path.join(__dirname, 'src', 'hooks', 'useCompOff.js'));
