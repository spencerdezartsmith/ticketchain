var Ticketchain = artifacts.require('./Ticketchain.sol');

module.exports = function(deployer) {
  deployer.deploy(Ticketchain);
};