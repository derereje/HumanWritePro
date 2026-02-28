import fs from 'fs';
import path from 'path';

const srcDir = path.join(process.cwd(), 'src');

const replacements = [
    // Opaque white backgrounds -> highly transparent white or explicit dark card variants
    { search: /\bbg-white\/[5-9]0\b/g, replace: 'bg-white/[0.03]' },

    // Slate backgrounds with opacities
    { search: /\bbg-slate-50\/50\b/g, replace: 'bg-white/[0.02]' },
    { search: /\bbg-slate-100\/50\b/g, replace: 'bg-white/[0.03]' },
    { search: /\bbg-slate-200\/50\b/g, replace: 'bg-white/[0.04]' },
    { search: /\bbg-slate-200\b(?!\/)/g, replace: 'bg-white/[0.05]' },
    { search: /\bborder-slate-200\/50\b/g, replace: 'border-white/[0.1]' },

    // Overly bright borders causing weird halos
    { search: /\bborder-slate-300\b/g, replace: 'border-white/[0.15]' },
    { search: /\bborder-slate-100\b/g, replace: 'border-white/[0.05]' },
    { search: /\bborder-white\/60\b/g, replace: 'border-white/10' },

    // Hover states
    { search: /\bhover:bg-slate-200\/50\b/g, replace: 'hover:bg-white/[0.1]' },
    { search: /\bhover:bg-slate-100\b/g, replace: 'hover:bg-white/[0.08]' },
    { search: /\bhover:bg-slate-50\b/g, replace: 'hover:bg-white/[0.05]' },

    // Fix `text-slate-500` which can be too dark on our dark background to be legible
    { search: /\btext-slate-500\b(?!\/)/g, replace: 'text-slate-400' },

    // Catch any remaining hard-to-read dark texts
    { search: /\btext-slate-600\b(?!\/)/g, replace: 'text-slate-300' },
    { search: /\btext-slate-[789]00\b(?!\/)/g, replace: 'text-slate-200' },
    { search: /\btext-gray-[789]00\b(?!\/)/g, replace: 'text-slate-200' },
    { search: /\btext-black\b(?!\/)/g, replace: 'text-white' },

    // Some components might have `bg-white` hardcoded on inner divs
    { search: /\bbg-white\b(?!\/)/g, replace: 'bg-card' },

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
console.log('Theme replacement round 2 complete!');
