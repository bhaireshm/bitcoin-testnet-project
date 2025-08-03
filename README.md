# Bitcoin Testnet Project

A Bitcoin testnet transaction creator built with Node.js and TypeScript.

## Prerequisites

- Node.js >= 18.0.0
- pnpm

## Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/your-username/bitcoin-testnet-project.git
   ```

2. Install dependencies:

   ```bash
   pnpm install
   ```

3. Create a `.env` file from the example:

   ```bash
   cp .env.example .env
   ```

4. Add your private key and other environment variables to the `.env` file.

## Usage

### Create a Wallet

To create a new Bitcoin testnet wallet, run the following command:

```bash
pnpm run create-wallet
```

This will generate a new wallet and save the details in the `wallets` directory.

### Send a Transaction

To send a transaction, run the following command:

```bash
pnpm run send
```

This will create and broadcast a new transaction using the details provided in the script.

## Scripts

- `pnpm run build`: Compiles the TypeScript code.
- `pnpm run start`: Runs the compiled JavaScript code.
- `pnpm run create-wallet`: Creates a new Bitcoin testnet wallet.
- `pnpm run send`: Creates and sends a new Bitcoin testnet transaction.
- `pnpm run clean`: Removes the `dist` directory.
