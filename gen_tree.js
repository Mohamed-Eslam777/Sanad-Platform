const fs = require('fs');
const path = require('path');

function generateTree(dir, prefix = '') {
    const files = fs.readdirSync(dir);
    let result = '';
    const filteredFiles = files.filter(f => !['node_modules', '.git', '.venv', '__pycache__', 'dist', 'build', '.next'].includes(f));

    filteredFiles.forEach((file, index) => {
        const filePath = path.join(dir, file);
        const isLast = index === filteredFiles.length - 1;
        const marker = isLast ? '└── ' : '├── ';

        result += `${prefix}${marker}${file}\n`;

        if (fs.statSync(filePath).isDirectory()) {
            const newPrefix = prefix + (isLast ? '    ' : '│   ');
            result += generateTree(filePath, newPrefix);
        }
    });
    return result;
}

const root = 'c:\\Users\\RepairCom\\OneDrive\\Desktop\\Sanad';
fs.writeFileSync(path.join(root, 'project_tree_output.txt'), root + '\n' + generateTree(root));
console.log('Tree generated');
