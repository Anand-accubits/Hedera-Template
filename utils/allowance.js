const {
    AccountAllowanceApproveTransaction,
    AccountAllowanceDeleteTransaction,
    NftId,
    TransferTransaction,
    TransactionId
} = require("@hashgraph/sdk");

// Allowance approval Functions
exports.hbarAllowanceFcn = async (owner, spender, allowBal, pvKey, client) => {
    const allowanceTx = new AccountAllowanceApproveTransaction().approveHbarAllowance(owner, spender, allowBal).freezeWith(client);
    const allowanceSign = await allowanceTx.sign(pvKey);
    const allowanceSubmit = await allowanceSign.execute(client);
    const allowanceRx = await allowanceSubmit.getReceipt(client);

    return allowanceRx;
}

exports.ftAllowanceFcn = async (tId, owner, spender, allowBal, pvKey, client) => {
    const allowanceTx = new AccountAllowanceApproveTransaction().approveTokenAllowance(tId, owner, spender, allowBal).freezeWith(client);
    const allowanceSign = await allowanceTx.sign(pvKey);
    const allowanceSubmit = await allowanceSign.execute(client);
    const allowanceRx = await allowanceSubmit.getReceipt(client);

    return allowanceRx;
}

exports.nftAllowanceFcn = async (tId, owner, spender, nft2Approve, pvKey, client) => {
    const allowanceTx = new AccountAllowanceApproveTransaction()
        // .approveTokenNftAllowanceAllSerials(tId, owner, spender) // Can approve all serials under a NFT collection
        .approveTokenNftAllowance(nft2Approve[0], owner, spender) // Or can approve individual serials under a NFT collection
        .approveTokenNftAllowance(nft2Approve[1], owner, spender)
        .approveTokenNftAllowance(nft2Approve[2], owner, spender)
        .freezeWith(client);
    const allowanceSign = await allowanceTx.sign(pvKey);
    const allowanceSubmit = await allowanceSign.execute(client);
    const allowanceRx = await allowanceSubmit.getReceipt(client);

    return allowanceRx;
}

exports.nftAllowanceDeleteFcn = async (owner, nft2disallow, pvKey, client) => {
    const allowanceTx = new AccountAllowanceDeleteTransaction()
        .deleteAllTokenNftAllowances(nft2disallow[0], owner)
        .deleteAllTokenNftAllowances(nft2disallow[1], owner)
        .freezeWith(client);
    const allowanceSign = await allowanceTx.sign(pvKey);
    const allowanceSubmit = await allowanceSign.execute(client);
    const allowanceRx = await allowanceSubmit.getReceipt(client);

    return allowanceRx;
}

// Allowance Transfer Functions

exports.hbarAllowanceTransferFcn = async (owner, receiver, sendBal, spender, spenderPvKey, client) => {
    const approvedSendTx = new TransferTransaction()
        .addApprovedHbarTransfer(owner, sendBal.negated())
        .addHbarTransfer(receiver, sendBal)
        .setTransactionId(TransactionId.generate(spender)) // Spender must generate the TX ID or be the client
        .freezeWith(client);
    const approvedSendSign = await approvedSendTx.sign(spenderPvKey);
    const approvedSendSubmit = await approvedSendSign.execute(client);
    const approvedSendRx = await approvedSendSubmit.getReceipt(client);
    return approvedSendRx;
}

exports.ftAllowanceTransferFcn = async (tId, owner, receiver, sendBal, spender, spenderPvKey, client) => {
    const approvedSendTx = new TransferTransaction()
        .addApprovedTokenTransfer(tId, owner, -sendBal)
        .addTokenTransfer(tId, receiver, sendBal)
        .setTransactionId(TransactionId.generate(spender)) // Spender must generate the TX ID or be the client
        .freezeWith(client);
    const approvedSendSign = await approvedSendTx.sign(spenderPvKey);
    const approvedSendSubmit = await approvedSendSign.execute(client);
    const approvedSendRx = await approvedSendSubmit.getReceipt(client);
    return approvedSendRx;
}

exports.nftAllowanceTransferFcn = async (owner, receiver, nft2Send, spender, spenderPvKey, client) => {
    const approvedSendTx = new TransferTransaction()
        .addApprovedNftTransfer(nft2Send, owner, receiver)
        .setTransactionId(TransactionId.generate(spender)) // Spender must generate the TX ID or be the client
        .freezeWith(client);
    const approvedSendSign = await approvedSendTx.sign(spenderPvKey);
    const approvedSendSubmit = await approvedSendSign.execute(client);
    const approvedSendRx = await approvedSendSubmit.getReceipt(client);
    return approvedSendRx;
}