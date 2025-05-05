import { table } from 'node:console';
import { createHash } from 'node:crypto';
import fs from 'node:fs';
import fsPromises from 'node:fs/promises';
import { homedir } from 'node:os';
import path from 'node:path';
import { pipeline } from 'node:stream/promises';
import { createBrotliCompress, createBrotliDecompress } from 'node:zlib';
import { log } from './start.js';

const OPERATION_FAILED = 'Operation failed: ';

export async function up() {
    const newPath = path.join(process.cwd(), '..');
    try {
        if (homedir() === process.cwd()) {
            return;
        }
        process.chdir(newPath);
    } catch (error) {
        log(`${OPERATION_FAILED}: ${error.message}`);
    }
}

export async function changeDirectory(dir) {
    const newPath = path.join(process.cwd(), dir);
    try {
        process.chdir(newPath);
    } catch (error) {
        log(`${OPERATION_FAILED}: ${error.message}`);
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
                Type: type,
                Size: stats.size,
            };
        }));
        fileStats.sort((a, b) => a.Type.localeCompare(b.Type));
        table(fileStats);
    } catch (error) {
        log(`${OPERATION_FAILED}: ${error.message}`);
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
            log(`${OPERATION_FAILED}: ${error.message}`);
        });
    } catch (error) {
        log(`${OPERATION_FAILED}: ${error.message}`);
    }
}

export async function addFile(fileName) {
    try {
        const filePath = path.join(process.cwd(), fileName);
        await fsPromises.writeFile(filePath, '', { flag: 'wx' });
        log(`File ${fileName} created successfully.`);
    } catch (error) {
        log(`${OPERATION_FAILED}: ${error.message}`);
    }
}

export async function createDirectory(dirName) {
    try {
        const dirPath = path.join(process.cwd(), dirName);
        await fsPromises.mkdir(dirPath, { recursive: true });
        log(`Directory ${dirName} created successfully.`);
    } catch (error) {
        log(`${OPERATION_FAILED}: ${error.message}`);
    }
}

export async function renameFile(oldName, newName) {
    try {
        const oldPath = path.join(process.cwd(), oldName);
        const newPath = path.join(process.cwd(), newName);
        await fsPromises.rename(oldPath, newPath);
        log(`File renamed from ${oldName} to ${newName} successfully.`);
    } catch (error) {
        log(`${OPERATION_FAILED}: ${error.message}`);
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
        log(`${OPERATION_FAILED}: ${error.message}`);
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
        log(`${OPERATION_FAILED}: ${error.message}`);
    }
}

export async function removeFile(fileName) {
    try {
        const filePath = path.join(process.cwd(), fileName);
        await fsPromises.unlink(filePath);
        log(`File ${fileName} deleted successfully.`);
    }
    catch (error) {
        log(`${OPERATION_FAILED}: ${error.message}`);
    }
}

export async function hashFile(fileName) {
    const filePath = path.join(process.cwd(), fileName);

    try {
        const hash = createHash('sha256');
        const readStream = fs.createReadStream(filePath);

        await new Promise((resolve, reject) => {
            readStream.on('data', (chunk) => {
                hash.update(chunk);
            });

            readStream.on('end', () => {
                const digest = hash.digest('hex');
                log(`Hash of file ${fileName}: ${digest}`);
                resolve();
            });

            readStream.on('error', (error) => {
                log(`${OPERATION_FAILED}: ${error.message}`);
                reject(error);
            });
        });
    } catch (error) {
        log(`${OPERATION_FAILED}: ${error.message}`);
    }
}

export async function brotliCompress(fileName, destinationFilename) {
    const filePath = path.join(process.cwd(), fileName);
    const compressedFilePath = `${destinationFilename}.gz`;

    try {
        const gzip = createBrotliCompress();
        const sourceStream = fs.createReadStream(filePath);
        const destinationStream = fs.createWriteStream(compressedFilePath);

        await pipeline(sourceStream, gzip, destinationStream);
        log(`File ${fileName} Brotli compressed to ${compressedFilePath} successfully.`);
    } catch (error) {
        log(`${OPERATION_FAILED}: ${error.message}`);
    }
}

export async function brotliDecompress(fileName, destinationFilename) {
    const filePath = path.join(process.cwd(), fileName);
    const decompressedFilePath = `${destinationFilename}`;

    try {
        const brotliUnZip = createBrotliDecompress();
        const sourceStream = fs.createReadStream(filePath);
        const destinationStream = fs.createWriteStream(decompressedFilePath);

        await pipeline(sourceStream, brotliUnZip, destinationStream);
        log(`File ${fileName} decompressed to ${decompressedFilePath} successfully.`);
    } catch (error) {
        log(`${OPERATION_FAILED}: ${error.message}`);
    }
}

export async function showHelp() {
    log(`Available commands:
    up - Move up one directory
    cd <directory> - Change directory
    ls - List files in the current directory
    cat <file> - Read a file
    mkdir <newDdirectory> - Create a new directory
    add <file> - Create a new file    
    rn <oldFile> <newFile> - Rename a file
    cp <source> <destination> - Copy a file
    mv <source> <destination> - Move a file
    rm <file> - Remove a file
    os --EOL - Print default system End-Of-Line to console
    os --cpus - Print host machine CPUs info
    os --homedir - Print home directory
    os --username - Print current *system user name*
    os --architecture - Print CPU architecture for node.js
    hash <file> - Hash a file using SHA-256
    compress <file> <destinationFilename> - Compress a file using Brotli
    decompress <file> <destinationFilename> - Decompress a Brotli compressed file
    help - Show this help message
    .exit - Exit the program`);
}