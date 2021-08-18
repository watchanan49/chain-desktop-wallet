import { IEvmRpc } from "../interface/evm.rpcClient";
import Web3 from "web3";
import { HttpProvider } from "web3-core";
import { BlockTransactionObject, TransactionReceipt } from 'web3-eth';

class EVMClient implements IEvmRpc {

    private web3: Web3;

    constructor(web3Instance: Web3) {
        this.web3 = web3Instance;
    }

    public static create(web3HttpProviderUrl: string): EVMClient {
        if (!web3HttpProviderUrl.startsWith('https://') || !web3HttpProviderUrl.startsWith('http://')) {
            throw new Error("Please provide a valid HTTP Web3 Provider.");
        }
        const web3 = new Web3(new HttpProvider(web3HttpProviderUrl));
        return new EVMClient(web3);
    }


    // Node
    async isNodeSyncing(): Promise<boolean> {
        const isSyncing = await this.web3.eth.isSyncing();
        if (isSyncing instanceof Object) {
            return true;
        }
        return false;
    }

    public async getChainId(): Promise<number> {
        return await this.web3.eth.getChainId();
    }

    // Address
    async getNativeBalanceByAddress(address: string): Promise<string> {
        if (!this.web3.utils.isAddress(address)) {
            throw new Error("Please provide a valid EVM compatible address.");
        }

        const nativeBalance = await this.web3.eth.getBalance(address, "latest");
        return nativeBalance;
    }

    async getNextNonceByAddress(address: string): Promise<number> {
        if (!this.web3.utils.isAddress(address)) {
            throw new Error("Please provide a valid EVM compatible address.");
        }

        const pendingNonce = await this.web3.eth.getTransactionCount(address, "pending");
        return pendingNonce;
    }

    // Transaction
    async getTransactionReceiptByHash(txHash: string): Promise<TransactionReceipt | null> {
        const mayBeTxReceipt = await this.web3.eth.getTransactionReceipt(txHash);
        if (!mayBeTxReceipt) {
            return null;
        }
        return mayBeTxReceipt;
    }

    // Block
    async getLatestBlockHeight(): Promise<number> {
        const blockHeight = await this.web3.eth.getBlockNumber();
        return blockHeight;
    }

    async getBlock(blockHashOrBlockNumber: number | string): Promise<BlockTransactionObject> {
        const blockTransactions = await this.web3.eth.getBlock(blockHashOrBlockNumber, true);
        return blockTransactions
    }
    async getBlockByHeight(height: number): Promise<BlockTransactionObject> {
        return await this.getBlock(height);
    }

    async getBlockByHash(blockHash: string): Promise<BlockTransactionObject> {
        return await this.getBlock(blockHash);
    }

    // Broadcast
    async broadcastRawTransactionHex(signedTxHex: string): Promise<string> {

        if (!this.web3.utils.isHex(signedTxHex)) {
            throw new Error("Please provide a valid Hex string.");

        }
        if (!signedTxHex.startsWith('0x')) {
            signedTxHex = `0x${signedTxHex}`
        }

        const broadcastTx = await this.web3.eth.sendSignedTransaction(signedTxHex);

        if (broadcastTx.status) {
            return broadcastTx.transactionHash;
        }
    }
}

export { EVMClient };