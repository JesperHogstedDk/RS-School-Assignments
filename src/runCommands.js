import { table } from 'node:console';
import fs from 'node:fs';
import fsPromises from 'node:fs/promises';
import path from 'node:path';
import { pipeline } from 'node:stream/promises';
import { log } from './start.js';

export async function up() {
    const newPath = path.join(process.cwd(), '..');
    try {
        process.chdir(newPath);
    } catch (error) {
        log(`Failed to move up: ${error.message}`);
    }
}

export async function changeDirectory(dir) {
    const newPath = path.join(process.cwd(), dir);
    try {
        process.chdir(newPath);
    } catch (error) {
        log(`Failed to change directory: ${error.message}`);
    }
}

export async function listFiles() {

    try {
        const files = await fsPromises.readdir(process.cwd());
        let fileStats = await Promise.all(files.map(async (file) => {
            const stats = await fsPromises.stat(path.join(process.cwd(), file));
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

export async function readFile(fileName) {
    const filePath = path.join(process.cwd(), fileName);

    try {
        const readStream = fs.createReadStream(filePath, { encoding: 'utf8' });

        readStream.on('data', (chunk) => {
            log(chunk); 
        });

        readStream.on('end', () => {
            log(`Finished reading file: ${fileName}`);
        });

        readStream.on('error', (error) => {
            log(`Failed to read file: ${error.message}`);
        });
    } catch (error) {
        log(`Failed to read file: ${error.message}`);
    }
}

export async function addFile(fileName) {
    try {
        const filePath = path.join(process.cwd(), fileName);
        await fsPromises.writeFile(filePath, '', { flag: 'wx' });
        log(`File ${fileName} created successfully.`);
    } catch (error) {
        if (error.code === 'EEXIST') {
            log(`${error.message}`);
        } else {
            log(`Failed to create file: ${error.message}`);
        }
    }
}

export async function createDirectory(dirName) {
    try {
        const dirPath = path.join(process.cwd(), dirName);
        await fsPromises.mkdir(dirPath, { recursive: true });
        log(`Directory ${dirName} created successfully.`);
    } catch (error) {
        log(`${error.message}`);
    }
}

export async function renameFile(oldName, newName) {
    try {
        const oldPath = path.join(process.cwd(), oldName);
        const newPath = path.join(process.cwd(), newName);
        await fsPromises.rename(oldPath, newPath);
        log(`File renamed from ${oldName} to ${newName} successfully.`);
    } catch (error) {
        log(`${error.message}`);
    }
}

export async function copyFile(source, destination) {
    const sourcePath = path.join(process.cwd(), source);
    const destinationPath = path.join(process.cwd(), destination);

    try {
        await pipeline(
            fs.createReadStream(sourcePath),
            fs.createWriteStream(destinationPath)
        );
        log(`File copied from ${source} to ${destination} successfully.`);
    } catch (error) {
        log(`Failed to copy file: ${error.message}`);
    }
}

export async function moveFile(source, destination) {
    try {
        const sourcePath = path.join(process.cwd(), source);
        const destinationPath = path.join(process.cwd(), destination);

        await pipeline(
            fs.createReadStream(sourcePath),
            fs.createWriteStream(destinationPath)
        );
        await fsPromises.unlink(sourcePath); 
        log(`File moved from ${source} to ${destination} successfully.`);
    } catch (error) {
        log(`${error.message}`);
    }
}

export async function removeFile(fileName) {
    try {
        const filePath = path.join(process.cwd(), fileName);
        await fsPromises.unlink(filePath);
        log(`File ${fileName} deleted successfully.`);  
    }
    catch (error) {
        log(`Failed to delete file: ${error.message}`);
    }
}