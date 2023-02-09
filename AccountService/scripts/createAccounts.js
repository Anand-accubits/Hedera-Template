const { PrivateKey, AccountCreateTransaction, Hbar, Client, AccountBalanceQuery } = require('@hashgraph/sdk');
const { createAccountKeys, createAccounts } = require('../helpers')
require('dotenv').config()

// Grab account id and private key from ENV
const myAccountId = process.env.MY_ACCOUNT_ID
const myPrivateKey = process.env.MY_PRIVATE_KEY

// If weren't able to grab it, should throw a new error
if (myAccountId == null ||
    myPrivateKey == null) {
    throw new Error("Environment variables myAccountId and myPrivateKey must be present");
}

// Connect with Hedera
const client = Client.forTestnet();
client.setOperator(myAccountId, myPrivateKey)

/**
 * Function to create 5 accounts and transfer 
 */
async function main() {

    // Call createAccountKeys() to generate 5 account keys
    const accountKeys = await createAccountKeys(client, 5);

    // Call createAccounts() to create account with a balance of 100 Hbar's
    console.log(`Newly Created Accounts are\n`)
    const accounts = await createAccounts(client, accountKeys, 100);
    process.exit();
}

main();