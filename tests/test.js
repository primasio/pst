
const fs      = require('fs');

const Web3    = require('web3');
const TestRPC = require("ethereumjs-testrpc");

const web3 = new Web3();
web3.setProvider(TestRPC.provider());

const CONTRACT_ABI_ARRAY = JSON.parse(fs.readFileSync("./build/PrimasToken.abi", {"encoding": "utf8", "flag": "r"} ));
const CONTRACT_BIN_CODE  = "0x" + fs.readFileSync("./build/PrimasToken.bin", {"encoding": "utf8", "flag": "r"} );


function assert(r){
    if ( !r ) {
        throw new Error('AssertError');
    } else {
        return true;
    }
}

// Just Like Python Range function.
function range (start, stop, step) {
    if (stop == null) {
      stop = start || 0;
      start = 0;
    }
    step = step || 1;
    var length = Math.max(Math.ceil((stop - start) / step), 0);
    var range = Array(length);
    for (var idx = 0; idx < length; idx++, start += step) {
      range[idx] = start;
    }
    return range;
}

function render_test_result(r){

}

function Test(contract, callback){
    web3.eth.getAccounts(function (e, accounts){
        if (e) return console.error(e);
        callback(contract, accounts);
    });
}

function test_init(contract, accounts, cb){
    contract.totalSupply(function (e, n){
        if (e) return cb("contract.totalSupply.call", null);
        if ( !n.eq(Web3.prototype.toBigNumber("100000000000000000000000000")) ) return cb("totalSupply != 100000000 * 10 ** 18", null);
        contract.decimals.call(function (e, n){
            if ( e ) return cb("contract.decimals.call", null);
            if ( n.toNumber() !== 18 ) return cb("decimals != 18", null);
            contract.balanceOf(accounts[0], function (e, r){
                if ( e ) return cb("contract.balanceOf.call", null);
                if ( !r.eq(Web3.prototype.toBigNumber("100000000000000000000000000")) ) return cb("contract.balanceOf.call(initialOwner) != 100000000 * 10 ** 18", null);
                return cb(undefined, null);
            });
        });
    })
}

function test_transfer(contract, accounts, cb){
    let options = { 'from': accounts[0] };
    web3.eth.defaultAccount = accounts[0];

    contract.transfer.call(accounts[1], 1000, options, function (e, r){
        if (e) return cb("contract.transfer.call", null);
        // 100000000000000000000000000
        if ( r != true ) return cb("transfer() != true", null);
        contract.balanceOf.call(accounts[0], function (e, r){
            if (e) return cb("contract.balanceOf.call", null);
            if ( !r.eq(Web3.prototype.toBigNumber("100000000000000000000000000").sub(1000)) ) return cb("balanceOf(\"%s\") != 100000000 * 10 ** 18 - 1000".replace("%s", accounts[0]), null);
            contract.balanceOf.call(accounts[0], function (e, r){
                console.log(r.toNumber(), 1000);
                if (e) return cb("contract.balanceOf.call", null);
                if ( !r.eq(Web3.prototype.toBigNumber("1000")) ) return cb("balanceOf(\"%s\") != 1000".replace("%s", accounts[1]), null);
                return cb(undefined, null);
            });
        });
    });
}

function test_transfer_from(contract, accounts, cb){
    cb("未实现", null);
}

function test_withdraw_workflow(contract, accounts, cb){
    contract.approve.call(accounts[1], 1000, {'from': accounts[0]}, function (e, r){
        if (e) return cb("contract.approve.call", null);
        if (r != true) return cb("approve() != true", null);
        contract.transferFrom.call(accounts[0], accounts[2], 1000, {'from': accounts[1]}, function (e, r){
            if (e) return cb("contract.transferFrom.call", null);
            if (r!=true) return cb("transferFrom() != true", null);
            cb(undefined, null);
        });
    });
}

function render_fn_name (name, max_len){
    return name + range(max_len - name.length).map(function (){return " "}).join("");
}


function toBigNumber(n){
    return Web3.prototype.toBigNumber(n);
}

Test(web3.eth.contract(CONTRACT_ABI_ARRAY), function (contract, accounts){
    assert(accounts.length == 10);
    assert(accounts.filter(function (_account, _idx){return !_account }).length == 0);

    let fns = [test_init, test_transfer, test_transfer_from, test_withdraw_workflow];
    
    let max_fn_name_len = fns.map(function (fn){return fn.name.length}).reduce(function (a, b){
                                return Math.max(a, b)}, 0);

    fns.forEach(function (fn, idx){
        web3.eth.estimateGas({'data': CONTRACT_BIN_CODE}, function (e, r){
            if ( !e ){
                let gas = r * 2;
                contract.new({
                    'from': accounts[0],
                    'data': CONTRACT_BIN_CODE,
                    'gas' : gas
                }, function (e, r){
                    if (e) {
                        console.log(e);
                        console.error("功能测试 `%s` \t\t未通过 (合约部署失败)" .replace("%s", render_fn_name(fn.name, max_fn_name_len) ) );
                        return;
                    }
                    if ( r.address ) {
                        fn(web3.eth.contract(CONTRACT_ABI_ARRAY).at(r.address), accounts, function (e, r){
                            if (e) {
                                console.error("功能测试 `%s` \t\t未通过 (%s)" .replace("%s", render_fn_name(fn.name, max_fn_name_len) ).replace("%s", e) );
                                return;
                            }
                            console.error("功能测试 `%s` \t\t通过" .replace("%s", render_fn_name(fn.name, max_fn_name_len) ));
                        });
                    } else {
                        // PASS
                    }
                });
            }
        });
    });
});
