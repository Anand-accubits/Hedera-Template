const {
    PrivateKey,
    Client,
    KeyList,
    AccountCreateTransaction,
    Hbar,
    AccountBalanceQuery,
    TransferTransaction
} = require("@hashgraph/sdk");
const { getClient, getWallet } = require("../../utils/common");
require('dotenv').config({ path: 'MultiSig/.env' })
// import MirrorChannel from '@hashgraph/sdk/lib/channel/MirrorChannel.js';

//Grab your Hedera testnet account ID and private key from your .env file
const accountId1 = process.env.ACCOUNT_ID_1;
const privateKey1 = PrivateKey.fromString(process.env.PRIVATE_KEY_1);

const accountId2 = process.env.ACCOUNT_ID_2;
const privateKey2 = PrivateKey.fromString(process.env.PRIVATE_KEY_2);

const accountId3 = process.env.ACCOUNT_ID_3;
const privateKey3 = PrivateKey.fromString(process.env.PRIVATE_KEY_3);

const accountId4 = process.env.ACCOUNT_ID_4;
const privateKey4 = PrivateKey.fromString(process.env.PRIVATE_KEY_4);

const client = Client.forTestnet();
client.setOperator(accountId1, privateKey1);

async function main() {
    const keyList = await createKeyList([privateKey1.publicKey, privateKey2.publicKey, privateKey3.publicKey])
    console.log("Key list created: ", keyList)

    const multiSignatureAccId = await createMultiSignatureAccount(client, keyList);
    console.log('\nThe Multi Signature Account ID is: ' + multiSignatureAccId);

    let accountBalance = await getAccountBalance(client, accountId4);
    console.log("Account 4 balance (Initial value): ", accountId4)

    await transferHbars(client, multiSignatureAccId, accountId4, privateKey1, privateKey2)
    accountBalance = await getAccountBalance(client, accountId4);
    console.log("Account 4 balance (After Transfer): ", accountId4)

    process.exit()
}

async function createKeyList(keys) {
    //Create a key list with 3 keys , 2 are mandatory
    const keyList = new KeyList(keys, 2);
    return keyList;
};

async function createMultiSignatureAccount(client, keys) {
    const multiSigAccount = await new AccountCreateTransaction()
        .setKey(keys)
        .setInitialBalance(Hbar.fromString('20'))
        .execute(client);

    // Get the new account ID
    const getReceipt = await multiSigAccount.getReceipt(client);
    const multiSigAccountID = getReceipt.accountId;

    return multiSigAccountID;
};

async function getAccountBalance(client, myAccountId) {
    try {
        // getting account balance
        const accountBalance = await new AccountBalanceQuery()
            .setAccountId(myAccountId)
            .execute(client);

        if (accountBalance) {
            console.log("The new account balance is: " + accountBalance.hbars.toTinybars() + " tinybar.");
            console.log(`The account balance for account ${myAccountId} is ${accountBalance.hbars} HBar`);

            console.log("All account Info:")
            console.log(JSON.stringify(accountBalance));
        }
        return accountBalance;
    } catch (error) {
        console.log("Err: ", error)
    }
}

async function transferHbars(client, multiSigAccountID, accountId4, privateKey1, privateKey2) {

    const transaction = new TransferTransaction()
        .addHbarTransfer(multiSigAccountID, Hbar.fromString(`-10`))
        .addHbarTransfer(accountId4, Hbar.fromString('10'))
        .freezeWith(client);

    const signedTxn = await transaction.sign(privateKey1);

    // const txResponse1 = await signedTxn.execute(client);

    const multiSignedTxn = await signedTxn.sign(privateKey2);

    //Sign with the client operator key to pay for the transaction and submit to a Hedera network
    const txResponse = await multiSignedTxn.execute(client);

    //Get the receipt of the transaction
    const receipt = await txResponse.getReceipt(client);

    //Get the transaction status
    const transactionStatus = receipt.status;
    console.log('The transaction status is ' + transactionStatus.toString());
}

main()