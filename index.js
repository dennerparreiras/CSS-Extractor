import ora from 'ora';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { prepareHTML } from './modules/html-crawler.js';
import { analyzeHTML } from './modules/html-analyzer.js';
import { processCSS } from './modules/css-crawler.js';

// Resolving the paths to the input and output directories
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const inputDir = path.join(__dirname, 'input');
const outputDir = path.join(__dirname, 'output');

// Initializing the spinner for CLI progress visualization
const spinner = ora('Starting CSS extraction process...').start();

/**
 * Main function to orchestrate the CSS extraction process.
 * This involves preparing the HTML, analyzing it, and processing the CSS files.
 */
async function extractCSS() {
    try {
        // Crawling HTML
        let htmlFile = fs.readdirSync(inputDir).find(file => path.extname(file) === '.html');
        spinner.text = 'Preparing HTML...';
        // Removing 'data-v' attributes and comments, and saving the sanitized HTML
        const treatedHtmlFilePath = await prepareHTML(inputDir, outputDir, htmlFile);

        // Analyzing HTML
        const html = fs.readFileSync(treatedHtmlFilePath, 'utf8');
        spinner.text = 'Analyzing HTML...';
        // Extracting class names, ids, and tags from the HTML
        const { classNames, ids, tags } = await analyzeHTML(html);
        spinner.succeed(`Found ${classNames.length} unique classes, ${ids.length} unique ids and ${tags.length} unique tags in the HTML.`);

        // Crawling CSS
        const cssFiles = fs.readdirSync(inputDir).filter(file => path.extname(file) === '.css');
        spinner.succeed(`Found ${cssFiles.length} CSS files.`);
        // Looping over each CSS file to process it and save the relevant CSS to the output directory
        for (let cssFile of cssFiles) {
            spinner.text = `Processing CSS file ${cssFile}...`;
            const cssContent = await processCSS(inputDir, outputDir, cssFile, classNames, ids, tags);
            fs.writeFileSync(path.join(outputDir, `output-${cssFile}`), cssContent);
        }

        // Concatenating CSS
        const outputCssFiles = fs.readdirSync(outputDir).filter(file => path.extname(file) === '.css' && file !== 'output-final.css');
        // Joining all the processed CSS into a final CSS file
        const finalCssContent = outputCssFiles.map(file => fs.readFileSync(path.join(outputDir, file), 'utf8')).join('\n');
        fs.writeFileSync(path.join(outputDir, 'output-final.css'), finalCssContent);
        spinner.succeed('CSS extraction process completed successfully!');
    } catch (error) {
        // Logging any errors that occur
        spinner.fail(`Error occurred: ${error.message}`);
    }
}

// Start the extraction process
extractCSS();
