// Script 4 - Search notes fields in confirmed transactions
// Usage - $node -r dotenv/config scripts/4_algo_search_transactions_note.js

const algosdk = require('algosdk');

//------Import account mnemonics------\\
var account1_mnemonic = process.env.ACCOUNT1_MNEMONIC;
var account2_mnemonic = process.env.ACCOUNT2_MNEMONIC;

console.log("Account Mnemonic 1 from user = " + account1_mnemonic);
console.log("Account Mnemonic 2 from user = " + account2_mnemonic);

//------/Import account mnemonics------\\

//------Recover algorand accounts from mnemonic/secret phrase------\\

console.log("Now attempting to recover accounts using user supplied secret phrases...");

var recoveredAccount1 = algosdk.mnemonicToSecretKey(account1_mnemonic);
var isValid = algosdk.isValidAddress(recoveredAccount1.addr);
console.log("Account recovered: " + isValid);
var account1 = recoveredAccount1.addr;
console.log("Account 1 = " + account1);

var recoveredAccount2 = algosdk.mnemonicToSecretKey(account2_mnemonic);
var isValid = algosdk.isValidAddress(recoveredAccount2.addr);
console.log("Account recovered: " + isValid);
var account2 = recoveredAccount2.addr;
console.log("Account 2 = " + account2);

console.log("");

//------/Recover algorand accounts from mnemonic/secret phrase------\\

//------Setup indexer connection------\\

console.log("Now setting up indexer connection...");

// configure  indexer client connection parameters i.e. connection to algo network (this can either be to sandbox or via a 3rd party service)

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
}
    server = process.env.TESTNET_ALGOINDEXER_SERVER; // PureStake https://testnet-algorand.api.purestake.io/idx2
    port = process.env.TESTNET_ALGOD_PORT;
} else if (environment == 'MAINNET') {
    //if MAINNET
    token = {
        'X-API-Key': process.env.MAINNET_ALGOD_API_KEY
    }
    server = process.env.MAINNET_ALGOINDEXER_SERVER;
    port = process.env.MAINNET_ALGOD_PORT;
} else {
    //if DEV
    token = process.env.DEV_ALGOD_API_KEY; // "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa";
    server = process.env.DEV_ALGOD_SERVER; // "http://localhost";
    port = process.env.DEV_ALGOINDEXER_PORT; //8980
}

// Instantiate the indexer client wrapper
let indexerClient = new algosdk.Indexer(token, server, port);

//------/Setup indexer connection------\\

//------Indexer get block (i.e. check status)------\\

console.log("Now checking if indexer is available and looking up block 5...");
(async () => {
    let blockInfo = await indexerClient.lookupBlock(5).do()
    console.log(blockInfo)
})().catch(e => {
    console.log(e);
});

//------/Indexer get block (i.e. check status)------\\

//------Search transaction notes------\\

(async () => {
    //let search_term = '{"firstName":"John"';
    let search_term = 'Hello World';
    const enc = new TextEncoder();
    const note = enc.encode(search_term);
    const s = Buffer.from(note).toString("base64");
    let transactionInfo = await indexerClient.searchForTransactions()
        .minRound(10894697)
        .notePrefix(s).do();
    console.log("Information for Transaction search: " + JSON.stringify(transactionInfo, undefined, 2));
    // create a buffer
    if (transactionInfo.transactions.length > 0)
    {
        console.log("First Match:");
        const buff = Buffer.from(transactionInfo.transactions[0].note, 'base64');
        // decode buffer as UTF-8
        const str = buff.toString('utf-8');
        // print normal string
        console.log(str);
    }

})().catch(e => {
    console.log(e);
    console.trace();
});
//------/Search transaction notes------\\
