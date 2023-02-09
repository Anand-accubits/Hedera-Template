const {
    Wallet,
    LocalProvider,
    Client
} = require('@hashgraph/sdk');

const getClient = async (accountId, privateKey) => {
    // Connect with Hedera
    const client = Client.forTestnet();
    client.setOperator(accountId, privateKey)
    return client;
}

const getWallet = async (accountId, privateKey) => {
    return new Wallet(
        accountId,
        privateKey,
        new LocalProvider()
    );
}

exports.getClient = (accountId, privateKey) => getClient(accountId, privateKey)
exports.getWallet = (accountId, privateKey) => getWallet(accountId, privateKey)