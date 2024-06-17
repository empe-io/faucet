
const FAUCET_QUEUE_LIMIT = 15;
const AMOUNT = "10000000";
const DENOM = "uempe";
const CHAIN_ID = "empe-testnet-2";
let faucetQueue=[];
const prefix= "empe";
const gas_price = "0.0001uempe";
const gas = "20000000";
const TIME_LIMIT = 3600 * 2; // 3600 seconds x 2 = 2 hours
const MAX_PER_IP = 1;
const HD_PATH = "m/44'/118'/0'/0/0";
module.exports = {
    FAUCET_QUEUE_LIMIT,
    AMOUNT,
    DENOM,
    CHAIN_ID,
    faucetQueue,
    prefix,
    gas_price,
    gas,
    TIME_LIMIT,
    MAX_PER_IP,
    HD_PATH
}
