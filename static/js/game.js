AjaxWar.gamestuff = {};

AjaxWar.gamestuff.calcBuildTime = function(unitType, player) {
    
    
    log('calcBuildTime... ('+unitType+')');
    log('player... ('+player+')');
    log('player.prodcount... ('+player.prodcount+')');
    
    if( unitType == 'tower' ) {
        return 1000 / player.prodcount;
    }
    
    if( unitType == 'tank' ) {
        return 5000 / player.prodcount;
    }
    
    if( unitType == 'production' ) {
        return 10000 / player.prodcount;
    }
    
    return 1000000000;
}

AjaxWar.gamestuff.canBuild = function() {
    
    if( !document.getElementById('buildtimer') ) {
        return true;
    }
    
    return false;
}

var Game = function(playerCount, clientId, isHost) {
  this.isHost = isHost;
  this.playerCount = playerCount;
  this.clientId = clientId;
  this.players = {};
}
Game.prototype = {
  send: function(type, data) {
    if (!data) data = {};
    data['type'] = 'game:'+type;
    data['client'] = this.clientId;
    //$.ajaxSetup({contentType: 'application/json'});
    $.post('?send', {"json":JSON.stringify(data), "type": data['type']});
  },
  
  receive: function(message) {
    message = JSON.parse(message.json); // this shit is fucked
    if (message.client != this.clientId) {
      this['on'+message.type.split(':')[1]](message);
    }
  },
  
  getPlayer: function() {
    return this.players[this.clientId];
  },
  
  
  // if somebody tries to join when playing, we tell them to bugger off
  onjoin: function(event) {
    if (this.isHost) {
      this.send('playing');
    }
  },
  
  start: function() { 
    displayText("Starting game...");
    $('#screen').css('background-image', 'none');
    AjaxWar.init('screen', color, this);
    this.send('enter', {color: color});
    this.createPlayer(this.clientId, color, false);
    if (this.playerCount == 1 && this.isHost) this.setupLocations(); // if player count is 1
  },
  
  
  onenter: function(event) {
    if (!this.hasOwnProperty(event.client) && len(this.players) < this.playerCount) {
      this.createPlayer(event.client, event.color, true);
    }
    if (len(this.players) == this.playerCount && this.isHost) {
      this.setupLocations();
    }
  },
  
  setupLocations: function() {
    var startingCorners = [[10,10], [60,10], [10, 60], [60,60]];
    var location = null, unit = null, locations = {};
    for (var i in this.players) {
      location = startingCorners.splice(rnd(startingCorners.length), 1)[0];
      location = denormalizePosition((location[0] + rnd(30))/100, (location[1] + rnd(30))/100);
      unit = this.players[i].createUnit(AjaxWar.getNextRef(), 'production', location.x, location.y);
      locations[i] = unit.serialize();
    }
    setInterval(AjaxWar.combatTick, 2000);
    this.send('start', {'locations': locations});
  },
  
  onstart: function(event) {
    for (var i in event.locations) {
      this.players[i].createUnit(
        event.locations[i].id, 
        event.locations[i].type, 
        event.locations[i].x, 
        event.locations[i].y);
    }
  },
  
  onattack: function(event) {
    var unit = AjaxWar.getUnitById(event.target);
    unit.blink();
  },
  
  onkill: function(event) {
    var unit = AjaxWar.getUnitById(event.target);
    unit.die();
  },
  
  onunitcreate: function(event) {
    this.players[event.client].createUnit(event.unit.id, event.unit.type, event.unit.x, event.unit.y);
  },
  
  onunitmove: function(event) {
    var unit = AjaxWar.getUnitById(event.unit.id);
    unit.move(event.x, event.y);
  },
  
  createPlayer: function(id, color, remote) {
    displayText("Player '"+id+"' joined");
    this.players[id] = new Player(id, color, remote);
  },
  
  sendChat: function(chat) {
    this.send('chat', {chat: chat});
  },
  
  onchat: function(event) {
    displayChat(this.players[event.client], event.chat);
  },
  
  setNick: function(nick) {
    this.players[this.clientId].nick = nick;
    this.send('nick', {'nick': nick});
  },
  
  onnick: function(event) {
    var player = this.players[event.client];
    displayText(player.getName() + " changed name to "+event.nick);
    player.nick = nick;
  },
};