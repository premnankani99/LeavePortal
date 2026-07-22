const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, 'src');

function injectLogsInDirectory(dir) {
    const files = fs.readdirSync(dir);
    for (const file of files) {
        const filePath = path.join(dir, file);
        const stat = fs.statSync(filePath);

        if (stat.isDirectory()) {
            injectLogsInDirectory(filePath);
        } else if (file.endsWith('.jsx') || file.endsWith('.js')) {
            let content = fs.readFileSync(filePath, 'utf8');
            let modified = false;

            // Inject into functional components
            const componentRegex = /(?:const|let|var) (\w+) = \([^)]*\) => {/g;
            content = content.replace(componentRegex, (match, compName) => {
                modified = true;
                return `${match}\n    console.log("[Frontend Component] Rendering ${compName} in ${file}");`;
            });

            // Inject into useEffect
            const useEffectRegex = /useEffect\(\(\) => {/g;
            content = content.replace(useEffectRegex, (match) => {
                modified = true;
                return `${match}\n        console.log("[Frontend Effect] Triggered in ${file}");`;
            });

            // Inject into fetch/axios calls
            const apiRegex = /(?:fetch|axios\.\w+)\(['"`]([^'"`]+)['"`]/g;
            content = content.replace(apiRegex, (match, url) => {
                modified = true;
                // Add console.log before the fetch by tricking it into an IIFE if possible,
                // but that's risky. Let's just add it to any async functions instead.
                return match; 
            });

            const asyncRegex = /const (\w+) = async \([^)]*\) => {/g;
            content = content.replace(asyncRegex, (match, funcName) => {
                modified = true;
                return `${match}\n    console.log("[Frontend Async] Executing ${funcName} in ${file}");`;
            });

            if (modified) {
                fs.writeFileSync(filePath, content);
                console.log(`Injected logs into ${filePath}`);
            }
        }
    }
}

injectLogsInDirectory(srcDir);
console.log("Frontend log injection complete.");
