const sqlite3 = require('sqlite3').verbose();
const { Secp256k1HdWallet } = require("@cosmjs/amino");
const { SigningStargateClient, GasPrice } = require("@cosmjs/stargate");
const { stringToPath } = require("@cosmjs/crypto");
const constants = require("./config/constants");
const { MsgMultiSend } = require("cosmjs-types/cosmos/bank/v1beta1/tx");
const Long = require("long");

const db = new sqlite3.Database('./faucet.db');

// Initialize tables if they do not exist
db.serialize(() => {
    db.run("CREATE TABLE IF NOT EXISTS faucetQueue (address TEXT)");
    db.run("CREATE TABLE IF NOT EXISTS rateLimit (ip TEXT, count INTEGER, lastRequest INTEGER)");
});

// Read and write utility functions
function addToQueue(userAddress) {
    db.run("INSERT INTO faucetQueue(address) VALUES(?)", [userAddress], function(err) {
        if (err) {
            console.error(err.message);
        } else {
            console.log(userAddress, "ADDED TO LIST");
        }
    });
}

function getFaucetQueue() {
    return new Promise((resolve, reject) => {
        db.all("SELECT address FROM faucetQueue", [], (err, rows) => {
            if (err) {
                console.error(err.message);
                reject(err);
            } else {
                const queue = rows.map(row => row.address);
                console.log("Getting Faucet Queue");
                console.log(queue);
                resolve(queue);
            }
        });
    });
}

function removeFromQueue(address) {
    db.run("DELETE FROM faucetQueue WHERE address = ?", [address], function(err) {
        if (err) {
            console.error(err.message);
        } else {
            console.log("Removing address " + address);
        }
    });
}

function handleRateLimiting(ip) {
    return new Promise((resolve, reject) => {
        db.get("SELECT count, lastRequest FROM rateLimit WHERE ip = ?", [ip], (err, row) => {
            if (err) {
                console.error(err.message);
                reject(err);
            } else {
                let count = 1;
                let lastRequest = Date.now();

                if (row) {
                    count = row.count + 1;
                    const currentTime = Date.now();
                    if (currentTime - row.lastRequest > constants.TIME_LIMIT * 1000) {
                        count = 1;
                        lastRequest = currentTime;
                    }
                }

                db.run("REPLACE INTO rateLimit(ip, count, lastRequest) VALUES(?, ?, ?)", [ip, count, lastRequest], function(err) {
                    if (err) {
                        console.error(err.message);
                        reject(err);
                    } else {
                        resolve(count);
                    }
                });
            }
        });
    });
}

// Remove whitespaces from string
function trimWhiteSpaces(data) {
    return data.split(' ').join('');
}

// Compose message
function msg(inputs, outputs) {
    return {
        typeUrl: "/cosmos.bank.v1beta1.MsgMultiSend",
        value: MsgMultiSend.fromPartial({
            inputs: [{
                address: trimWhiteSpaces(inputs), // fromAddress
                coins: [{
                    denom: constants.DENOM,
                    amount: (outputs.length * parseInt(constants.AMOUNT)).toString(),
                }],
            }],
            outputs: outputs, // toAddress
        }),
    };
}

// Sign and broadcast message
async function signAndBroadcast(wallet, signerAddress, msgs, fee, memo = '') {
    const cosmJS = await SigningStargateClient.connectWithSigner(process.env.RPC, wallet);
    return await cosmJS.signAndBroadcast(signerAddress, msgs, fee, memo); // DeliverTxResponse, 0 if success
}

async function processTransaction(wallet, addr, msgs) {
    try {
        let faucetQueue = await getFaucetQueue();
        const response = await signAndBroadcast(
            wallet,
            addr,
            [msgs], {
                "amount": [{
                    amount: (parseInt(constants.gas) * GasPrice.fromString(constants.gas_price).amount).toString(),
                    denom: constants.DENOM
                }],
                "gas": constants.gas
            },
            "Thanks for using Empe Faucet"
        );
        console.log("Response:", response);
        faucetQueue.forEach(function(address) {
            removeFromQueue(address);
        });
    } catch (err) {
        console.error('Unable to process transaction');
        throw err;
    }
}

async function MnemonicWalletWithPassphrase(mnemonic) {
    const wallet = await Secp256k1HdWallet.fromMnemonic(mnemonic, {
        prefix: constants.prefix,
        bip39Password: '',
        hdPaths: [stringToPath(constants.HD_PATH)]
    });
    const [firstAccount] = await wallet.getAccounts();
    return [wallet, firstAccount.address];
}

// Faucet Request Handler
async function handleFaucetRequest(req) {
    let userAddress = req.body.address;
    const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress;

    try {
        if (!isValidAddressFormat(userAddress)) {
            return JSON.stringify({
                status: "error",
                message: "Invalid address format."
            });
        }

        const ipCount = await handleRateLimiting(ip);
        console.log(`${ip} has value: ${ipCount}`);

        if (ipCount > constants.MAX_PER_IP) {
            return JSON.stringify({
                status: "error",
                message: `You have requested ${ipCount} times. The limit is ${constants.MAX_PER_IP} per ${secondsToHms(constants.TIME_LIMIT)}.`
            });
        }

        let [wallet, addr] = await MnemonicWalletWithPassphrase(process.env.FAUCET_MNEMONIC);
        addToQueue(userAddress);
        return JSON.stringify({
            status: "success",
            message: `Success, your address ${userAddress} will receive funds shortly from ${addr}`
        });
    } catch (e) {
        console.error(e);
        return JSON.stringify({
            status: "error",
            message: e.toString()
        });
    }
}

// Runner Function
async function runner() {
    let [_, addr] = await MnemonicWalletWithPassphrase(process.env.FAUCET_MNEMONIC);
    console.log(`Faucet address: ${addr}`);

    setInterval(async function() {
        let queue = await getFaucetQueue();
        if (queue.length > 0) {
            try {
                let [wallet, addr] = await MnemonicWalletWithPassphrase(process.env.FAUCET_MNEMONIC);
                let outputs = [];
                queue.forEach(receiver => outputs.push({
                    address: trimWhiteSpaces(receiver),
                    coins: [{
                        denom: constants.DENOM,
                        amount: constants.AMOUNT,
                    }],
                }));
                const msgs = msg(addr, outputs);
                await processTransaction(wallet, addr, msgs);
                queue.forEach(removeFromQueue);
            } catch (e) {
                console.log("Transaction Failed: ", e);
            }
        } else {
            console.log("No Accounts to faucet");
        }
    }, 7000);
}

// Helper function to validate address format (example for Cosmos SDK address format)
function isValidAddressFormat(address) {
    // Basic check for length and prefix
    return address.startsWith('empe') && address.length === 43;
}

function secondsToHms(d) {
    d = Number(d);
    let h = Math.floor(d / 3600);
    let m = Math.floor(d % 3600 / 60);
    let s = Math.floor(d % 3600 % 60);

    let hDisplay = h > 0 ? h + (h == 1 ? " hour, " : " hours ") : "";
    let mDisplay = m > 0 ? m + (m == 1 ? " minute, " : " minutes ") : "";
    let sDisplay = s > 0 ? s + (s == 1 ? " second" : " seconds") : "";
    return hDisplay + mDisplay + sDisplay;
}

module.exports = { runner, handleFaucetRequest, MnemonicWalletWithPassphrase, processTransaction, getFaucetQueue };
