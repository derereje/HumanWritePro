const fs = require('fs');
const path = require('path');

const keywordPath = path.join(__dirname, 'keyword.txt');
const outputPath = path.join(__dirname, 'src/lib/pseo-keywords.ts');

try {
  const content = fs.readFileSync(keywordPath, 'utf-8');
  // Split by new line, trim, and remove empty lines
  const keywords = content
    .split(/\r?\n/)
    .map(line => line.trim())
    .filter(line => line.length > 0);
  
  // Deduplicate
  const uniqueKeywords = [...new Set(keywords)];

  console.log(`Found ${uniqueKeywords.length} unique keywords.`);

  const fileContent = `// This file is auto-generated. Do not edit manually.
export const PSEO_KEYWORDS = ${JSON.stringify(uniqueKeywords, null, 2)} as const;
`;

  fs.writeFileSync(outputPath, fileContent);
  console.log(`See ${outputPath}`);

} catch (error) {
  console.error('Error:', error);
}
