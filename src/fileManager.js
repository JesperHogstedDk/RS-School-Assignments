

const fileManager = async () => {
   console.log(`Welcome to the File Manager, ${getusernameArgument()}!`)
}

await fileManager()

function getusernameArgument() {
    let userName = '';
    for (let index = 0; index < process.argv.length; index++) {
        const element = process.argv[index];
        if (element.startsWith('--username')) {
            userName = process.argv[index].substring(11);
            break;
        }
    }
    return userName;
}

