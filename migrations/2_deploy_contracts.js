var StringTuils = artifacts.require("./library/StringUtils.sol");
var TokenDealerMapping = artifacts.require("./library/TokenDealerMapping.sol");
var EthDealer = artifacts.require("./EthDealer.sol");
var SeeleDealer = artifacts.require("./SeeleDealer.sol");
var S3DProtocol = artifacts.require("./S3DProtocol.sol");
var SeeleToken = artifacts.require("./SeeleToken.sol");

module.exports = function(deployer) {
    deployer.deploy(StringTuils);
    deployer.deploy(TokenDealerMapping);
    deployer.link(StringTuils, S3DProtocol);
    deployer.link(TokenDealerMapping, S3DProtocol);
    deployer.deploy(EthDealer);
    deployer.deploy(SeeleDealer);
    deployer.deploy(S3DProtocol);
    deployer.deploy(SeeleToken, 0x627306090abab3a6e1400e9345bc60c78a8bef57, 0x627306090abab3a6e1400e9345bc60c78a8bef57, 1e27);


    var EthDealerInstance ;
    var SeeleDealerInstance ;
    var S3DProtocolInstance ;

    deployer.then(function(instance) {
   
        return EthDealer.deployed();
      }).then(function(instance) {
        EthDealerInstance = instance;
        // Set the new instance of A's address on B via B's setA() function.
        return SeeleDealer.deployed();
      }).then(function(instance) {
        SeeleDealerInstance = instance;
        return S3DProtocol.deployed()
      }).then(function(instance) {
        S3DProtocolInstance = instance;
        console.log("EthDealerInstanceInstance address " + EthDealerInstance.address);
        console.log("SeeleDealerInstance address " + SeeleDealerInstance.address);

        S3DProtocolInstance.addDealer('eth', EthDealerInstance.address);
        S3DProtocolInstance.addDealer('seele', SeeleDealerInstance.address);      
      });


};