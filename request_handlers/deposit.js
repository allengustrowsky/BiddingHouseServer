const { AuctionServer } = require('../serverState.js')
const { validateDeposit } = require('../validators.js')

function handleDeposit (apiKey, amount) {
    const socket = this
    try {
        if (validateDeposit(socket, apiKey, amount)) {
            AuctionServer.users[apiKey].balance += parseFloat(amount)
            AuctionServer.SendStateUpdate(apiKey, `You deposited $${parseFloat(amount).toFixed(2)}.`)
        }
    } catch (e) {
        console.log(`Error occurred: ${e}`)
        socket.emit('error', 'An error occurred. Please try again.')
    }
    
}

module.exports = { handleDeposit }