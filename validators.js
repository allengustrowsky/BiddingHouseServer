const { Socket } = require('socket.io')
const { AuctionServer } = require('./serverState')
const { AuctionStates } = require('./state')

/**
 * Validates that the user has a valid api key.
 * 
 * @param {Socket} socket client socket
 * @param {string} apiKey client api key
 * @returns {boolean} passes validation
 */
const validateState = (socket, apiKey) => {
    if (!AuctionServer.users[apiKey]) {
        socket.emit('error', 'You are not authorized to do this!')
        return false
    }

    return true
}

/**
 * Validates the parts of a DEPOSIT request from a specific client. 
 * Alerts the user if validation fails.
 * 
 * @param {Socket} socket client socket
 * @param {string} apiKey client api key
 * @param {number} amount deposit amount in dollars
 * @returns {boolean} passes validation
 */
const validateDeposit = (socket, apiKey, amount) => {
    if (!AuctionServer.users[apiKey]) {
        socket.emit('error', 'You are not authorized to do this!')
        return false
    } else if (AuctionServer.auctionState === AuctionStates.OPEN) {
        socket.emit('error', 'You cannot deposit money while an auction is live.')
        return false
    } else if (isNaN(amount)) {
        socket.emit('error', 'Deposit amount must be a number!')
        return false
    } else if (parseFloat(amount) <= 0) {
        socket.emit('error', 'Deposit must be greater than $0.00!')
        return false
    }

    return true
}

/**
 * Validates the parts of a AUCTION request from a specific client. 
 * Alerts the user if validation fails.
 * 
 * @param {Socket} socket client socket
 * @param {string} apiKey client api key
 * @param {string} name item name
 * @param {number} price item price
 * @param {string} description item description
 * @returns {boolean} passes validation
 */
const validateAuction = (socket, apiKey, name, price, description) => {
    if (!AuctionServer.users[apiKey]) {
        socket.emit('error', 'You are not authorized to do this!')
        return false
    } else if (AuctionServer.auctionState !== AuctionStates.CLOSED) {
        socket.emit('error', 'Cannot submit auction requests at this time!')
        return false
    } else if (Object.keys(AuctionServer.users).length < 2) {
        socket.emit('error', 'Must have more than one user in the auction house to start and auction!')
        return false
    } else if (isNaN(price)) {
        socket.emit('error', 'Item price must be a number!')
        return false
    } else if (name === '') {
        socket.emit('error', 'Item name cannot be empty!')
        return false
    } else if (price === '') {
        socket.emit('error', 'Item price cannot be empty!')
        return false
    } else if (description === '') {
        socket.emit('error', 'Item description cannot be empty!')
        return false
    } else if (parseFloat(price) <= 0) {
        socket.emit('error', 'Item price must be greater than $0.00!')
        return false
    } // state must be CLOSED

    return true
}

/**
 * Validates that an approve request comes from an admin and that there 
 * is a pending auction to approve.
 * 
 * @param {Socket} socket client socket
 * @param {string} apiKey client api key
 * @returns {boolean} passes validation
 */
const validateApprove = (socket, apiKey, approval) => {
    if (AuctionServer.admin !== apiKey) {
        console.log(AuctionServer.admin)
        console.log(apiKey)
        socket.emit('error', 'You are not authorized to do this!')
        return false
    } else if (AuctionServer.auctionState !== AuctionStates.PENDING) {
        socket.emit('error', 'No pending auction to approve.')
        return false
    } else if (isNaN(approval) && parseInt(approval) !== 0 && parseInt(approval) !== 1) {
        socket.emit('error', 'Invalid approval value.')
        return false
    } 

    return true
}

/**
 * Validates the request to bid on the item that is currently live. The salesperson
 * cannot bid on their own item
 * 
 * @param {Socket} socket client socket
 * @param {string} apiKey client api key
 * @param {number} amount amount to bid on live item
 * @returns {boolean} passes validation
 */
const validateBid = (socket, apiKey, amount) => {
    if (!AuctionServer.users[apiKey]) {
        socket.emit('error', 'You are not authorized to do this!')
        return false
    } else if (AuctionServer.salesPerson === apiKey) {
        socket.emit('error', 'You cannot bid on your own item!')
        return false
    } else if (AuctionServer.auctionState !== AuctionStates.OPEN) {
        socket.emit('error', 'No item to bid on!')
        return false
    } else if (isNaN(amount)) {
        socket.emit('error', 'Invalid bid value!')
        return false
    } else if (parseFloat(amount) > AuctionServer.users[apiKey].balance) {
        socket.emit('error', 'You don\'t have enough money to make this bid!')
        return false
    } else if (parseFloat(amount) < AuctionServer.itemForSale.price) {
        socket.emit('error', 'Bid mus tbe higher than item\'s initial price!')
        return false
    } else if (parseFloat(amount) < AuctionServer.highestBid) {
        socket.emit('error', `Bid must be higher that the highest current bid ($${AuctionServer.highestBid.toFixed(2)}).`)
        return false
    }

    return true
}

module.exports = { validateState, validateDeposit, validateAuction, validateApprove, validateBid }