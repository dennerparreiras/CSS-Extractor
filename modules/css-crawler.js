import fs from 'fs';
import path from 'path';
import { parse, stringify } from 'css';

/**
 * Processes CSS files to filter out irrelevant CSS rules based on class names, ids and tags from the HTML.
 * It also removes all data-v attributes from the CSS.
 * @param {string} inputDir - The input directory path.
 * @param {string} outputDir - The output directory path.
 * @param {string} cssFile - The name of the CSS file to process.
 * @param {Array<string>} classNames - The list of class names from the HTML.
 * @param {Array<string>} ids - The list of ids from the HTML.
 * @param {Array<string>} tags - The list of tags from the HTML.
 * @returns {string} - The processed CSS as a string.
 */
export async function processCSS(inputDir, outputDir, cssFile, classNames, ids, tags) {
    // Construct the path to the CSS file and read its content
    const cssPath = path.join(inputDir, cssFile);
    const cssContent = fs.readFileSync(cssPath, 'utf8');

    // Remove all data-v attributes from the CSS
    const cleanedCssContent = removeDataAttributes(cssContent);

    // Parse the CSS into an Abstract Syntax Tree (AST)
    const cssAst = parse(cleanedCssContent);

    // Filter out irrelevant CSS rules
    // This is done by iterating over each rule in the CSS AST
    // For each rule, the function checks if the rule's selectors match any of the class names, ids, or tags from the HTML
    // If a match is found, the rule is considered relevant and is kept
    // If no match is found, the rule is considered irrelevant and is removed
    cssAst.stylesheet.rules = cssAst.stylesheet.rules.filter((rule) => {
        if (rule.type !== 'rule') return false;
        const selectors = rule.selectors;
        for (let selector of selectors) {
            selector = selector.replace(/::after|::before|:hover|:active|:focus/g, '');
            const classesInSelector = selector.match(/\.[\w-]*/g) || [];
            const idsInSelector = selector.match(/#[\w-]*/g) || [];
            const tagsInSelector = selector.match(/[\w-]*/g) || [];
            if (classesInSelector.some(cls => classNames.includes(cls.substring(1)))) return true;
            if (idsInSelector.some(id => ids.includes(id.substring(1)))) return true;
            if (tagsInSelector.some(tag => tags.includes(tag))) return true;
        }
        return false;
    });

    // Convert the CSS AST back into a string and return it
    const relevantCss = stringify(cssAst);
    return relevantCss;
}

/**
 * Removes all data-v attributes from the CSS.
 * @param {string} css - The original CSS as a string.
 * @returns {string} - The CSS without any data-v attributes.
 */
function removeDataAttributes(css) {
    return css.replace(/\[data-v-[\w\d]+\]/g, '');
}
