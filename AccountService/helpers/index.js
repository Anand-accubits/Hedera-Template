const { PrivateKey, AccountCreateTransaction, Hbar, Client, AccountBalanceQuery } = require('@hashgraph/sdk');
// require('dotenv').config()

// // Grab account id and private key from ENV
// const myAccountId = process.env.MY_ACCOUNT_ID
// const myPrivateKey = process.env.MY_PRIVATE_KEY

// // If weren't able to grab it, should throw a new error
// if (myAccountId == null ||
//     myPrivateKey == null) {
//     throw new Error("Environment variables myAccountId and myPrivateKey must be present");
// }

// // Connect with Hedera
// const client = Client.forTestnet();
// client.setOperator(myAccountId, myPrivateKey)

/**
 * 
 * Function Generate Account Keys
 */
/**
 * 
 * @param {Object} client 
 * @param {Number} counts 
 * @returns <Array>
 */
const createAccountKeys = async (client, counts) => {
    const accountKeys = []
    for (let i = 0; i < counts; i++) {
        const newPrivateKey = PrivateKey.generateED25519();
        const newPublicKey = newPrivateKey.publicKey;

        accountKeys.push({
            privateKey: newPrivateKey,
            publicKey: newPublicKey
        })
    }

    return accountKeys;
}

/**
 * Function to create 5 accounts and transfer 
 */
const createAccounts = async (client, accountKeys, amount) => {
    // const accountKeys = await createAccountKeys(5);
    const accounts = {}

    for (let index = 0; index < accountKeys.length; index++) {
        const account = accountKeys[index];
        const createAccountTx = await new AccountCreateTransaction()
            .setKey(account.publicKey)
            .setInitialBalance(new Hbar(amount))
            .execute(client);

        const receipt = await createAccountTx.getReceipt(client);

        accounts[`PrivateKey${index + 1}`] = account.privateKey.toString()
        accounts[`PublicKey${index + 1}`] = account.publicKey.toString()
        accounts[`AccountId${index + 1}`] = receipt.accountId.toString()

        console.log(`PrivateKey${index + 1} = ${account.privateKey.toString()}`)
        console.log(`PublicKey${index + 1} = ${account.publicKey.toString()}`)
        console.log(`AccountId${index + 1} = ${receipt.accountId.toString()}`)
        console.log('\n')
    }
    return accounts;
}

exports.createAccountKeys = (client, counts) => createAccountKeys(client, counts)
exports.createAccounts = (client, accountKeys, amount) => createAccounts(client, accountKeys, amount)