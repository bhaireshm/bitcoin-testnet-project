export const TESTNET_CONFIG = {
    name: 'Bitcoin Testnet',
    apiUrl: 'https://blockstream.info/testnet/api',
    explorerUrl: 'https://blockstream.info/testnet',
    faucets: [
        'https://coinfaucet.eu/en/btc-testnet/',
        'https://bitcoinfaucet.uo1.net/',
        'https://testnet.coinfaucet.eu/',
        'https://testnet-faucet.mempool.co/'
    ],
    network: {
        messagePrefix: '\x18Bitcoin Signed Message:\n',
        bech32: 'tb',
        bip32: {
            public: 0x043587cf,
            private: 0x04358394,
        },
        pubKeyHash: 0x6f,
        scriptHash: 0xc4,
        wif: 0xef,
    }
};

export const MAINNET_CONFIG = {
    name: 'Bitcoin Mainnet',
    apiUrl: 'https://blockstream.info/api',
    explorerUrl: 'https://blockstream.info',
    network: {
        messagePrefix: '\x18Bitcoin Signed Message:\n',
        bech32: 'bc',
        bip32: {
            public: 0x0488b21e,
            private: 0x0488ade4,
        },
        pubKeyHash: 0x00,
        scriptHash: 0x05,
        wif: 0x80,
    }
};

// Safety check - prevent accidental mainnet usage
export function getNetworkConfig() {
    const isTestnet = process.env["NODE_ENV"] !== 'production';

    if (!isTestnet) {
        console.warn('WARNING: This application is designed for testnet only!');
        console.warn('Never use on mainnet without proper security review!');
    }

    return TESTNET_CONFIG;
}
