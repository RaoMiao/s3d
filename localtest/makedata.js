var S3DProtocol = artifacts.require("./S3DProtocol.sol");
var EthDealer = artifacts.require("./EthDealer.sol");
var SeeleDealer = artifacts.require("./SeeleDealer.sol");
var SeeleToken = artifacts.require("./SeeleToken.sol");
var ZRXToken = artifacts.require("./ZRXToken.sol");
var OMGToken = artifacts.require("./OMGToken.sol");
var OMGDealer = artifacts.require("./OMGDealer.sol");
var ZRXDealer = artifacts.require("./ZRXDealer.sol");

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
        S3DProtocolInstance.buy(symbol, 0, referredBy, {from: address, value: tokenamount});
    } else if(symbol == "seele") {
        SeeleTokenInst.mint(address, 1e23, false, {from: mainAccount, value: 0});
        SeeleTokenInst.approve(SeeleDealerInstance.address, 1e23,  {from: address, value: 0});
        S3DProtocolInstance.buy(symbol, tokenamount, referredBy, {from: address, value: 0});      
    } else if(symbol == "omg") {
        OMGTokenInst.mint(address, 1e23, {from: mainAccount, value: 0});
        OMGTokenInst.approve(OMGDealerInstance.address, 0,  {from: address, value: 0});
        OMGTokenInst.approve(OMGDealerInstance.address, 1e23,  {from: address, value: 0});
        S3DProtocolInstance.buy(symbol, tokenamount, referredBy, {from: address, value: 0});      
    } else if(symbol == "zrx") {
        ZRXTokenInst.transfer(address, 1e23, {from: mainAccount, value: 0});
        ZRXTokenInst.approve(ZRXDealerInstance.address, 1e23,  {from: address, value: 0});
        S3DProtocolInstance.buy(symbol, tokenamount, referredBy, {from: address, value: 0});      
    }

    console.log("SendBuy: " + "address:" + address + "  " + "symbol:" + symbol + "  " + "tokenamount:" + tokenamount + "  " + "referredBy:" + referredBy)
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
        
        SendBuy("0x4925D66978FB4f13e574107Fb01F4c3B51AbA7Aa", "eth", 1e18, "0x0000000000000000000000000000000000000000");
        SendBuy("0x4956D13120447ceBb1bddEBae03F4c7E0c2eE3Bf", "eth", 1e18, "0x0000000000000000000000000000000000000000");
        SendBuy("0x5068EDfB644C8Cc4acCb1649b1969EBcB76B60d6", "eth", 1e18, "0x0000000000000000000000000000000000000000");
        SendBuy("0x5567Fd0a8164acbd463dd28A69CFAD90CF4F0D9B", "eth", 1e18, "0x0000000000000000000000000000000000000000");
        SendBuy("0x5575b7fD2b1119F2E45021fac13c1381d83293cA", "eth", 1e18, "0x0000000000000000000000000000000000000000");

        SendBuy("0x4925D66978FB4f13e574107Fb01F4c3B51AbA7Aa", "seele", 1e21, "0x0000000000000000000000000000000000000000");
        SendBuy("0x4956D13120447ceBb1bddEBae03F4c7E0c2eE3Bf", "seele", 1e21, "0x0000000000000000000000000000000000000000");
        SendBuy("0x5068EDfB644C8Cc4acCb1649b1969EBcB76B60d6", "seele", 1e21, "0x0000000000000000000000000000000000000000");
        SendBuy("0x5567Fd0a8164acbd463dd28A69CFAD90CF4F0D9B", "seele", 1e21, "0x0000000000000000000000000000000000000000");
        SendBuy("0x5575b7fD2b1119F2E45021fac13c1381d83293cA", "seele", 1e21, "0x0000000000000000000000000000000000000000");

        SendBuy("0x4925D66978FB4f13e574107Fb01F4c3B51AbA7Aa", "omg", 1e21, "0x0000000000000000000000000000000000000000");
        SendBuy("0x4956D13120447ceBb1bddEBae03F4c7E0c2eE3Bf", "omg", 1e21, "0x0000000000000000000000000000000000000000");
        SendBuy("0x5068EDfB644C8Cc4acCb1649b1969EBcB76B60d6", "omg", 1e21, "0x0000000000000000000000000000000000000000");
        SendBuy("0x5567Fd0a8164acbd463dd28A69CFAD90CF4F0D9B", "omg", 1e21, "0x0000000000000000000000000000000000000000");
        SendBuy("0x5575b7fD2b1119F2E45021fac13c1381d83293cA", "omg", 1e21, "0x0000000000000000000000000000000000000000");

        SendBuy("0x4925D66978FB4f13e574107Fb01F4c3B51AbA7Aa", "zrx", 1e21, "0x0000000000000000000000000000000000000000");
        SendBuy("0x4956D13120447ceBb1bddEBae03F4c7E0c2eE3Bf", "zrx", 1e21, "0x0000000000000000000000000000000000000000");
        SendBuy("0x5068EDfB644C8Cc4acCb1649b1969EBcB76B60d6", "zrx", 1e21, "0x0000000000000000000000000000000000000000");
        SendBuy("0x5567Fd0a8164acbd463dd28A69CFAD90CF4F0D9B", "zrx", 1e21, "0x0000000000000000000000000000000000000000");
        SendBuy("0x5575b7fD2b1119F2E45021fac13c1381d83293cA", "zrx", 1e21, "0x0000000000000000000000000000000000000000");
    });
}