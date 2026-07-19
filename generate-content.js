import fs from 'node:fs';
import path from 'node:path';

const quotesSource = './src/data/quotes.txt';
const diarySource = './src/data/spiritual_diary.txt';
const quotesOutput = './public/quotes';
const diaryOutput = './public/diary';

const ensureCleanGeneratedFiles = (directory, filePattern) => {
    fs.mkdirSync(directory, { recursive: true });
    for (const filename of fs.readdirSync(directory)) {
        if (filePattern.test(filename)) {
            fs.unlinkSync(path.join(directory, filename));
        }
    }
};

ensureCleanGeneratedFiles(quotesOutput, /^quote-\d+\.txt$|^manifest\.json$/);
ensureCleanGeneratedFiles(diaryOutput, /^[a-z]+-\d{1,2}\.json$|^manifest\.json$/);

const quotesText = fs.readFileSync(quotesSource, 'utf8');
const quoteBlocks = [...quotesText.matchAll(/([\s\S]+?)\n([-—―][^\n]+)/g)]
    .map((match) => match[0]
        .split('\n')
        .map((line) => line.trimEnd())
        .join('\n')
        .trim());

quoteBlocks.forEach((block, index) => {
    fs.writeFileSync(path.join(quotesOutput, `quote-${index}.txt`), `${block}\n`);
});
fs.writeFileSync(
    path.join(quotesOutput, 'manifest.json'),
    `${JSON.stringify({ count: quoteBlocks.length })}\n`
);

const diaryText = fs.readFileSync(diarySource, 'utf8');
const diaryEntries = [...diaryText.matchAll(/^\*\s+([A-Za-z]+\s+\d{1,2}):\s+"(.*)"\s+[—-]\s+([^\r\n]+)$/gm)]
    .map((match) => ({
        date: match[1],
        key: match[1].toLowerCase().replace(/\s+/g, '-'),
        quote: match[2],
        citation: match[3].trim()
    }));

for (const entry of diaryEntries) {
    fs.writeFileSync(
        path.join(diaryOutput, `${entry.key}.json`),
        `${JSON.stringify({ quote: entry.quote, citation: entry.citation })}\n`
    );
}
fs.writeFileSync(
    path.join(diaryOutput, 'manifest.json'),
    `${JSON.stringify({ count: diaryEntries.length, dates: diaryEntries.map((entry) => entry.date) })}\n`
);

if (quoteBlocks.length === 0 || diaryEntries.length < 365) {
    throw new Error(`Content generation failed: ${quoteBlocks.length} quotes and ${diaryEntries.length} diary entries found.`);
}

console.log(`Generated ${quoteBlocks.length} quotes and ${diaryEntries.length} daily entries.`);
