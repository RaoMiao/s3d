var StringTuils = artifacts.require("./library/StringUtils.sol");
var TokenDealerMapping = artifacts.require("./library/TokenDealerMapping.sol");
var EthDealer = artifacts.require("./EthDealer.sol");
var SeeleDealer = artifacts.require("./SeeleDealer.sol");
var S3DProtocol = artifacts.require("./S3DProtocol.sol");
var SeeleToken = artifacts.require("./SeeleToken.sol");
var SeeleDividendsToEth = artifacts.require("./SeeleDividendsToEth.sol");

module.exports = function(deployer) {

    var SeeleTokenInst;
    deployer.deploy(SeeleToken, '0xcd16575a90ed9506bcf44c78845d93f1b647f48c', '0xcd16575a90ed9506bcf44c78845d93f1b647f48c', 1e27);

    deployer.deploy(StringTuils);
    deployer.deploy(TokenDealerMapping);
    deployer.deploy(EthDealer);

    deployer.then(function(instance) {
        return SeeleToken.deployed();
    }).then(function(instance) {
        SeeleTokenInst = instance;
        deployer.deploy(SeeleDealer, SeeleTokenInst.address);
        deployer.deploy(SeeleDividendsToEth, SeeleTokenInst.address);
 
    })


    deployer.link(StringTuils, S3DProtocol);
    deployer.link(TokenDealerMapping, S3DProtocol);
    deployer.deploy(S3DProtocol);


    var EthDealerInstance ;
    var SeeleDealerInstance ;
    var S3DProtocolInstance ;
    var SeeleDividendsToEthInstance;

    deployer.then(function(instance) {
        return EthDealer.deployed();
      }).then(function(instance) {
        EthDealerInstance = instance;
        return SeeleDealer.deployed();
      }).then(function(instance) {
        SeeleDealerInstance = instance;
        return SeeleDividendsToEth.deployed()
      }).then(function(instance) {
        SeeleDividendsToEthInstance = instance;
        return S3DProtocol.deployed()
      }).then(function(instance) {
        S3DProtocolInstance = instance;
        console.log("EthDealerInstanceInstance address " + EthDealerInstance.address);
        console.log("SeeleDealerInstance address " + SeeleDealerInstance.address);

        S3DProtocolInstance.addDealer('eth', EthDealerInstance.address);
        S3DProtocolInstance.addDealer('seele', SeeleDealerInstance.address);   

        EthDealerInstance.disableInitialStage();
        SeeleDealerInstance.disableInitialStage();

        EthDealerInstance.addAddressToWhitelist(S3DProtocolInstance.address);
        SeeleDealerInstance.addAddressToWhitelist(S3DProtocolInstance.address);
        SeeleDealerInstance.setSeeleDividendsToEthContractAddress(SeeleDividendsToEthInstance.address);
        SeeleDividendsToEthInstance.setEthDealerAddress(EthDealerInstance.address);
        SeeleDividendsToEthInstance.addAddressToWhitelist(SeeleDealerInstance.address);
        SeeleDividendsToEthInstance.addAddressToWhitelist(EthDealerInstance.address);



        SeeleTokenInst.unpause().then(function(){
          SeeleTokenInst.mint('0xcd16575a90ed9506bcf44c78845d93f1b647f48c', 1e23, false);
          SeeleTokenInst.mint('0x9af4bb5e60e6e0cc890a0978ed3a9a33cbcbdf98', 1e23, false);
          SeeleTokenInst.approve(SeeleDealerInstance.address, 1e23);
        })
      });



};