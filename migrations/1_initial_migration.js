var Migrations = artifacts.require("./Migrations.sol");

module.exports = function(deployer) {
  deployer.deploy(Migrations);

  // var adminAddress = '0xcd16575a90ed9506bcf44c78845d93f1b647f48c';
  // var gasLimit = web3.eth.getBlock("pending").gasLimit;
  // deployer.deploy(Migrations, {gas: gasLimit, from: adminAddress });
};
