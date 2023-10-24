const { NEW_AUCTION_EXPIRATION, BIDDER_WINS_AFTER } = require('./constants.js')
const { AuctionStates } = require('./state.js')

class AuctionServer {
    static users = {} // {apiKey: User}
    static auctionState = AuctionStates.CLOSED
    static admin = '' // apiKey
    static salesPerson = '' // apiKey
    static highestBidder = '' // apiKey
    static highestBid = 0
    static itemForSale = null // Item
    static clock = null // setTimeout

    /**
     * Sends a message to all users connected to the server.
     * 
     * @param {string} message The message to send to all users.
     */
    static Announce(message) {
        for (const apiKey in AuctionServer.users) {
            AuctionServer.SendStateUpdate(apiKey, message)
        }
    }

    /**
     * Sends a personalized state update of the auction house to a certain user.  apiKey 
     * must be valid and the user must exist.
     * 
     * @param {string} apiKey API key of user who will receive the state update
     * @param {string} message Message to send to the user
     */
    static SendStateUpdate(apiKey, message) {
        AuctionServer.users[apiKey].socket.emit('stateUpdate', AuctionServer.ToJsonString(apiKey, message))
    }

    /**
     * Handles the timing for an auction based on current server state and handles
     * server state changes when those timers time out
     * 
     * @return {void}
     */
    static HandleAuctionTiming() {
        AuctionServer.clock && clearTimeout(AuctionServer.clock)
        
        const noBidders = AuctionServer.highestBid === 0
        AuctionServer.clock = setTimeout(
            (noBidders ? AuctionServer.HandleNewAucExpiration : AuctionServer.HandleAuctionWinner), 
            (noBidders ? NEW_AUCTION_EXPIRATION : BIDDER_WINS_AFTER)
        )
    }

    /**
     * Handles server state changes when an auction expires because no one
     * submitted a bid in the specified amount of time. Announces the 
     * results to all clients.
     * 
     * @return {void}
     */
    static HandleNewAucExpiration() {
        clearTimeout(AuctionServer.clock)
        
        AuctionServer.salesPerson = ''
        AuctionServer.auctionState = AuctionStates.CLOSED
        AuctionServer.highestBidder = ''
        AuctionServer.highestBid = 0
        AuctionServer.itemForSale = null

        AuctionServer.Announce(`The auction expired because no one has submitted a bid in the past ${NEW_AUCTION_EXPIRATION / 1000} seconds. The auction floor is now open.`)
    }

    /**
     * Handles server state changes when a user wins an auction because no 
     * one submitted a bid in the specified amount of time. Announces the 
     * results to all clients.
     */
    static HandleAuctionWinner() {
        clearTimeout(AuctionServer.clock)
        // console.log(AuctionServer.highestBidder)
        const winnerName = AuctionServer.users[AuctionServer.highestBidder].name
        const itemName = AuctionServer.itemForSale.name

        AuctionServer.users[AuctionServer.salesPerson].soldItems.push(AuctionServer.itemForSale)
        AuctionServer.users[AuctionServer.salesPerson].balance += AuctionServer.highestBid
        AuctionServer.users[AuctionServer.highestBidder].inventory.push(AuctionServer.itemForSale)
        AuctionServer.users[AuctionServer.highestBidder].balance -= AuctionServer.highestBid
        AuctionServer.auctionState = AuctionStates.CLOSED
        AuctionServer.salesPerson = ''
        AuctionServer.highestBidder = ''
        AuctionServer.highestBid = 0
        AuctionServer.itemForSale = null

        AuctionServer.Announce(`${winnerName} won the auction for ${itemName}! The auction floor is now open.`)
    }

    /**
     * Stops the auction timer.
     * 
     * @return {void}
     */
    static CancelAuctionTiming() {
        AuctionServer.clock && clearTimeout(AuctionServer.clock)
    }

    /**
     * Converts the state of the server into stringified json.  Includes sensitive user data,
     * so it varies slightly depending on the user. Assumes a valid apiKey
     * 
     * @param {string} apiKey API key of the user whose data will be stringified in json
     * @param {string} message Message to send to the user
     * @returns {string} stringified json representing the current state of the auction house
     */
    static ToJsonString(apiKey, message) {
        return JSON.stringify({
            apiKey,
            name: AuctionServer.users[apiKey].name,
            balance: AuctionServer.users[apiKey].balance,
            inventory: AuctionServer.users[apiKey].inventory,   
            soldItems: AuctionServer.users[apiKey].soldItems,
            auctionState: AuctionServer.auctionState,
            admin: AuctionServer.users[AuctionServer.admin]?.name,
            salesPerson: AuctionServer.users[AuctionServer.salesPerson]?.name,
            highestBidder: AuctionServer.users[AuctionServer.highestBidder]?.name,
            highestBid: AuctionServer.highestBid,
            itemForSale: AuctionServer.itemForSale,
            isAdmin: AuctionServer.admin === apiKey,
            message,
            connectedUsers: Object.keys(AuctionServer.users).length
        })
    }
}

module.exports = { AuctionServer }