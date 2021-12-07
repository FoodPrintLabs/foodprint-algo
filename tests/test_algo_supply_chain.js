// Test adding supply chain operational data to Algorand blockchain
// Usage from project root - $node  -r dotenv/config tests/test_algo_supply_chain.js

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

//------Helper to Wait for Confirmation of transaction------\\

/**
 * Wait until the transaction is confirmed or rejected, or until 'timeout'
 * number of rounds have passed.
 * @param {algosdk.Algodv2} algodClient the Algod V2 client
 * @param {string} txId the transaction ID to wait for
 * @param {number} timeout maximum number of rounds to wait
 * @return {Promise<*>} pending transaction information
 * @throws Throws an error if the transaction is not confirmed or rejected in the next timeout rounds
 */
const waitForConfirmation = async function (algodClient, txId, timeout) {
    if (algodClient == null || txId == null || timeout < 0) {
        throw new Error("Bad arguments");
    }

    const status = (await algodClient.status().do());
    if (status === undefined) {
        throw new Error("Unable to get node status");
    }

    const startround = status["last-round"] + 1;
    let currentround = startround;

    while (currentround < (startround + timeout)) {
        const pendingInfo = await algodClient.pendingTransactionInformation(txId).do();
        if (pendingInfo !== undefined) {
            if (pendingInfo["confirmed-round"] !== null && pendingInfo["confirmed-round"] > 0) {
                //Got the completed Transaction
                return pendingInfo;
            } else {
                if (pendingInfo["pool-error"] != null && pendingInfo["pool-error"].length > 0) {
                    // If there was a pool error, then the transaction has been rejected!
                    throw new Error("Transaction " + txId + " rejected - pool error: " + pendingInfo["pool-error"]);
                }
            }
        }
        await algodClient.statusAfterBlock(currentround).do();
        currentround++;
    }

    throw new Error("Transaction " + txId + " not confirmed after " + timeout + " rounds!");
};

//------/Helper to Wait for Confirmation of transaction------\\

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

const environment = process.env.ENV // DEV, TESTNET or MAINNET
console.log("ENV currently set to " + environment);

let token, server, port;

