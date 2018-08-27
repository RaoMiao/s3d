var S3DProtocol = artifacts.require("./S3DProtocol.sol");

var SeeleTokenInst;
var ZRXTokenInst;
var OMGTokenInst;
var EthDealerInstance ;
var SeeleDealerInstance ;
var S3DProtocolInstance ;
var OMGDealerInstance;
var ZRXDealerInstance;

var notOwnerAccount = "0x4925D66978FB4f13e574107Fb01F4c3B51AbA7Aa";


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

  if("should owner functions correctly", function(){
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