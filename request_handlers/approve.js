const { AuctionServer } = require('../serverState.js')
const { AuctionStates } = require('../state.js')
const { validateApprove } = require('../validators.js')

function handleApprove (apiKey, approval) {
    const socket = this
    try {
        if (validateApprove(socket, apiKey, approval)) {
            const seller = AuctionServer.users[AuctionServer.salesPerson].name
            const itemName = AuctionServer.itemForSale.name
            if (parseInt(approval) === 1) {
                AuctionServer.auctionState = AuctionStates.OPEN
                AuctionServer.HandleAuctionTiming()
                AuctionServer.Announce(`${seller}'s request to auction ${itemName} was approved.  The auction is now live!`)
            } else {
                AuctionServer.itemForSale = null
                AuctionServer.salesPerson = ''
                AuctionServer.auctionState = AuctionStates.CLOSED
                AuctionServer.Announce(`${seller}'s request to auction ${itemName} was denied.  The auction floor is now open for item submissions.`)
            }
        }
    } catch (e) {
        console.log(`Error occurred: ${e}`)
        socket.emit('error', 'An error occurred. Please try again.')
    }

}

module.exports = { handleApprove }