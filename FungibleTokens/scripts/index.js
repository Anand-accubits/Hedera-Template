const {
    PrivateKey
} = require("@hashgraph/sdk");
const { getClient, getWallet } = require("../../utils/common");
const { createToken, queryTokenFunction, tokenBalance, mintToken, updateSupplyKey, burnToken } = require("../../utils/token");
require('dotenv').config({ path: 'FungibleTokens/.env' })

const accountId1 = process.env.ACCOUNT_ID_1;
const privateKey1 = PrivateKey.fromString(process.env.PRIVATE_KEY_1);

if (accountId1 == null ||
    privateKey1 == null) {
    throw new Error("Environment variables accountId1 and privateKey1 must be present");
}

const accountId2 = process.env.ACCOUNT_ID_2;
const privateKey2 = PrivateKey.fromString(process.env.PRIVATE_KEY_2);

if (accountId2 == null ||
    privateKey2 == null) {
    throw new Error("Environment variables accountId2 and privateKey2 must be present");
}

const accountId3 = process.env.ACCOUNT_ID_3;
const privateKey3 = PrivateKey.fromString(process.env.PRIVATE_KEY_3);

if (accountId3 == null ||
    privateKey3 == null) {
    throw new Error("Environment variables accountId2 and privateKey2 must be present");
}

async function main() {
    // Connect Hedera Network
    const client = await getClient(accountId1, privateKey1)
    const adminUser = await getWallet(accountId1, privateKey1)
    const supplyUser = await getWallet(accountId2, privateKey2)

    const tokenName = 'Token'
    const tokenSymbol = 'TKN'

    // Create Token
    const tokenId = await createToken(client, adminUser, supplyUser, accountId1, privateKey1, tokenName, tokenSymbol)
    await getTokenInfo(client, tokenId)

    //Get Token Balance
    const balance = await tokenBalance(client, accountId1, tokenId);
    console.log("The balance of the user is: " + balance);

    // MINTING 1000 Token
    const client2 = await getClient(accountId2, privateKey2)
    await mintToken(client2, tokenId, privateKey2);
    await getTokenInfo(client2, tokenId)

    // Update Supply User as OtherAccount2
    const supplyUser2 = await getWallet(accountId3, privateKey3)
    await updateSupplyKey(client, supplyUser2, privateKey1, tokenId);

    // // Burn 500 Token
    const client3 = await getClient(accountId3, privateKey3)
    await burnToken(client3, privateKey3, tokenId, 500);
    await getTokenInfo(client3, tokenId)

    process.exit(tokenId);
}

async function getTokenInfo(client, tokenId) {
    const name = await queryTokenFunction("name", tokenId, client);
    const symbol = await queryTokenFunction("symbol", tokenId, client);
    const tokenSupply = await queryTokenFunction("totalSupply", tokenId, client);
    console.log('The total supply of the ' + name + ' token is ' + tokenSupply + ' of ' + symbol);
}



main();
