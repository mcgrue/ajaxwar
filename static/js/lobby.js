var Lobby = function(size, startGame) {
  this.size = size;
  this.state = 'joining'; // joining, waiting, playing
  this.isHost = null;
  this.clientId = Math.floor(Math.random()*2048).toString(16);
  this.clients = [];
  //this.host = null;
  this.startGame = startGame;
}
Lobby.prototype = {
  send: function(type, data) {
    if (!data) { data = {} }
    data['type'] = type;
    data['client'] = this.clientId;
    $.post('?send', data);
  },
  receive: function(message) {
    if (message.client != this.clientId) {
        this['on'+message.type](message);
    }
  },
  join: function() {
    this.state = 'joining';
    this.send('join')
    if (this.isHost == null) {
      lobby = this;
      setTimeout(function() { 
        if (lobby.isHost == null) {
          lobby.send('host');
          lobby.isHost = true;
          console.log("Became host.");
          lobby.clients.push(lobby.id);
          lobby.onwait();
        }
      }, 3000);
    }
  },
  onhost: function(event) { 
    // Master has appeared, rejoin
    this.isHost = false;
    this.join(); 
  },
  onjoin: function(event) {
    if (this.isHost) {
      if (this.state == 'waiting') {
        this.clients.push(event.client);
        console.log("Player joined");
        if (this.clients.length == this.size) {
          this.play();
        } else {
          this.send('wait');
        }
      } 
      else if (this.state == 'playing') {
        this.send('playing');
      }
    }
  },
  onplaying: function(event) {
    if (this.state == 'joining') {
      this.isHost = false;
      console.log("Game in session");
    }
  },
  onwait: function(event) {
    if (this.isHost == null) { this.isHost = false; }
    console.log("Waiting for clients...")
    this.state = 'waiting';
  },
  play: function() {
    this.send('play');
    this.onplay();
  },
  onplay: function(event) {
    if (this.isHost == null) { this.isHost = false; }
    this.state = 'playing';
    this.startGame(this);
  },
}
