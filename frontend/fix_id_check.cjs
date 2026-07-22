const fs = require('fs');

function fixEquality(filePath) {
    if (fs.existsSync(filePath)) {
        let content = fs.readFileSync(filePath, 'utf8');
        content = content.replace('e.id === id', 'e.id === parseInt(id)');
        fs.writeFileSync(filePath, content, 'utf8');
        console.log(`Fixed ${filePath}`);
    }
}

fixEquality('src/pages/AdminEmployeeDetail.jsx');
fixEquality('src/pages/hr/HREmployeeDetail.jsx');
