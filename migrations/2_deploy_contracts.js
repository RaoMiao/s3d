var StringUtils = artifacts.require("./library/StringUtils.sol");
var TokenDealerMapping = artifacts.require("./library/TokenDealerMapping.sol");
var EthDealer = artifacts.require("./EthDealer.sol");
var SeeleDealer = artifacts.require("./SeeleDealer.sol");
var S3DProtocol = artifacts.require("./S3DProtocol.sol");
var SeeleToken = artifacts.require("./SeeleToken.sol");
var SeeleDividendsToEth = artifacts.require("./SeeleDividendsToEth.sol");
var ZRXToken = artifacts.require("./ZRXToken.sol");
var OMGToken = artifacts.require("./OMGToken.sol");
var OMGDealer = artifacts.require("./OMGDealer.sol");
var ZRXDealer = artifacts.require("./ZRXDealer.sol");

//const mainAccount = "0xcd16575a90ed9506bcf44c78845d93f1b647f48c";
const mainAccount = "0x13Afd24848f08a06Ac21c9320aA6217BC9a7c9D1";

module.exports = function(deployer) { 
    //var adminAccount = '0xcd16575a90ed9506bcf44c78845d93f1b647f48c';
    var adminAccount = '0x13Afd24848f08a06Ac21c9320aA6217BC9a7c9D1';


    var SeeleTokenInst;
    var ZRXTokenInst;
    var OMGTokenInst;
    var EthDealerInstance ;
    var SeeleDealerInstance ;
    var S3DProtocolInstance ;
    var OMGDealerInstance;
    var ZRXDealerInstance;

    deployer.deploy(SeeleToken, adminAccount, adminAccount, 1e27).then(function(instance){
        SeeleTokenInst = instance;
        return deployer.deploy(ZRXToken);
    }).then(function(instance){
        ZRXTokenInst = instance;
        return deployer.deploy(OMGToken);
    }).then(function(instance){
        OMGTokenInst = instance;
        return deployer.deploy(StringUtils);
    }).then(function(instance){
        deployer.link(StringUtils, S3DProtocol);      
        return deployer.deploy(TokenDealerMapping);
    }).then(function(instance){
        deployer.link(TokenDealerMapping, S3DProtocol);
        return deployer.deploy(S3DProtocol);
    }).then(function(instance){
        S3DProtocolInstance = instance;
        return deployer.deploy(EthDealer);
    }).then(function(instance){
        EthDealerInstance = instance;
        return deployer.deploy(SeeleDealer, SeeleTokenInst.address);
    }).then(function(instance){
        SeeleDealerInstance = instance;
        return deployer.deploy(OMGDealer, OMGTokenInst.address);
    }).then(function(instance){
        OMGDealerInstance = instance;
        return deployer.deploy(ZRXDealer, ZRXTokenInst.address);
    }).then(function(instance){
        ZRXDealerInstance = instance;
        return deployer.deploy(SeeleDividendsToEth, SeeleTokenInst.address);
    }).then(function(instance){
        SeeleDividendsToEthInstance = instance;
        return S3DProtocolInstance.addDealer('eth', EthDealerInstance.address);       
    }).then(function(){
        return S3DProtocolInstance.addDealer('seele', SeeleDealerInstance.address);   
    }).then(function(){
        return S3DProtocolInstance.addDealer('omg', OMGDealerInstance.address);   
    }).then(function(){
        return S3DProtocolInstance.addDealer('zrx', ZRXDealerInstance.address);   
    }).then(function(){
        return EthDealerInstance.disableInitialStage();
    }).then(function(){
        return SeeleDealerInstance.disableInitialStage();
    }).then(function(){
        return OMGDealerInstance.disableInitialStage();
    }).then(function(){
        return ZRXDealerInstance.disableInitialStage();
    }).then(function(){
        return EthDealerInstance.addAddressToWhitelist(S3DProtocolInstance.address);
    }).then(function(){
        return SeeleDealerInstance.addAddressToWhitelist(S3DProtocolInstance.address);
    }).then(function(){
        return OMGDealerInstance.addAddressToWhitelist(S3DProtocolInstance.address);
    }).then(function(){
        return ZRXDealerInstance.addAddressToWhitelist(S3DProtocolInstance.address);
    }).then(function(){
        return SeeleTokenInst.unpause();
    }).then(function(){
        return SeeleTokenInst.mint(mainAccount, 1e23, false);
    }).then(function(){
        return SeeleTokenInst.mint('0x9af4bb5e60e6e0cc890a0978ed3a9a33cbcbdf98', 1e23, false);
    }).then(function(){
        return SeeleTokenInst.mint('0x000Fb41cbDd1E368ED7C2E29Df1717a09aFbbD5a', 1e25, false);
    }).then(function(){
        return SeeleTokenInst.approve(SeeleDealerInstance.address, 1e23);
    }).then(function(){
        return OMGTokenInst.mint(mainAccount, 1e23);
    }).then(function(){
        return OMGTokenInst.mint('0x9af4bb5e60e6e0cc890a0978ed3a9a33cbcbdf98', 1e23);
    }).then(function(){
        return OMGTokenInst.mint('0x000Fb41cbDd1E368ED7C2E29Df1717a09aFbbD5a', 1e25);
    }).then(function(){
        return OMGTokenInst.approve(OMGDealerInstance.address, 1e23);
    }).then(function(){
        return ZRXTokenInst.approve(ZRXDealerInstance.address, 1e23);
    }).then(function(){
        return ZRXTokenInst.transfer('0x000Fb41cbDd1E368ED7C2E29Df1717a09aFbbD5a', 1e25);
    }).then(function(){
        console.log("s3d depoly success!!!");
    })
    

    // deployer.then(function(instance){
    //     console.log('here1');
    //     return SeeleToken.deployed();
    // }).then(function(instance){
    //     SeeleTokenInst = instance;
    //     console.log('SeeleTokenInst' + SeeleTokenInst.address);
    //     deployer.deploy(StringUtils);
    //     return StringUtils.deployed();      
    // }).then(function(instance){
    //     console.log('StringTuilsInst' + instance);
    //     deployer.link(StringUtils, S3DProtocol);      
    //     deployer.deploy(TokenDealerMapping);
    //     return TokenDealerMapping.deployed();      
    // }).then(function(instance){
    //     deployer.link(TokenDealerMapping, S3DProtocol);      
    //     deployer.deploy(S3DProtocol);
    //     return S3DProtocol.deployed();
    // }).then(function(instance){
    //     S3DProtocolInstance = instance;
    //     deployer.deploy(EthDealer);
    //     return EthDealer.deployed();
    // }).then(function(instance){
    //     EthDealerInstance = instance;
    //     deployer.deploy(SeeleDealer, SeeleTokenInst.address);
    //     return SeeleDealer.deployed(); 
    // }).then(function(instance){
    //     SeeleDealerInstance = instance;
    //     deployer.deploy(SeeleDividendsToEth, SeeleTokenInst.address);
    //     return SeeleDividendsToEth.deployed();     
    // }).then(function(instance){
    //     SeeleDividendsToEthInstance = instance;
    //     return S3DProtocolInstance.addDealer('eth', EthDealerInstance.address);       
    // }).then(function(){
    //     return S3DProtocolInstance.addDealer('seele', SeeleDealerInstance.address);   
    // }).then(function(){
    //     return EthDealerInstance.disableInitialStage();
    // }).then(function(){
    //     return SeeleDealerInstance.disableInitialStage();
    // }).then(function(){
    //     return EthDealerInstance.addAddressToWhitelist(S3DProtocolInstance.address);
    // }).then(function(){
    //     return SeeleDealerInstance.addAddressToWhitelist(S3DProtocolInstance.address);
    // }).then(function(){
    //     return SeeleDealerInstance.setSeeleDividendsToEthContractAddress(SeeleDividendsToEthInstance.address);
    // }).then(function(){
    //     return SeeleDividendsToEthInstance.setEthDealerAddress(EthDealerInstance.address);
    // }).then(function(){
    //     return SeeleDividendsToEthInstance.addAddressToWhitelist(SeeleDealerInstance.address);
    // }).then(function(){
    //     return SeeleDividendsToEthInstance.addAddressToWhitelist(EthDealerInstance.address);
    // }).then(function(){
    //     return SeeleTokenInst.unpause();
    // }).then(function(){
    //     return SeeleTokenInst.mint('0xcd16575a90ed9506bcf44c78845d93f1b647f48c', 1e23, false);
    // }).then(function(){
    //     return SeeleTokenInst.mint('0x9af4bb5e60e6e0cc890a0978ed3a9a33cbcbdf98', 1e23, false);
    // }).then(function(){
    //     SeeleTokenInst.approve(SeeleDealerInstance.address, 1e23);
    // })



    // deployer.deploy(StringTuils);
    // deployer.deploy(TokenDealerMapping);
    // deployer.deploy(EthDealer);

    // deployer.then(function(instance) {
    //     return SeeleToken.deployed();
    // }).then(function(instance) {
    //     SeeleTokenInst = instance;
    //     deployer.deploy(SeeleDealer, SeeleTokenInst.address);
    //     deployer.deploy(SeeleDividendsToEth, SeeleTokenInst.address);
 
    // })





    // var EthDealerInstance ;
    // var SeeleDealerInstance ;
    // var S3DProtocolInstance ;
    // var SeeleDividendsToEthInstance;

    // deployer.then(function(instance) {
    //     return EthDealer.deployed();
    //   }).then(function(instance) {
    //     EthDealerInstance = instance;
    //     return SeeleDealer.deployed();
    //   }).then(function(instance) {
    //     SeeleDealerInstance = instance;
    //     return SeeleDividendsToEth.deployed()
    //   }).then(function(instance) {
    //     SeeleDividendsToEthInstance = instance;
    //     return S3DProtocol.deployed()
    //   }).then(function(instance) {
    //     S3DProtocolInstance = instance;
    //     console.log("EthDealerInstanceInstance address " + EthDealerInstance.address);
    //     console.log("SeeleDealerInstance address " + SeeleDealerInstance.address);

    //     S3DProtocolInstance.addDealer('eth', EthDealerInstance.address);
    //     S3DProtocolInstance.addDealer('seele', SeeleDealerInstance.address);   

    //     EthDealerInstance.disableInitialStage();
    //     SeeleDealerInstance.disableInitialStage();

    //     EthDealerInstance.addAddressToWhitelist(S3DProtocolInstance.address);
    //     SeeleDealerInstance.addAddressToWhitelist(S3DProtocolInstance.address);
    //     SeeleDealerInstance.setSeeleDividendsToEthContractAddress(SeeleDividendsToEthInstance.address);
    //     SeeleDividendsToEthInstance.setEthDealerAddress(EthDealerInstance.address);
    //     SeeleDividendsToEthInstance.addAddressToWhitelist(SeeleDealerInstance.address);
    //     SeeleDividendsToEthInstance.addAddressToWhitelist(EthDealerInstance.address);



    //     SeeleTokenInst.unpause().then(function(){
    //       SeeleTokenInst.mint('0xcd16575a90ed9506bcf44c78845d93f1b647f48c', 1e23, false);
    //       SeeleTokenInst.mint('0x9af4bb5e60e6e0cc890a0978ed3a9a33cbcbdf98', 1e23, false);
    //       SeeleTokenInst.approve(SeeleDealerInstance.address, 1e23);
    //     })
    //   });



};