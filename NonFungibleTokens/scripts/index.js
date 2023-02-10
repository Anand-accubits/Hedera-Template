

const {
    Client, Wallet, LocalProvider, PrivateKey, CustomRoyaltyFee, AccountBalanceQuery, CustomFixedFee, Hbar, TokenAssociateTransaction, TokenCreateTransaction, TokenType, TokenSupplyType, TokenMintTransaction, TransferTransaction
} = require("@hashgraph/sdk");
const { getClient, getWallet } = require("../../utils/common");
const { associateToken, createNftFcn, mintNft, isTokenAssociated } = require("../../utils/nft");
require('dotenv').config({ path: 'NonFungibleTokens/.env' });

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

async function main() {
    // Connect with Hedera network
    const client = await getClient(accountId1, privateKey1);

    // CREATE NFT
    const tokenName = 'Sample Token'
    const tokenSymbol = "STN"
    const initialSupply = "0"
    const maxSupply = "100"

    const tokenId = await createNftFcn(tokenName, tokenSymbol, initialSupply, maxSupply, accountId1, privateKey1, client)
    console.log("TOKENID: ", tokenId.toString())

    // // MINT NFT
    //IPFS content identifiers for which we will create a NFT
    const metadata = "bafybeig5vygdwxnahwgp7vku6kyz4e3hdjsg4uikfz5sujbsummozw3wp4";
    await mintNft(client, tokenId, privateKey1, metadata);

    // // ASSOCIATE TOKEN
    // const wallet = await getWallet(accountId2, privateKey2)
    // await associateToken(client, wallet, privateKey2, tokenId)

    // // TRANSFER NFT
    // await transfer(tokenId);

    process.exit()
}

// async function mintNft(tokenId) {
//     //IPFS content identifiers for which we will create a NFT
//     CID = "bafybeig5vygdwxnahwgp7vku6kyz4e3hdjsg4uikfz5sujbsummozw3wp4";

//     // Mint new NFT
//     let mintTx = await new TokenMintTransaction()
//         .setTokenId(tokenId)
//         .setMetadata([Buffer.from(CID)])
//         .freezeWith(client);

//     //Sign the transaction with the supply key
//     let mintTxSign = await mintTx.sign(privateKey1);

//     //Submit the transaction to a Hedera network
//     let mintTxSubmit = await mintTxSign.execute(client);

//     //Get the transaction receipt
//     let mintRx = await mintTxSubmit.getReceipt(client);

//     //Log the serial number
//     console.log(`- Created NFT ${tokenId} with serial: ${mintRx.serials[0].low} \n`);

//     let balanceCheckTx = await new AccountBalanceQuery().setAccountId(accountId1).execute(client);

//     console.log(`- User balance: ${balanceCheckTx.tokens._map.get(tokenId.toString())} units of token ID ${tokenId}`);
// }



async function transfer(tokenId) {
    // const tokenId = '0.0.3419851'
    // Transfer the NFT from treasury to Alice
    // Sign with the treasury key to authorize the transfer
    let tokenTransferTx = await new TransferTransaction()
        .addNftTransfer(tokenId, 1, accountId1, accountId2)
        .freezeWith(client)
        .sign(privateKey1);

    let tokenTransferSubmit = await tokenTransferTx.execute(client);
    let tokenTransferRx = await tokenTransferSubmit.getReceipt(client);

    console.log(`\n- NFT transfer from Treasury to Buyer: ${tokenTransferRx.status} \n`);
}
main()