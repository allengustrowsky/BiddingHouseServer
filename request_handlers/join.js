const { AuctionServer } = require('../serverState.js')
const { User } = require('../entities/user.js')
const Crypto = require('crypto')

function handleNewUser(socket) {
    try {
        console.log('join')
        const query = socket.handshake.query
        if (!query.name) {
            socket.emit('initError', 'Please enter a valid name.')
        } else if (!query.balance) {
            socket.emit('initError', 'Please enter an initial balance.')
        } else if (isNaN(query.balance)) {
            socket.emit('initError', 'Invalid initial balance amount.')
        } else {
            const usr = new User(query.name, parseFloat(query.balance), socket)
            const apiKey = Crypto.randomBytes(32).toString('hex')
            console.log(apiKey)
            AuctionServer.users[apiKey] = usr
            if (Object.keys(AuctionServer.users).length === 1) {
                AuctionServer.admin = apiKey
            }
            socket.emit('join', apiKey)
            AuctionServer.Announce(`${usr.name} joined the auction house!`)
    
        }    
    } catch (e) {
        console.log(`Error occurred: ${e}`)
        socket.emit('initError', 'An error occurred. Please try again.')
    }

}

module.exports = { handleNewUser }