import fs from 'node:fs';
import path from 'node:path';

const clientDirectory = './dist/client';

const collectFiles = (directory, filename) => fs.readdirSync(directory, { withFileTypes: true })
    .flatMap((entry) => {
        const entryPath = path.join(directory, entry.name);
        if (entry.isDirectory()) return collectFiles(entryPath, filename);
        return entry.name === filename ? [entryPath] : [];
    });

const assert = (condition, message) => {
    if (!condition) throw new Error(message);
};

const pageFiles = collectFiles(clientDirectory, 'index.html');
assert(pageFiles.length === 160, `Expected 160 generated pages, found ${pageFiles.length}.`);

for (const pageFile of pageFiles) {
    const html = fs.readFileSync(pageFile, 'utf8');
    assert(html.includes('<meta name="description"'), `Missing description: ${pageFile}`);
    assert(html.includes('<link rel="canonical"'), `Missing canonical URL: ${pageFile}`);
    assert(html.includes('<link rel="manifest" href="/manifest.json">'), `Missing manifest: ${pageFile}`);
    if (pageFile.endsWith(`${path.sep}offline${path.sep}index.html`)) {
        assert(html.includes('content="noindex, nofollow"'), 'Offline page must not be indexed.');
    } else {
        assert(html.includes('content="index, follow,'), `Public page is not indexable: ${pageFile}`);
    }
}

const homepage = fs.readFileSync(path.join(clientDirectory, 'index.html'), 'utf8');
assert(Buffer.byteLength(homepage) < 30_000, 'Homepage payload exceeded the 30 KB HTML budget.');
assert(!homepage.includes('const fileContent'), 'The full spiritual diary was embedded in the homepage.');
assert(homepage.includes("replace(/\\s+/g, '-')"), 'The daily diary URL does not normalize spaces to hyphens.');
assert(homepage.includes('footer-quote quote-loading'), 'The rotating quotation lacks its initial loading state.');
assert(homepage.includes('.finally(showHourlyQuote)'), 'The rotating quotation loading state is not finalized.');

const sitemap = fs.readFileSync(path.join(clientDirectory, 'sitemap-0.xml'), 'utf8');
const sitemapUrls = [...sitemap.matchAll(/<loc>/g)].length;
assert(sitemapUrls === 159, `Expected 159 indexable sitemap URLs, found ${sitemapUrls}.`);
assert(!sitemap.includes('/offline/'), 'Offline fallback must not appear in the sitemap.');

const quoteFiles = fs.readdirSync('./public/quotes').filter((filename) => /^quote-\d+\.txt$/.test(filename));
const diaryFiles = fs.readdirSync('./public/diary').filter((filename) => /^[a-z]+-\d{1,2}\.json$/.test(filename));
assert(quoteFiles.length === 498, `Expected 498 quote fragments, found ${quoteFiles.length}.`);
assert(diaryFiles.length === 365, `Expected 365 diary fragments, found ${diaryFiles.length}.`);

const manifest = JSON.parse(fs.readFileSync('./public/manifest.json', 'utf8'));
assert(manifest.id === '/' && manifest.scope === '/' && manifest.display === 'standalone', 'Manifest is not installable at the site root.');
assert(Array.isArray(manifest.icons) && manifest.icons.length >= 2, 'Manifest requires install icons.');

const serviceWorker = fs.readFileSync('./public/sw.js', 'utf8');
assert(serviceWorker.includes("request.mode === 'navigate'"), 'Service worker lacks navigation handling.');
assert(serviceWorker.includes("networkFirst(request, '/offline/')"), 'Service worker lacks its offline navigation fallback.');

console.log(`Verified ${pageFiles.length} pages, ${sitemapUrls} indexable URLs, and installable offline support.`);
