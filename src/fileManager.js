import { stdin, stdout } from 'node:process';
import { up, changeDirectory, listFiles } from './runCommands.js';
import { userName, log } from './start.js';


export function fileManager() {

    function showWorkingDir() {
        log(`You are currently in ${process.cwd()}`);
    }

    async function createPrompt() {
        const { createInterface } = await import('node:readline/promises');
        const rl = createInterface({
            input: stdin,
            output: stdout,
            prompt: '> ',
            historySize: 10
        });
        rl.prompt();
        rl.on('line', async (line) => { 
            try {
                if (line.trim() === '.exit') {
                    rl.close();
                } else {
                    await parseCommand(line.trim()); 
                    showWorkingDir();
                }
            } catch (error) {
                log(`Error: ${error.message}`);
            } finally {
                rl.prompt();
            }
        });
        rl.on('close', () => {
            log(`Thank you for using File Manager, ${userName}, Goodbye!`);
            process.exit(0);
        });
    }

    const parseCommand = async (command) => {
        if (command === 'up') {
            await up();
        }
        else if (command.startsWith('cd ')) {
            const dir = command.split(' ')[1];
            await changeDirectory(dir);
        } else if (command === 'ls') {
            await listFiles();
        } else if (command.startsWith('cat ')) {
            const fileName = command.split(' ')[1];
            log(`Reading file ${fileName}...`);
            await readFile(fileName);
        } else if (command.startsWith('add ')) {
            const fileName = command.split(' ')[1];
            log(`Adding file ${fileName}...`);
            await addFile(fileName);
        } else if (command.startsWith('mkdir ')) {
            const dirName = command.split(' ')[1];
            log(`Creating directory ${dirName}...`);
            await createDirectory(dirName);
        } else if (command.startsWith('rn ')) {
            const [oldName, newName] = command.split(' ').slice(1);
            log(`Renaming file from ${oldName} to ${newName}...`);
            await renameFile(oldName, newName);
        } else if (command.startsWith('cp ')) {
            const [source, destination] = command.split(' ').slice(1);
            log(`Copying file from ${source} to ${destination}...`);
            await copyFile(source, destination);
        } else if (command.startsWith('mv ')) {
            const [source, destination] = command.split(' ').slice(1);
            log(`Moving file from ${source} to ${destination}...`);
            await moveFile(source, destination);
        } else if (command.startsWith('rm ')) {
            const fileName = command.split(' ')[1];
            log(`Removing file ${fileName}...`);
            await removeFile(fileName);
        } else if (command === 'os-eol') {
            log(`End of line character: ${os.EOL}`);
        } else if (command === 'os-cpus') {
            log(`Number of CPUs: ${os.cpus().length}`);
        } else if (command === 'os-homedir') {
            log(`Home directory: ${os.homedir()}`);
        } else if (command === 'os-username') {
            log(`Username: ${os.userInfo().username}`);
        }
    }

    async function start() {
        log(`Welcome to the File Manager, ${userName}!`)
        log('Press CTRL+C or type .exit to end File Manager!');
        log('Available commands: up, cd, ls, cat, add, mkdir, rn, cp, mv, rm, os-eol, os-cpus, os-homedir, os-username, os-architechture, hash, compress, decompress, .exit');
        showWorkingDir();
        await createPrompt();
    }
    return {
        start,
    }
}
