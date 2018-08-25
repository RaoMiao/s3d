var S3DProtocol = artifacts.require("./S3DProtocol.sol");
var EthDealer = artifacts.require("./EthDealer.sol");
var SeeleDealer = artifacts.require("./SeeleDealer.sol");
var SeeleToken = artifacts.require("./SeeleToken.sol");
var ZRXToken = artifacts.require("./ZRXToken.sol");
var OMGToken = artifacts.require("./OMGToken.sol");
var OMGDealer = artifacts.require("./OMGDealer.sol");
var ZRXDealer = artifacts.require("./ZRXDealer.sol");
var schedule = require("node-schedule");

var fs = require('fs');
var path = require('path');


var accountlist = [];

function readDirSync(path){
	var pa = fs.readdirSync(path);
	pa.forEach(function(ele,index){
		var info = fs.statSync(path+"/"+ele)	
		if(info.isDirectory()){
			readDirSync(path+"/"+ele);
		}else{
            address = GetFileNameNoExt(ele)
            accountlist.push(address);
		}	
	})
}

//字符串逆转
function strturn(str) {
    if (str != "") {
    var str1 = "";
    for (var i = str.length - 1; i >= 0; i--) {
        str1 += str.charAt(i);
    }
    return (str1);
    }
}
  
//取文件后缀名
function GetFileExt(filepath) {
    if (filepath != "") {
        var pos = "." + filepath.replace(/.+\./, "");
        return pos;
    }
}

//取文件名不带后缀
function GetFileNameNoExt(filepath) {
    var pos = strturn(GetFileExt(filepath));
    var file = strturn(filepath);
    var pos1 =strturn( file.replace(pos, ""));
    var pos2 = GetFileName(pos1);
    return pos2;
}
      
//取文件全名名称
function GetFileName(filepath) {
    if (filepath != "") {
        var names = filepath.split("\\");
        return names[names.length - 1];
    }
}

      
var filePath = path.resolve('D:/work/go_project/src/github.com/ethereum/go-ethereum/cmd/geth/privatenet/keystore/');

//调用文件遍历方法
readDirSync(filePath);

// perform actions

const mainAccount = "0xcd16575a90ed9506bcf44c78845d93f1b647f48c";
var S3DProtocolInstance ;
var SeeleTokenInst;
var ZRXTokenInst;
var OMGTokenInst;
var OMGDealerInstance;
var ZRXDealerInstance;
var EthDealerInstance ;
var SeeleDealerInstance ;

function SendBuy(address, symbol, tokenamount, referredBy) {
    web3.personal.unlockAccount(address, 'asdf1234', 1500000)

    if (symbol == "eth") {
        S3DProtocolInstance.buy(symbol, 0, referredBy, {from: address, value: tokenamount}).catch(function(e) {
            console.log(e);
        });
    } else if(symbol == "seele") {
        SeeleTokenInst.mint(address, 1e23, false, {from: mainAccount, value: 0}).catch(function(e) {
            console.log(e);
        });
        SeeleTokenInst.approve(SeeleDealerInstance.address, 1e23,  {from: address, value: 0}).catch(function(e) {
            console.log(e);
        });
        S3DProtocolInstance.buy(symbol, tokenamount, referredBy, {from: address, value: 0}).catch(function(e) {
            console.log(e);
        });
    } else if(symbol == "omg") {
        OMGTokenInst.mint(address, 1e23, {from: mainAccount, value: 0}).catch(function(e) {
            console.log(e);
        });
        // var approveAmount = OMGTokenInst.allowance.call(address, OMGDealerInstance.address)
        // console.log(approveAmount)
        // if (approveAmount != 0) {
        //     OMGTokenInst.approve(OMGDealerInstance.address, 0,  {from: address, value: 0});
        // }
        OMGTokenInst.approve(OMGDealerInstance.address, 1e23,  {from: address, value: 0}).catch(function(e) {
            console.log(e);
        });
        S3DProtocolInstance.buy(symbol, tokenamount, referredBy, {from: address, value: 0}).catch(function(e) {
            console.log(e);
        });
    } else if(symbol == "zrx") {
        ZRXTokenInst.transfer(address, 1e23, {from: mainAccount, value: 0}).catch(function(e) {
            console.log(e);
        });
        ZRXTokenInst.approve(ZRXDealerInstance.address, 1e23,  {from: address, value: 0}).catch(function(e) {
            console.log(e);
        });
        S3DProtocolInstance.buy(symbol, tokenamount, referredBy, {from: address, value: 0}).catch(function(e) {
            console.log(e);
        });
    }

    console.log("SendBuy: " + "address:" + address + "  " + "symbol:" + symbol + "  " + "tokenamount:" + tokenamount + "  " + "referredBy:" + referredBy)
}

