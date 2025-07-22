import * as bitcoin from 'bitcoinjs-lib';
import { ECPairFactory } from 'ecpair';
import * as ecc from 'tiny-secp256k1';
import axios from 'axios';
import { UTXO } from '../wallet/wallet';
import { TESTNET_CONFIG } from '../config/testnet';

const ECPair = ECPairFactory(ecc);

export interface TransactionParams {
    privateKey: string;
    utxos: UTXO[];
    recipientAddress: string;
    amount: number; // in BTC
    network: bitcoin.Network;
}

export interface TransactionResult {
    success: boolean;
    txId?: string;
    fee?: number;
    error?: string;
}

export async function createTransaction(params: TransactionParams): Promise<TransactionResult> {
    try {
        const { privateKey, utxos, recipientAddress, amount, network } = params;

        // Convert amount from BTC to satoshis
        const amountSats = Math.round(amount * 100000000);

        // Calculate fee (1 sat/byte estimate)
        const estimatedSize = 250; // Rough estimate for P2WPKH transaction
        const feeRate = 1; // 1 sat/byte for testnet
        const fee = estimatedSize * feeRate;

        // Select UTXOs with enough value
        let inputValue = 0;
        const selectedUtxos: UTXO[] = [];

        for (const utxo of utxos) {
            selectedUtxos.push(utxo);
            inputValue += utxo.value;

            if (inputValue >= amountSats + fee) {
                break;
            }
        }

        if (inputValue < amountSats + fee) {
            return {
                success: false,
                error: `Insufficient funds. Need ${amountSats + fee} sats, have ${inputValue} sats`
            };
        }

        // Create key pair from private key
        const keyPair = ECPair.fromPrivateKey(Buffer.from(privateKey, 'hex'), { network });

        // Create PSBT (Partially Signed Bitcoin Transaction)
        const psbt = new bitcoin.Psbt({ network });

        // Add inputs
        for (const utxo of selectedUtxos) {
            // Get previous transaction data
            const prevTxResponse = await axios.get(`${TESTNET_CONFIG.apiUrl}/tx/${utxo.txid}/hex`);
            const prevTxBuffer = Buffer.from(prevTxResponse.data, 'hex');

            psbt.addInput({
                hash: utxo.txid,
                index: utxo.vout,
                nonWitnessUtxo: prevTxBuffer
            });
        }

        // Add output for recipient
        psbt.addOutput({
            address: recipientAddress,
            value: amountSats
        });

        // Add change output if needed
        const change = inputValue - amountSats - fee;
        if (change > 546) { // Dust threshold
            // Generate change address (for simplicity, use the same key)
            const { address: changeAddress } = bitcoin.payments.p2wpkh({
                pubkey: keyPair.publicKey,
                network
            });

            if (changeAddress) {
                psbt.addOutput({
                    address: changeAddress,
                    value: change
                });
            }
        }

        // Sign all inputs
        for (let i = 0; i < selectedUtxos.length; i++) {
            psbt.signInput(i, keyPair);
        }

        // Finalize and extract transaction
        psbt.finalizeAllInputs();
        const tx = psbt.extractTransaction();
        const txHex = tx.toHex();
        const txId = tx.getId();

        console.log(`📦 Transaction size: ${tx.virtualSize()} bytes`);
        console.log(`💰 Fee: ${fee} satoshis (${fee / 100000000} BTC)`);

        // Broadcast transaction
        const broadcastResponse = await axios.post(`${TESTNET_CONFIG.apiUrl}/tx`, txHex, {
            headers: { 'Content-Type': 'text/plain' }
        });

        if (broadcastResponse.status === 200) {
            return {
                success: true,
                txId: txId,
                fee: fee
            };
        } else {
            return {
                success: false,
                error: 'Failed to broadcast transaction'
            };
        }

    } catch (error) {
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error'
        };
    }
}

export async function getTransactionStatus(txId: string): Promise<any> {
    try {
        const response = await axios.get(`${TESTNET_CONFIG.apiUrl}/tx/${txId}/status`);
        return response.data;
    } catch (error) {
        console.error('Error fetching transaction status:', error);
        return null;
    }
}
