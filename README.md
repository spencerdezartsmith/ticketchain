# ticketchain

You need truffle and meta mask to run this project
Stay in the root of the project in the terminal

- Enable and sign in to Metamask
- In one terminal window run `./starttestrpc.sh`
- In the terminal running the private node 👆🏼 you will see three private keys
- In metamask (in the top left) change to the private network. Then on the top right, select to `import account`. Keep the type as `private key` and copy and paste the first private key from the terminal.
- Do this for each of the private keys so you have a couple of accounts to play with
- In another terminal run 'truffle migrate'
- In another terminal run `npm run dev`

This should open up the dApp in chrome. 

- Click `Sell a ticket` and fill in the inputs. On submit you will be asked to accept the action in a metamask pop up window. 
- Then wait.... There is a listener that is listening for events. It needs to wait for the transaction to be mined so it can take up to 30 seconds. IF it doesn't show up, refresh the page. There is a metamask bug that messes with events. You can usually fix it by disabling metamask and enabling it again and/or restarting chrome. 
- Now you can switch to one of the other accounts in metamask and refresh the webpage
- You will see the ticket you listed availabe to buy
- Select `Buy` and got throught the same metamask verification. The item should disappear from the list. You will need to wait for it again. 
- You can click on `Events` and see the 'sold' event.

Godspeed!
