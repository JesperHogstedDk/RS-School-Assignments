import path from 'node:path';
import { log } from './start.js';
import fs from 'node:fs/promises';

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
        files.forEach(file => log(file));
    } catch (error) {
        log(`Failed to list files: ${error.message}`);
    }
}