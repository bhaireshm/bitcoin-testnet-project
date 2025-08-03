import * as fs from 'fs';
import * as path from 'path';
import { createWallet } from '../wallet/wallet';

async function main() {
  try {
    console.log('🔨 Creating new wallet...');
    const wallet = await createWallet();

    // Prepare data to save
    const walletData = {
      createdAt: new Date().toISOString(),
      ...wallet
    };

    // Create wallets directory if it doesn't exist
    const walletsDir = path.join(__dirname, '../../wallets');
    if (!fs.existsSync(walletsDir)) {
      fs.mkdirSync(walletsDir, { recursive: true });
    }

    // Save wallet info to file
    const walletFile = path.join(walletsDir, 'wallet.json');
    fs.writeFileSync(walletFile, JSON.stringify(walletData, null, 2));

    console.log('\nWallet created successfully!');
    console.log('Wallet information saved to:', walletFile);
    console.log('\n Wallet Details:');
    console.log('----------------');
    console.log(` Address: ${wallet.address}`);
    console.log(`Public Key: ${wallet.publicKey}`);
    console.log('\n IMPORTANT: Keep your private key and mnemonic safe!');
    console.log('\n Next steps:');
    console.log('1. Get testnet coins from any of these faucets:');
    console.log('  - https://coinfaucet.eu/en/btc-testnet/');
    console.log('  - https://bitcoinfaucet.uo1.net/');
    console.log('  - https://testnet.coinfaucet.eu/');
    console.log('\n2. Once you have received testnet coins, you can use sendTransaction.ts to send them');
  } catch (error) {
    console.error('Error creating wallet:', error);
  }
}

// Run the script
main().catch(console.error);
