const {
    PrivateKey,
    ContractFunctionParameters
} = require("@hashgraph/sdk");
require('dotenv').config({ path: 'Smart-Contract-Service/.env' });

const { deploy, invoke, query } = require('../../utils/smartcontract')
const { getClient, generateRandom } = require("../../utils/common");
const contractCompiled = require("../artifacts/LookupContract.json");


//Grab your Hedera testnet account ID and private key from your .env file
if (process.env.ACCOUNT_ID_1 == null ||
    process.env.PRIVATE_KEY_1 == null) {
    throw new Error("Environment variables ACCOUNT_ID_1 and PRIVATE_KEY_1 must be present");
}

const accountId1 = process.env.ACCOUNT_ID_1;
const privateKey1 = PrivateKey.fromString(process.env.PRIVATE_KEY_1);

async function main() {
    const bytecode = contractCompiled.bytecode;
    const client = await getClient(accountId1, privateKey1)
    const contractId = await deploy(client, bytecode);
    const randomNumber = await generateRandom(client, 123456);
    await invoke(client, contractId, new ContractFunctionParameters().addString("Alice").addUint256(randomNumber));
    await query(client, contractId, new ContractFunctionParameters().addString("Alice"));
    process.exit();
}

main();