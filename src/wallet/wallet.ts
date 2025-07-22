import axios from 'axios';
import { BIP32Factory } from 'bip32';
import * as bip39 from 'bip39';
import * as bitcoin from 'bitcoinjs-lib';
import { ECPairFactory } from 'ecpair';
import * as ecc from 'tiny-secp256k1';
import { TESTNET_CONFIG } from '../config/testnet';

const ECPair = ECPairFactory(ecc);
const bip32 = BIP32Factory(ecc);

export interface WalletInfo {
  mnemonic: string;
  address: string;
  publicKey: string;
  privateKey: string;
}

export interface UTXO {
  txid: string;
  vout: number;
  value: number;
  confirmations: number;
}

export async function createWallet(): Promise<WalletInfo> {
  console.log('🔐 Generating new mnemonic phrase...');

  // Generate a new mnemonic phrase
  const mnemonic = bip39.generateMnemonic();
  console.log(`📝 Mnemonic: ${mnemonic}`);
  console.log('⚠️  IMPORTANT: Write down this mnemonic phrase and store it securely!\n');

  // Convert mnemonic to seed
  const seed = bip39.mnemonicToSeedSync(mnemonic);

  // Create HD wallet root
  const root = bip32.fromSeed(seed, bitcoin.networks.testnet);

  // Derive key using BIP44 path for Bitcoin testnet: m/44'/1'/0'/0/0
  const path = "m/44'/1'/0'/0/0";
  const child = root.derivePath(path);

  if (!child.privateKey) {
    throw new Error('Failed to derive private key');
  }

  // Create key pair
  const keyPair = ECPair.fromPrivateKey(child.privateKey, { network: bitcoin.networks.testnet });

  // Generate P2WPKH (native segwit) address
  const { address } = bitcoin.payments.p2wpkh({
    pubkey: keyPair.publicKey,
    network: bitcoin.networks.testnet
  });

  if (!address) {
    throw new Error('Failed to generate address');
  }

  console.log('✅ New wallet created successfully!\n');

  return {
    mnemonic,
    address,
    publicKey: keyPair.publicKey.toString('hex'),
    privateKey: keyPair.privateKey?.toString('hex') || ''
  };
}

export async function getWalletBalance(address: string): Promise<number> {
  try {
    const response = await axios.get(`${TESTNET_CONFIG.apiUrl}/address/${address}`);
    const balanceSats = response.data.chain_stats.funded_txo_sum - response.data.chain_stats.spent_txo_sum;
    return balanceSats / 100000000; // Convert satoshis to BTC
  } catch (error) {
    console.error('Error fetching balance:', error);
    return 0;
  }
}

export async function getUTXOs(address: string): Promise<UTXO[]> {
  try {
    const response = await axios.get(`${TESTNET_CONFIG.apiUrl}/address/${address}/utxo`);
    return response.data.map((utxo: any) => ({
      txid: utxo.txid,
      vout: utxo.vout,
      value: utxo.value,
      confirmations: utxo.status.confirmed ? utxo.status.block_height : 0
    }));
  } catch (error) {
    console.error('Error fetching UTXOs:', error);
    return [];
  }
}

export function restoreWalletFromMnemonic(mnemonic: string): WalletInfo {
  if (!bip39.validateMnemonic(mnemonic)) {
    throw new Error('Invalid mnemonic phrase');
  }

  const seed = bip39.mnemonicToSeedSync(mnemonic);
  const root = bip32.fromSeed(seed, bitcoin.networks.testnet);
  const path = "m/44'/1'/0'/0/0";
  const child = root.derivePath(path);

  if (!child.privateKey) {
    throw new Error('Failed to derive private key');
  }

  const keyPair = ECPair.fromPrivateKey(child.privateKey, { network: bitcoin.networks.testnet });
  const { address } = bitcoin.payments.p2wpkh({
    pubkey: keyPair.publicKey,
    network: bitcoin.networks.testnet
  });

  if (!address) {
    throw new Error('Failed to generate address');
  }

  return {
    mnemonic,
    address,
    publicKey: keyPair.publicKey.toString('hex'),
    privateKey: keyPair.privateKey?.toString('hex') || ''
  };
}
