class User {
    constructor(name, balance, socket) {
        this.name = name
        this.balance = balance
        this.inventory = []
        this.soldItems = []
        this.socket = socket
    }

}

module.exports = { User };