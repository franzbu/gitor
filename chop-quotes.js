import fs from 'fs';

const quotesPath = './src/data/quotes.txt';
const outputDir = './public/quotes';

// Create the public/quotes folder if it doesn't exist
if (!fs.existsSync(outputDir)){
    fs.mkdirSync(outputDir, { recursive: true });
}

// Read the master file
const text = fs.readFileSync(quotesPath, 'utf-8');
const blocks = [];

// Match everything up to and including the citation line (starts with -, —, or ―)
const regex = /([\s\S]+?)\n([-—―][^\n]+)/g;
let match;

while ((match = regex.exec(text)) !== null) {
    // trim() removes leading empty lines between quotes, keeping the quote's internal structure intact
    blocks.push(match[0].trim()); 
}

// Write each block into its own file
blocks.forEach((block, index) => {
    fs.writeFileSync(`${outputDir}/quote-${index}.txt`, block);
});

console.log(`✅ Chopped ${blocks.length} quotes into ${outputDir}`);