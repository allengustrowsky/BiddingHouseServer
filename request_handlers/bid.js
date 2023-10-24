const { AuctionServer } = require('../serverState.js')
const { validateBid } = require('../validators.js')

function handleBid (apiKey, amount) {
    const socket = this
    try {
        if (validateBid(socket, apiKey, amount)) {
            AuctionServer.highestBidder = apiKey
            AuctionServer.highestBid = parseFloat(amount)
            AuctionServer.HandleAuctionTiming()
            AuctionServer.Announce(`${AuctionServer.users[apiKey].name} has just submitted a bid for $${parseFloat(amount).toFixed(2)}!`)
        }
    } catch (e) {
        console.log(`Error occurred: ${e}`)
        socket.emit('error', 'An error occurred. Please try again.')
    }
}

module.exports = { handleBid }