function SendSell(address, symbol) {
    web3.personal.unlockAccount(address, 'asdf1234', 1500000)


    S3DProtocolInstance.balanceOfOneToken.call(symbol, address).then(function(balance){
        var ownAmount = balance;
        console.log("ownAmount" + ownAmount)

        var sellAmount = ownAmount / 5;
        S3DProtocolInstance.sell(symbol, sellAmount,  {from: address, value: 0}).catch(function(e) {
            console.log(e);
        });
    
        console.log("SendSell: " + "address:" + address + "  " + "symbol:" + symbol + "  " + "tokenamount:" + sellAmount )
    
    })
}

function SendWithdraw(address, symbol) {
    web3.personal.unlockAccount(address, 'asdf1234', 1500000)

    S3DProtocolInstance.dividendsOf.call(symbol, address).then(function(dividens){
        var ownAmount = dividens;

        var amount = ownAmount / 2;

        S3DProtocolInstance.withdraw(symbol, amount,  {from: address, value: 0}).catch(function(e) {
            console.log(e);
        });

        console.log("SendWithdraw: " + "address:" + address + "  " + "symbol:" + symbol + "  " + "tokenamount:" + amount )
    })
}

function SendWithdrawAll(address) {
    web3.personal.unlockAccount(address, 'asdf1234', 1500000)
  
    S3DProtocolInstance.withdrawAll( {from: address, value: 0}).catch(function(e) {
        console.log(e);
    });
}

function SendReinvest(address, symbol) {
    web3.personal.unlockAccount(address, 'asdf1234', 1500000)

    S3DProtocolInstance.dividendsOf.call(symbol, address).then(function(dividens){
        var ownAmount = dividens;
        var amount = ownAmount / 2;

        S3DProtocolInstance.reinvest(symbol, amount,  {from: address, value: 0}).catch(function(e) {
            console.log(e);
        });

        console.log("SendReinvest: " + "address:" + address + "  " + "symbol:" + symbol + "  " + "tokenamount:" + amount )
    })


}

function SendArbitrage(address, fromSymbol, toSymbol) {
    web3.personal.unlockAccount(address, 'asdf1234', 1500000)

    S3DProtocolInstance.balanceOfOneToken.call(fromSymbol, address).then(function(balance){
        var ownAmount = balance;
        console.log("ownAmount" + ownAmount)

        var sellAmount = ownAmount / 5;

        S3DProtocolInstance.arbitrageTokens(fromSymbol, toSymbol, sellAmount,  {from: address, value: 0}).catch(function(e) {
            console.log(e);
        });
    
        console.log("arbitrageTokens: " + "address:" + address + "  " + "fromSymbol:" + fromSymbol + "  " + "toSymbol:" + toSymbol + "  " + "tokenamount:" + sellAmount )
    })
}

function randomFrom(lowerValue,upperValue)
{
    return Math.floor(Math.random() * (upperValue - lowerValue + 1) + lowerValue);
}

function getAIntroducer()
{
    var accountIndex = randomFrom(0, accountlist.length);
    var account = accountlist[accountIndex];
    return account;
}

