import * as bitcoin from 'bitcoinjs-lib';
import * as bip39 from 'bip39';

export function isValidBitcoinAddress(address: string, network: bitcoin.Network): boolean {
  try {
    bitcoin.address.toOutputScript(address, network);
    return true;
  } catch {
    return false;
  }
}

export function isValidMnemonic(mnemonic: string): boolean {
  return bip39.validateMnemonic(mnemonic);
}

export function isValidAmount(amount: number): boolean {
  return amount > 0 && amount <= 21000000 && Number.isFinite(amount);
}

export function satoshisToBTC(satoshis: number): number {
  return satoshis / 100000000;
}

export function btcToSatoshis(btc: number): number {
  return Math.round(btc * 100000000);
}

export function formatBTC(amount: number): string {
  return `${amount.toFixed(8)} BTC`;
}

export function formatSatoshis(satoshis: number): string {
  return `${satoshis.toLocaleString()} sats`;
}

export function validateTransactionParams(params: {
  recipientAddress: string;
  amount: number;
  network: bitcoin.Network;
}): { valid: boolean; error?: string } {
  if (!isValidBitcoinAddress(params.recipientAddress, params.network)) {
    return { valid: false, error: 'Invalid recipient address' };
  }

  if (!isValidAmount(params.amount)) {
    return { valid: false, error: 'Invalid amount' };
  }

  if (params.amount < 0.00000546) { // Below dust threshold
    return { valid: false, error: 'Amount below dust threshold' };
  }

  return { valid: true };
}
