import fs from 'fs';
import path from 'path';
import cheerio from 'cheerio';

/**
 * This function prepares the HTML by removing 'data-v' attributes and comments,
 * and then saves the sanitized HTML to the output directory.
 *
 * @param {string} inputDir - The directory where the input HTML file is located.
 * @param {string} outputDir - The directory where the output HTML file should be saved.
 * @param {string} htmlFile - The name of the HTML file to be processed.
 * @returns {string} The path to the output HTML file.
 */
export async function prepareHTML(inputDir, outputDir, htmlFile) {
    // Resolve the path to the HTML file in the input directory
    const htmlPath = path.join(inputDir, htmlFile);

    // Resolve the path to the output HTML file in the output directory
    const outputPath = path.join(outputDir, 'treated-html.html');

    // Read the contents of the HTML file
    const htmlContent = fs.readFileSync(htmlPath, 'utf8');

    // Load the HTML content into Cheerio for parsing and manipulation
    const $ = cheerio.load(htmlContent);

    // Loop over each element in the HTML
    $('*').each(function () {
        // Get the attributes of the current element
        const attributes = $(this).attr();

        // Loop over each attribute
        Object.keys(attributes).forEach((attr) => {
            // If the attribute starts with 'data-v', remove it
            if (attr.startsWith('data-v')) {
                $(this).removeAttr(attr);
            }
        });
    });

    // Loop over each node in the HTML
    $('*').contents().each(function () {
        // If the node is a comment, remove it
        if (this.type === 'comment') {
            $(this).remove();
        }
    });

    // Get the HTML string of the manipulated document
    const sanitizedHtml = $.html();

    // Write the sanitized HTML to the output file
    fs.writeFileSync(outputPath, sanitizedHtml);

    // Return the path to the output file
    return outputPath;
}
