const {
    TokenCreateTransaction,
    TokenType,
    TokenSupplyType,
    TokenMintTransaction,
    TokenNftInfoQuery,
    NftId,
    TokenId,
    AccountId,
    CustomRoyaltyFee,
    CustomFixedFee,
    Hbar,
    TokenInfoQuery } = require("@hashgraph/sdk");

exports.createNftFcn = async (tName, tSymbol, iSupply, maxSupply, id, pvKey, client) => {

    // // DEFINE CUSTOM FEE SCHEDULE (10% royalty fee)  
    let nftCustomFee = new CustomRoyaltyFee()
        .setNumerator(10)
        .setDenominator(100)
        .setFeeCollectorAccountId(id)
        //the fallback fee is set to 1000 hbar.
        .setFallbackFee(new CustomFixedFee().setHbarAmount(new Hbar(1000)));

    const nftCreate = new TokenCreateTransaction()
        .setTokenName(tName)
        .setTokenSymbol(tSymbol)
        .setTokenType(TokenType.NonFungibleUnique)
        .setSupplyType(TokenSupplyType.Finite)
        .setDecimals(0)
        .setInitialSupply(iSupply)
        .setTreasuryAccountId(id)
        .setSupplyKey(pvKey.publicKey)
        .setMaxSupply(maxSupply)
        .setCustomFees([nftCustomFee])
        // .setAdminKey(adminKey)
        // .setPauseKey(pauseKey)
        // .setFreezeKey(freezeKey)
        // .setWipeKey(wipeKey)
        .freezeWith(client);

    const nftCreateTxSign = await nftCreate.sign(pvKey);
    const nftCreateSubmit = await nftCreateTxSign.execute(client);
    const nftCreateRx = await nftCreateSubmit.getReceipt(client);
    const tokenId = nftCreateRx.tokenId;

    //Log the token ID
    console.log(`NFT is Created with TokenId: ${tokenId} \n`);

    return tokenId;
}
exports.batchMint = async (client, tokenId, pvKey) => {
    // MINT NEW BATCH OF NFTs
    const CID = [
        Buffer.from("ipfs://QmNPCiNA3Dsu3K5FxDPMG5Q3fZRwVTg14EXA92uqEeSRXn"),
        Buffer.from("ipfs://QmZ4dgAgt8owvnULxnKxNe8YqpavtVCXmc1Lt2XajFpJs9"),
        Buffer.from("ipfs://QmPzY5GxevjyfMUF5vEAjtyRoigzWp47MiKAtLBduLMC1T"),
        Buffer.from("ipfs://Qmd3kGgSrAwwSrhesYcY7K54f3qD7MDo38r7Po2dChtQx5"),
        Buffer.from("ipfs://QmWgkKz3ozgqtnvbCLeh7EaR1H8u5Sshx3ZJzxkcrT3jbw"),
    ];
    const mintTx = new TokenMintTransaction()
        .setTokenId(tokenId)
        .setMetadata(CID) //Batch minting - UP TO 10 NFTs in single tx
        .freezeWith(client);
    const mintTxSign = await mintTx.sign(pvKey);
    const mintTxSubmit = await mintTxSign.execute(client);
    const mintRx = await mintTxSubmit.getReceipt(client);
    const tokenInfo = await queries.tokenQueryFcn(tokenId, client);

    return [tokenId, tokenInfo];
}

exports.mintNft = async (client, tokenId, privateKey, metadata) => {
    // Mint new NFT
    let mintTx = await new TokenMintTransaction()
        .setTokenId(tokenId)
        .setMetadata([Buffer.from(metadata)])
        .freezeWith(client);

    //Sign the transaction with the supply key
    let mintTxSign = await mintTx.sign(privateKey);

    //Submit the transaction to a Hedera network
    let mintTxSubmit = await mintTxSign.execute(client);

    //Get the transaction receipt
    let mintRx = await mintTxSubmit.getReceipt(client);

    //Log the serial number
    console.log(`- Created NFT ${tokenId} with serial: ${mintRx.serials[0].low} \n`);

    return mintRx.serials[0].low.toString()
}

exports.associateToken = async (client, wallet, privateKey, tokenId) => {
    //  Before an account that is not the treasury for a token can receive or send this specific token ID, the account
    //  must become “associated” with the token.
    let associateBuyerTx = await new TokenAssociateTransaction()
        .setAccountId(wallet.accountId)
        .setTokenIds([tokenId])
        .freezeWith(client)
        .sign(privateKey)

    //SUBMIT THE TRANSACTION
    let associateBuyerTxSubmit = await associateBuyerTx.execute(client);

    //GET THE RECEIPT OF THE TRANSACTION
    let associateBuyerRx = await associateBuyerTxSubmit.getReceipt(client);

    //LOG THE TRANSACTION STATUS
    console.log(`- Token association with the users account: ${associateBuyerRx.status} \n`);

}

exports.getNFTInfo = async (client, tokenId, NFTTokenIndex) => {
    console.log(`Searching for NFT ID ${NFTTokenIndex} on token ${tokenId}`);
    //Returns the info for the specified NFT ID
    const nftInfos = await new TokenNftInfoQuery()
        .setNftId(new NftId(TokenId.fromString(tokenId), NFTTokenIndex))
        .execute(client);

    console.log("The ID of the token is: " + nftInfos[0].nftId.tokenId.toString());
    console.log("The serial of the token is: " + nftInfos[0].nftId.serial.toString());
    console.log("The metadata of the token is: " + nftInfos[0].metadata.toString());
    console.log("Current owner: " + new AccountId(nftInfos[0].accountId).toString());
}