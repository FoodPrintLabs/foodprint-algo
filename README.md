# foodprint-algo

FoodPrint is a digital, blockchain-enabled, farm-to-fork (fresh produce) supply chain platform for smallholder farmers. 
This is a repo for the FoodPrint Stateful Algorand Smart Contract created in Python using PyTeal.


## Overview
TODO

## Documentation
TODO

## Installation (Development Environment - Python)

1. Install `PyTeal` and other `Python` dependencies. 
```
$pip install -r requirements.txt
```

## Installation (Development Environment - Node.js)

1. Install `Node.js` dependencies. 
```
$npm install
```

2. Install dotenv node package. Dotenv is a zero-dependency module that loads environment variables from a .env file into process.env 
```
$npm install dotenv
```

3. Create a `.env` file in the root of the project. This should be .gitignored
```
$touch .env
```

4. Add environment variables to `.env`. 
```
ENV=TESTNET
DEV_ALGOD_API_KEY=aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa
DEV_ALGOD_SERVER=http://localhost
DEV_ALGOD_PORT=4001
TESTNET_ALGOD_API_KEY=REPLACEME_WITH_PURESTAKE_KEY
TESTNET_ALGOD_SERVER=https://testnet-algorand.api.purestake.io/ps2
TESTNET_ALGOD_PORT=
MAINNET_ALGOD_API_KEY=REPLACEME_WITH_PURESTAKE_KEY
MAINNET_ALGOD_SERVER=https:https://mainnet-algorand.api.purestake.io/ps2
MAINNET_ALGOD_PORT=
ACCOUNT1_MNEMONIC=REPLACEME_WITH_ACCOUNT1_MNEMONIC
ACCOUNT2_MNEMONIC==REPLACEME_WITH_ACCOUNT2_MNEMONIC
```

5. Test import of .env variables using `tests/test_env.js` from project root
```
node  -r dotenv/config tests/test_env.js
```

6. Run script to setup Algorand accounts
```
$node -r dotenv/config 1_algo_account_create.js  
```

7. Update mnemonic env variables with account 1 and account 2 mnemonics
```
ACCOUNT1_MNEMONIC=REPLACEME_WITH_ACCOUNT1_MNEMONIC
ACCOUNT2_MNEMONIC==REPLACEME_WITH_ACCOUNT2_MNEMONIC 
```

8. Run scripts to import mnemonics, check balances and send transactions
``` 
$node -r dotenv/config 2_algo_account_balance.js  
$node -r dotenv/config 3_algo_account_send.js  
```

9. Run tests to capture supply chain data via an Algorand zero value transaction and note field
``` 
node  -r dotenv/config tests/test_algo_supply_chain.js
```

## References
- https://developer.algorand.org/articles/creating-stateful-algorand-smart-contracts-python-pyteal/
- https://pyteal.readthedocs.io/en/v0.6.0/examples.html
- https://pyteal.readthedocs.io/en/v0.6.0/state.html