import { JSDOM } from 'jsdom';

/**
 * This function analyzes the given HTML and extracts class names, ids and tags.
 *
 * @param {string} html - A string of HTML to be analyzed.
 * @returns {Object} An object containing three arrays: classNames, ids, and tags. 
 * Each array contains unique items extracted from the HTML.
 */
export async function analyzeHTML(html) {
    // Initialize a new JSDOM instance with the provided HTML
    const dom = new JSDOM(html);

    // Create a document object for easier element manipulation and querying
    const document = dom.window.document;

    // Declare arrays to hold class names, ids, and tags
    let classNames = [];
    let ids = [];
    let tags = [];

    // Select all elements in the document
    const elements = document.querySelectorAll('*');

    // Loop over each element
    elements.forEach((element) => {
        // If the element has a class, split the class string into individual classes and add them to the classNames array
        if (element.className) {
            const classes = element.className.split(' ');
            classNames = [...classNames, ...classes];
        }

        // If the element has an id, add it to the ids array
        if (element.id) {
            ids.push(element.id);
        }

        // Add the element's tag to the tags array
        tags.push(element.tagName.toLowerCase());
    });

    // De-duplicate classNames, ids, and tags by converting them to Set and back to array.
    classNames = [...new Set(classNames)];
    ids = [...new Set(ids)];
    tags = [...new Set(tags)];

    // Return an object containing the arrays of classNames, ids, and tags
    return { classNames, ids, tags };
}
