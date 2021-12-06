// SearchTransactionsNote.js
// requires algosdk@1.6.1 or higher
// verify installed version
// npm list algosdk
// Usage from project root - $node  -r dotenv/config tests/test_algo_search_notes_indexer.js

const algosdk = require('algosdk');
const indexer_token = "";
const indexer_server = "http://localhost";
const indexer_port = 8980;

// Instantiate the indexer client wrapper
let indexerClient = new algosdk.Indexer(indexer_token, indexer_server, indexer_port);

(async () => {
    let names = '{"firstName":"John"';
    const enc = new TextEncoder();
    const note = enc.encode(names);
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