// import Constants from "./constants";
const { PORT } = require('./constants.js')
const { Server } = require('socket.io')
const { handleState } = require('./request_handlers/state.js')
const { handleNewUser } = require('./request_handlers/join.js')
const { handleDeposit } = require('./request_handlers/deposit.js')
const { handleAuction } = require('./request_handlers/auction.js')
const { handleApprove } = require('./request_handlers/approve.js')
const { handleBid } = require('./request_handlers/bid.js')
const { disconnectDeadSockets } = require('./request_handlers/disconnect.js')


console.log('starting up...' + PORT);

const app = () => {
    const io = new Server(PORT, {cors: {origin: "*"}})

    const onConnection = (socket) => {
        handleNewUser(socket)
        socket.on('STATE', handleState)
        socket.on('DEPOSIT', handleDeposit)
        socket.on('AUCTION', handleAuction)
        socket.on('APPROVE', handleApprove)
        socket.on('BID', handleBid)
        socket.on('disconnect', disconnectDeadSockets)
    }

    io.on('connection', onConnection)
}

app()