var buyCnt = 100;
var initCnt = 0;
var finishFlag = true;
function RobotCommon() {
    if(!finishFlag)
        return;

    finishFlag = false;

    var accountIndex = randomFrom(0, accountlist.length);
    var account = accountlist[accountIndex];
    
    var ethBalance = 0;
    var seeleBalance = 0;
    var omgBalance = 0;
    var zrxBalance = 0;

    var ethDividends = 0;
    var seeleDividends = 0;
    var omgDividends = 0;
    var zrxDividends = 0;

    var ethTotalSupply = 0;
    var seeleTotalSupply = 0;
    var omgTotalSupply = 0;
    var zrxTotalSupply = 0;

    S3DProtocolInstance.balanceOfOneToken.call("eth", account).then(function(balance){
        ethBalance = balance;
        return S3DProtocolInstance.balanceOfOneToken.call("seele", account);
    }).then(function(balance){
        seeleBalance = balance;
        return S3DProtocolInstance.balanceOfOneToken.call("omg", account);
    }).then(function(balance){
        omgBalance = balance;
        return S3DProtocolInstance.balanceOfOneToken.call("zrx", account);
    }).then(function(balance){
        zrxBalance = balance;
        return S3DProtocolInstance.dividendsOf.call("eth", address);
    }).then(function(dividends){
        ethDividends = dividends;
        return S3DProtocolInstance.dividendsOf.call("seele", address);
    }).then(function(dividends){
        seeleDividends = dividends;
        return S3DProtocolInstance.dividendsOf.call("omg", address);
    }).then(function(dividends){
        omgDividends = dividends;
        return S3DProtocolInstance.dividendsOf.call("zrx", address);      
    }).then(function(dividends){
        zrxDividends = dividends;
        return S3DProtocolInstance.totalSupplyOfOneToken.call("eth");
    }).then(function(totalSupply){
        ethTotalSupply = totalSupply;
        return S3DProtocolInstance.totalSupplyOfOneToken.call("seele");
    }).then(function(totalSupply){
        seeleTotalSupply = totalSupply;
        return S3DProtocolInstance.totalSupplyOfOneToken.call("omg");
    }).then(function(totalSupply){
        omgTotalSupply = totalSupply;
        return S3DProtocolInstance.totalSupplyOfOneToken.call("zrx");
    }).then(function(totalSupply){
        zrxTotalSupply = totalSupply;

        console.log("----S3D INFO -------------");

        console.log("ethBalance: " + ethBalance);
        console.log("seeleBalance: " + seeleBalance);
        console.log("omgBalance: " + omgBalance);
        console.log("zrxBalance: " + zrxBalance);

        console.log("ethDividends: " + ethDividends);
        console.log("seeleDividends: " + seeleDividends);
        console.log("omgDividends: " + omgDividends);
        console.log("zrxDividends: " + zrxDividends);

        console.log("ethTotalSupply: " + ethTotalSupply);
        console.log("seeleTotalSupply: " + seeleTotalSupply);
        console.log("omgTotalSupply: " + omgTotalSupply);
        console.log("zrxTotalSupply: " + zrxTotalSupply);

        console.log("----S3D INFO -------------")


        var doWhat = randomFrom(1, 6);
        if (initCnt < buyCnt) {
            initCnt ++;
            doWhat = 1;
        }

        switch(doWhat)
        {
            case 1:
                console.log("DO BUY");
                //buy
                var referAccount = getAIntroducer();
                var type = randomFrom(1, 4);
                var tokenAmount = randomFrom(1, 3);
                switch(type)
                {
                    case 1:
                        SendBuy(account, "eth", tokenAmount * 1e18, referAccount);
                        break;
                    case 2:
                        SendBuy(account, "seele", tokenAmount * 1e18, referAccount);
                        break;
                    case 3:
                        SendBuy(account, "omg", tokenAmount * 1e18, referAccount);
                        break;
                    case 4:
                        SendBuy(account, "zrx", tokenAmount * 1e18, referAccount);
                        break;
                }
                finishFlag = true;
                break;
            case 2:
                console.log("DO REINVEST");

                //reinvest
                var typeArray = [];
                if (ethDividends > 0) {
                    typeArray.push(1);
                } 

                if (seeleDividends > 0) {
                    typeArray.push(2);
                } 

                if (omgDividends > 0) {
                    typeArray.push(3);
                }
                if (zrxDividends > 0) {
                    typeArray.push(4)
                }

                if (typeArray.length != 0) {
                    var typeIndex = randomFrom(0, typeArray.length);
                    var type = typeArray[typeIndex];
                    switch(type)
                    {
                        case 1:
                            SendReinvest(account, "eth");
                            break;
                        case 2:
                            SendReinvest(account, "seele");
                            break;
                        case 3:
                            SendReinvest(account, "omg");
                            break;
                        case 4:
                            SendReinvest(account, "zrx");
                            break;
                    }
                } else {
                    console.log("dividends not enough!");
                }
                finishFlag = true;
                break;
            case 3:
                console.log("DO SELL");

                //sell
                var typeArray = [];
                if (ethBalance > 0) {
                    typeArray.push(1);
                } 

                if (seeleBalance > 0) {
                    typeArray.push(2);
                } 

                if (omgBalance > 0) {
                    typeArray.push(3);
                }
                if (zrxBalance > 0) {
                    typeArray.push(4)
                }

                if (typeArray.length != 0) {
                    var typeIndex = randomFrom(0, typeArray.length);
                    var type = typeArray[typeIndex];
                    switch(type)
                    {
                        case 1:
                            SendSell(account, "eth");
                            break;
                        case 2:
                            SendSell(account, "seele");
                            break;
                        case 3:
                            SendSell(account, "omg");
                            break;
                        case 4:
                            SendSell(account, "zrx");
                            break;
                    }
                } else {
                    console.log("balance not enough!");                    
                }
                finishFlag = true;
                break;
            case 4:
                console.log("DO WITHDRAW");

                //withdraw
                var typeArray = [];
                if (ethDividends > 0) {
                    typeArray.push(1);
                } 

                if (seeleDividends > 0) {
                    typeArray.push(2);
                } 

                if (omgDividends > 0) {
                    typeArray.push(3);
                }
                if (zrxDividends > 0) {
                    typeArray.push(4)
                }

                if (typeArray.length != 0) {
                    var typeIndex = randomFrom(0, typeArray.length);
                    var type = typeArray[typeIndex];
                    switch(type)
                    {
                        case 1:
                            SendWithdraw(account, "eth");
                            break;
                        case 2:
                            SendWithdraw(account, "seele");
                            break;
                        case 3:
                            SendWithdraw(account, "omg");
                            break;
                        case 4:
                            SendWithdraw(account, "zrx");
                            break;
                    }
                } else {
                    console.log("dividends not enough!");                    
                }
                finishFlag = true;
                break;
            case 5:
                console.log("DO WITHDRAWALL");

                //withdrawall
                var typeArray = [];
                if (ethDividends > 0) {
                    typeArray.push(1);
                } 

                if (seeleDividends > 0) {
                    typeArray.push(2);
                } 

                if (omgDividends > 0) {
                    typeArray.push(3);
                }
                if (zrxDividends > 0) {
                    typeArray.push(4)
                }

                if (typeArray.length != 0) {
                    var typeIndex = randomFrom(0, typeArray.length);
                    var type = typeArray[typeIndex];
                    switch(type)
                    {
                        case 1:
                            SendWithdrawAll(account );
                            break;
                        case 2:
                            SendWithdrawAll(account);
                            break;
                        case 3:
                            SendWithdrawAll(account);
                            break;
                        case 4:
                            SendWithdrawAll(account);
                            break;
                    }
                } else {
                    console.log("dividends not enough!");                      
                }
                finishFlag = true;
                break;
            case 6:
                console.log("DO ARBITRAGE");

                // Arbitrage

                var typeArray = [];

                if (ethBalance < seeleTotalSupply) {
                    typeArray.push(1);
                }

                if (ethBalance < omgTotalSupply) {
                    typeArray.push(2);
                }

                if (ethBalance < zrxTotalSupply) {
                    typeArray.push(3);
                }

                if (seeleBalance < ethTotalSupply) {
                    typeArray.push(4);
                }

                if (seeleBalance < omgTotalSupply) {
                    typeArray.push(5);
                }

                if (seeleBalance < zrxTotalSupply) {
                    typeArray.push(6);
                }

                if (omgBalance < ethTotalSupply) {
                    typeArray.push(7);
                }

                if (omgBalance < seeleTotalSupply) {
                    typeArray.push(8);
                }

                if (omgBalance < zrxTotalSupply) {
                    typeArray.push(9);
                }

                if (zrxBalance < ethTotalSupply) {
                    typeArray.push(10);
                }

                if (zrxBalance < seeleTotalSupply) {
                    typeArray.push(11);
                }

                if (zrxBalance < omgTotalSupply) {
                    typeArray.push(12);
                }

                if (typeArray.length != 0) {
                    var typeIndex = randomFrom(0, typeArray.length);
                    var type = typeArray[typeIndex];
                    switch(type)
                    {
                        case 1:
                            SendArbitrage(account, "eth", "seele");
                            break;
                        case 2:
                            SendArbitrage(account, "eth", "omg");
                            break;
                        case 3:
                            SendArbitrage(account, "eth", "zrx");
                            break;
                        case 4:
                            SendArbitrage(account, "seele", "eth");
                            break;
                        case 5:
                            SendArbitrage(account, "seele", "omg");
                            break;
                        case 6:
                            SendArbitrage(account, "seele", "zrx");
                            break;
                        case 7:
                            SendArbitrage(account, "omg", "eth");
                            break;
                        case 8:
                            SendArbitrage(account, "omg", "seele");
                            break;
                        case 9:
                            SendArbitrage(account, "omg", "zrx");
                            break;
                        case 10:
                            SendArbitrage(account, "zrx", "eth");
                            break;
                        case 11:
                            SendArbitrage(account, "zrx", "seele");
                            break;
                        case 12:
                            SendArbitrage(account, "zrx", "omg");
                            break;
                    }
                } else {
                    console.log("can not arbitrage");                      
                }
                finishFlag = true;
                break;
        }
    })


}

