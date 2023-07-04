import fs from 'fs';
import path from 'path';
import { parse, stringify } from 'css';

/**
 * Processes CSS files to filter out irrelevant CSS rules based on class names, ids, tags, @media, @font-face, *, and variable declarations.
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

    // Separate rules into three groups: @font-face/@media, universal, and others
    const fontFaceMediaRules = [];
    const universalRules = [];
    const otherRules = [];

    cssAst.stylesheet.rules.forEach((rule) => {
        if (rule.type === 'font-face' || rule.type === 'media' || rule.selectors.includes('@')) {
            // @font-face, @media, or other rules starting with @
            if (!isDuplicateRule(rule, fontFaceMediaRules)) {
                fontFaceMediaRules.push(rule);
            }
        } else if (rule.type === 'rule' && rule.selectors.includes('*')) {
            // Universal rule
            if (!isDuplicateRule(rule, universalRules)) {
                universalRules.push(rule);
            }
        } else {
            // Other rule
            if (!isDuplicateRule(rule, otherRules)) {
                otherRules.push(rule);
            }
        }
    });

    // Filter out irrelevant CSS rules from otherRules
    const relevantOtherRules = otherRules.filter((rule) => {
        if (rule.type === 'rule') {
            // Check if the rule contains class names, ids, or tags from the HTML
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
        } else if (
            rule.type === 'media' ||
            rule.type === 'font-face' ||
            rule.declarations.some(declaration => declaration.property.startsWith('--'))
        ) {
            // Keep @media, @font-face, and variable declaration rules
            return true;
        }
        return false;
    });

    // Combine the three groups of rules in the specified order, removing duplicates
    const combinedRules = [...fontFaceMediaRules, ...universalRules, ...relevantOtherRules].filter((rule, index, self) => {
        return !self.slice(index + 1).some(otherRule => JSON.stringify(otherRule) === JSON.stringify(rule));
    });

    // Update the rules in the CSS AST
    cssAst.stylesheet.rules = combinedRules;

    // Convert the CSS AST back into a string and return it
    const processedCss = stringify(cssAst);
    return processedCss;
}

/**
 * Removes all data-v attributes from the CSS.
 * @param {string} css - The original CSS as a string.
 * @returns {string} - The CSS without any data-v attributes.
 */
function removeDataAttributes(css) {
    return css.replace(/\[data-v-[\w\d]+\]/g, '');
}

/**
 * Checks if a rule is a duplicate of any rule in the given rule list.
 * @param {Object} rule - The CSS rule object to check.
 * @param {Array} ruleList - The list of CSS rules to compare against.
 * @returns {boolean} - True if the rule is a duplicate, false otherwise.
 */
function isDuplicateRule(rule, ruleList) {
    const ruleString = JSON.stringify(rule);
    return ruleList.some(existingRule => JSON.stringify(existingRule) === ruleString);
}
