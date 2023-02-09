const fs = require('fs');
const { createFile, readFile, updateFile, retrieve } = require('../../utils/file')
const { getWallet, } = require('../../utils/common')
require('dotenv').config({ path: 'FileService/.env' })

const ACCOUNT_ID_1 = process.env.ACCOUNT_ID_1;
const PRIVATE_KEY_1 = process.env.PRIVATE_KEY_1;

if (ACCOUNT_ID_1 == null || PRIVATE_KEY_1 == null) {
    throw new Error(
        "Environment variables ACCOUNT_ID_1, and PRIVATE_KEY_1 are required."
    );
}

async function main() {
    // Create the Wallet
    const wallet = await getWallet(ACCOUNT_ID_1, PRIVATE_KEY_1)
    console.log("Creating an Empty File")

    // // Read File
    // const path = '' 
    // const data = await readFile()

    // Create File
    let data = ''
    const { fileId, nodeId } = await createFile(wallet, data);

    // UPDATE CONTENT
    console.log("Updating Content of the file")
    // data = 'hello'
    data = fs.readFileSync('FileService/uploads/file.pdf');
    await updateFile(wallet, fileId, nodeId, data)

    // // Retrieve File Data
    console.log("Retrieving the content of the file")
    await retrieve(wallet, fileId, 'FileService/downloads/retrieved.pdf')
    process.exit();
}



main();
