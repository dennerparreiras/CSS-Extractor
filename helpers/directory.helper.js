import fs from 'fs';
import path, { dirname } from 'path';
import { fileURLToPath } from 'url';

// Obtain the directory name of the current module.
const __dirname = dirname(fileURLToPath(import.meta.url));
// Define paths for the input and output directories relative to the current module.
const inputDir = path.join(__dirname, 'input');
const outputDir = path.join(__dirname, 'output');

/**
 * Function to delete all files within a given directory. 
 * If the entity within the directory is itself a directory, the function calls itself recursively.
 * @param {string} directory - The directory path whose contents should be deleted.
 */
function clearDirectory(directory) {
    // Get the entities within the directory with the `withFileTypes` option to get additional information.
    const entities = fs.readdirSync(directory, { withFileTypes: true });

    // Loop through each entity in the directory.
    for (const entity of entities) {
        // Construct the full path of the current entity.
        const fullPath = path.join(directory, entity.name);

        if (entity.isDirectory()) {
            // If the entity is a directory, call the function recursively.
            clearDirectory(fullPath);
            // Then remove the empty directory.
            fs.rmdirSync(fullPath);   
        } else if (entity.isFile()) {
            // If the entity is a file, remove the file.
            fs.unlinkSync(fullPath);
        }
    }
}

/**
 * Function to clear the contents of the output directory.
 */
export function clearOutput() {
    clearDirectory(outputDir);
    console.log('Output directory cleared.');
}

/**
 * Function to clear the contents of the input directory.
 */
export function clearInput() {
    clearDirectory(inputDir);
    console.log('Input directory cleared.');
}

/**
 * Function to clear the contents of both the input and output directories.
 */
export function clearAll() {
    clearOutput();
    clearInput();
    console.log('All directories cleared.');
}
