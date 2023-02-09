
const {
    Hbar,
    FileCreateTransaction,
    FileAppendTransaction,
    FileContentsQuery } = require('@hashgraph/sdk');
const fs = require('fs');

const createFile = async (wallet, data) => {
    // Create a file on Hedera and store file
    let fileCreateTransaction = await new FileCreateTransaction()
        .setKeys([wallet.getAccountKey()])
        .setContents(data)
        .setMaxTransactionFee(new Hbar(2))
        .freezeWithSigner(wallet);
    fileCreateTransaction = await fileCreateTransaction.signWithSigner(wallet);
    const txCreateResponse = await fileCreateTransaction.executeWithSigner(wallet);

    //Get the receipt of the transaction
    const createReceipt = await txCreateResponse.getReceiptWithSigner(wallet);

    //Grab the new file ID from the receipt
    const fileId = createReceipt.fileId;
    const { nodeId } = txCreateResponse
    console.log(`Your file ID is: ${fileId}`);
    return { fileId, nodeId };
}

const updateFile = async (wallet, fileId, nodeId, data) => {
    // // Fees can be calculated with the fee estimator https://hedera.com/fees
    const txAppendResponse = await (
        await (
            await new FileAppendTransaction()
                .setNodeAccountIds([nodeId])
                .setFileId(fileId)
                .setContents(data)
                .setMaxTransactionFee(new Hbar(5))
                .freezeWithSigner(wallet)
        ).signWithSigner(wallet)
    ).executeWithSigner(wallet);

    const appendReceipt = await txAppendResponse.getReceiptWithSigner(wallet);
}

const readFile = async (path) => {
    const data = fs.readFileSync(path);
    return data;
}

const retrieve = async (wallet, fileId, path) => {
    const query = new FileContentsQuery()
        .setFileId(fileId);

    const contents = await query.executeWithSigner(wallet);

    console.log(`The size of the data is ${contents.length}`);
    // console.log(`The File content is : ${contents.toString()}`);

    fs.writeFileSync(path, contents);
}


exports.createFile = (wallet, data) => createFile(wallet, data)
exports.updateFile = (wallet, fileId, nodeId, data) => updateFile(wallet, fileId, nodeId, data)
exports.readFile = (path) => readFile(path)
exports.retrieve = (wallet, fileId, path) => retrieve(wallet, fileId, path)