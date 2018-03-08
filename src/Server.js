const net = require('net');

const Client = require('./Client');
const ConnectionManager = require('./ConnectionManager');
const {idGenerator} = require('./utils/idGenerator');
const message = require('./const/message');

class Server extends net.Server {
  constructor() {
    super({pauseOnConnect: true});

    this.connectionManager = new ConnectionManager();
    this.clientIDGenerator = idGenerator(1);

    this.on('connection', socket => this._onConnection(socket));
  }

  async close() {
    await this.connectionManager.invoke('close');
    await new Promise(resolve => super.close(() => resolve()));
    return this;
  }

  async listen(port) {
    await new Promise(resolve => super.listen(port, () => resolve()));
    return this;
  }

  _onConnection(socket) {
    const id = this.clientIDGenerator.next().value;
    const client = new Client(id, socket);
    client.once('close', () => this.connectionManager.remove(client.id));

    this.connectionManager.add(client);
    this.emit('client', client);

    client.send(message.GREETING)
    .then(() => client.resume())
    .catch(() => client.close());
  }
}

module.exports = Server;