module.exports = function(callback) {

    S3DProtocol.deployed().then(function(instance) {
        S3DProtocolInstance = instance;
        return ZRXToken.deployed();
    }).then(function(instance){
        ZRXTokenInst = instance;
        return SeeleToken.deployed(); 
    }).then(function(instance){
        SeeleTokenInst = instance;
        return OMGToken.deployed(); 
    }).then(function(instance){
        OMGTokenInst = instance;
        return EthDealer.deployed(); 
    }).then(function(instance){
        EthDealerInstance = instance;
        return SeeleDealer.deployed(); 
    }).then(function(instance){
        SeeleDealerInstance = instance;
        return OMGDealer.deployed();
    }).then(function(instance){
        OMGDealerInstance = instance;
        return ZRXDealer.deployed();
    }).then(function(instance){
        ZRXDealerInstance = instance;
        
        // SendBuy("0x4925D66978FB4f13e574107Fb01F4c3B51AbA7Aa", "eth", 1e18, "0x6690F54bc3a912EB5959ca52102410b2ABE362C3");
        // SendBuy("0x4956D13120447ceBb1bddEBae03F4c7E0c2eE3Bf", "eth", 1e18, "0x0000000000000000000000000000000000000000");
        // SendBuy("0x5068EDfB644C8Cc4acCb1649b1969EBcB76B60d6", "eth", 1e18, "0x0000000000000000000000000000000000000000");
        // SendBuy("0x5567Fd0a8164acbd463dd28A69CFAD90CF4F0D9B", "eth", 1e18, "0x0000000000000000000000000000000000000000");
        // SendBuy("0x5575b7fD2b1119F2E45021fac13c1381d83293cA", "eth", 1e18, "0x0000000000000000000000000000000000000000");

        // SendBuy("0x4925D66978FB4f13e574107Fb01F4c3B51AbA7Aa", "seele", 1e21, "0x0000000000000000000000000000000000000000");
        // SendBuy("0x4956D13120447ceBb1bddEBae03F4c7E0c2eE3Bf", "seele", 1e21, "0x0000000000000000000000000000000000000000");
        // SendBuy("0x5068EDfB644C8Cc4acCb1649b1969EBcB76B60d6", "seele", 1e21, "0x0000000000000000000000000000000000000000");
        // SendBuy("0x5567Fd0a8164acbd463dd28A69CFAD90CF4F0D9B", "seele", 1e21, "0x0000000000000000000000000000000000000000");
        // SendBuy("0x5575b7fD2b1119F2E45021fac13c1381d83293cA", "seele", 1e21, "0x0000000000000000000000000000000000000000");

        // SendBuy("0x4925D66978FB4f13e574107Fb01F4c3B51AbA7Aa", "omg", 1e21, "0x0000000000000000000000000000000000000000");
        // SendBuy("0x4956D13120447ceBb1bddEBae03F4c7E0c2eE3Bf", "omg", 1e21, "0x0000000000000000000000000000000000000000");
        // SendBuy("0x5068EDfB644C8Cc4acCb1649b1969EBcB76B60d6", "omg", 1e21, "0x0000000000000000000000000000000000000000");
        // SendBuy("0x5567Fd0a8164acbd463dd28A69CFAD90CF4F0D9B", "omg", 1e21, "0x0000000000000000000000000000000000000000");
        // SendBuy("0x5575b7fD2b1119F2E45021fac13c1381d83293cA", "omg", 1e21, "0x0000000000000000000000000000000000000000");

        // SendBuy("0x5567Fd0a8164acbd463dd28A69CFAD90CF4F0D9B", "zrx", 1e21, "0x6923CB48f1D1d4c2FB76ca417A913688df76098f");
        // SendBuy("0x4956D13120447ceBb1bddEBae03F4c7E0c2eE3Bf", "zrx", 1e21, "0x0000000000000000000000000000000000000000");
        // SendBuy("0x5068EDfB644C8Cc4acCb1649b1969EBcB76B60d6", "zrx", 1e21, "0x0000000000000000000000000000000000000000");
        // SendBuy("0x5567Fd0a8164acbd463dd28A69CFAD90CF4F0D9B", "zrx", 1e21, "0x0000000000000000000000000000000000000000");
        // SendBuy("0x5575b7fD2b1119F2E45021fac13c1381d83293cA", "zrx", 1e21, "0x0000000000000000000000000000000000000000");

   
        // SendWithdrawAll("0x4925D66978FB4f13e574107Fb01F4c3B51AbA7Aa");
        // SendWithdrawAll("0x4956D13120447ceBb1bddEBae03F4c7E0c2eE3Bf");
        // SendWithdrawAll("0x5068EDfB644C8Cc4acCb1649b1969EBcB76B60d6");
        // SendWithdrawAll("0x5567Fd0a8164acbd463dd28A69CFAD90CF4F0D9B");
        // SendWithdrawAll("0x5575b7fD2b1119F2E45021fac13c1381d83293cA");


        // SendSell("0x4925D66978FB4f13e574107Fb01F4c3B51AbA7Aa", "eth");
        // SendSell("0x4956D13120447ceBb1bddEBae03F4c7E0c2eE3Bf", "eth");
        // SendSell("0x5068EDfB644C8Cc4acCb1649b1969EBcB76B60d6", "eth");
        // SendSell("0x5567Fd0a8164acbd463dd28A69CFAD90CF4F0D9B", "eth");
        // SendSell("0x5575b7fD2b1119F2E45021fac13c1381d83293cA", "eth");

        // SendSell("0x4925D66978FB4f13e574107Fb01F4c3B51AbA7Aa", "seele");
        // SendSell("0x4956D13120447ceBb1bddEBae03F4c7E0c2eE3Bf", "seele");
        // SendSell("0x5068EDfB644C8Cc4acCb1649b1969EBcB76B60d6", "seele");
        // SendSell("0x5567Fd0a8164acbd463dd28A69CFAD90CF4F0D9B", "seele");
        // SendSell("0x5575b7fD2b1119F2E45021fac13c1381d83293cA", "seele");

        // SendSell("0x4925D66978FB4f13e574107Fb01F4c3B51AbA7Aa", "omg");
        // SendSell("0x4956D13120447ceBb1bddEBae03F4c7E0c2eE3Bf", "omg");
        // SendSell("0x5068EDfB644C8Cc4acCb1649b1969EBcB76B60d6", "omg");
        // SendSell("0x5567Fd0a8164acbd463dd28A69CFAD90CF4F0D9B", "omg");
        // SendSell("0x5575b7fD2b1119F2E45021fac13c1381d83293cA", "omg");

        // SendSell("0x4925D66978FB4f13e574107Fb01F4c3B51AbA7Aa", "zrx");
        // SendSell("0x4956D13120447ceBb1bddEBae03F4c7E0c2eE3Bf", "zrx");
        // SendSell("0x5068EDfB644C8Cc4acCb1649b1969EBcB76B60d6", "zrx");
        // SendSell("0x5567Fd0a8164acbd463dd28A69CFAD90CF4F0D9B", "zrx");
        // SendSell("0x5575b7fD2b1119F2E45021fac13c1381d83293cA", "zrx");

        // SendWithdraw("0x4925D66978FB4f13e574107Fb01F4c3B51AbA7Aa", "eth");
        // SendWithdraw("0x4956D13120447ceBb1bddEBae03F4c7E0c2eE3Bf", "eth");
        // SendWithdraw("0x5068EDfB644C8Cc4acCb1649b1969EBcB76B60d6", "eth");
        // SendWithdraw("0x5567Fd0a8164acbd463dd28A69CFAD90CF4F0D9B", "eth");
        // SendWithdraw("0x5575b7fD2b1119F2E45021fac13c1381d83293cA", "eth");

        // SendWithdraw("0x4925D66978FB4f13e574107Fb01F4c3B51AbA7Aa", "seele");
        // SendWithdraw("0x4956D13120447ceBb1bddEBae03F4c7E0c2eE3Bf", "seele");
        // SendWithdraw("0x5068EDfB644C8Cc4acCb1649b1969EBcB76B60d6", "seele");
        // SendWithdraw("0x5567Fd0a8164acbd463dd28A69CFAD90CF4F0D9B", "seele");
        // SendWithdraw("0x5575b7fD2b1119F2E45021fac13c1381d83293cA", "seele");

        // SendWithdraw("0x4925D66978FB4f13e574107Fb01F4c3B51AbA7Aa", "omg");
        // SendWithdraw("0x4956D13120447ceBb1bddEBae03F4c7E0c2eE3Bf", "omg");
        // SendWithdraw("0x5068EDfB644C8Cc4acCb1649b1969EBcB76B60d6", "omg");
        // SendWithdraw("0x5567Fd0a8164acbd463dd28A69CFAD90CF4F0D9B", "omg");
        // SendWithdraw("0x5575b7fD2b1119F2E45021fac13c1381d83293cA", "omg");

        // SendWithdraw("0x4925D66978FB4f13e574107Fb01F4c3B51AbA7Aa", "zrx");
        // SendWithdraw("0x4956D13120447ceBb1bddEBae03F4c7E0c2eE3Bf", "zrx");
        // SendWithdraw("0x5068EDfB644C8Cc4acCb1649b1969EBcB76B60d6", "zrx");
        // SendWithdraw("0x5567Fd0a8164acbd463dd28A69CFAD90CF4F0D9B", "zrx");
        // SendWithdraw("0x5575b7fD2b1119F2E45021fac13c1381d83293cA", "zrx");

        // SendReinvest("0x4925D66978FB4f13e574107Fb01F4c3B51AbA7Aa", "eth");
        // SendReinvest("0x4956D13120447ceBb1bddEBae03F4c7E0c2eE3Bf", "eth");
        // SendReinvest("0x5068EDfB644C8Cc4acCb1649b1969EBcB76B60d6", "eth");
        // SendReinvest("0x5567Fd0a8164acbd463dd28A69CFAD90CF4F0D9B", "eth");
        // SendReinvest("0x5575b7fD2b1119F2E45021fac13c1381d83293cA", "eth");

        // SendReinvest("0x4925D66978FB4f13e574107Fb01F4c3B51AbA7Aa", "seele");
        // SendReinvest("0x4956D13120447ceBb1bddEBae03F4c7E0c2eE3Bf", "seele");
        // SendReinvest("0x5068EDfB644C8Cc4acCb1649b1969EBcB76B60d6", "seele");
        // SendReinvest("0x5567Fd0a8164acbd463dd28A69CFAD90CF4F0D9B", "seele");
        // SendReinvest("0x5575b7fD2b1119F2E45021fac13c1381d83293cA", "seele");

        // SendReinvest("0x4925D66978FB4f13e574107Fb01F4c3B51AbA7Aa", "omg");
        // SendReinvest("0x4956D13120447ceBb1bddEBae03F4c7E0c2eE3Bf", "omg");
        // SendReinvest("0x5068EDfB644C8Cc4acCb1649b1969EBcB76B60d6", "omg");
        // SendReinvest("0x5567Fd0a8164acbd463dd28A69CFAD90CF4F0D9B", "omg");
        // SendReinvest("0x5575b7fD2b1119F2E45021fac13c1381d83293cA", "omg");

        // SendReinvest("0x4925D66978FB4f13e574107Fb01F4c3B51AbA7Aa", "zrx");
        // SendReinvest("0x4956D13120447ceBb1bddEBae03F4c7E0c2eE3Bf", "zrx");
        // SendReinvest("0x5068EDfB644C8Cc4acCb1649b1969EBcB76B60d6", "zrx");
        // SendReinvest("0x5567Fd0a8164acbd463dd28A69CFAD90CF4F0D9B", "zrx");
        // SendReinvest("0x5575b7fD2b1119F2E45021fac13c1381d83293cA", "zrx");

        // SendWithdrawAll("0x4925D66978FB4f13e574107Fb01F4c3B51AbA7Aa");
        // SendWithdrawAll("0x4956D13120447ceBb1bddEBae03F4c7E0c2eE3Bf");
        // SendWithdrawAll("0x5068EDfB644C8Cc4acCb1649b1969EBcB76B60d6");
        // SendWithdrawAll("0x5567Fd0a8164acbd463dd28A69CFAD90CF4F0D9B");
        // SendWithdrawAll("0x5575b7fD2b1119F2E45021fac13c1381d83293cA");

        SendArbitrage("0x4925D66978FB4f13e574107Fb01F4c3B51AbA7Aa", "seele", "eth");
        SendArbitrage("0x4956D13120447ceBb1bddEBae03F4c7E0c2eE3Bf", "seele", "eth");
        SendArbitrage("0x5068EDfB644C8Cc4acCb1649b1969EBcB76B60d6", "seele", "eth");
        SendArbitrage("0x5567Fd0a8164acbd463dd28A69CFAD90CF4F0D9B", "seele", "eth");
        SendArbitrage("0x5575b7fD2b1119F2E45021fac13c1381d83293cA", "seele", "eth");

        // SendArbitrage("0x4925D66978FB4f13e574107Fb01F4c3B51AbA7Aa", "eth", "seele");
        // SendArbitrage("0x4956D13120447ceBb1bddEBae03F4c7E0c2eE3Bf", "eth", "seele");
        // SendArbitrage("0x5068EDfB644C8Cc4acCb1649b1969EBcB76B60d6", "eth", "seele");
        // SendArbitrage("0x5567Fd0a8164acbd463dd28A69CFAD90CF4F0D9B", "eth", "seele");
        // SendArbitrage("0x5575b7fD2b1119F2E45021fac13c1381d83293cA", "eth", "seele");

        // SendArbitrage("0x4925D66978FB4f13e574107Fb01F4c3B51AbA7Aa", "omg", "eth");
        // SendArbitrage("0x4956D13120447ceBb1bddEBae03F4c7E0c2eE3Bf", "omg", "eth");
        // SendArbitrage("0x5068EDfB644C8Cc4acCb1649b1969EBcB76B60d6", "omg", "eth");
        // SendArbitrage("0x5567Fd0a8164acbd463dd28A69CFAD90CF4F0D9B", "omg", "eth");
        // SendArbitrage("0x5575b7fD2b1119F2E45021fac13c1381d83293cA", "omg", "eth");

        // SendArbitrage("0x4925D66978FB4f13e574107Fb01F4c3B51AbA7Aa", "eth", "omg");
        // SendArbitrage("0x4956D13120447ceBb1bddEBae03F4c7E0c2eE3Bf", "eth", "omg");
        // SendArbitrage("0x5068EDfB644C8Cc4acCb1649b1969EBcB76B60d6", "eth", "omg");
        // SendArbitrage("0x5567Fd0a8164acbd463dd28A69CFAD90CF4F0D9B", "eth", "omg");
        // SendArbitrage("0x5575b7fD2b1119F2E45021fac13c1381d83293cA", "eth", "omg");

       
        // SendArbitrage("0x4925D66978FB4f13e574107Fb01F4c3B51AbA7Aa", "zrx", "seele");
        // SendArbitrage("0x4956D13120447ceBb1bddEBae03F4c7E0c2eE3Bf", "zrx", "seele");
        // SendArbitrage("0x5068EDfB644C8Cc4acCb1649b1969EBcB76B60d6", "zrx", "seele");
        // SendArbitrage("0x5567Fd0a8164acbd463dd28A69CFAD90CF4F0D9B", "zrx", "seele");
        // SendArbitrage("0x5575b7fD2b1119F2E45021fac13c1381d83293cA", "zrx", "seele");
 

        // SendBuy("0x4925D66978FB4f13e574107Fb01F4c3B51AbA7Aa", "eth", 3e18, "0x4956D13120447ceBb1bddEBae03F4c7E0c2eE3Bf");
        // SendBuy("0x4956D13120447ceBb1bddEBae03F4c7E0c2eE3Bf", "eth", 3e18, "0x5068EDfB644C8Cc4acCb1649b1969EBcB76B60d6");
        // SendBuy("0x5068EDfB644C8Cc4acCb1649b1969EBcB76B60d6", "eth", 3e18, "0x5567Fd0a8164acbd463dd28A69CFAD90CF4F0D9B");
        // SendBuy("0x5567Fd0a8164acbd463dd28A69CFAD90CF4F0D9B", "eth", 3e18, "0x5575b7fD2b1119F2E45021fac13c1381d83293cA");
        // SendBuy("0x5575b7fD2b1119F2E45021fac13c1381d83293cA", "eth", 3e18, "0x4925D66978FB4f13e574107Fb01F4c3B51AbA7Aa");

        // SendWithdrawAll("0x4925D66978FB4f13e574107Fb01F4c3B51AbA7Aa");

        
    //     var rule = new schedule.RecurrenceRule();
    // 　　var times = [];
    // 　　for(var i=1; i<60; i++){ 
    //         if (i % 15 == 0){
    //             times.push(i);  
    //         }
    // 　　}
        
    // 　　rule.second = times;
        
    // 　　var j = schedule.scheduleJob(rule, function(){
    //         RobotCommon();
    //     });
    });
}

process.on('uncaughtException', function (err) {
    //打印出错误
    console.log(err);
    //打印出错误的调用栈方便调试
    console.log(err.stack);
});