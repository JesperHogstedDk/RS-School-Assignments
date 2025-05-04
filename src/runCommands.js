import path from 'node:path';
import { log } from './start.js';
import fs from 'node:fs/promises';
import { table } from 'node:console';

export async function up() {
    const newPath = path.join(process.cwd(), '..');
    try {
        process.chdir(newPath);
        // console.log(`Moved up to: ${newPath}`);
    } catch (error) {
        log(`Failed to move up: ${error.message}`);

    }
}

export async function changeDirectory(dir) {
    const newPath = path.join(process.cwd(), dir);
    try {
        process.chdir(newPath);
        // console.log(`Changed directory to: ${newPath}`);
    } catch (error) {
        log(`Failed to change directory: ${error.message}`);
    }
}

export async function listFiles() {

    try {
        const files = await fs.readdir(process.cwd());
        let fileStats = await Promise.all(files.map(async (file) => {
            const stats = await fs.stat(path.join(process.cwd(), file));
            let type = ''
            if (stats.isSymbolicLink()) {
                type = 'symbolic link';
            } else if (stats.isDirectory()) {
                type = 'directory';
            } else if (stats.isFile()) {
                type = 'file';
            } else {
                type = 'other';
            }
            return {
                Name: file,
                Size: stats.size,
                Type: type
            };
        }));
        table(fileStats);                
    } catch (error) {
        log(`Failed to list files: ${error.message}`);
    }
}