// Script 1 - create algorand accounts using the algosdk
// Make sure you have updated env variables before running. See readme
// Usage from project root - $node -r dotenv/config scripts/1_algo_account_create.js

const algosdk = require('algosdk');
// Generate 2 accounts
// once created successfully, you will need to add funds via goal (DEV i.e. local sandbox), testnet dispenser (TESTNET) or Algorand Wallet (MAINNET)
// The Algorand TestNet Dispenser is located here: https://bank.testnet.algorand.network/
// TestNet node 3rd party service use PureStake "https://testnet-algorand.api.purestake.io/ps2" or AlgoExplorer "https://api.testnet.algoexplorer.io"

//------Setup algorand accounts------\\

console.log("Now creating accounts...");

var acct = null;

acct = algosdk.generateAccount();
var account1 = acct.addr;
console.log("Account 1 = " + account1);

// convert the Account 1 secret key to a 25-word mnemonic i.e. human-readable secret phrase
var account1_mnemonic = algosdk.secretKeyToMnemonic(acct.sk);
console.log("Account Mnemonic 1 = " + account1_mnemonic);
console.log("Account created. Note the address and mnemonic (store mnemonic somewhere safe!)");

acct = algosdk.generateAccount();
var account2 = acct.addr;
console.log("Account 2 = " + account2);
var account2_mnemonic = algosdk.secretKeyToMnemonic(acct.sk);
console.log("Account Mnemonic 2 = " + account2_mnemonic);
console.log("Account created. Note the address and mnemonic (store mnemonic somewhere safe!)");

console.log("\nAdd funds to DEV account using goal (i.e. ./sandbox goal clerk send -a 12345678)  using one of the default accounts created from the unencrypted wallet");
console.log("Add funds to TESTNET account using the TestNet Dispenser at https://bank.testnet.algorand.network/");
console.log("Add funds to MAINNET account using the Algorand Wallet");

console.log("\nCopy these 3 lines of code. They will be used in helper and integration scripts etc " +
    "(e.g. algo_account_balance.js and algo_account_send.js). Make sure to safely store these mnemonics offline or a scure keystore");

console.log("\nAccount1 mnemonic = \"" + account1_mnemonic + "\"");
console.log("Account2 mnemonic = \"" + account2_mnemonic + "\"");

//------/Setup algorand accounts------\\

//------Setup algod connection------\\

console.log("Now setting up algod connection...");

// configure  algod client connection parameters i.e. connection to algo network (this can either be to sandbox or via a 3rd party service)

// this token is not the same as a digital asset, rather it is API Key (token): which is defined as an object. The token is used to
// identify the source of a connection / give you permission to access an algorand node. In the sandbox, the default token is aaa...
// Example use of token is when querying KMD for list of wallets, the first will work but the second has invalid key and fails
// $curl localhost:4002/v1/wallets -H "X-KMD-API-Token: aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa"
// $curl localhost:4002/v1/wallets -H "X-KMD-API-Token: aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaB"

// This is especially useful if you are connecting to the Algorand TestNet/BetaNet/MainNet via a 3rd party service i.e. a 3rd party node
// e.g. https://developer.purestake.io/ (in the Ethereum space, this would be infura.io)
// $curl -X GET "https://testnet-algorand.api.purestake.io/ps2/v2/status" -H "x-api-key: REPLACE_WITH_PURESTAKE_KEY"

const environment = process.env.ENV; // DEV, TESTNET or MAINNET
console.log("ENV currently set to " + environment);

let token, server, port;

if (environment == 'TESTNET') {
    token = {
    'X-API-Key': process.env.TESTNET_ALGOD_API_KEY
};
    server = process.env.TESTNET_ALGOD_SERVER; // PureStake "https://testnet-algorand.api.purestake.io/ps2" or AlgoExplorer "https://api.testnet.algoexplorer.io",
    port = process.env.TESTNET_ALGOD_PORT;
} else if (environment == 'MAINNET') {
    //if MAINNET
    token = {
        'X-API-Key': process.env.MAINNET_ALGOD_API_KEY
    }
    server = process.env.MAINNET_ALGOD_SERVER; // PureStake "https://testnet-algorand.api.purestake.io/ps2" or AlgoExplorer "https://api.testnet.algoexplorer.io",
    port = process.env.MAINNET_ALGOD_PORT;
} else {
    //if DEV
    token = process.env.DEV_ALGOD_API_KEY; // "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa";
    server = process.env.DEV_ALGOD_SERVER; // "http://localhost";
    port = process.env.DEV_ALGOD_PORT;
}

// Instantiate the algod wrapper
let algodclient = new algosdk.Algodv2(token, server, port);

//------/Setup algod connection------\\

//------Check algod status------\\

console.log("Now checking algod status...");

(async () => {
    // call the status method from the algod client to check the details of your connection.
    let status = (await algodclient.status().do());
    console.log("Algorand network status: %o", status);
})().catch(e => {
    console.log(e);
});

//------/Check algod status------\\

//------Query account objects on the network------\\

console.log("Now checking balances...");

// get information on accounts e.g. balances
(async () => {
    let account_info = (await algodclient.accountInformation(account1).do());
    let acct_string = JSON.stringify(account_info);
    console.log("Account 1 Info: " + acct_string);
    console.log("Balance of account 1: " + JSON.stringify(account_info.amount));

    account_info = (await algodclient.accountInformation(account2).do());
    acct_string = JSON.stringify(account_info);
    console.log("Account 2 Info: " + acct_string);
    console.log("Balance of account 2: " + JSON.stringify(account_info.amount));

})().catch(e => {
    console.log(e);
});

//------/Query account objects on the network------\\