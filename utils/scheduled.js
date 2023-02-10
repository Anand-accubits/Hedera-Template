const {
    TransferTransaction,
    Client,
    ScheduleCreateTransaction,
    PrivateKey,
    Hbar, ScheduleInfoQuery,
    ScheduleId, AccountId,Timestamp
} = require("@hashgraph/sdk");

exports.createScheduledTx = async (client, privateKey, transaction) => {
    //Schedule a transaction
    const scheduleTransaction = await (await new ScheduleCreateTransaction()
        .setScheduledTransaction(transaction)
        .setScheduleMemo("Scheduled TX!")
        .setAdminKey(privateKey))
        .execute(client);

    //Get the receipt of the transaction
    const receipt = await scheduleTransaction.getReceipt(client);

    //Get the schedule ID
    const scheduleId = receipt.scheduleId;
    console.log("The schedule ID is " + scheduleId);

    //Get the scheduled transaction ID
    const scheduledTxId = receipt.scheduledTransactionId;
    console.log("The scheduled transaction ID is " + scheduledTxId);
    return scheduledTxId;
}

exports.submitScheduledTxn = async (client, privateKey, encoded) => {
    const scheduledTransactionRaw = Buffer.from(encoded, 'base64');
    const scheduledTransaction = ScheduleCreateTransaction.fromBytes(scheduledTransactionRaw);
    const signedTransaction = await scheduledTransaction.sign(privateKey)

    const txResponse = await signedTransaction.execute(client);
    const receipt = await txResponse.getReceipt(client);
    console.log(`TX ${txResponse.transactionId.toString()} status: ${receipt.status}`);

    //Get the schedule ID
    const scheduleId = receipt.scheduleId;
    console.log("The schedule ID is " + scheduleId);
    return scheduleId;
}

exports.getScheduleInfo = async (client, scheduleId) => {

    //Create the query
    const query = new ScheduleInfoQuery()
        .setScheduleId(scheduleId);

    //Sign with the client operator private key and submit the query request to a node in a Hedera network
    const info = await query.execute(client);
    console.log("The scheduledId you queried for is: ", new ScheduleId(info.scheduleId).toString());
    console.log("The memo for it is: ", info.scheduleMemo);
    console.log("It got created by: ", new AccountId(info.creatorAccountId).toString());
    console.log("It got payed by: ", new AccountId(info.payerAccountId).toString());
    console.log("The expiration time of the scheduled tx is: ", new Timestamp(info.expirationTime).toDate());
    if (new Timestamp(info.executed).toDate().getTime() === new Date("1970-01-01T00:00:00.000Z").getTime()) {
        console.log("The transaction has not been executed yet.");
    } else {
        console.log("The time of execution of the scheduled tx is: ", new Timestamp(info.executed).toDate());
    }

}