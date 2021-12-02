// Test import of env variables
// Usage from project root - $node  -r dotenv/config tests/test_env.js

console.log("ENV = " + process.env.ENV)
console.log("DEV_ALGOD_API_KEY = " + process.env.DEV_ALGOD_API_KEY)
console.log("DEV_ALGOD_SERVER = " + process.env.DEV_ALGOD_SERVER)
console.log("DEV_ALGOD_PORT = " + process.env.DEV_ALGOD_PORT)
console.log("TESTNET_ALGOD_API_KEY = " + process.env.TESTNET_ALGOD_API_KEY)
console.log("TESTNET_ALGOD_SERVER = " + process.env.TESTNET_ALGOD_SERVER)
console.log("TESTNET_ALGOD_PORT = " + process.env.TESTNET_ALGOD_PORT)
console.log("MAINNET_ALGOD_API_KEY = " + process.env.MAINNET_ALGOD_API_KEY)
console.log("MAINNET_ALGOD_SERVER = " + process.env.MAINNET_ALGOD_SERVER)
console.log("MAINNET_ALGOD_PORT = " + process.env.MAINNET_ALGOD_PORT)
console.log("ACCOUNT1_ADDRESS = " + process.env.ACCOUNT1_ADDRESS)
console.log("ACCOUNT1_MNEMONIC = " + process.env.ACCOUNT1_MNEMONIC)
console.log("ACCOUNT2_ADDRESS = " + process.env.ACCOUNT2_ADDRESS)
console.log("ACCOUNT2_MNEMONIC = " + process.env.ACCOUNT2_MNEMONIC)