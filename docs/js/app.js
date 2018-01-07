App = {
  web3Provider: null,
  contracts: {},
  account: 0x0,
  loading: false, 

  init: function() {
    return App.initWeb3()
  },

  initWeb3: function() {
    if (typeof web3 !== 'undefined') {
      App.web3Provider = web3.currentProvider;
      web3 = new Web3(web3.currentProvider)
    } else {
      App.web3Provider = new 
      Web3.providers.HttpProvider('http://localhost:8545');
      web3 = new Web3(App.web3Provider);
    }

    App.displayAccountInfo();
    return App.initContract();
  },

  displayAccountInfo: function() {
    web3.eth.getCoinbase(function(err, account) {
      if (err === null) {
        App.account = account;
        $("#account").text(account);
        web3.eth.getBalance(account, function(err, balance) {
          if (err === null) {
            $("#accountBalance").text(web3.fromWei(balance, 'ether') + " ETH");
          }
        });
      }
    });
  },

  initContract: function() {
    $.getJSON('Ticketchain.json', function(ticketchainArtifact) {
      App.contracts.Ticketchain = TruffleContract(ticketchainArtifact)
      App.contracts.Ticketchain.setProvider(App.web3Provider);
      App.listenToEvents();
      return App.reloadTickets();
    })
  },

  reloadTickets: function() {
    // avoid reentry
    if (App.loading) {
      return;
    }
    App.loading = true;

    // refresh account information because the balance may have changed
    App.displayAccountInfo();

    let ticketchainInstance;

    App.contracts.Ticketchain.deployed().then(function(instance) {
      ticketchainInstance = instance;
      return ticketchainInstance.getTicketsForSale();
    }).then(function(ticketIds) {
      // retrieve and clear the ticket placeholder
      const ticketsRow = $('#ticketsRow');
      ticketsRow.empty()

      for (var i = 0; i < ticketIds.length; i++) {
        let ticketId = ticketIds[i];
        ticketchainInstance.tickets(ticketId).then(function(ticket) {
          App.displayTicket(
            ticket[0],
            ticket[1],
            ticket[3],
            ticket[4],
            ticket[5],
          );
        });
      }
      App.loading = false;
    }).catch(function(error) {
      console.log(error.message);
      App.loading = false;
    });
  },

  displayTicket: function (id, seller, bandName, venue, price) {
    const ticketsRow = $('#ticketsRow');
    const etherPrice = web3.fromWei(price, 'ether');

    // Retrieve and fill template
    const ticketTemplate = $('#ticketTemplate');
    ticketTemplate.find('.ticket-band-name').text(bandName);
    ticketTemplate.find('.ticket-venue').text(venue);
    ticketTemplate.find('.ticket-price').text(`${etherPrice} ETH`);
    ticketTemplate.find('.btn-buy').attr('data-id', id);
    ticketTemplate.find('.btn-buy').attr('data-value', etherPrice);

    // Seller?
    if (seller == App.account) {
      ticketTemplate.find('.ticket-seller').text('You');
      ticketTemplate.find('.btn-buy').hide();
    } else {
      ticketTemplate.find('.ticket-seller').text(seller);
      ticketTemplate.find('.btn-buy').show();
    }

    // add this new ticket
    ticketsRow.append(ticketTemplate.html())
  },

  sellTicket: function() {
    const _band_name = $('#ticket_band_name').val();
    const _venue = $('#ticket_venue').val();
    const _price = web3.toWei(parseFloat($('#ticket_price').val() || 0), 'ether');
    
    if ((_band_name.trim() == '') || (_price == 0)) {
      // nothing to sell
      return false;
    }

    App.contracts.Ticketchain.deployed().then(function(instance) {
      return instance.sellTicket(_band_name, _venue, _price, {
        from: App.account,
        gas: 500000
      });
    }).then(function (result) {

      }).catch(function(err) {
      console.log('error: ', err)
    })
  },

  listenToEvents: function() {
    App.contracts.Ticketchain.deployed().then(function(instance) {
      instance.sellTicketEvent({}, {
        fromBlock: 0,
        toBlock: 'latest'
      }).watch(function(error, event) {
        if (!error) {
          $('#events').append(`<li class="list-group-item">${event.args._bandName} is for sale</li>`);
        } else {
          console.error(error);
        }
        App.reloadTickets();
      });

      instance.buyTicketEvent({}, {
        fromBlock: 0,
        toBlock: 'latest'
      }).watch(function (error, event) {
        if (!error) {
          $('#events').append(`<li class="list-group-item">${event.args._buyer} bought a ticket to see ${event.args._bandName}</li>`);
        } else {
          console.error(error);
        }
        App.reloadTickets();
      });
    })
  },

  buyTicket: function() {
    event.preventDefault();

    //retrieve the ticket price
    const _ticketId = $(event.target).data('id');
    const _price = parseFloat($(event.target).data('value'));

    App.contracts.Ticketchain.deployed().then(function(instance) {
      return instance.buyTicket(_ticketId, {
        from: App.account,
        value: web3.toWei(_price, 'ether'),
        gas: 500000
      });
    }).then(function(result) {

    }).catch(function(error) {
      console.error(error)
    })
  }
};

$(function() {
  $(window).load(function() {
    App.init();
  });
});
