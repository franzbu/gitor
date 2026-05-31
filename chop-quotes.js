import fs from 'fs';

const quotesPath = './src/data/quotes.txt';
const outputDir = './public/quotes';

// Create the public/quotes folder if it doesn't exist
if (!fs.existsSync(outputDir)){
    fs.mkdirSync(outputDir, { recursive: true });
}

// Read the master file and split it into blocks
const text = fs.readFileSync(quotesPath, 'utf-8');
const blocks = text.split(/\n\s*\n+/).map(b => b.trim()).filter(b => b.length > 0 && !b.startsWith('_'));

// Write each block into its own file
blocks.forEach((block, index) => {
    fs.writeFileSync(`${outputDir}/quote-${index}.txt`, block);
});

console.log(`✅ Chopped ${blocks.length} quotes into ${outputDir}`);