const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

try {
  const commitHash = execSync('git rev-parse --short HEAD').toString().trim();
  const docsPath = path.join(__dirname, '../docs/webapi-documentation.html');
  
  if (fs.existsSync(docsPath)) {
    let docsContent = fs.readFileSync(docsPath, 'utf8');
    
    // Replaces existing header or injects a new one
    const regex = /Last Updated: Commit \[[a-zA-Z0-9]+\]/g;
    const replacement = `Last Updated: Commit [${commitHash}]`;
    
    if (regex.test(docsContent)) {
      docsContent = docsContent.replace(regex, replacement);
    } else {
      // Fallback if not found, add it near the body tag
      docsContent = docsContent.replace('<body>', `<body>\n    <p><i>${replacement}</i></p>`);
    }
    
    fs.writeFileSync(docsPath, docsContent);
    console.log(`✅ Documentation updated with latest commit ID: ${commitHash}`);
  }
} catch (error) {
  console.error('Failed to update documentation with commit ID:', error);
}
