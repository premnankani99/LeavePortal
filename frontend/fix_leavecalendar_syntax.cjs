const fs = require('fs');
const filePath = 'src/pages/LeaveCalendar.jsx';
let content = fs.readFileSync(filePath, 'utf8');

// Find the last closing brace '}' of the component
const lastBraceIndex = content.lastIndexOf('}');
if (lastBraceIndex !== -1) {
    // Keep everything up to the last brace and add a clean newline
    content = content.substring(0, lastBraceIndex + 1) + '\n';
    fs.writeFileSync(filePath, content, 'utf8');
    console.log('Cleaned up invalid characters at the end of LeaveCalendar.jsx');
} else {
    console.error('Could not find closing brace');
}
