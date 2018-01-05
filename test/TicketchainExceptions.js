// Contract to be tested
const Ticketchain = artifacts.require('./Ticketchain.sol');

// Test suite

contract('Ticketchain', function(accounts) {
  let TicketchainInstance;
  const seller = accounts[1];
  const buyer = accounts[2];
  const bandName = 'SZA';
  const eventVenue = 'Enmore Theatre';
  const price = 10;

  // No article for sale yet
  it('should throw an exception if you try to buy a ticket when there is no ticket for sale', function() {
    return Ticketchain.deployed().then(function(instance) {
      TicketchainInstance = instance;
      return TicketchainInstance.buyTicket({
        from: buyer,
        value: web3.toWei(price, 'ether')
      })
    }).catch(function(error) {
      error.message.indexOf('invalid opcode') >= 0, error.message.indexOf('invalid opcode');
    }).then(function() {
      return TicketchainInstance.getTicket.call();
    }).then(function(data) {
      // make sure the contrat state was not altered
      assert.equal(data[0], 0x0, 'seller must be empty');
      assert.equal(data[1], 0x0, 'buyer must be empty');
      assert.equal(data[2], '', 'bandName must be empty');
      assert.equal(data[3], '', 'eventVenue must be empty');
      assert.equal(data[4].toNumber(), 0, 'ticket price must be zero');
    })
  })

  // Buying an article you are selling
  it('should throw an exception if you try to buy your own ticket', function() {
    return Ticketchain.deployed().then(function(instance) {
      TicketchainInstance = instance;
      return TicketchainInstance.sellTicket(bandName, eventVenue, web3.toWei(price, 'ether'), {
        from: seller
      });
    }).then(function(receipt) {
      return TicketchainInstance.buyTicket({
        from: seller,
        value: web3.toWei(price, 'ether')
      });
    }).catch(function(error) {
      error.message.indexOf('invalid opcode') >= 0, error.message.indexOf('invalid opcode') >= 0;
    }).then(function() {
      return TicketchainInstance.getTicket.call()
    }).then(function(data) {
      // make sure the state was not altered
      assert.equal(data[0], seller, `seller must be ${seller}`);
      assert.equal(data[1], 0x0, 'buyer must be empty');
      assert.equal(data[2], bandName, `band name must be ${bandName}`);
      assert.equal(data[3], eventVenue, `venue name must be ${eventVenue}`);
      assert.equal(data[4].toNumber(), web3.toWei(price, 'ether'), `price name must be ${web3.toWei(price, 'ether')}`);
    })
  })

  // Incorrect value
  it('should throw an exception if you try to buy a ticket for a value different from its price', function() {
    return Ticketchain.deployed().then(function(instance) {
      TicketchainInstance = instance;
      return TicketchainInstance.buyTicket({
        from: buyer,
        value: web3.toWei(price + 1, 'ether')
      });
    }).catch(function(error) {
      error.message.indexOf('invalid opcode') >= 0, error.message.indexOf('invalid opcode') >= 0;
    }).then(function() {
      return TicketchainInstance.getTicket.call();
    }).then(function(data) {
      // make sure the state was not altered
      assert.equal(data[0], seller, `seller must be ${seller}`);
      assert.equal(data[1], 0x0, 'buyer must be empty');
      assert.equal(data[2], bandName, `band name must be ${bandName}`);
      assert.equal(data[3], eventVenue, `venue name must be ${eventVenue}`);
      assert.equal(data[4].toNumber(), web3.toWei(price, 'ether'), `price name must be ${web3.toWei(price, 'ether')}`);
    })
  })

  // Cannot buy an article that was already sold
  it('should throw an exception if you try to buy a ticket that was already sold', function () {
    return Ticketchain.deployed().then(function (instance) {
      TicketchainInstance = instance;
      return TicketchainInstance.buyTicket({
        from: buyer,
        value: web3.toWei(price, 'ether')
      });
    }).then(function() {
      return TicketchainInstance.buyArticle({
        from: we3.eth.accounts[0],
        value: web3.toWei(price, 'ether')
      });
    }).catch(function (error) {
      error.message.indexOf('invalid opcode') >= 0, error.message.indexOf('invalid opcode') >= 0;
    }).then(function() {
      return TicketchainInstance.getTicket.call();
    }).then(function (data) {
      // make sure the state was not altered
      assert.equal(data[0], seller, `seller must be ${seller}`);
      assert.equal(data[1], buyer, 'buyer must be empty');
      assert.equal(data[2], bandName, `band name must be ${bandName}`);
      assert.equal(data[3], eventVenue, `venue name must be ${eventVenue}`);
      assert.equal(data[4].toNumber(), web3.toWei(price, 'ether'), `price name must be ${web3.toWei(price, 'ether')}`);
    })
  })
})

