import { fileManager } from './fileManager.js';

export const log = (message) => { console.log(message); }
export const userName = await getUsernameFromArgument();

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

checkUsage();

const manager = fileManager();
await manager.start()