import * as fs from 'fs';
import * as path from 'path';
import * as bitcoin from 'bitcoinjs-lib';
import { getUTXOs, getWalletBalance } from '../wallet/wallet';
import { createTransaction } from '../transactions/create';
import { TESTNET_CONFIG } from '../config/testnet';

const CONFIG = {
  amountToSend: 0.0001,

  // Recipient address
  recipientAddress: 'tb1qqmp9euydw2d2pa42w368x64u58qdywlk9rdvld',

  // Wallet file path
  walletPath: path.join(__dirname, '../../wallets/wallet.json')
};

async function main() {
  try {
    // Check if wallet file exists
    if (!fs.existsSync(CONFIG.walletPath)) {
      throw new Error('Wallet file not found. Please run createWallet.ts first.');
    }

    // Load wallet data
    const walletData = JSON.parse(fs.readFileSync(CONFIG.walletPath, 'utf-8'));

    console.log('🚀 Starting Bitcoin Testnet Transaction');
    console.log('=====================================\n');

    // Check balance
    console.log('💰 Checking wallet balance...');
    const balance = await getWalletBalance(walletData.address);
    console.log(`Current balance: ${balance} BTC\n`);

    if (balance < CONFIG.amountToSend) {
      throw new Error(`Insufficient balance. Need ${CONFIG.amountToSend} BTC, have ${balance} BTC`);
    }

    // Get UTXOs(Unspent transaction output)
    const utxos = await getUTXOs(walletData.address);
    console.log(`📦 Found ${utxos.length} unspent outputs\n`);

    if (utxos.length === 0) {
      throw new Error('No UTXOs available for spending');
    }

    // Create transaction
    console.log('💸 Creating transaction...');
    console.log(`📤 Sending ${CONFIG.amountToSend} BTC to ${CONFIG.recipientAddress}`);

    const txResult = await createTransaction({
      privateKey: walletData.privateKey,
      utxos: utxos,
      recipientAddress: CONFIG.recipientAddress,
      amount: CONFIG.amountToSend,
      network: bitcoin.networks.testnet
    });

    if (txResult.success) {
      console.log('\n✅ Transaction created and broadcasted successfully!');
      console.log(`🔍 Transaction ID: ${txResult.txId}`);
      console.log(`🌐 View on explorer: ${TESTNET_CONFIG.explorerUrl}/tx/${txResult.txId}`);
      console.log(`💰 Fee paid: ${txResult.fee} satoshis`);
    } else {
      console.log('\n❌ Transaction failed:', txResult.error);
    }

  } catch (error) {
    console.error('❌ Error:', error instanceof Error ? error.message : error);
  }
}

// Run the script
main().catch(console.error);
