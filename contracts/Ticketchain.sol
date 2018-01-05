pragma solidity ^0.4.11;

import './Owned.sol';

contract Ticketchain is Owned {
  // Custom types
  struct Ticket {
    uint id;
    address seller;
    address buyer;
    string bandName;
    string venue;
    uint256 price;
  }

  // String variables
  mapping(uint => Ticket) public tickets;
  uint ticketCounter;

  // Events
  event sellTicketEvent(
    uint indexed _id,
    address indexed _seller, 
    string _bandName, 
    string _venue, 
    uint256 _price
  );

  event buyTicketEvent(
    uint indexed _id,
    address indexed _seller, 
    address indexed _buyer, 
    string _bandName, 
    string _venue, 
    uint256 _price
  );

  // Sell an Ticket
  function sellTicket(string _bandName, string _venue, uint256 _price) public {
    // a new ticket
    ticketCounter++;

    // Store this ticket
    tickets[ticketCounter] = Ticket(
      ticketCounter,
      msg.sender,
      0x0,
      _bandName,
      _venue,
      _price
    );

    // Listen for the sell event
    sellTicketEvent(ticketCounter, msg.sender, _bandName, _venue, _price);
  }

  // Fetch the number of the tickets in the contract
  function getNumberOfTickets() public constant returns (uint) {
    return ticketCounter;
  }

  // Fetch and return all ticket IDs available for sale
  function getTicketsForSale() public constant returns (uint[]) {
    // we check whether there is at lease one ticket
    if (ticketCounter == 0) {
      return new uint[](0);
    }

    // prepare output arrays
    uint[] memory ticketIds = new uint[](ticketCounter);

    uint numberOfTicketsForSale = 0;
    // Iterate over tickets
    for (uint i = 1; i <= ticketCounter; i++) {
      // keep only the ID for the ticket not already sold
      if (tickets[i].buyer == 0x0) {
        ticketIds[numberOfTicketsForSale] = tickets[i].id;
        numberOfTicketsForSale++;
      }
    }

    // copy the ticketIds array into the smaller for sale array
    uint[] memory forSale = new uint[](numberOfTicketsForSale);
    for (uint j = 0; j < numberOfTicketsForSale; j++) {
      forSale[j] = ticketIds[j];
    }
    return (forSale);
  }

  // Buy a ticket
  function buyTicket(uint _id) payable public {
    // check whether there is at least one ticket
    require(ticketCounter > 0);
    
    // check whether the ticket exists
    require(_id > 0 && _id <= ticketCounter);

    // retrieve the ticket
    Ticket storage ticket = tickets[_id];

    // check the ticket was not already sold
    require(ticket.buyer == 0x0);

    // check the seller is not the buyer
    require(ticket.seller != msg.sender);

    // check the value sent is the right price
    require(ticket.price == msg.value);

    // keep buyers information
    ticket.buyer = msg.sender;

    // buyer buys the tickets
    ticket.seller.transfer(msg.value);

    // trigger event
    buyTicketEvent(_id, ticket.seller, ticket.buyer, ticket.bandName, ticket.venue, ticket.price);
  }

  // kill the contract
  function kill() onlyOwner public {
    selfdestruct(owner);
  }
}