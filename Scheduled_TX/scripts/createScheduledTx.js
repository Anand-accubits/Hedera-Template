const {
    TransferTransaction,
    Client,
    ScheduleCreateTransaction,
    PrivateKey,
    Hbar, ScheduleInfoQuery,
    
} = require("@hashgraph/sdk");
const { getClient } = require("../../utils/common");
const { createScheduledTx, submitScheduledTxn, getScheduleInfo } = require("../../utils/scheduled");
require('dotenv').config({ path: 'Scheduled_TX/.env' });

//Grab your Hedera testnet account ID and private key from your .env file
if (process.env.ACCOUNT_ID_1 == null ||
    process.env.PRIVATE_KEY_1 == null) {
    throw new Error("Environment variables ACCOUNT_ID_1 and PRIVATE_KEY_1 must be present");
}

const accountId1 = process.env.ACCOUNT_ID_1;
const privateKey1 = PrivateKey.fromString(process.env.PRIVATE_KEY_1);

if (process.env.ACCOUNT_ID_2 == null ||
    process.env.PRIVATE_KEY_2 == null) {
    throw new Error("Environment variables ACCOUNT_ID_2 and PRIVATE_KEY_2 must be present");
}

const accountId2 = process.env.ACCOUNT_ID_2;
const privateKey2 = PrivateKey.fromString(process.env.PRIVATE_KEY_2);

if (process.env.ACCOUNT_ID_3 == null ||
    process.env.PRIVATE_KEY_3 == null) {
    throw new Error("Environment variables ACCOUNT_ID_3 and PRIVATE_KEY_3 must be present");
}

const accountId3 = process.env.ACCOUNT_ID_3;
const privateKey3 = PrivateKey.fromString(process.env.PRIVATE_KEY_3);

async function main() {

    const client = await getClient(accountId1, privateKey1);
    //Create a transaction to schedule
    const transaction = new TransferTransaction()
        .addHbarTransfer(accountId2, Hbar.fromTinybars(-100))
        .addHbarTransfer(accountId3, Hbar.fromTinybars(100));

    // await createScheduledTx(client, privateKey1, transaction)
    //Schedule a transaction
    const scheduleTransaction = await new ScheduleCreateTransaction()
        .setScheduledTransaction(transaction)
        .setScheduleMemo("Scheduled TX6!")
        .setAdminKey(privateKey1)
        .freezeWith(client);

    // Serialise and export the transaction to a base 64 
    const serializedData = scheduleTransaction.toBytes();
    const scheduledTxIdBase64 = Buffer.from(serializedData).toString('base64');

    const client2 = await getClient(accountId2, privateKey2)
    const scheduledId = await submitScheduledTxn(client, privateKey2, scheduledTxIdBase64)

    await getScheduleInfo(client2, scheduledId)

    // //Get the receipt of the transaction
    // const receipt = await scheduleTransaction.getReceipt(client);

    // //Get the schedule ID
    // const scheduleId = receipt.scheduleId;
    // console.log("The schedule ID is " +scheduleId);

    // //Get the scheduled transaction ID
    // const scheduledTxId = receipt.scheduledTransactionId;
    // console.log("The scheduled transaction ID is " +scheduledTxId);

    process.exit();
}

main();
