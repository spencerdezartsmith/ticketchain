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

  // check initial state values
  it('should be initialized with empty values', async function() {
    TicketchainInstance = await Ticketchain.deployed();
    const ticket = await TicketchainInstance.getTicket.call();
    
    assert.equal(ticket[0], 0x0, 'seller must be empty');
    assert.equal(ticket[1], 0x0, 'buyer must be empty');
    assert.equal(ticket[2], '', 'bandName must be empty');
    assert.equal(ticket[3], '', 'eventVenue must be empty');
    assert.equal(ticket[4].toNumber(), 0, 'ticket price must be zero');
  });

  // sell an ticket
  it('should sell a ticket', async function() {
    TicketchainInstance = await Ticketchain.deployed();
    const sellTicket = await TicketchainInstance.sellTicket(bandName, eventVenue, web3.toWei(price, 'ether'), { from: seller });
    const ticket = await TicketchainInstance.getTicket.call();

    assert.equal(ticket[0], seller, `seller must be ${seller}`);
    assert.equal(ticket[1], 0x0, 'buyer must be empty');    
    assert.equal(ticket[2], bandName, `band name must be ${bandName}`);
    assert.equal(ticket[3], eventVenue, `venue name must be ${eventVenue}`);
    assert.equal(ticket[4].toNumber(), web3.toWei(price, 'ether'), `price name must be ${web3.toWei(price, 'ether')}`);
    
  })

  // should check events
  it('should trigger an event when a new ticket is sold', async function() {
    TicketchainInstance = await Ticketchain.deployed();
    await TicketchainInstance.sellTicketEvent();
    const sellTicket = await TicketchainInstance.sellTicket(bandName, eventVenue, web3.toWei(price, 'ether'), { from: seller });
    
    assert.equal(sellTicket.logs.length, 1, 'should have received one event');
    assert.equal(sellTicket.logs[0].args._seller, seller, `seller must be ${seller}`);
    assert.equal(sellTicket.logs[0].args._bandName, bandName, `band name must be ${bandName}`);
    assert.equal(sellTicket.logs[0].args._price.toNumber(), web3.toWei(price, 'ether'), `price must be ${web3.toWei(price, 'ether')}`);
  })

  it('should buy an article', async function() {
    TicketchainInstance = await Ticketchain.deployed();
    // record balances of the buyer and the seller
    const sellerBalanceBeforeBuy = await web3.fromWei(web3.eth.getBalance(seller), 'ether').toNumber();
    const buyerBalanceBeforeBuy = await web3.fromWei(web3.eth.getBalance(buyer), 'ether').toNumber();
    const receipt = await TicketchainInstance.buyTicket({ from: buyer, value: web3.toWei(price, 'ether') });

    assert.equal(receipt.logs.length, 1, 'one event should have been triggered');
    assert.equal(receipt.logs[0].event, 'buyTicketEvent', 'event should be buyTicketEvent');
    assert.equal(receipt.logs[0].args._seller, seller, `event seller should be ${seller}`);
    assert.equal(receipt.logs[0].args._buyer, buyer, `event buyer should be ${buyer}`);
    assert.equal(receipt.logs[0].args._bandName, bandName, `event bandname should be ${bandName}`);
    assert.equal(receipt.logs[0].args._venue, eventVenue, `event bandname should be ${bandName}`);
    assert.equal(receipt.logs[0].args._price.toNumber(),
    web3.toWei(price, 'ether'), `event price must be ${web3.toWei(price, 'ether')}`)
    
    // record balances after the buy
    sellerBalanceAfterBuy = web3.fromWei(web3.eth.getBalance(seller), 'ether').toNumber();
    buyerBalanceAfterBuy = web3.fromWei(web3.eth.getBalance(buyer), 'ether').toNumber();

    // check the effect of the buy on balances, also accounting for gas
    assert(sellerBalanceAfterBuy == sellerBalanceBeforeBuy + price, `seller should have earned ${price} ETH`);
    assert(buyerBalanceAfterBuy <= buyerBalanceBeforeBuy - price, `buyer should have spent ${price} ETH`);

    const data = await TicketchainInstance.getTicket.call()
    assert.equal(data[0], seller, `seller must be ${seller}`);
    assert.equal(data[1], buyer, `buyer must be ${buyer}`);
    assert.equal(data[2], bandName, `bandName must be ${bandName}`);
    assert.equal(data[3], eventVenue, `eventVenue must be ${eventVenue}`);

  })
});