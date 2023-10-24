const { AuctionServer } = require('../serverState.js')
const { Item } = require('../entities/item.js')
const { validateAuction } = require('../validators.js')
const { AuctionStates } = require('../state.js')

function handleAuction (apiKey, name, price, description) {
    const socket = this
    try {
        if (validateAuction(socket, apiKey, name, price, description)) {
            const item = new Item(name, price, description)
            AuctionServer.itemForSale = item
            AuctionServer.salesPerson = apiKey
            AuctionServer.auctionState = AuctionStates.PENDING
            AuctionServer.Announce(`${AuctionServer.users[apiKey].name} submitted an auction request: ${name} for $${parseFloat(price).toFixed(2)}`)
        }  
    } catch (e) {
        console.log(`Error occurred: ${e}`)
        socket.emit('error', 'An error occurred. Please try again.')
    }
}

module.exports = { handleAuction }