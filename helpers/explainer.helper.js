import fs from 'fs';
import path from 'path';

const __dirname = path.resolve();
const files = [
    'readme.md',
    'package.json',
    'index.js',
    'modules/css-crawler.js',
    'modules/html-crawler.js',
    'modules/html-analyzer.js',
    'helpers/directory.helper.js',
    'helpers/explainer.helper.js',
];

let output = '';

// Header
output += `# Project Overview\n\n`;

output += `This document provides an overview of the project structure and code. 
It is intended to facilitate understanding for users and any AI tools used for 
code comprehension and refactoring. Here we explain the purpose and functionality 
of each module or file.\n\n`;

files.forEach(file => {
    const filePath = path.join(__dirname, file);
    if (fs.existsSync(filePath)) {
        const content = fs.readFileSync(filePath, 'utf8');
        const fileExt = path.extname(file);

        output += `## File: ${filePath}\n\n`;

        if (fileExt === '.js') {
            output += `### Code:\n\`\`\`javascript\n${content}\n\`\`\`\n`;
        } else {
            output += `### Content:\n\n${content}\n\n`;
        }
    } else {
        console.warn(`File "${file}" was not found.`);
    }
});

fs.writeFileSync(path.join(__dirname, 'output', 'explanation.md'), output);

console.log('explanation.md file generated.');
