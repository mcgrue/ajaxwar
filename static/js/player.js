      
var Player = function(id, color, remote, nick) {
  this.remote = remote;
  this.id = id;
  this.nick = nick;
  this.color = color;
  this.units = [];
  this.prodcount = 0;
}
Player.prototype = {
  getName: function() {
    return (this.nick) ? this.nick : this.id;
  },
  createUnit: function(id, type, x, y) {
    var unit = new AjaxWar.Unit(id, type, x, y, this);
    
    log('CREATE UNIT... ('+type+')');
    
    if(type == 'production') {
      
      this.prodcount++;
    }
    
    log('this.prodcount... ('+this.prodcount+')');
    
    this.units.push(unit);
    return unit;
  },
  die: function() {
      for (var unit in this.units) {
          unit._removeReferences();
      }
  }
}