const { MIN_USERS_FOR_AUCTION } = require("../constants")
const { AuctionServer } = require("../serverState")
const { AuctionStates } = require("../state")

const disconnectDeadSockets = () => {
    try {
        for (const apiKey in AuctionServer.users) {
            if (!AuctionServer.users[apiKey].socket.connected) {
                handleDisconnect(apiKey)
            }
        }
    } catch (e) {
        console.log(`Error occurred: ${e}`)
        AuctionServer.Announce('An error occurred disconnecting a user.')
        // reset server state?
    }
}

const handleDisconnect = (apiKey) => {
    const usr = AuctionServer.users[apiKey]

    const isAdmin = AuctionServer.admin === apiKey
    const isSalesperson = AuctionServer.salesPerson === apiKey
    const isHighestBidder = AuctionServer.highestBidder === apiKey

    delete AuctionServer.users[apiKey]

    let response = `${usr.name} has left the auction. `
    if (Object.keys(AuctionServer.users).length === 0) { // user was the only one on the server
        AuctionServer.admin = ''
    } else {
        if (isAdmin) {
            AuctionServer.admin = Object.keys(AuctionServer.users)[0] // assign the next user in the list to admin
            response += `${AuctionServer.users[AuctionServer.admin].name} is the new admin. `
        }

        if (isSalesperson || Object.keys(AuctionServer.users).length < MIN_USERS_FOR_AUCTION) {
            response += `The auction has been cancelled, and the auction floor is now open. `

            AuctionServer.auctionState = AuctionStates.CLOSED
            AuctionServer.salesPerson = ''
            AuctionServer.highestBidder = ''
            AuctionServer.highestBid = 0
            AuctionServer.itemForSale = null
            AuctionServer.CancelAuctionTiming()
        } else if (isHighestBidder) {
            response += `${usr.name}'s highest bid of $${AuctionServer.highestBid.toFixed(2)} has been removed, and the auction has been reset. Start bidding! `

            AuctionServer.highestBidder = ''
            AuctionServer.highestBid = 0
            AuctionServer.HandleAuctionTiming()
        }
    }

    AuctionServer.Announce(response)
}

module.exports = { disconnectDeadSockets, handleDisconnect }

