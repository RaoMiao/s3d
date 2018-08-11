var AddressUtil = artifacts.require("./library/AddressUtil.sol");
var TokenRegistryImpl = artifacts.require("./TokenRegistryImpl.sol");
var EthDealer = artifacts.require("./EthDealer.sol");
var SeeleDealer = artifacts.require("./SeeleDealer.sol");
var S3DProtocol = artifacts.require("./S3DProtocol.sol");

module.exports = function(deployer) {
    deployer.deploy(AddressUtil);
    deployer.link(AddressUtil, TokenRegistryImpl);
    deployer.deploy(TokenRegistryImpl);
    deployer.deploy(EthDealer);
    deployer.deploy(SeeleDealer);
    deployer.deploy(S3DProtocol);

    var TokenRegistryImplInstance ;
    var EthDealerInstanceInstance ;
    var SeeleDealerInstance ;
    var S3DProtocolInstance ;

    deployer.then(function() {
        // Create a new version of A
        return TokenRegistryImpl.deployed();
      }).then(function(instance) {
        TokenRegistryImplInstance = instance;
        // Get the deployed instance of B
        return EthDealer.deployed();
      }).then(function(instance) {
        EthDealerInstanceInstance = instance;
        // Set the new instance of A's address on B via B's setA() function.
        return SeeleDealer.deployed();
      }).then(function(instance) {
        SeeleDealerInstance = instance;
        return S3DProtocol.deployed()
      }).then(function(instance) {
        S3DProtocolInstance = instance;
        console.log("TokenRegistryImplInstance address " + TokenRegistryImplInstance.address);
        console.log("EthDealerInstanceInstance address " + EthDealerInstanceInstance.address);
        console.log("SeeleDealerInstance address " + SeeleDealerInstance.address);

        S3DProtocolInstance.setTokenRegistryAddress(TokenRegistryImplInstance.address);
        S3DProtocolInstance.addDealer('eth', EthDealerInstanceInstance.address);
        S3DProtocolInstance.addDealer('seele', SeeleDealerInstance.address);      
      });
/*
    deployer.deploy(TokenRegistryImpl).then(function() {
        return deployer.deploy(EthDealer)
    }).then(function(){
        return deployer.deploy(SeeleDealer)
    }).then(function(){
        return deployer.deploy(S3DProtocol)
    }).then(function(){

        TokenRegistryImpl.deployed().then(function(){
            return EthDealer.deployed();
        }).then(function(){
            return SeeleDealer.deployed();
        }).then(function(){
            return S3DProtocol.deployed();
        }).then(function(){
            var TokenRegistryImplInstance = TokenRegistryImpl.deployed();
            var EthDealerInstanceInstance = EthDealer.deployed();
            var SeeleDealerInstance = SeeleDealer.deployed();
            var S3DProtocolInstance = S3DProtocol.deployed();
            
            console.log("here")
            console.log(S3DProtocolInstance)
            S3DProtocolInstance.setTokenRegistryAddress(TokenRegistryImplInstance.address);
            S3DProtocolInstance.addDealer('eth', EthDealerInstanceInstance.address);
            S3DProtocolInstance.addDealer('seele', SeeleDealerInstance.address);
        });
    })
*/
 

};