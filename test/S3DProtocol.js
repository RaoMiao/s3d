var S3DProtocol = artifacts.require("./S3DProtocol.sol");

var SeeleTokenInst;
var ZRXTokenInst;
var OMGTokenInst;
var EthDealerInstance ;
var SeeleDealerInstance ;
var S3DProtocolInstance ;
var OMGDealerInstance;
var ZRXDealerInstance;

contract('S3DProtocol', function(accounts) {
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
});