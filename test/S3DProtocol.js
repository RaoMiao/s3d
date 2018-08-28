var S3DProtocol = artifacts.require("./S3DProtocol.sol");
var EthDealer = artifacts.require("./EthDealer.sol");
var SeeleDealer = artifacts.require("./SeeleDealer.sol");
var SeeleToken = artifacts.require("./SeeleToken.sol");
var ZRXToken = artifacts.require("./ZRXToken.sol");
var OMGToken = artifacts.require("./OMGToken.sol");
var OMGDealer = artifacts.require("./OMGDealer.sol");
var ZRXDealer = artifacts.require("./ZRXDealer.sol");

var SeeleTokenInst;
var ZRXTokenInst;
var OMGTokenInst;
var EthDealerInstance ;
var SeeleDealerInstance ;
var S3DProtocolInstance ;
var OMGDealerInstance;
var ZRXDealerInstance;

//var notOwnerAccount = "0xB9B2cf809241A1Ee1Cc1b985f0bD8bd875aE8671";
var notOwnerAccount = "0xB9B2cf809241A1Ee1Cc1b985f0bD8bd875aE8671";


const floatEpsilon = Math.pow(2, -23);
 
const equalNumber = (a, b) => {
    return Math.abs(a - b) <= floatEpsilon * Math.max(Math.abs(a), Math.abs(b));
}

