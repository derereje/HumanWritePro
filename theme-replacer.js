import fs from 'fs';
import path from 'path';

const srcDir = path.join(process.cwd(), 'src');

const replacements = [
    // Backgrounds
    { search: /\bbg-white\b(?!\/)/g, replace: 'bg-card' },
    { search: /\bbg-slate-50\b(?!\/)/g, replace: 'bg-white/[0.02]' },
    { search: /\bbg-slate-100\b(?!\/)/g, replace: 'bg-white/[0.04]' },
    { search: /\bbg-gray-50\b(?!\/)/g, replace: 'bg-white/[0.02]' },
    { search: /\bbg-gray-100\b(?!\/)/g, replace: 'bg-white/[0.04]' },
    // Texts
    { search: /\btext-slate-900\b(?!\/)/g, replace: 'text-white' },
    { search: /\btext-slate-800\b(?!\/)/g, replace: 'text-slate-200' },
    { search: /\btext-slate-700\b(?!\/)/g, replace: 'text-slate-300' },
    { search: /\btext-slate-600\b(?!\/)/g, replace: 'text-slate-400' },
    { search: /\btext-gray-900\b(?!\/)/g, replace: 'text-white' },
    { search: /\btext-gray-800\b(?!\/)/g, replace: 'text-slate-200' },
    { search: /\btext-gray-700\b(?!\/)/g, replace: 'text-slate-300' },
    { search: /\btext-gray-600\b(?!\/)/g, replace: 'text-slate-400' },
    { search: /\btext-black\b(?!\/)/g, replace: 'text-white' },
    // Borders
    { search: /\bborder-slate-200\b(?!\/)/g, replace: 'border-white\/10' },
    { search: /\bborder-slate-100\b(?!\/)/g, replace: 'border-white\/5' },
    { search: /\bborder-gray-200\b(?!\/)/g, replace: 'border-white\/10' },
    { search: /\bborder-gray-100\b(?!\/)/g, replace: 'border-white\/5' },
    // Shadows (light shadows to dark shadows or none to avoid white halos)
    { search: /\bshadow-sm\b/g, replace: '' },
    { search: /\bshadow-md\b/g, replace: 'shadow-lg shadow-black\/50' },
    { search: /\bshadow-lg\b/g, replace: 'shadow-xl shadow-black\/50' },
];

function processDirectory(directory) {
    const files = fs.readdirSync(directory);
    for (const file of files) {
        const fullPath = path.join(directory, file);
        if (fs.statSync(fullPath).isDirectory()) {
            processDirectory(fullPath);
        } else if (fullPath.endsWith('.tsx') || fullPath.endsWith('.ts')) {
            let content = fs.readFileSync(fullPath, 'utf8');
            let originalContent = content;
            for (const { search, replace } of replacements) {
                content = content.replace(search, replace);
            }
            if (content !== originalContent) {
                fs.writeFileSync(fullPath, content, 'utf8');
                console.log('Updated:', fullPath);
            }
        }
    }
}

processDirectory(srcDir);
console.log('Theme replacement complete!');
