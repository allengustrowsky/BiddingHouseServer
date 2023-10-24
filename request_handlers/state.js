const { AuctionServer } = require('../serverState.js')
const { validateState } = require('../validators.js')

function handleState (apiKey) {
    const socket = this
    try {
        if (validateState(socket, apiKey)) {
            AuctionServer.SendStateUpdate(apiKey, 'Loading initial data.')
        }
    } catch (e) {
        console.log(`Error occurred: ${e}`)
        socket.emit('error', 'An error occurred. Please try again.')
    }
}

module.exports = { handleState }