contract('S3DProtocol', function(accounts) {


  //unlock account
  web3.personal.unlockAccount(notOwnerAccount, 'asdf1234', 1500000)

  it("should depoly correct", function() {

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

        assert.notEqual(S3DProtocolInstance, null, "S3DProtocolInstance is null");
        assert.notEqual(ZRXTokenInst, null, "ZRXTokenInst is null");
        assert.notEqual(SeeleTokenInst, null, "SeeleTokenInst is null");
        assert.notEqual(OMGTokenInst, null, "OMGTokenInst is null");
        assert.notEqual(EthDealerInstance, null, "EthDealerInstance is null");
        assert.notEqual(SeeleDealerInstance, null, "SeeleDealerInstance is null");
        assert.notEqual(OMGDealerInstance, null, "OMGDealerInstance is null");
        assert.notEqual(ZRXDealerInstance, null, "ZRXDealerInstance is null");
    });
  });

  it("should have eth dealer", function() {
    return S3DProtocolInstance.getDealer("eth").then(function(ethAddress){
        assert.notEqual(ethAddress, null, "eth dealer is null");
    })
  });

  it("should have seele dealer", function() {
    return S3DProtocolInstance.getDealer("seele").then(function(seeleAddress){
        assert.notEqual(seeleAddress, null, "eth dealer is null");
    })
  });

  it("should have omg dealer", function() {
    return S3DProtocolInstance.getDealer("omg").then(function(omgAddress){
        assert.notEqual(omgAddress, null, "eth dealer is null");
    })
  });

  it("should have zrx dealer", function() {
    return S3DProtocolInstance.getDealer("zrx").then(function(zrxAddress){
        assert.notEqual(zrxAddress, null, "zrx dealer is null");
    })
  });

  if("should add dealer and remove dealer correctly", function(){
    var testaddress = '0x0A26b0eE9922C98932e4e965Dc832FbCe9988cEB';
    S3DProtocolInstance.addDealer("testdealer", testaddress).then(function(size){
        assert.equal(size, 5, "adddealer failed");       
        return S3DProtocolInstance.getDealer("testdealer");
    }).then(function(testDealerAddress){
        assert.equal(testaddress, testDealerAddress, "getDealer the data is not same");            
        return S3DProtocolInstance.removeDealer("testdealer");
    }).then(function(size){
        assert.equal(size, 4, "removeDealer failed");       
        return S3DProtocolInstance.getDealer("testdealer");       
    }).then(function(testDealerAddress){
        assert.equal(testDealerAddress, "0x0000000000000000000000000000000000000000", "getDealer the data is not same");           
    }); 
  })

  it("should addReferraler correctly", function() {
    var testaddress = '0x0A26b0eE9922C98932e4e965Dc832FbCe9988cEB';
    return S3DProtocolInstance.isReferraler(testaddress).then(function(isReferraler){
        assert.equal(isReferraler, false, "is not a referraler");       
        return S3DProtocolInstance.addReferraler(testaddress);
    }).then(function(){
        return S3DProtocolInstance.isReferraler(testaddress);
    }).then(function(isReferraler){
        assert.equal(isReferraler, true, "is a referraler");        
        return S3DProtocolInstance.removeReferraler(testaddress);
    }).then(function(){
        return S3DProtocolInstance.isReferraler(testaddress);
    }).then(function(isReferraler){
        assert.equal(isReferraler, false, "is not a referraler");

        
    })
  });

  it("should addArbitrager correctly", function() {
    var testaddress = '0x0A26b0eE9922C98932e4e965Dc832FbCe9988cEB';
    return S3DProtocolInstance.isArbitrager(testaddress).then(function(isArbitrager){
        assert.equal(isArbitrager, false, "is not a Arbitrager");       
        return S3DProtocolInstance.addArbitrager(testaddress);
    }).then(function(){
        return S3DProtocolInstance.isArbitrager(testaddress);
    }).then(function(isArbitrager){
        assert.equal(isArbitrager, true, "is a Arbitrager");        
        return S3DProtocolInstance.removeArbitrager(testaddress);
    }).then(function(){
        return S3DProtocolInstance.isArbitrager(testaddress);
    }).then(function(isArbitrager){
        assert.equal(isArbitrager, false, "is not a Arbitrager");
    })
  });

  it("should setReferralRequirement correctly", function() {
    var amountOfTokens = 800e18;
    return S3DProtocolInstance.referralRequirement.call().then(function(referralRequirement){
        assert.equal(referralRequirement, 500e18, "referralRequirement is not correct");       
        return S3DProtocolInstance.setReferralRequirement(amountOfTokens);
    }).then(function(){
        return S3DProtocolInstance.referralRequirement.call();
    }).then(function(referralRequirement){
        assert.equal(referralRequirement, amountOfTokens, "referralRequirement is not 800e18");       
        return S3DProtocolInstance.setReferralRequirement(500e18);       
    }).then(function(){
        return S3DProtocolInstance.referralRequirement.call();
    }).then(function(referralRequirement){
        assert.equal(referralRequirement, 500e18, "referralRequirement is not 500e18");         
    })
  });

  
  it("should setArbitrageRequirement correctly", function() {
    var amountOfTokens = 1500e18;
    return S3DProtocolInstance.arbitrageRequirement.call().then(function(arbitrageRequirement){
        assert.equal(arbitrageRequirement, 1000e18, "arbitrageRequirement is not correct");       
        return S3DProtocolInstance.setArbitrageRequirement(amountOfTokens);
    }).then(function(){
        return S3DProtocolInstance.arbitrageRequirement.call();
    }).then(function(arbitrageRequirement){
        assert.equal(arbitrageRequirement, amountOfTokens, "arbitrageRequirement is not 1500e18");       
        return S3DProtocolInstance.setArbitrageRequirement(1000e18);       
    }).then(function(){
        return S3DProtocolInstance.arbitrageRequirement.call();
    }).then(function(arbitrageRequirement){
        assert.equal(arbitrageRequirement, 1000e18, "arbitrageRequirement is not 1000e18");         
    })
  });


  it("should buy eth s3d correctly", function(){

    var before_ethBalance = 0;
    var before_s3dEthBalance = 0;
    var before_s3dEthTotalSupply = 0;
    var s3dEthExpectBuy = 0;

    var after_ethBalance = 0;
    var after_s3dEthBalance = 0;
    var after_s3dEthTotalSupply = 0;

    var ethBuyAmount = 1e18;

    return S3DProtocolInstance.balanceOfOneToken.call("eth", notOwnerAccount).then(function(balance){
        before_ethBalance = balance;
        return S3DProtocolInstance.totalBalance.call("eth");
    }).then(function(ethBalance){
        before_s3dEthBalance = ethBalance;
        return S3DProtocolInstance.totalSupplyOfOneToken.call("eth");
    }).then(function(ethSupply){
        before_s3dEthTotalSupply = ethSupply;
        return S3DProtocolInstance.calculateTokensReceived.call("eth", ethBuyAmount);
    }).then(function(tokensReceived){
        s3dEthExpectBuy = tokensReceived;
        return S3DProtocolInstance.buy("eth", 0, "0x0000000000000000000000000000000000000000", {from: notOwnerAccount, value: ethBuyAmount})
    }).then(function(){
        return S3DProtocolInstance.balanceOfOneToken.call("eth", notOwnerAccount);
    }).then(function(balance){
        after_ethBalance = balance;
        assert.equal(equalNumber(after_ethBalance , (before_ethBalance + s3dEthExpectBuy)), true, "s3dEthExpectBuy is not same");
        return S3DProtocolInstance.totalBalance.call("eth");
    }).then(function(ethBalance){
        after_s3dEthBalance = ethBalance;
        assert.equal(equalNumber(after_s3dEthBalance , before_s3dEthBalance + ethBuyAmount), true, "s3dEthExpectBuy is not same");      
        return S3DProtocolInstance.totalSupplyOfOneToken.call("eth");
    }).then(function(ethSupply){
        after_s3dEthTotalSupply = ethSupply;
        assert.equal(equalNumber(after_s3dEthTotalSupply , before_s3dEthTotalSupply + s3dEthExpectBuy), true, "s3dEthExpectBuy is not same"); 
    })
  });

  
  it("should buy seele s3d correctly", function(){

    var before_seeleBalance = 0;
    var before_s3dSeeleBalance = 0;
    var before_s3dSeeleTotalSupply = 0;
    var s3dSeeleExpectBuy = 0;

    var after_SeeleBalance = 0;
    var after_s3dSeeleBalance = 0;
    var after_s3dSeeleTotalSupply = 0;

    var seeleBuyAmount = 1e18;

    return S3DProtocolInstance.balanceOfOneToken.call("seele", notOwnerAccount).then(function(balance){
        before_seeleBalance = balance;
        return S3DProtocolInstance.totalBalance.call("seele");
    }).then(function(seeleBalance){
        before_s3dSeeleBalance = seeleBalance;
        return S3DProtocolInstance.totalSupplyOfOneToken.call("seele");
    }).then(function(seeleSupply){
        before_s3dSeeleTotalSupply = seeleSupply;
        return S3DProtocolInstance.calculateTokensReceived.call("seele", seeleBuyAmount);
    }).then(function(tokensReceived){
        s3dSeeleExpectBuy = tokensReceived;
        return SeeleTokenInst.mint(notOwnerAccount, 1e23, false);
    }).then(function(){
        return SeeleTokenInst.approve(SeeleDealerInstance.address, 1e23, {from: notOwnerAccount, value: 0});
    }).then(function(){
        return S3DProtocolInstance.buy("seele", 1e18, "0x0000000000000000000000000000000000000000", {from: notOwnerAccount, value: 0})
    }).then(function(){
        return S3DProtocolInstance.balanceOfOneToken.call("seele", notOwnerAccount);
    }).then(function(balance){
        after_seeleBalance = balance;
        assert.equal(equalNumber(after_seeleBalance , (before_seeleBalance + s3dSeeleExpectBuy)), true, "s3dSeeleExpectBuy is not same");
        return S3DProtocolInstance.totalBalance.call("seele");
    }).then(function(seeleBalance){
        after_s3dSeeleBalance = seeleBalance;
        assert.equal(equalNumber(after_s3dSeeleBalance , before_s3dSeeleBalance + seeleBuyAmount), true, "s3dSeeleExpectBuy is not same");      
        return S3DProtocolInstance.totalSupplyOfOneToken.call("seele");
    }).then(function(seeleSupply){
        after_s3dSeeleTotalSupply = seeleSupply;
        assert.equal(equalNumber(after_s3dSeeleTotalSupply , before_s3dSeeleTotalSupply + s3dSeeleExpectBuy), true, "s3dSeeleExpectBuy is not same"); 
    })
  });

  it("should buy omg s3d correctly", function(){

    var before_omgBalance = 0;
    var before_s3dOmgBalance = 0;
    var before_s3dOmgTotalSupply = 0;
    var s3dOmgExpectBuy = 0;

    var after_OmgBalance = 0;
    var after_s3dOmgBalance = 0;
    var after_s3dOmgTotalSupply = 0;

    var omgBuyAmount = 1e18;

    return S3DProtocolInstance.balanceOfOneToken.call("omg", notOwnerAccount).then(function(balance){
        before_omgBalance = balance;
        return S3DProtocolInstance.totalBalance.call("omg");
    }).then(function(omgBalance){
        before_s3dOmgBalance = omgBalance;
        return S3DProtocolInstance.totalSupplyOfOneToken.call("omg");
    }).then(function(omgSupply){
        before_s3dOmgTotalSupply = omgSupply;
        return S3DProtocolInstance.calculateTokensReceived.call("omg", omgBuyAmount);
    }).then(function(tokensReceived){
        s3dOmgExpectBuy = tokensReceived;
        return OMGTokenInst.mint(notOwnerAccount, 1e23);
    }).then(function(){
        return OMGTokenInst.approve(OMGDealerInstance.address, 1e23, {from: notOwnerAccount, value: 0});
    }).then(function(){
        return S3DProtocolInstance.buy("omg", 1e18, "0x0000000000000000000000000000000000000000", {from: notOwnerAccount, value: 0})
    }).then(function(){
        return S3DProtocolInstance.balanceOfOneToken.call("omg", notOwnerAccount);
    }).then(function(balance){
        after_omgBalance = balance;
        assert.equal(equalNumber(after_omgBalance , (before_omgBalance + s3dOmgExpectBuy)), true, "s3dSeeleExpectBuy is not same");
        return S3DProtocolInstance.totalBalance.call("omg");
    }).then(function(omgBalance){
        after_s3dOmgBalance = omgBalance;
        assert.equal(equalNumber(after_s3dOmgBalance , before_s3dOmgBalance + omgBuyAmount), true, "s3dSeeleExpectBuy is not same");      
        return S3DProtocolInstance.totalSupplyOfOneToken.call("omg");
    }).then(function(omgSupply){
        after_s3dOmgTotalSupply = omgSupply;
        assert.equal(equalNumber(after_s3dOmgTotalSupply , before_s3dOmgTotalSupply + s3dOmgExpectBuy), true, "s3dSeeleExpectBuy is not same"); 
    })
  });

  it("should buy zrx s3d correctly", function(){

    var before_zrxBalance = 0;
    var before_s3dZrxBalance = 0;
    var before_s3dZrxTotalSupply = 0;
    var s3dZrxExpectBuy = 0;

    var after_ZrxBalance = 0;
    var after_s3dZrxBalance = 0;
    var after_s3dZrxTotalSupply = 0;

    var zrxBuyAmount = 1e18;

    return S3DProtocolInstance.balanceOfOneToken.call("zrx", notOwnerAccount).then(function(balance){
        before_zrxBalance = balance;
        return S3DProtocolInstance.totalBalance.call("zrx");
    }).then(function(zrxBalance){
        before_s3dZrxBalance = zrxBalance;
        return S3DProtocolInstance.totalSupplyOfOneToken.call("zrx");
    }).then(function(zrxSupply){
        before_s3dZrxTotalSupply = zrxSupply;
        return S3DProtocolInstance.calculateTokensReceived.call("zrx", zrxBuyAmount);
    }).then(function(tokensReceived){
        s3dZrxExpectBuy = tokensReceived;
        return ZRXTokenInst.transfer(notOwnerAccount, 1e23);
    }).then(function(){
        return ZRXTokenInst.approve(ZRXDealerInstance.address, 1e23, {from: notOwnerAccount, value: 0});
    }).then(function(){
        return S3DProtocolInstance.buy("zrx", 1e18, "0x0000000000000000000000000000000000000000", {from: notOwnerAccount, value: 0})
    }).then(function(){
        return S3DProtocolInstance.balanceOfOneToken.call("zrx", notOwnerAccount);
    }).then(function(balance){
        after_zrxBalance = balance;
        assert.equal(equalNumber(after_zrxBalance , (before_zrxBalance + s3dZrxExpectBuy)), true, "s3dZrxExpectBuy is not same");
        return S3DProtocolInstance.totalBalance.call("zrx");
    }).then(function(zrxBalance){
        after_s3dZrxBalance = zrxBalance;
        assert.equal(equalNumber(after_s3dZrxBalance , before_s3dZrxBalance + zrxBuyAmount), true, "s3dZrxExpectBuy is not same");      
        return S3DProtocolInstance.totalSupplyOfOneToken.call("zrx");
    }).then(function(zrxSupply){
        after_s3dZrxTotalSupply = zrxSupply;
        assert.equal(equalNumber(after_s3dZrxTotalSupply , before_s3dZrxTotalSupply + s3dZrxExpectBuy), true, "s3dZrxExpectBuy is not same"); 
    })
  });

  it("should sell eth s3d correctly", function(){

    var before_ethBalance = 0;
    var before_s3dEthBalance = 0;
    var before_s3dEthTotalSupply = 0;
    var s3dEthExpectGet = 0;

    var after_ethBalance = 0;
    var after_s3dEthBalance = 0;
    var after_s3dEthTotalSupply = 0;

    var s3dSellAmount = 0;

    return S3DProtocolInstance.balanceOfOneToken.call("eth", notOwnerAccount).then(function(balance){
        before_ethBalance = balance;
        s3dSellAmount = before_ethBalance / 2;
        return S3DProtocolInstance.totalBalance.call("eth");
    }).then(function(ethBalance){
        before_s3dEthBalance = ethBalance;
        return S3DProtocolInstance.totalSupplyOfOneToken.call("eth");
    }).then(function(ethSupply){
        before_s3dEthTotalSupply = ethSupply;
        return S3DProtocolInstance.calculateBuyTokenReceived.call("eth", s3dSellAmount);
    }).then(function(tokensReceived){
        s3dEthExpectGet = tokensReceived;
        return S3DProtocolInstance.sell("eth", s3dSellAmount, {from: notOwnerAccount, value: 0})
    }).then(function(){
        return S3DProtocolInstance.balanceOfOneToken.call("eth", notOwnerAccount);
    }).then(function(balance){
        after_ethBalance = balance;
        assert.equal(equalNumber(after_ethBalance , (before_ethBalance - s3dSellAmount)), true, "s3dEthExpectBuy is not same");
        return S3DProtocolInstance.totalBalance.call("eth");
    }).then(function(ethBalance){
        after_s3dEthBalance = ethBalance;
        assert.equal(equalNumber(after_s3dEthBalance , before_s3dEthBalance), true, "s3dEthExpectBuy is not same");      
        return S3DProtocolInstance.totalSupplyOfOneToken.call("eth");
    }).then(function(ethSupply){
        after_s3dEthTotalSupply = ethSupply;
        assert.equal(equalNumber(after_s3dEthTotalSupply , before_s3dEthTotalSupply - s3dSellAmount), true, "s3dEthExpectBuy is not same"); 
    })
  });

  it("should sell seele s3d correctly", function(){

    var before_seeleBalance = 0;
    var before_s3dSeeleBalance = 0;
    var before_s3dSeeleTotalSupply = 0;
    var s3dSeeleExpectGet = 0;

    var after_seeleBalance = 0;
    var after_s3dSeeleBalance = 0;
    var after_s3dSeeleTotalSupply = 0;

    var s3dSellAmount = 0;

    return S3DProtocolInstance.balanceOfOneToken.call("seele", notOwnerAccount).then(function(balance){
        before_seeleBalance = balance;
        s3dSellAmount = before_seeleBalance / 2;
        return S3DProtocolInstance.totalBalance.call("seele");
    }).then(function(seeleBalance){
        before_s3dSeeleBalance = seeleBalance;
        return S3DProtocolInstance.totalSupplyOfOneToken.call("seele");
    }).then(function(seeleSupply){
        before_s3dSeeleTotalSupply = seeleSupply;
        return S3DProtocolInstance.calculateBuyTokenReceived.call("seele", s3dSellAmount);
    }).then(function(tokensReceived){
        s3dSeeleExpectGet = tokensReceived;
        return S3DProtocolInstance.sell("seele", s3dSellAmount, {from: notOwnerAccount, value: 0})
    }).then(function(){
        return S3DProtocolInstance.balanceOfOneToken.call("seele", notOwnerAccount);
    }).then(function(balance){
        after_seeleBalance = balance;
        assert.equal(equalNumber(after_seeleBalance , (before_seeleBalance - s3dSellAmount)), true, "s3dSeeleExpectGet is not same");
        return S3DProtocolInstance.totalBalance.call("seele");
    }).then(function(seeleBalance){
        after_s3dSeeleBalance = seeleBalance;
        assert.equal(equalNumber(after_s3dSeeleBalance , before_s3dSeeleBalance), true, "s3dSeeleExpectGet is not same");      
        return S3DProtocolInstance.totalSupplyOfOneToken.call("seele");
    }).then(function(seeleSupply){
        after_s3dSeeleTotalSupply = seeleSupply;
        assert.equal(equalNumber(after_s3dSeeleTotalSupply , before_s3dSeeleTotalSupply - s3dSellAmount), true, "s3dSeeleExpectGet is not same"); 
    })
  });

  it("should sell omg s3d correctly", function(){

    var before_omgBalance = 0;
    var before_s3dOmgBalance = 0;
    var before_s3dOmgTotalSupply = 0;
    var s3dOmgExpectGet = 0;

    var after_omgBalance = 0;
    var after_s3dOmgBalance = 0;
    var after_s3dOmgTotalSupply = 0;

    var s3dSellAmount = 0;

    return S3DProtocolInstance.balanceOfOneToken.call("omg", notOwnerAccount).then(function(balance){
        before_omgBalance = balance;
        s3dSellAmount = before_omgBalance / 2;   
        return S3DProtocolInstance.totalBalance.call("omg");
    }).then(function(omgBalance){
        before_s3dOmgBalance = omgBalance;
        return S3DProtocolInstance.totalSupplyOfOneToken.call("omg");
    }).then(function(omgSupply){
        before_s3dOmgTotalSupply = omgSupply;
        return S3DProtocolInstance.calculateBuyTokenReceived.call("omg", s3dSellAmount);
    }).then(function(tokensReceived){
        s3dOmgExpectGet = tokensReceived;
        return S3DProtocolInstance.sell("omg", s3dSellAmount, {from: notOwnerAccount, value: 0})
    }).then(function(){
        return S3DProtocolInstance.balanceOfOneToken.call("omg", notOwnerAccount);
    }).then(function(balance){
        after_omgBalance = balance;
        assert.equal(equalNumber(after_omgBalance , (before_omgBalance - s3dSellAmount)), true, "s3dOmgExpectGet is not same1");
        return S3DProtocolInstance.totalBalance.call("omg");
    }).then(function(omgBalance){
        after_s3dOmgBalance = omgBalance;
        assert.equal(equalNumber(after_s3dOmgBalance , before_s3dOmgBalance), true, "s3dOmgExpectGet is not same2");      
        return S3DProtocolInstance.totalSupplyOfOneToken.call("omg");
    }).then(function(omgSupply){
        after_s3dOmgTotalSupply = omgSupply;
        assert.equal(equalNumber(after_s3dOmgTotalSupply , before_s3dOmgTotalSupply - s3dSellAmount), true, "s3dOmgExpectGet is not same3"); 
    })
  });

  it("should sell zrx s3d correctly", function(){

    var before_zrxBalance = 0;
    var before_s3dZrxBalance = 0;
    var before_s3dZrxTotalSupply = 0;
    var s3dZrxExpectGet = 0;

    var after_zrxBalance = 0;
    var after_s3dZrxBalance = 0;
    var after_s3dZrxTotalSupply = 0;

    var s3dSellAmount = 0;

    return S3DProtocolInstance.balanceOfOneToken.call("zrx", notOwnerAccount).then(function(balance){
        before_zrxBalance = balance;
        s3dSellAmount = before_zrxBalance / 2;
        return S3DProtocolInstance.totalBalance.call("zrx");
    }).then(function(zrxBalance){
        before_s3dZrxBalance = zrxBalance;
        return S3DProtocolInstance.totalSupplyOfOneToken.call("zrx");
    }).then(function(zrxSupply){
        before_s3dZrxTotalSupply = zrxSupply;
        return S3DProtocolInstance.calculateBuyTokenReceived.call("zrx", s3dSellAmount);
    }).then(function(tokensReceived){
        s3dZrxExpectGet = tokensReceived;
        return S3DProtocolInstance.sell("zrx", s3dSellAmount, {from: notOwnerAccount, value: 0})
    }).then(function(){
        return S3DProtocolInstance.balanceOfOneToken.call("zrx", notOwnerAccount);
    }).then(function(balance){
        after_zrxBalance = balance;
        assert.equal(equalNumber(after_zrxBalance , (before_zrxBalance - s3dSellAmount)), true, "s3dSeeleExpectGet is not same");
        return S3DProtocolInstance.totalBalance.call("zrx");
    }).then(function(zrxBalance){
        after_s3dZrxBalance = zrxBalance;
        assert.equal(equalNumber(after_s3dZrxBalance , before_s3dZrxBalance), true, "s3dZrxExpectGet is not same");      
        return S3DProtocolInstance.totalSupplyOfOneToken.call("zrx");
    }).then(function(zrxSupply){
        after_s3dZrxTotalSupply = zrxSupply;
        assert.equal(equalNumber(after_s3dZrxTotalSupply , before_s3dZrxTotalSupply - s3dSellAmount), true, "s3dZrxExpectGet is not same"); 
    })
  });

  it("should withdraw eth correctly", function(){

    var before_ethBalance = 0;
    var before_dividends = 0;
    var after_dividends = 0;
    var after_ethBalance = 0;

    var withDrawAmount = 0;

    return S3DProtocolInstance.dividendsOf.call("eth", notOwnerAccount).then(function(balance){
        before_dividends = balance;
        withDrawAmount = before_dividends / 2;
        return web3.eth.getBalance(notOwnerAccount);
    }).then(function(ethBalance){
        before_ethBalance  = ethBalance;
        return S3DProtocolInstance.withdraw("eth", withDrawAmount, {from: notOwnerAccount, value: 0});
    }).then(function(){
        return S3DProtocolInstance.dividendsOf.call("eth", notOwnerAccount);
    }).then(function(dividends){
        after_dividends = dividends;
        assert.equal(equalNumber(after_dividends , (before_dividends - withDrawAmount)), true, "ethDividends is not same");
        return web3.eth.getBalance(notOwnerAccount);
    }).then(function(ethBalance){
        //有gas 不准确
        // after_ethBalance = ethBalance;
        // var final = after_ethBalance.minus(before_ethBalance).toNumber()
        // console.log(final);
        // console.log(withDrawAmount);
        // assert.equal(equalNumber(final , withDrawAmount), true, "ethBalance is not same");
    })
  });

  it("should withdraw seele correctly", function(){

    var before_seeleBalance = 0;
    var before_dividends = 0;
    var after_dividends = 0;
    var after_seeleBalance = 0;

    var withDrawAmount = 0;

    return S3DProtocolInstance.dividendsOf.call("seele", notOwnerAccount).then(function(balance){
        before_dividends = balance;
        withDrawAmount = before_dividends / 10;
        return SeeleTokenInst.balanceOf.call(notOwnerAccount);
    }).then(function(seeleBalance){
        before_seeleBalance  = seeleBalance;
        return S3DProtocolInstance.withdraw("seele", withDrawAmount, {from: notOwnerAccount, value: 0});
    }).then(function(){
        return S3DProtocolInstance.dividendsOf.call("seele", notOwnerAccount);
    }).then(function(dividends){
        after_dividends = dividends;
        assert.equal(equalNumber(after_dividends , (before_dividends - withDrawAmount)), true, "seeleDividends is not same");
        return SeeleTokenInst.balanceOf.call(notOwnerAccount);
    }).then(function(seeleBalance){
        after_seeleBalance = seeleBalance;
        assert.equal(equalNumber(after_seeleBalance , (before_seeleBalance + withDrawAmount)), true, "seeleBalance is not same");
    })
  });

  it("should withdraw omg correctly", function(){

    var before_omgBalance = 0;
    var before_dividends = 0;
    var after_dividends = 0;
    var after_omgBalance = 0;

    var withDrawAmount = 0;

    return S3DProtocolInstance.dividendsOf.call("omg", notOwnerAccount).then(function(balance){
        before_dividends = balance;
        withDrawAmount = before_dividends / 10;
        return OMGTokenInst.balanceOf.call(notOwnerAccount);
    }).then(function(omgBalance){
        before_omgBalance  = omgBalance;
        return S3DProtocolInstance.withdraw("omg", withDrawAmount, {from: notOwnerAccount, value: 0});
    }).then(function(){
        return S3DProtocolInstance.dividendsOf.call("omg", notOwnerAccount, {from: notOwnerAccount, value: 0});
    }).then(function(dividends){
        after_dividends = dividends;
        assert.equal(equalNumber(after_dividends , (before_dividends - withDrawAmount)), true, "omgDividends is not same");
        return OMGTokenInst.balanceOf.call(notOwnerAccount);
    }).then(function(omgBalance){
        after_omgBalance = omgBalance;
        assert.equal(equalNumber(after_omgBalance , (before_omgBalance + withDrawAmount)), true, "omgBalance is not same");
    })
  });

  it("should withdraw zrx correctly", function(){

    var before_zrxBalance = 0;
    var before_dividends = 0;
    var after_dividends = 0;
    var after_zrxBalance = 0;

    var withDrawAmount = 0;

    return S3DProtocolInstance.dividendsOf.call("zrx", notOwnerAccount).then(function(balance){
        before_dividends = balance;
        withDrawAmount = before_dividends / 10;
        return ZRXTokenInst.balanceOf.call(notOwnerAccount);
    }).then(function(zrxBalance){
        before_zrxBalance  = zrxBalance;
        return S3DProtocolInstance.withdraw("zrx", withDrawAmount, {from: notOwnerAccount, value: 0});
    }).then(function(){
        return S3DProtocolInstance.dividendsOf.call("zrx", notOwnerAccount);
    }).then(function(dividends){
        after_dividends = dividends;
        assert.equal(equalNumber(after_dividends , (before_dividends - withDrawAmount)), true, "zrxDividends is not same");
        return ZRXTokenInst.balanceOf.call(notOwnerAccount);
    }).then(function(zrxBalance){
        after_zrxBalance = zrxBalance;
        assert.equal(equalNumber(after_zrxBalance , (before_zrxBalance + withDrawAmount)), true, "zrxBalance is not same");
    })
  });

  it("should reinvest eth correctly", function(){

    var before_ethBalance = 0;
    var before_dividends = 0;
    var after_dividends = 0;
    var after_ethBalance = 0;

    var withDrawAmount = 0;

    return S3DProtocolInstance.dividendsOf.call("eth", notOwnerAccount).then(function(balance){
        before_dividends = balance;
        withDrawAmount = before_dividends.dividedBy(2).toNumber();
        return web3.eth.getBalance(notOwnerAccount);
    }).then(function(ethBalance){
        before_ethBalance  = ethBalance;
        return S3DProtocolInstance.reinvest("eth", withDrawAmount, {from: notOwnerAccount, value: 0});
    }).then(function(){
        return S3DProtocolInstance.dividendsOf.call("eth", notOwnerAccount);
    }).then(function(dividends){
        after_dividends = dividends;
        assert.equal(after_dividends.toNumber() > withDrawAmount, true, "ethDividends is not same");
        return web3.eth.getBalance(notOwnerAccount);
    }).then(function(ethBalance){
        //有gas 不准确
        // after_ethBalance = ethBalance;
        // var final = after_ethBalance.minus(before_ethBalance).toNumber()
        // console.log(final);
        // console.log(withDrawAmount);
        // assert.equal(equalNumber(final , withDrawAmount), true, "ethBalance is not same");
    })
  });

  it("should reinvest seele correctly", function(){

    var before_seeleBalance = 0;
    var before_dividends = 0;
    var after_dividends = 0;
    var after_seeleBalance = 0;

    var withDrawAmount = 0;

    return S3DProtocolInstance.dividendsOf.call("seele", notOwnerAccount).then(function(balance){
        before_dividends = balance;
        withDrawAmount = before_dividends.dividedBy(2).toNumber();
        return SeeleTokenInst.balanceOf.call(notOwnerAccount);
    }).then(function(seeleBalance){
        before_seeleBalance  = seeleBalance;
        return S3DProtocolInstance.reinvest("seele", withDrawAmount, {from: notOwnerAccount, value: 0});
    }).then(function(){
        return S3DProtocolInstance.dividendsOf.call("seele", notOwnerAccount);
    }).then(function(dividends){
        after_dividends = dividends;
        assert.equal(after_dividends.toNumber() > withDrawAmount, true, "seeleDividends is not same");
        return SeeleTokenInst.balanceOf.call(notOwnerAccount);
    }).then(function(seeleBalance){
        after_seeleBalance = seeleBalance;
        assert.equal(equalNumber(after_seeleBalance , (before_seeleBalance + withDrawAmount)), true, "seeleBalance is not same");
    })
  });

  it("should reinvest omg correctly", function(){

    var before_omgBalance = 0;
    var before_dividends = 0;
    var after_dividends = 0;
    var after_omgBalance = 0;

    var withDrawAmount = 0;

    return S3DProtocolInstance.dividendsOf.call("omg", notOwnerAccount).then(function(balance){
        before_dividends = balance;
        withDrawAmount = before_dividends.dividedBy(2).toNumber();
        return OMGTokenInst.balanceOf.call(notOwnerAccount);
    }).then(function(omgBalance){
        before_omgBalance  = omgBalance;
        return S3DProtocolInstance.reinvest("omg", withDrawAmount, {from: notOwnerAccount, value: 0});
    }).then(function(){
        return S3DProtocolInstance.dividendsOf.call("omg", notOwnerAccount, {from: notOwnerAccount, value: 0});
    }).then(function(dividends){
        after_dividends = dividends;
        assert.equal(after_dividends.toNumber() > withDrawAmount, true, "omgDividends is not same");
        return OMGTokenInst.balanceOf.call(notOwnerAccount);
    }).then(function(omgBalance){
        after_omgBalance = omgBalance;
        assert.equal(equalNumber(after_omgBalance , (before_omgBalance + withDrawAmount)), true, "omgBalance is not same");
    })
  });

  it("should reinvest zrx correctly", function(){

    var before_zrxBalance = 0;
    var before_dividends = 0;
    var after_dividends = 0;
    var after_zrxBalance = 0;

    var withDrawAmount = 0;

    return S3DProtocolInstance.dividendsOf.call("zrx", notOwnerAccount).then(function(balance){
        before_dividends = balance;
        withDrawAmount = before_dividends.dividedBy(2).toNumber();
        return ZRXTokenInst.balanceOf.call(notOwnerAccount);
    }).then(function(zrxBalance){
        before_zrxBalance  = zrxBalance;
        return S3DProtocolInstance.reinvest("zrx", withDrawAmount, {from: notOwnerAccount, value: 0});
    }).then(function(){
        return S3DProtocolInstance.dividendsOf.call("zrx", notOwnerAccount);
    }).then(function(dividends){
        after_dividends = dividends;
        assert.equal(after_dividends.toNumber() > withDrawAmount, true, "zrxDividends is not same");
        return ZRXTokenInst.balanceOf.call(notOwnerAccount);
    }).then(function(zrxBalance){
        after_zrxBalance = zrxBalance;
        assert.equal(equalNumber(after_zrxBalance , (before_zrxBalance + withDrawAmount)), true, "zrxBalance is not same");
    })
  });

  it("should withdrawall correctly", function(){

    var before_ethBalance = 0;
    var before_seeleBalance = 0;
    var before_omgBalance = 0;
    var before_zrxBalance = 0;

    var before_ethdividends = 0;
    var before_seeledividends = 0;
    var before_omgdividends = 0;
    var before_zrxdividends = 0;

    var after_ethdividends = 0;
    var after_seeledividends = 0;
    var after_omgdividends = 0;
    var after_zrxdividends = 0;

    var after_ethBalance = 0;
    var after_seeleBalance = 0;
    var after_omgBalance = 0;
    var after_zrxBalance = 0; 

    return S3DProtocolInstance.dividendsOf.call("eth", notOwnerAccount).then(function(dividends){
        before_ethdividends = dividends;
        return S3DProtocolInstance.dividendsOf.call("seele", notOwnerAccount);
    }).then(function(dividends){
        before_seeledividends = dividends;
        return S3DProtocolInstance.dividendsOf.call("omg", notOwnerAccount);       
    }).then(function(dividends){
        before_omgdividends = dividends;
        return S3DProtocolInstance.dividendsOf.call("zrx", notOwnerAccount);            
    }).then(function(dividends){
        before_zrxdividends = dividends;
        return web3.eth.getBalance(notOwnerAccount);
    }).then(function(balance){
        before_ethBalance = balance;
        return SeeleTokenInst.balanceOf.call(notOwnerAccount);
    }).then(function(balance){
        before_seeleBalance = balance;
        return OMGTokenInst.balanceOf.call(notOwnerAccount);
    }).then(function(balance){
        before_omgBalance = balance;
        return ZRXTokenInst.balanceOf.call(notOwnerAccount);
    }).then(function(balance){
        before_zrxBalance = balance;

        return S3DProtocolInstance.withdrawAll({from: notOwnerAccount, value: 0});
    }).then(function(){
        return S3DProtocolInstance.dividendsOf.call("eth", notOwnerAccount)
    }).then(function(dividends){
        before_ethdividends = dividends;
        return S3DProtocolInstance.dividendsOf.call("seele", notOwnerAccount);
    }).then(function(dividends){
        before_seeledividends = dividends;
        return S3DProtocolInstance.dividendsOf.call("omg", notOwnerAccount);       
    }).then(function(dividends){
        before_omgdividends = dividends;
        return S3DProtocolInstance.dividendsOf.call("zrx", notOwnerAccount);            
    }).then(function(dividends){
        before_zrxdividends = dividends;
        return web3.eth.getBalance(notOwnerAccount);
    }).then(function(balance){
        before_ethBalance = balance;
        return SeeleTokenInst.balanceOf.call(notOwnerAccount);
    }).then(function(balance){
        before_seeleBalance = balance;
        return OMGTokenInst.balanceOf.call(notOwnerAccount);
    }).then(function(balance){
        before_omgBalance = balance;
        return ZRXTokenInst.balanceOf.call(notOwnerAccount);
    }).then(function(balance){
        before_zrxBalance = balance;
    });
  });

  it("should arbitrageTokens seele-eth correctly", function(){

    var before_seeleS3dBalance = 0;
    var after_seeleS3dBalance = 0;
    var before_ethS3dBalance = 0;
    var after_ethS3dBalance = 0;
    var before_seeleS3dTotoalSupply = 0;
    var after_seeleS3dTotalSupply = 0;
    var before_ethS3dTotalSupply = 0;
    var after_ethS3dTotalSupply = 0;
    var before_ethBalance = 0;
    var after_ethBalance = 0;

    var arbitrageTokensAmount = 0;
    var ethArbitrageTokensAmount = 0;
    var ethReceived = 0;

    return S3DProtocolInstance.balanceOfOneToken.call("seele", notOwnerAccount).then(function(balance){
        before_seeleS3dBalance = balance;
        return S3DProtocolInstance.totalSupplyOfOneToken.call("seele");
    }).then(function(totalSupply){
        before_seeleS3dTotoalSupply = totalSupply;
        return S3DProtocolInstance.balanceOfOneToken.call("eth", notOwnerAccount);
    }).then(function(balance){
        before_ethS3dBalance = balance;
        return S3DProtocolInstance.totalSupplyOfOneToken.call("eth");
    }).then(function(totalSupply){
        before_ethS3dTotalSupply = totalSupply;
        return web3.eth.getBalance(notOwnerAccount);
    }).then(function(balance){
        before_ethBalance = balance;

        arbitrageTokensAmount = before_seeleS3dBalance.dividedBy(5).toNumber();
        ethArbitrageTokensAmount = before_ethS3dTotalSupply.dividedBy(3).toNumber();
        if(arbitrageTokensAmount > ethArbitrageTokensAmount){
            arbitrageTokensAmount = ethArbitrageTokensAmount;
        }
        return S3DProtocolInstance.calculateBuyTokenReceived("eth", arbitrageTokensAmount);
    }).then(function(ethget){
        ethReceived = ethget;
        return S3DProtocolInstance.arbitrageTokens("seele", "eth", arbitrageTokensAmount, {from: notOwnerAccount, value: 0});
    }).then(function(){
        return S3DProtocolInstance.balanceOfOneToken.call("seele", notOwnerAccount);
    }).then(function(balance){
        after_seeleS3dBalance = balance;
        return S3DProtocolInstance.totalSupplyOfOneToken.call("seele");
    }).then(function(totalSupply){
        after_seeleS3dTotalSupply = totalSupply;
        return S3DProtocolInstance.balanceOfOneToken.call("eth", notOwnerAccount);
    }).then(function(balance){
        after_ethS3dBalance = balance;
        return S3DProtocolInstance.totalSupplyOfOneToken.call("eth");
    }).then(function(totalSupply){
        after_ethS3dTotalSupply = totalSupply;
        return web3.eth.getBalance(notOwnerAccount);
    }).then(function(balance){
        after_ethBalance = balance;
      
        assert.equal(equalNumber(before_seeleS3dBalance.minus(after_seeleS3dBalance).toNumber(), ( arbitrageTokensAmount)), true, "seeleS3dBalance  is not same");
        assert.equal(equalNumber(before_ethS3dBalance.toNumber() , after_ethS3dBalance.toNumber()), true, "ethS3dBalance  is not same");
        assert.equal(equalNumber(before_seeleS3dTotoalSupply.minus(after_seeleS3dTotalSupply).toNumber() , ( arbitrageTokensAmount)), true, "seeleS3dTotalSupply  is not same");
        assert.equal(equalNumber(before_ethS3dTotalSupply , after_ethS3dTotalSupply), true, "ethS3dTotalSupply  is not same");
        
        //assert.equal(after_ethBalance.comparedTo(before_ethBalance), true, "ethBalance  is not same");
    })
  });

  it("should arbitrageTokens omg-eth correctly", function(){

    var before_omgS3dBalance = 0;
    var after_omgS3dBalance = 0;
    var before_ethS3dBalance = 0;
    var after_ethS3dBalance = 0;
    var before_omgS3dTotoalSupply = 0;
    var after_omgS3dTotalSupply = 0;
    var before_ethS3dTotalSupply = 0;
    var after_ethS3dTotalSupply = 0;
    var before_ethBalance = 0;
    var after_ethBalance = 0;

    var arbitrageTokensAmount = 0;
    var ethArbitrageTokensAmount = 0;
    var ethReceived = 0;

    return S3DProtocolInstance.balanceOfOneToken.call("omg", notOwnerAccount).then(function(balance){
        before_omgS3dBalance = balance;
        return S3DProtocolInstance.totalSupplyOfOneToken.call("omg");
    }).then(function(totalSupply){
        before_omgS3dTotoalSupply = totalSupply;
        return S3DProtocolInstance.balanceOfOneToken.call("eth", notOwnerAccount);
    }).then(function(balance){
        before_ethS3dBalance = balance;
        return S3DProtocolInstance.totalSupplyOfOneToken.call("eth");
    }).then(function(totalSupply){
        before_ethS3dTotalSupply = totalSupply;
        return web3.eth.getBalance(notOwnerAccount);
    }).then(function(balance){
        before_ethBalance = balance;

        arbitrageTokensAmount = before_omgS3dBalance.dividedBy(5).toNumber();
        ethArbitrageTokensAmount = before_ethS3dTotalSupply.dividedBy(3).toNumber();
        if(arbitrageTokensAmount > ethArbitrageTokensAmount){
            arbitrageTokensAmount = ethArbitrageTokensAmount;
        }
        return S3DProtocolInstance.calculateBuyTokenReceived("eth", arbitrageTokensAmount);
    }).then(function(ethget){
        ethReceived = ethget;
        return S3DProtocolInstance.arbitrageTokens("omg", "eth", arbitrageTokensAmount, {from: notOwnerAccount, value: 0});
    }).then(function(){
        return S3DProtocolInstance.balanceOfOneToken.call("omg", notOwnerAccount);
    }).then(function(balance){
        after_omgS3dBalance = balance;
        return S3DProtocolInstance.totalSupplyOfOneToken.call("omg");
    }).then(function(totalSupply){
        after_omgS3dTotalSupply = totalSupply;
        return S3DProtocolInstance.balanceOfOneToken.call("eth", notOwnerAccount);
    }).then(function(balance){
        after_ethS3dBalance = balance;
        return S3DProtocolInstance.totalSupplyOfOneToken.call("eth");
    }).then(function(totalSupply){
        after_ethS3dTotalSupply = totalSupply;
        return web3.eth.getBalance(notOwnerAccount);
    }).then(function(balance){
        after_ethBalance = balance;

        assert.equal(equalNumber(before_omgS3dBalance.minus(after_omgS3dBalance).toNumber(), ( arbitrageTokensAmount)), true, "omgS3dBalance  is not same");
        assert.equal(equalNumber(before_ethS3dBalance.toNumber() , after_ethS3dBalance.toNumber()), true, "ethS3dBalance  is not same");
        assert.equal(equalNumber(before_omgS3dTotoalSupply.minus(after_omgS3dTotalSupply).toNumber() , ( arbitrageTokensAmount)), true, "omgS3dTotalSupply  is not same");
        assert.equal(equalNumber(before_ethS3dTotalSupply , after_ethS3dTotalSupply), true, "ethS3dTotalSupply  is not same");

        //assert.equal(after_ethBalance > before_ethBalance, true, "ethBalance  is not same");
    })
  });

  it("should arbitrageTokens zrx-eth correctly", function(){

    var before_zrxS3dBalance = 0;
    var after_zrxS3dBalance = 0;
    var before_ethS3dBalance = 0;
    var after_ethS3dBalance = 0;
    var before_zrxS3dTotoalSupply = 0;
    var after_zrxS3dTotalSupply = 0;
    var before_ethS3dTotalSupply = 0;
    var after_ethS3dTotalSupply = 0;
    var before_ethBalance = 0;
    var after_ethBalance = 0;

    var arbitrageTokensAmount = 0;
    var ethArbitrageTokensAmount = 0;
    var ethReceived = 0;

    return S3DProtocolInstance.balanceOfOneToken.call("zrx", notOwnerAccount).then(function(balance){
        before_zrxS3dBalance = balance;
        return S3DProtocolInstance.totalSupplyOfOneToken.call("zrx");
    }).then(function(totalSupply){
        before_zrxS3dTotoalSupply = totalSupply;
        return S3DProtocolInstance.balanceOfOneToken.call("eth", notOwnerAccount);
    }).then(function(balance){
        before_ethS3dBalance = balance;
        return S3DProtocolInstance.totalSupplyOfOneToken.call("eth");
    }).then(function(totalSupply){
        before_ethS3dTotalSupply = totalSupply;
        return web3.eth.getBalance(notOwnerAccount);
    }).then(function(balance){
        before_ethBalance = balance;

        arbitrageTokensAmount = before_zrxS3dBalance.dividedBy(5).toNumber();
        ethArbitrageTokensAmount = before_ethS3dTotalSupply.dividedBy(3).toNumber();
        if(arbitrageTokensAmount > ethArbitrageTokensAmount){
            arbitrageTokensAmount = ethArbitrageTokensAmount;
        }
        return S3DProtocolInstance.calculateBuyTokenReceived("eth", arbitrageTokensAmount);
    }).then(function(ethget){
        ethReceived = ethget;
        return S3DProtocolInstance.arbitrageTokens("zrx", "eth", arbitrageTokensAmount, {from: notOwnerAccount, value: 0});
    }).then(function(){
        return S3DProtocolInstance.balanceOfOneToken.call("zrx", notOwnerAccount);
    }).then(function(balance){
        after_zrxS3dBalance = balance;
        return S3DProtocolInstance.totalSupplyOfOneToken.call("zrx");
    }).then(function(totalSupply){
        after_zrxS3dTotalSupply = totalSupply;
        return S3DProtocolInstance.balanceOfOneToken.call("eth", notOwnerAccount);
    }).then(function(balance){
        after_ethS3dBalance = balance;
        return S3DProtocolInstance.totalSupplyOfOneToken.call("eth");
    }).then(function(totalSupply){
        after_ethS3dTotalSupply = totalSupply;
        return web3.eth.getBalance(notOwnerAccount);
    }).then(function(balance){
        after_ethBalance = balance;

        assert.equal(equalNumber(before_zrxS3dBalance.minus(after_zrxS3dBalance).toNumber(), ( arbitrageTokensAmount)), true, "zrxS3dBalance  is not same");
        assert.equal(equalNumber(before_ethS3dBalance.toNumber() , after_ethS3dBalance.toNumber()), true, "ethS3dBalance  is not same");
        assert.equal(equalNumber(before_zrxS3dTotoalSupply.minus(after_zrxS3dTotalSupply).toNumber() , ( arbitrageTokensAmount)), true, "zrxS3dTotalSupply  is not same");
        assert.equal(equalNumber(before_ethS3dTotalSupply , after_ethS3dTotalSupply), true, "ethS3dTotalSupply  is not same");

        //assert.equal(after_ethBalance > before_ethBalance, true, "ethBalance  is not same");
    })
  });

  it("should arbitrageTokens eth-seele correctly", function(){

    var before_ethS3dBalance = 0;
    var after_ethS3dBalance = 0;
    var before_seeleS3dBalance = 0;
    var after_seeleS3dBalance = 0;
    var before_ethS3dTotoalSupply = 0;
    var after_ethS3dTotalSupply = 0;
    var before_seeleS3dTotalSupply = 0;
    var after_seeleS3dTotalSupply = 0;
    var before_seeleBalance = 0;
    var after_seeleBalance = 0;

    var arbitrageTokensAmount = 0;
    var seeleArbitrageTokensAmount = 0;
    var seeleReceived = 0;

    return S3DProtocolInstance.balanceOfOneToken.call("eth", notOwnerAccount).then(function(balance){
        before_ethS3dBalance = balance;
        return S3DProtocolInstance.totalSupplyOfOneToken.call("eth");
    }).then(function(totalSupply){
        before_ethS3dTotoalSupply = totalSupply;
        return S3DProtocolInstance.balanceOfOneToken.call("seele", notOwnerAccount);
    }).then(function(balance){
        before_seeleS3dBalance = balance;
        return S3DProtocolInstance.totalSupplyOfOneToken.call("seele");
    }).then(function(totalSupply){
        before_seeleS3dTotalSupply = totalSupply;  
        return SeeleTokenInst.balanceOf.call(notOwnerAccount);
    }).then(function(balance){
        before_seeleBalance = balance;

        arbitrageTokensAmount = before_ethS3dBalance.dividedBy(5).toNumber();
        seeleArbitrageTokensAmount = before_seeleS3dTotalSupply.dividedBy(3).toNumber();
        if(arbitrageTokensAmount > seeleArbitrageTokensAmount){
            arbitrageTokensAmount = seeleArbitrageTokensAmount;
        }
        return S3DProtocolInstance.calculateBuyTokenReceived("seele", arbitrageTokensAmount);
    }).then(function(ethget){
        seeleReceived = ethget;
        return S3DProtocolInstance.arbitrageTokens("eth", "seele", arbitrageTokensAmount, {from: notOwnerAccount, value: 0});
    }).then(function(){
        return S3DProtocolInstance.balanceOfOneToken.call("eth", notOwnerAccount);
    }).then(function(balance){
        after_ethS3dBalance = balance;
        return S3DProtocolInstance.totalSupplyOfOneToken.call("eth");
    }).then(function(totalSupply){
        after_ethS3dTotalSupply = totalSupply;
        return S3DProtocolInstance.balanceOfOneToken.call("seele", notOwnerAccount);
    }).then(function(balance){
        after_seeleS3dBalance = balance;
        return S3DProtocolInstance.totalSupplyOfOneToken.call("seele");
    }).then(function(totalSupply){
        after_seeleS3dTotalSupply = totalSupply;
        return SeeleTokenInst.balanceOf.call(notOwnerAccount);
    }).then(function(balance){
        after_seeleBalance = balance;

        assert.equal(equalNumber(before_ethS3dBalance.minus(after_ethS3dBalance).toNumber(), ( arbitrageTokensAmount)), true, "ethS3dBalance  is not same");
        assert.equal(equalNumber(before_seeleS3dBalance.toNumber() , after_seeleS3dBalance.toNumber()), true, "ethSeeleBalance  is not same");
        assert.equal(equalNumber(before_ethS3dTotoalSupply.minus(after_ethS3dTotalSupply).toNumber() , ( arbitrageTokensAmount)), true, "ethS3dTotalSupply  is not same");
        assert.equal(equalNumber(before_seeleS3dTotalSupply , after_seeleS3dTotalSupply), true, "seeleS3dTotalSupply  is not same");

        assert.equal(equalNumber(after_seeleBalance.minus(before_seeleBalance).toNumber(), seeleReceived), true, "seeleBalance  is not same");
    })
  });

  it("should arbitrageTokens omg-seele correctly", function(){

    var before_omgS3dBalance = 0;
    var after_omgS3dBalance = 0;
    var before_seeleS3dBalance = 0;
    var after_seeleS3dBalance = 0;
    var before_omgS3dTotoalSupply = 0;
    var after_omgS3dTotalSupply = 0;
    var before_seeleS3dTotalSupply = 0;
    var after_seeleS3dTotalSupply = 0;
    var before_seeleBalance = 0;
    var after_seeleBalance = 0;

    var arbitrageTokensAmount = 0;
    var seeleArbitrageTokensAmount = 0;
    var seeleReceived = 0;

    return S3DProtocolInstance.balanceOfOneToken.call("omg", notOwnerAccount).then(function(balance){
        before_omgS3dBalance = balance;
        return S3DProtocolInstance.totalSupplyOfOneToken.call("omg");
    }).then(function(totalSupply){
        before_omgS3dTotoalSupply = totalSupply;
        return S3DProtocolInstance.balanceOfOneToken.call("seele", notOwnerAccount);
    }).then(function(balance){
        before_seeleS3dBalance = balance;
        return S3DProtocolInstance.totalSupplyOfOneToken.call("seele");
    }).then(function(totalSupply){
        before_seeleS3dTotalSupply = totalSupply;  
        return SeeleTokenInst.balanceOf.call(notOwnerAccount);
    }).then(function(balance){
        before_seeleBalance = balance;

        arbitrageTokensAmount = before_omgS3dBalance.dividedBy(5).toNumber();
        seeleArbitrageTokensAmount = before_seeleS3dTotalSupply.dividedBy(3).toNumber();
        if(arbitrageTokensAmount > seeleArbitrageTokensAmount){
            arbitrageTokensAmount = seeleArbitrageTokensAmount;
        }
        return S3DProtocolInstance.calculateBuyTokenReceived("seele", arbitrageTokensAmount);
    }).then(function(seeleget){
        seeleReceived = seeleget;
        return S3DProtocolInstance.arbitrageTokens("omg", "seele", arbitrageTokensAmount, {from: notOwnerAccount, value: 0});
    }).then(function(){
        return S3DProtocolInstance.balanceOfOneToken.call("omg", notOwnerAccount);
    }).then(function(balance){
        after_omgS3dBalance = balance;
        return S3DProtocolInstance.totalSupplyOfOneToken.call("omg");
    }).then(function(totalSupply){
        after_omgS3dTotalSupply = totalSupply;
        return S3DProtocolInstance.balanceOfOneToken.call("seele", notOwnerAccount);
    }).then(function(balance){
        after_seeleS3dBalance = balance;
        return S3DProtocolInstance.totalSupplyOfOneToken.call("seele");
    }).then(function(totalSupply){
        after_seeleS3dTotalSupply = totalSupply;
        return SeeleTokenInst.balanceOf.call(notOwnerAccount);
    }).then(function(balance){
        after_seeleBalance = balance;

        assert.equal(equalNumber(before_omgS3dBalance.minus(after_omgS3dBalance).toNumber(), ( arbitrageTokensAmount)), true, "omgS3dBalance  is not same");
        assert.equal(equalNumber(before_seeleS3dBalance.toNumber() , after_seeleS3dBalance.toNumber()), true, "ethSeeleBalance  is not same");
        assert.equal(equalNumber(before_omgS3dTotoalSupply.minus(after_omgS3dTotalSupply).toNumber() , ( arbitrageTokensAmount)), true, "omgS3dTotalSupply  is not same");
        assert.equal(equalNumber(before_seeleS3dTotalSupply , after_seeleS3dTotalSupply), true, "seeleS3dTotalSupply  is not same");

        assert.equal(equalNumber(after_seeleBalance.minus(before_seeleBalance).toNumber(), seeleReceived), true, "seeleBalance  is not same");
    })
  });

  it("should arbitrageTokens zrx-seele correctly", function(){

    var before_zrxS3dBalance = 0;
    var after_zrxS3dBalance = 0;
    var before_seeleS3dBalance = 0;
    var after_seeleS3dBalance = 0;
    var before_zrxS3dTotoalSupply = 0;
    var after_zrxS3dTotalSupply = 0;
    var before_seeleS3dTotalSupply = 0;
    var after_seeleS3dTotalSupply = 0;
    var before_seeleBalance = 0;
    var after_seeleBalance = 0;

    var arbitrageTokensAmount = 0;
    var seeleArbitrageTokensAmount = 0;
    var seeleReceived = 0;

    return S3DProtocolInstance.balanceOfOneToken.call("zrx", notOwnerAccount).then(function(balance){
        before_zrxS3dBalance = balance;
        return S3DProtocolInstance.totalSupplyOfOneToken.call("zrx");
    }).then(function(totalSupply){
        before_zrxS3dTotoalSupply = totalSupply;
        return S3DProtocolInstance.balanceOfOneToken.call("seele", notOwnerAccount);
    }).then(function(balance){
        before_seeleS3dBalance = balance;
        return S3DProtocolInstance.totalSupplyOfOneToken.call("seele");
    }).then(function(totalSupply){
        before_seeleS3dTotalSupply = totalSupply;  
        return SeeleTokenInst.balanceOf.call(notOwnerAccount);
    }).then(function(balance){
        before_seeleBalance = balance;

        arbitrageTokensAmount = before_zrxS3dBalance.dividedBy(5).toNumber();
        seeleArbitrageTokensAmount = before_seeleS3dTotalSupply.dividedBy(3).toNumber();
        if(arbitrageTokensAmount > seeleArbitrageTokensAmount){
            arbitrageTokensAmount = seeleArbitrageTokensAmount;
        }
        return S3DProtocolInstance.calculateBuyTokenReceived("seele", arbitrageTokensAmount);
    }).then(function(seeleget){
        seeleReceived = seeleget;
        return S3DProtocolInstance.arbitrageTokens("zrx", "seele", arbitrageTokensAmount, {from: notOwnerAccount, value: 0});
    }).then(function(){
        return S3DProtocolInstance.balanceOfOneToken.call("zrx", notOwnerAccount);
    }).then(function(balance){
        after_zrxS3dBalance = balance;
        return S3DProtocolInstance.totalSupplyOfOneToken.call("zrx");
    }).then(function(totalSupply){
        after_zrxS3dTotalSupply = totalSupply;
        return S3DProtocolInstance.balanceOfOneToken.call("seele", notOwnerAccount);
    }).then(function(balance){
        after_seeleS3dBalance = balance;
        return S3DProtocolInstance.totalSupplyOfOneToken.call("seele");
    }).then(function(totalSupply){
        after_seeleS3dTotalSupply = totalSupply;
        return SeeleTokenInst.balanceOf.call(notOwnerAccount);
    }).then(function(balance){
        after_seeleBalance = balance;

        assert.equal(equalNumber(before_zrxS3dBalance.minus(after_zrxS3dBalance).toNumber(), ( arbitrageTokensAmount)), true, "zrxS3dBalance  is not same");
        assert.equal(equalNumber(before_seeleS3dBalance.toNumber() , after_seeleS3dBalance.toNumber()), true, "ethSeeleBalance  is not same");
        assert.equal(equalNumber(before_zrxS3dTotoalSupply.minus(after_zrxS3dTotalSupply).toNumber() , ( arbitrageTokensAmount)), true, "zrxS3dTotalSupply  is not same");
        assert.equal(equalNumber(before_seeleS3dTotalSupply , after_seeleS3dTotalSupply), true, "seeleS3dTotalSupply  is not same");

        assert.equal(equalNumber(after_seeleBalance.minus(before_seeleBalance).toNumber(), seeleReceived), true, "seeleBalance  is not same");
    })
  });


  it("should arbitrageTokens eth-omg correctly", function(){

    var before_ethS3dBalance = 0;
    var after_ethS3dBalance = 0;
    var before_omgS3dBalance = 0;
    var after_omgS3dBalance = 0;
    var before_ethS3dTotoalSupply = 0;
    var after_ethS3dTotalSupply = 0;
    var before_omgS3dTotalSupply = 0;
    var after_omgS3dTotalSupply = 0;
    var before_omgBalance = 0;
    var after_omgBalance = 0;

    var arbitrageTokensAmount = 0;
    var omgArbitrageTokensAmount = 0;
    var omgReceived = 0;

    return S3DProtocolInstance.balanceOfOneToken.call("eth", notOwnerAccount).then(function(balance){
        before_ethS3dBalance = balance;
        return S3DProtocolInstance.totalSupplyOfOneToken.call("eth");
    }).then(function(totalSupply){
        before_ethS3dTotoalSupply = totalSupply;
        return S3DProtocolInstance.balanceOfOneToken.call("omg", notOwnerAccount);
    }).then(function(balance){
        before_omgS3dBalance = balance;
        return S3DProtocolInstance.totalSupplyOfOneToken.call("omg");
    }).then(function(totalSupply){
        before_omgS3dTotalSupply = totalSupply;  
        return OMGTokenInst.balanceOf.call(notOwnerAccount);
    }).then(function(balance){
        before_omgBalance = balance;

        arbitrageTokensAmount = before_ethS3dBalance.dividedBy(5).toNumber();
        omgArbitrageTokensAmount = before_omgS3dTotalSupply.dividedBy(3).toNumber();
        if(arbitrageTokensAmount > omgArbitrageTokensAmount){
            arbitrageTokensAmount = omgArbitrageTokensAmount;
        }
        return S3DProtocolInstance.calculateBuyTokenReceived("omg", arbitrageTokensAmount);
    }).then(function(omgget){
        omgReceived = omgget;
        return S3DProtocolInstance.arbitrageTokens("eth", "omg", arbitrageTokensAmount, {from: notOwnerAccount, value: 0});
    }).then(function(){
        return S3DProtocolInstance.balanceOfOneToken.call("eth", notOwnerAccount);
    }).then(function(balance){
        after_ethS3dBalance = balance;
        return S3DProtocolInstance.totalSupplyOfOneToken.call("eth");
    }).then(function(totalSupply){
        after_ethS3dTotalSupply = totalSupply;
        return S3DProtocolInstance.balanceOfOneToken.call("omg", notOwnerAccount);
    }).then(function(balance){
        after_omgS3dBalance = balance;
        return S3DProtocolInstance.totalSupplyOfOneToken.call("omg");
    }).then(function(totalSupply){
        after_omgS3dTotalSupply = totalSupply;
        return OMGTokenInst.balanceOf.call(notOwnerAccount);
    }).then(function(balance){
        after_omgBalance = balance;

        assert.equal(equalNumber(before_ethS3dBalance.minus(after_ethS3dBalance).toNumber(), ( arbitrageTokensAmount)), true, "ethS3dBalance  is not same");
        assert.equal(equalNumber(before_omgS3dBalance.toNumber() , after_omgS3dBalance.toNumber()), true, "omgS3dBalance  is not same");
        assert.equal(equalNumber(before_ethS3dTotoalSupply.minus(after_ethS3dTotalSupply).toNumber() , ( arbitrageTokensAmount)), true, "ethS3dTotalSupply  is not same");
        assert.equal(equalNumber(before_omgS3dTotalSupply , after_omgS3dTotalSupply), true, "omgS3dTotalSupply  is not same");

        assert.equal(equalNumber(after_omgBalance.minus(before_omgBalance).toNumber(), omgReceived), true, "omgBalance  is not same");
    })
  });

  it("should arbitrageTokens seele-omg correctly", function(){

    var before_seeleS3dBalance = 0;
    var after_seeleS3dBalance = 0;
    var before_omgS3dBalance = 0;
    var after_omgS3dBalance = 0;
    var before_seeleS3dTotoalSupply = 0;
    var after_seeleS3dTotalSupply = 0;
    var before_omgS3dTotalSupply = 0;
    var after_omgS3dTotalSupply = 0;
    var before_omgBalance = 0;
    var after_omgBalance = 0;

    var arbitrageTokensAmount = 0;
    var omgArbitrageTokensAmount = 0;
    var omgReceived = 0;

    return S3DProtocolInstance.balanceOfOneToken.call("seele", notOwnerAccount).then(function(balance){
        before_seeleS3dBalance = balance;
        return S3DProtocolInstance.totalSupplyOfOneToken.call("seele");
    }).then(function(totalSupply){
        before_seeleS3dTotoalSupply = totalSupply;
        return S3DProtocolInstance.balanceOfOneToken.call("omg", notOwnerAccount);
    }).then(function(balance){
        before_omgS3dBalance = balance;
        return S3DProtocolInstance.totalSupplyOfOneToken.call("omg");
    }).then(function(totalSupply){
        before_omgS3dTotalSupply = totalSupply;  
        return OMGTokenInst.balanceOf.call(notOwnerAccount);
    }).then(function(balance){
        before_omgBalance = balance;

        arbitrageTokensAmount = before_seeleS3dBalance.dividedBy(5).toNumber();
        omgArbitrageTokensAmount = before_omgS3dTotalSupply.dividedBy(3).toNumber();
        if(arbitrageTokensAmount > omgArbitrageTokensAmount){
            arbitrageTokensAmount = omgArbitrageTokensAmount;
        }
        return S3DProtocolInstance.calculateBuyTokenReceived("omg", arbitrageTokensAmount);
    }).then(function(omgget){
        omgReceived = omgget;
        return S3DProtocolInstance.arbitrageTokens("seele", "omg", arbitrageTokensAmount, {from: notOwnerAccount, value: 0});
    }).then(function(){
        return S3DProtocolInstance.balanceOfOneToken.call("seele", notOwnerAccount);
    }).then(function(balance){
        after_seeleS3dBalance = balance;
        return S3DProtocolInstance.totalSupplyOfOneToken.call("seele");
    }).then(function(totalSupply){
        after_seeleS3dTotalSupply = totalSupply;
        return S3DProtocolInstance.balanceOfOneToken.call("omg", notOwnerAccount);
    }).then(function(balance){
        after_omgS3dBalance = balance;
        return S3DProtocolInstance.totalSupplyOfOneToken.call("omg");
    }).then(function(totalSupply){
        after_omgS3dTotalSupply = totalSupply;
        return OMGTokenInst.balanceOf.call(notOwnerAccount);
    }).then(function(balance){
        after_omgBalance = balance;

        assert.equal(equalNumber(before_seeleS3dBalance.minus(after_seeleS3dBalance).toNumber(), ( arbitrageTokensAmount)), true, "seeleS3dBalance  is not same");
        assert.equal(equalNumber(before_omgS3dBalance.toNumber() , after_omgS3dBalance.toNumber()), true, "omgS3dBalance  is not same");
        assert.equal(equalNumber(before_seeleS3dTotoalSupply.minus(after_seeleS3dTotalSupply).toNumber() , ( arbitrageTokensAmount)), true, "seeleS3dTotalSupply  is not same");
        assert.equal(equalNumber(before_omgS3dTotalSupply , after_omgS3dTotalSupply), true, "omgS3dTotalSupply  is not same");

        assert.equal(equalNumber(after_omgBalance.minus(before_omgBalance).toNumber(), omgReceived), true, "omgBalance  is not same");
    })
  });

  it("should arbitrageTokens zrx-omg correctly", function(){

    var before_zrxS3dBalance = 0;
    var after_zrxS3dBalance = 0;
    var before_omgS3dBalance = 0;
    var after_omgS3dBalance = 0;
    var before_zrxS3dTotoalSupply = 0;
    var after_zrxS3dTotalSupply = 0;
    var before_omgS3dTotalSupply = 0;
    var after_omgS3dTotalSupply = 0;
    var before_omgBalance = 0;
    var after_omgBalance = 0;

    var arbitrageTokensAmount = 0;
    var omgArbitrageTokensAmount = 0;
    var omgReceived = 0;

    return S3DProtocolInstance.balanceOfOneToken.call("zrx", notOwnerAccount).then(function(balance){
        before_zrxS3dBalance = balance;
        return S3DProtocolInstance.totalSupplyOfOneToken.call("zrx");
    }).then(function(totalSupply){
        before_zrxS3dTotoalSupply = totalSupply;
        return S3DProtocolInstance.balanceOfOneToken.call("omg", notOwnerAccount);
    }).then(function(balance){
        before_omgS3dBalance = balance;
        return S3DProtocolInstance.totalSupplyOfOneToken.call("omg");
    }).then(function(totalSupply){
        before_omgS3dTotalSupply = totalSupply;  
        return OMGTokenInst.balanceOf.call(notOwnerAccount);
    }).then(function(balance){
        before_omgBalance = balance;

        arbitrageTokensAmount = before_zrxS3dBalance.dividedBy(5).toNumber();
        omgArbitrageTokensAmount = before_omgS3dTotalSupply.dividedBy(3).toNumber();
        if(arbitrageTokensAmount > omgArbitrageTokensAmount){
            arbitrageTokensAmount = omgArbitrageTokensAmount;
        }
        return S3DProtocolInstance.calculateBuyTokenReceived("omg", arbitrageTokensAmount);
    }).then(function(omgget){
        omgReceived = omgget;
        return S3DProtocolInstance.arbitrageTokens("zrx", "omg", arbitrageTokensAmount, {from: notOwnerAccount, value: 0});
    }).then(function(){
        return S3DProtocolInstance.balanceOfOneToken.call("zrx", notOwnerAccount);
    }).then(function(balance){
        after_zrxS3dBalance = balance;
        return S3DProtocolInstance.totalSupplyOfOneToken.call("zrx");
    }).then(function(totalSupply){
        after_zrxS3dTotalSupply = totalSupply;
        return S3DProtocolInstance.balanceOfOneToken.call("omg", notOwnerAccount);
    }).then(function(balance){
        after_omgS3dBalance = balance;
        return S3DProtocolInstance.totalSupplyOfOneToken.call("omg");
    }).then(function(totalSupply){
        after_omgS3dTotalSupply = totalSupply;
        return OMGTokenInst.balanceOf.call(notOwnerAccount);
    }).then(function(balance){
        after_omgBalance = balance;

        assert.equal(equalNumber(before_zrxS3dBalance.minus(after_zrxS3dBalance).toNumber(), ( arbitrageTokensAmount)), true, "zrxS3dBalance  is not same");
        assert.equal(equalNumber(before_omgS3dBalance.toNumber() , after_omgS3dBalance.toNumber()), true, "omgS3dBalance  is not same");
        assert.equal(equalNumber(before_zrxS3dTotoalSupply.minus(after_zrxS3dTotalSupply).toNumber() , ( arbitrageTokensAmount)), true, "zrxS3dTotalSupply  is not same");
        assert.equal(equalNumber(before_omgS3dTotalSupply , after_omgS3dTotalSupply), true, "omgS3dTotalSupply  is not same");

        assert.equal(equalNumber(after_omgBalance.minus(before_omgBalance).toNumber(), omgReceived), true, "omgBalance  is not same");
    })
  });
 
  it("should arbitrageTokens eth-zrx correctly", function(){

    var before_ethS3dBalance = 0;
    var after_ethS3dBalance = 0;
    var before_zrxS3dBalance = 0;
    var after_zrxS3dBalance = 0;
    var before_ethS3dTotoalSupply = 0;
    var after_ethS3dTotalSupply = 0;
    var before_zrxS3dTotalSupply = 0;
    var after_zrxS3dTotalSupply = 0;
    var before_zrxBalance = 0;
    var after_zrxBalance = 0;

    var arbitrageTokensAmount = 0;
    var zrxArbitrageTokensAmount = 0;
    var zrxReceived = 0;

    return S3DProtocolInstance.balanceOfOneToken.call("eth", notOwnerAccount).then(function(balance){
        before_ethS3dBalance = balance;
        return S3DProtocolInstance.totalSupplyOfOneToken.call("eth");
    }).then(function(totalSupply){
        before_ethS3dTotoalSupply = totalSupply;
        return S3DProtocolInstance.balanceOfOneToken.call("zrx", notOwnerAccount);
    }).then(function(balance){
        before_zrxS3dBalance = balance;
        return S3DProtocolInstance.totalSupplyOfOneToken.call("zrx");
    }).then(function(totalSupply){
        before_zrxS3dTotalSupply = totalSupply;  
        return ZRXTokenInst.balanceOf.call(notOwnerAccount);
    }).then(function(balance){
        before_zrxBalance = balance;

        arbitrageTokensAmount = before_ethS3dBalance.dividedBy(5).toNumber();
        zrxArbitrageTokensAmount = before_zrxS3dTotalSupply.dividedBy(3).toNumber();
        if(arbitrageTokensAmount > zrxArbitrageTokensAmount){
            arbitrageTokensAmount = zrxArbitrageTokensAmount;
        }
        return S3DProtocolInstance.calculateBuyTokenReceived("zrx", arbitrageTokensAmount);
    }).then(function(zrxget){
        zrxReceived = zrxget;
        return S3DProtocolInstance.arbitrageTokens("eth", "zrx", arbitrageTokensAmount, {from: notOwnerAccount, value: 0});
    }).then(function(){
        return S3DProtocolInstance.balanceOfOneToken.call("eth", notOwnerAccount);
    }).then(function(balance){
        after_ethS3dBalance = balance;
        return S3DProtocolInstance.totalSupplyOfOneToken.call("eth");
    }).then(function(totalSupply){
        after_ethS3dTotalSupply = totalSupply;
        return S3DProtocolInstance.balanceOfOneToken.call("zrx", notOwnerAccount);
    }).then(function(balance){
        after_zrxS3dBalance = balance;
        return S3DProtocolInstance.totalSupplyOfOneToken.call("zrx");
    }).then(function(totalSupply){
        after_zrxS3dTotalSupply = totalSupply;
        return ZRXTokenInst.balanceOf.call(notOwnerAccount);
    }).then(function(balance){
        after_zrxBalance = balance;

        assert.equal(equalNumber(before_ethS3dBalance.minus(after_ethS3dBalance).toNumber(), ( arbitrageTokensAmount)), true, "ethS3dBalance  is not same");
        assert.equal(equalNumber(before_zrxS3dBalance.toNumber() , after_zrxS3dBalance.toNumber()), true, "zrxS3dBalance  is not same");
        assert.equal(equalNumber(before_ethS3dTotoalSupply.minus(after_ethS3dTotalSupply).toNumber() , ( arbitrageTokensAmount)), true, "ethS3dTotalSupply  is not same");
        assert.equal(equalNumber(before_zrxS3dTotalSupply , after_zrxS3dTotalSupply), true, "zrxS3dTotalSupply  is not same");

        assert.equal(equalNumber(after_zrxBalance.minus(before_zrxBalance).toNumber(), zrxReceived), true, "zrxBalance  is not same");
    })
  });

  it("should arbitrageTokens seele-zrx correctly", function(){

    var before_seeleS3dBalance = 0;
    var after_seeleS3dBalance = 0;
    var before_zrxS3dBalance = 0;
    var after_zrxS3dBalance = 0;
    var before_seeleS3dTotoalSupply = 0;
    var after_seeleS3dTotalSupply = 0;
    var before_zrxS3dTotalSupply = 0;
    var after_zrxS3dTotalSupply = 0;
    var before_zrxBalance = 0;
    var after_zrxBalance = 0;

    var arbitrageTokensAmount = 0;
    var zrxArbitrageTokensAmount = 0;
    var zrxReceived = 0;

    return S3DProtocolInstance.balanceOfOneToken.call("seele", notOwnerAccount).then(function(balance){
        before_seeleS3dBalance = balance;
        return S3DProtocolInstance.totalSupplyOfOneToken.call("seele");
    }).then(function(totalSupply){
        before_seeleS3dTotoalSupply = totalSupply;
        return S3DProtocolInstance.balanceOfOneToken.call("zrx", notOwnerAccount);
    }).then(function(balance){
        before_zrxS3dBalance = balance;
        return S3DProtocolInstance.totalSupplyOfOneToken.call("zrx");
    }).then(function(totalSupply){
        before_zrxS3dTotalSupply = totalSupply;  
        return ZRXTokenInst.balanceOf.call(notOwnerAccount);
    }).then(function(balance){
        before_zrxBalance = balance;

        arbitrageTokensAmount = before_seeleS3dBalance.dividedBy(5).toNumber();
        zrxArbitrageTokensAmount = before_zrxS3dTotalSupply.dividedBy(3).toNumber();
        if(arbitrageTokensAmount > zrxArbitrageTokensAmount){
            arbitrageTokensAmount = zrxArbitrageTokensAmount;
        }
        return S3DProtocolInstance.calculateBuyTokenReceived("zrx", arbitrageTokensAmount);
    }).then(function(zrxget){
        zrxReceived = zrxget;
        return S3DProtocolInstance.arbitrageTokens("seele", "zrx", arbitrageTokensAmount, {from: notOwnerAccount, value: 0});
    }).then(function(){
        return S3DProtocolInstance.balanceOfOneToken.call("seele", notOwnerAccount);
    }).then(function(balance){
        after_seeleS3dBalance = balance;
        return S3DProtocolInstance.totalSupplyOfOneToken.call("seele");
    }).then(function(totalSupply){
        after_seeleS3dTotalSupply = totalSupply;
        return S3DProtocolInstance.balanceOfOneToken.call("zrx", notOwnerAccount);
    }).then(function(balance){
        after_zrxS3dBalance = balance;
        return S3DProtocolInstance.totalSupplyOfOneToken.call("zrx");
    }).then(function(totalSupply){
        after_zrxS3dTotalSupply = totalSupply;
        return ZRXTokenInst.balanceOf.call(notOwnerAccount);
    }).then(function(balance){
        after_zrxBalance = balance;

        assert.equal(equalNumber(before_seeleS3dBalance.minus(after_seeleS3dBalance).toNumber(), ( arbitrageTokensAmount)), true, "seeleS3dBalance  is not same");
        assert.equal(equalNumber(before_zrxS3dBalance.toNumber() , after_zrxS3dBalance.toNumber()), true, "zrxS3dBalance  is not same");
        assert.equal(equalNumber(before_seeleS3dTotoalSupply.minus(after_seeleS3dTotalSupply).toNumber() , ( arbitrageTokensAmount)), true, "seeleS3dTotalSupply  is not same");
        assert.equal(equalNumber(before_zrxS3dTotalSupply , after_zrxS3dTotalSupply), true, "zrxS3dTotalSupply  is not same");

        assert.equal(equalNumber(after_zrxBalance.minus(before_zrxBalance).toNumber(), zrxReceived), true, "zrxBalance  is not same");    })
  });

  it("should arbitrageTokens omg-zrx correctly", function(){

    var before_omgS3dBalance = 0;
    var after_omgS3dBalance = 0;
    var before_zrxS3dBalance = 0;
    var after_zrxS3dBalance = 0;
    var before_omgS3dTotoalSupply = 0;
    var after_omgS3dTotalSupply = 0;
    var before_zrxS3dTotalSupply = 0;
    var after_zrxS3dTotalSupply = 0;
    var before_zrxBalance = 0;
    var after_zrxBalance = 0;

    var arbitrageTokensAmount = 0;
    var zrxArbitrageTokensAmount = 0;
    var zrxReceived = 0;

    return S3DProtocolInstance.balanceOfOneToken.call("omg", notOwnerAccount).then(function(balance){
        before_omgS3dBalance = balance;
        return S3DProtocolInstance.totalSupplyOfOneToken.call("omg");
    }).then(function(totalSupply){
        before_omgS3dTotoalSupply = totalSupply;
        return S3DProtocolInstance.balanceOfOneToken.call("zrx", notOwnerAccount);
    }).then(function(balance){
        before_zrxS3dBalance = balance;
        return S3DProtocolInstance.totalSupplyOfOneToken.call("zrx");
    }).then(function(totalSupply){
        before_zrxS3dTotalSupply = totalSupply;  
        return ZRXTokenInst.balanceOf.call(notOwnerAccount);
    }).then(function(balance){
        before_zrxBalance = balance;

        arbitrageTokensAmount = before_omgS3dBalance.dividedBy(5).toNumber();
        zrxArbitrageTokensAmount = before_zrxS3dTotalSupply.dividedBy(3).toNumber();
        if(arbitrageTokensAmount > zrxArbitrageTokensAmount){
            arbitrageTokensAmount = zrxArbitrageTokensAmount;
        }
        return S3DProtocolInstance.calculateBuyTokenReceived("zrx", arbitrageTokensAmount);
    }).then(function(zrxget){
        zrxReceived = zrxget;
        return S3DProtocolInstance.arbitrageTokens("omg", "zrx", arbitrageTokensAmount, {from: notOwnerAccount, value: 0});
    }).then(function(){
        return S3DProtocolInstance.balanceOfOneToken.call("omg", notOwnerAccount);
    }).then(function(balance){
        after_omgS3dBalance = balance;
        return S3DProtocolInstance.totalSupplyOfOneToken.call("omg");
    }).then(function(totalSupply){
        after_omgS3dTotalSupply = totalSupply;
        return S3DProtocolInstance.balanceOfOneToken.call("zrx", notOwnerAccount);
    }).then(function(balance){
        after_zrxS3dBalance = balance;
        return S3DProtocolInstance.totalSupplyOfOneToken.call("zrx");
    }).then(function(totalSupply){
        after_zrxS3dTotalSupply = totalSupply;
        return ZRXTokenInst.balanceOf.call(notOwnerAccount);
    }).then(function(balance){
        after_zrxBalance = balance;

        assert.equal(equalNumber(before_omgS3dBalance.minus(after_omgS3dBalance).toNumber(), ( arbitrageTokensAmount)), true, "omgS3dBalance  is not same");
        assert.equal(equalNumber(before_zrxS3dBalance.toNumber() , after_zrxS3dBalance.toNumber()), true, "zrxS3dBalance  is not same");
        assert.equal(equalNumber(before_omgS3dTotoalSupply.minus(after_omgS3dTotalSupply).toNumber() , ( arbitrageTokensAmount)), true, "omgS3dTotalSupply  is not same");
        assert.equal(equalNumber(before_zrxS3dTotalSupply , after_zrxS3dTotalSupply), true, "zrxS3dTotalSupply  is not same");

        assert.equal(equalNumber(after_zrxBalance.minus(before_zrxBalance).toNumber(), zrxReceived), true, "zrxBalance  is not same");    })
  });

  it("should owner functions correctly", function(){
    var testaddress = '0x0A26b0eE9922C98932e4e965Dc832FbCe9988cEB';  
    return S3DProtocolInstance.addReferraler(testaddress, {from: notOwnerAccount, value: 0}).catch(function(e) {
        assert.notEqual(e, null, "notowner call addReferraler");                
        return S3DProtocolInstance.removeReferraler(testaddress, {from: notOwnerAccount, value: 0})
    }).catch(function(e) {
        assert.notEqual(e, null, "notowner call removeReferraler");                
        return S3DProtocolInstance.addArbitrager(testaddress, {from: notOwnerAccount, value: 0})       
    }).catch(function(e) {
        assert.notEqual(e, null, "notowner call addArbitrager");                
        return S3DProtocolInstance.removeArbitrager(testaddress, {from: notOwnerAccount, value: 0})       
    }).catch(function(e) {
        assert.notEqual(e, null, "notowner call removeArbitrager");                
        return S3DProtocolInstance.addDealer("eth", testaddress, {from: notOwnerAccount, value: 0})       
    }).catch(function(e) {
        assert.notEqual(e, null, "notowner call addDealer");                
        return S3DProtocolInstance.removeDealer("eth", testaddress, {from: notOwnerAccount, value: 0})       
    }).catch(function(e) {
        assert.notEqual(e, null, "notowner call removeDealer");                
        return S3DProtocolInstance.setReferralRequirement(1000e18, {from: notOwnerAccount, value: 0})       
    }).catch(function(e) {
        assert.notEqual(e, null, "notowner call setReferralRequirement");                
        return S3DProtocolInstance.setArbitrageRequirement(1000e18, {from: notOwnerAccount, value: 0})       
    }).catch(function(e) {
        assert.notEqual(e, null, "notowner call setArbitrageRequirement");                
    })
  });


});