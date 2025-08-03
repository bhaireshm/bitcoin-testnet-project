import * as bitcoin from 'bitcoinjs-lib';
import { TESTNET_CONFIG } from './config/testnet';
import { createTransaction } from './transactions/create';
import { createWallet, getUTXOs, getWalletBalance } from './wallet/wallet';

// tb1qqmp9euydw2d2pa42w368x64u58qdywlk9rdvld
// https://blockstream.info/testnet/address/tb1qqmp9euydw2d2pa42w368x64u58qdywlk9rdvld

async function main() {
  console.log('🚀 Starting Bitcoin Testnet Transaction Creator');
  console.log('===============================================\n');

  console.log(`📡 Network: ${TESTNET_CONFIG.name}`);
  console.log(`🔗 Using ${TESTNET_CONFIG.name}\n`);

  try {
    // Create or load wallet
    console.log('💼 Creating new wallet...');
    const wallet = await createWallet();

    console.log('📊 Wallet Information:');
    console.log('----------------------');
    console.log(`📍 Address: ${wallet.address}`);
    console.log(`🔑 Public Key: ${wallet.publicKey}`);
    console.log(`🌐 Network: ${TESTNET_CONFIG.name}\n`);

    // Check balance
    console.log('💰 Checking wallet balance...');
    const balance = await getWalletBalance(wallet.address);
    console.log(`💼 Balance: ${balance} BTC\n`);

    if (balance === 0) {
      console.log('ℹ️  No testnet coins found. Get free testnet bitcoins from:');
      console.log('🔗 https://coinfaucet.eu/en/btc-testnet/');
      console.log('🔗 https://bitcoinfaucet.uo1.net/');
      console.log('🔗 https://testnet.coinfaucet.eu/\n');
      console.log('💡 After receiving coins, run this program again to create transactions!');
      return;
    }

    // Get UTXOs
    const utxos = await getUTXOs(wallet.address);
    console.log(`📦 Found ${utxos.length} unspent outputs\n`);

    if (utxos.length === 0) {
      console.log('❌ No UTXOs available for spending');
      return;
    }

    // Create a test transaction (send small amount to same address for demonstration)
    const recipientAddress = wallet.address; // For demo purposes
    const amountToSend = 0.0001; // 0.0001 BTC

    console.log('💸 Creating test transaction...');
    console.log(`📤 Sending ${amountToSend} BTC to ${recipientAddress}`);

    const txResult = await createTransaction({
      privateKey: wallet.privateKey,
      utxos: utxos,
      recipientAddress: recipientAddress,
      amount: amountToSend,
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
    console.error('💥 Error:', error);
  }
}

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.log('\n👋 Shutting down Bitcoin Testnet Transaction Creator...');
  process.exit(0);
});

// Start the application
main().catch(console.error);
