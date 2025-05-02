

const fileManager = async (userName) =>{
    console.log('Welcome to the File Manager, Username!')

    console.log(process.argv)
    let commandLineArguments = ''
    for (let index = 0; index < process.argv.length; index++) {
        const element = process.argv[index];
        if (element.startsWith('--')) {
            const propertyIsValue = element.substring(2) + ' is ' + process.argv[index + 1]  
            const comma = (index < process.argv.length - 2) === true ? ', ' : ''
            commandLineArguments += propertyIsValue + comma
        }
    }
    console.log(commandLineArguments)
}

await fileManager('Jesper')