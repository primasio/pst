'use strict';

const fs      = require('fs');
const Web3    = require('web3');


const utils  = require('./utils.js');
const assert = utils.assert;
const range  = utils.range;


const JSON_RPC_HOST   = 'http://127.0.0.1:8545';
const DEFAULT_ACCOUNT = '0x9a8088707e96c7c742b33888a2d879946bf7505f'; // '0x7e00554c5385b0d028783fa009066286c35fc2d8';
const ARTICLE_CONTRACT_ABI_ARRAY = JSON.parse(fs.readFileSync("./build/PrimasToken.abi", {"encoding": "utf8", "flag": "r"} ));
const ARTICLE_CONTRACT_BIN_CODE  = "0x" + fs.readFileSync("./build/PrimasToken.bin", {"encoding": "utf8", "flag": "r"} );


const web3 = new Web3(new Web3.providers.HttpProvider(JSON_RPC_HOST));


const contract = web3.eth.contract(ARTICLE_CONTRACT_ABI_ARRAY);
const gasEstimate = web3.eth.estimateGas({data: ARTICLE_CONTRACT_BIN_CODE}) * 2;

console.log("Gas: " + gasEstimate );

function deploy(account, cb){
    if ( !account ) account = DEFAULT_ACCOUNT;
    if ( !cb ) cb = function (){};
    
    let initializer = {
        from: account,
        data: ARTICLE_CONTRACT_BIN_CODE,
        gas : gasEstimate,
    };
    let callback = function (err, result){
        if(!err) {
            if(!result.address) {
                let msg = [ 
                    "[INFO] Contract transaction send: TransactionHash: ",
                    result.transactionHash.toString(),
                    " waiting to be mined..."
                ].join("");
                console.info(msg);
            } else {
                console.info("[INFO] Deploy Success (%s) ...".replace("%s", result.address));
                cb(undefined, result.address);
            }
        } else {
            console.error("JSON RPC Callback error.");
            console.error(err);
            cb(err, undefined);
        }
    };
    
    console.log('[INFO] Deploy contract (%s) ...'.replace("%s", JSON_RPC_HOST));
    contract.new(initializer, callback);
}

deploy();