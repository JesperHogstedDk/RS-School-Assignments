const { stdin, stdout } = await import('node:process');

checkUsage();
const userName = await getUsernameFromArgument();

async function startCommunication() {
    const { pipeline } = await import('node:stream/promises');
    const { Transform } = await import('stream');

    class ReverseStream extends Transform {
        async _transform(chunk, encoding, callback) {
            const input = chunk.toString().trim();
            if (input === '.exit') {
                this.push(null);
            } else
                if (input.startsWith('cp')) {
                    this.push('Valid command: ' + input + '\n');
                    parseCommand(input);

                    this.push('Command executed successfully! \n');
                    log(await showWorkingDir() + '\n');                    
                    stdout.write('> ');
                } else {
                    this.push('Unknown command: ' + input + '\n');
                    this.push('Please enter a valid command! \n');
                    this.push('Available commands: cp, mv, rm, mkdir, rmdir, ls, cat, touch, .exit \n');
                    // log(await showWorkingDir() + '\n');
                    stdout.write('> ');
                }
            callback();
        }
    }

    const reverseStream = new ReverseStream();
    // reverseStream.on('data', (chunk) => {
    //     log(`on data: ${chunk.toString()}`);
    // });
    reverseStream.on('error', (err) => {
        log(`Error: ${err.message}`);
    });
    reverseStream.on('end', () => {
        log(`Thank you for using File Manager, ${userName}, goodbye!`);
        process.exit(0); // Exit the process when the stream ends
    });
    reverseStream.on('close', () => {
        log('Stream closed');
    });
    reverseStream.on('finish', () => {
        log('Stream finished');
    });

    log('Press CTRL+C or type .exit to end File Manager!');
    log(await showWorkingDir());
    stdout.write('> ');
    process.stdin.setEncoding('utf8');
    await pipeline(process.stdin, reverseStream, process.stdout)
}

function checkUsage() {
    const args = process.argv.slice(2);
    if (args.length === 0) {
        log('Usage: node fileManager.js -- --username=your_username');
        process.exit(1);
    }
    const usernameArg = args.find(arg =>
        arg.startsWith('--username') && arg.substring(10, 11) === '=');
    if (!usernameArg) {
        log('Usage: node fileManager.js -- --username=your_username');
        process.exit(1);
    }
}

const log = (message) =>
{
    console.log(message);
}

async function getUsernameFromArgument() {

    const args = process.argv.slice(2);
    const usernameArg = args.find(arg =>
        arg.startsWith('--username') && arg.substring(10, 11) === '=');
    const userName = usernameArg.substring(11);
    if (userName.length === 0) {
        log('Error: Username cannot be empty!');
        process.exit(1);
    }
    return userName
}

const showWorkingDir = async () => {
    return `You are currently in ${await getWworkingDirectory()}!`;
}

const getWworkingDirectory = async () => {
    const { cwd } = await import('node:process');
    const { fileURLToPath } = await import('node:url');
    const { dirname } = await import('node:path');
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = dirname(__filename);
    return cwd() === __dirname ? 'current directory' : cwd()
}

const parseCommand = async (command) => {
    log(`Parsing command: ${command}`);
}

const fileManager = async () => {
    log(`Welcome to the File Manager, ${userName}!`)
    await startCommunication();
}

await fileManager();