if (environment == 'TESTNET') {
    token = {
    'X-API-Key': process.env.TESTNET_ALGOD_API_KEY
}
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

//------Log supply chain data (harvest) and check balance------\\

console.log("Now logging supply chain harvest data from %s to %s... Assumes source account has funds to pay fees", recoveredAccount1.addr, recoveredAccount2.addr);
//If you use the async keyword before a function definition, you can then use await within the function.
// When you await a promise, the function is paused in a non-blocking way until the promise settles.
(async() => {
    let params = await algodclient.getTransactionParams().do();
    // see https://mumbai.polygonscan.com/tx/0xffbd57ca02f12666561b7789a09e29868f564b4344b8b319e74e0181658af40e vs
    // https://testnet.algoexplorer.io/tx/X2V5FXDKXOEOSI3JD7XJVZFSETFMG5KPK3KANIXAFRQJ2D3QDCZA
    let supplyChainData = '{"logID":"9c6491af-74d8-43b1-acdd-83737cd6ec83", "logtype":"harvest", _supplierproduceID":"BGSM_Bergamot",' +
        '"_photoHash":"a066295322a9e6f2137d276b911d45362b206ce3749624908aaf06ede392d6e2",' +
        '"_geolocationFoodPrint":"Test", "actionTimeStamp":"Thu Nov 04 2021 13:54:00 GMT+0200 (South Africa Standard Time)",'+
        '"_growingCondtions":"Pesticide Free, Greenhouse Grown", "logDescription":"FoodPrint Test", logTableName":"foodprint_harvest", \n' +
        '        "logQuantity":"50(kilogram)", "logUser":"superuserjulz@example.com"}';

    const enc = new TextEncoder();
    const note = enc.encode(supplyChainData);
    let txn = {
        "from": recoveredAccount1.addr,
        "to": recoveredAccount2.addr,
        // comment out the next line to use suggested fee
        "fee": 1000, // transactions only cost 1/1000th of an Algo (0.001).
        "amount": 0, // 0 algos
        "firstRound": params.firstRound,
        "lastRound": params.lastRound,
        "genesisID": params.genesisID,
        "genesisHash": params.genesisHash,
        "note": note
    }

    // sign transaction using private key
    let signedTxn = algosdk.signTransaction(txn, recoveredAccount1.sk);

    // submit the signed transaction to the network
    let sendTx = await algodclient.sendRawTransaction(signedTxn.blob).do();

    console.log("Transaction: " + sendTx.txId);

    // Wait for confirmation
   let confirmedTxn = await waitForConfirmation(algodclient, sendTx.txId, 4);

   // get the completed transaction
   console.log("Transaction " + sendTx.txId + " confirmed in round " + confirmedTxn["confirmed-round"]);

   var txnNote = new TextDecoder().decode(confirmedTxn.txn.txn.note);
   console.log("Note field: ", txnNote);

   console.log("Transaction Amount: %d microAlgos", confirmedTxn.txn.txn.amt);
   console.log("Transaction Fee: %d microAlgos", confirmedTxn.txn.txn.fee);

   console.log("Now checking balances...");
   // get information on accounts e.g. balances
   let account_info = (await algodclient.accountInformation(recoveredAccount1.addr).do());
   let acct_string = JSON.stringify(account_info);
   console.log("Account 1 Info: " + acct_string);
   console.log("Balance of account 1 in microAlgos: " + JSON.stringify(account_info.amount));

   account_info = (await algodclient.accountInformation(recoveredAccount2.addr).do());
   acct_string = JSON.stringify(account_info);
   console.log("Account 2 Info: " + acct_string);
   console.log("Balance of account 2: " + JSON.stringify(account_info.amount));

})().catch( e => {
    console.log(e)
})
//------/Log supply chain data (harvest) and check balance------\\

//------Log supply chain data (handover/storage) and check balance------\\

console.log("Now logging supply chain handover data from %s to %s... Assumes source account has funds to pay fees!", recoveredAccount1.addr, recoveredAccount2.addr);
//If you use the async keyword before a function definition, you can then use await within the function.
// When you await a promise, the function is paused in a non-blocking way until the promise settles.
(async() => {
    let params = await algodclient.getTransactionParams().do();
    // see https://mumbai.polygonscan.com/tx/0x009c453c0fdb2509245377877c9adde687068effd9bf28859e000f87ac3b4751 vs
    // https://testnet.algoexplorer.io/tx/4ESVS3Z5CGCARFXB64CWZKBVWK3VBHNQNIMZLMC5VGT653MFS7JA
    let supplyChainData = '{"logID":"25ed364a-5a22-4796-9e42-c2496164e917", "previouslogID":"9c6491af-74d8-43b1-acdd-83737cd6ec83", ' +
        '"logtype":"storage", "_otherID":"{supplierproduceID:BGSM_Bergamot, marketID:OZCFM}"' +
        '"actionTimeStamp":"Thu Nov 04 2021 14:24:00 GMT+0200 (South Africa Standard Time)",'+
        '"logDetail": "{description:FoodPrint Test, logTableName:foodprint_storage, logUser:adminjack@example.com, logQuantity:34(bunch)}"' +
        '"logQuantity":"50(kilogram)", "logUser":"superuserjulz@example.com"}';

    const enc = new TextEncoder();
    const note = enc.encode(supplyChainData);
    let txn = {
        "from": recoveredAccount1.addr,
        "to": recoveredAccount2.addr,
        // comment out the next line to use suggested fee
        "fee": 1000, // transactions only cost 1/1000th of an Algo (0.001).
        "amount": 0, // 0 algos
        "firstRound": params.firstRound,
        "lastRound": params.lastRound,
        "genesisID": params.genesisID,
        "genesisHash": params.genesisHash,
        "note": note
    }

    // sign transaction using private key
    let signedTxn = algosdk.signTransaction(txn, recoveredAccount1.sk);

    // submit the signed transaction to the network
    let sendTx = await algodclient.sendRawTransaction(signedTxn.blob).do();

    console.log("Transaction: " + sendTx.txId);

    // Wait for confirmation
   let confirmedTxn = await waitForConfirmation(algodclient, sendTx.txId, 4);

   // get the completed transaction
   console.log("Transaction " + sendTx.txId + " confirmed in round " + confirmedTxn["confirmed-round"]);

   var txnNote = new TextDecoder().decode(confirmedTxn.txn.txn.note);
   console.log("Note field: ", txnNote);

   console.log("Transaction Amount: %d microAlgos", confirmedTxn.txn.txn.amt);
   console.log("Transaction Fee: %d microAlgos", confirmedTxn.txn.txn.fee);

   console.log("Now checking balances...");
   // get information on accounts e.g. balances
   let account_info = (await algodclient.accountInformation(recoveredAccount1.addr).do());
   let acct_string = JSON.stringify(account_info);
   console.log("Account 1 Info: " + acct_string);
   console.log("Balance of account 1 in microAlgos: " + JSON.stringify(account_info.amount));

   account_info = (await algodclient.accountInformation(recoveredAccount2.addr).do());
   acct_string = JSON.stringify(account_info);
   console.log("Account 2 Info: " + acct_string);
   console.log("Balance of account 2: " + JSON.stringify(account_info.amount));

})().catch( e => {
    console.log(e)
})
//------/Log supply chain data (handover/storage) and check balance------\\
