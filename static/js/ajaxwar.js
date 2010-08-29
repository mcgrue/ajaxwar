AjaxWar = {};

AjaxWar._objRefIds = [];
AjaxWar._objRefs = {};

AjaxWar.getNextRef = function () {
    return AjaxWar.playerColor + '_' + AjaxWar._objRefIds.length;
}

AjaxWar.addRef = function (id, ref) {
    AjaxWar._objRefIds.push(id);
    AjaxWar._objRefs[id] = ref;
}

AjaxWar.killRef = function(id) {
    for(var i=0; i<AjaxWar._objRefIds.length; i++) {
        if( AjaxWar._objRefIds[i] === id ) {
            AjaxWar._objRefIds.splice(i,1);
            break;
        }
    }
    
    delete AjaxWar._objRefs[id];
}

AjaxWar.getUnitById = function(id) {
    return AjaxWar._objRefs[id];
}

//////// SVG STUFF
AjaxWar.svg = {};
AjaxWar.svg._canvas = false;
AjaxWar.svg.init = function() {
    var playfieldId = AjaxWar.playfieldId;
    
    var node = document.getElementById(playfieldId);
    var width = $('#'+playfieldId).width();
    var height = $('#'+playfieldId).height();
    
    AjaxWar.svg._canvas = Raphael(node, width, height);
}

AjaxWar.svg.makeCircle = function(x,y,r,fill,stroke) {
    var circle = AjaxWar.svg._canvas.circle(x,y,r);
    if (stroke) {
        circle.attr('stroke', stroke);
    } else {
        circle.attr("stroke-width", 0);
    }
    circle.attr("fill", fill);
    circle.attr("fill-opacity", 0.10);
    return circle;
}

//////// Unit Class
AjaxWar.Unit = function(id, unittype, x, y, player) {
    this.id = id;
    this.type = unittype;
    this.x = x;
    this.y = y;
    this.player = player;
    
    var div = $("<div>").html("");
    div.addClass(unittype);
    div.addClass('player-'+player.id);
    div.css( 'left', x + 'px' );
    div.css( 'top', y + 'px' );

    
    div.attr('id', id);
    AjaxWar.addRef(id, this); 
    
    if (unittype == 'production') {
        var canvas = Raphael(div[0], 60, 60);
        this.svg = canvas.set();
        this.svg.push(
            canvas.rect(5,30,45,25),
            canvas.rect(5,5,7,25),
            canvas.rect(20,5,7,25)
        ); 
    } else if (unittype == 'tower') {
         var canvas = Raphael(div[0], 60, 60);
         this.svg = canvas.set();
         this.svg.push(
             canvas.rect(19,20,22,16),
             canvas.path("M 30 20 L 55 55 L 5 55 z"),
             canvas.rect(30,25,30,3)
         );
    } else if (unittype == 'tank' || unittype == 'ghosttank') {
        var canvas = Raphael(div[0], 60, 30);
        this.svg = canvas.set();
        this.svg.push(
            canvas.rect(10,15,38,12),
            canvas.circle(10,21,6),
            canvas.circle(48,21,6),
            canvas.rect(24,5,18,10),
            canvas.rect(30,8,30,3)
        );
    }
    this.svg.attr({
        fill: this.player.color,
        'stroke-width': 0,
        opacity: (unittype == 'ghosttank') ? 0.5 : 1
    });
    
    if (unittype === 'tank' && this.player.id == AjaxWar.game.clientId) {
        div.draggable({
            start: function(evt, ui) {
                AjaxWar.ui.dragTank(id, evt, ui);
            },
            stop: function(evt, ui) {
                AjaxWar.ui.dropTank(id, evt, ui);
            }
        });
        
        div.css('position', 'absolute'); // no, jquery, I don't want draggable things to always be relative.
    }
    
    if (this.player.id == AjaxWar.game.clientId) { 
        if( unittype === 'tank' || unittype === 'tower' ) {
            this.rangeCircle = AjaxWar.svg.makeCircle(x,y,this.range,'red','red');
            this.rangeCircle.hide();
        } else if (unittype === 'production') {
            this.range = 120;
            this.rangeCircle = AjaxWar.svg.makeCircle(x,y,this.range,this.player.color);
            this.rangeCircle.click(function(e){
                if( !AjaxWar.ui.indicator.isValid() ) {
                    return;
                }

                var id = AjaxWar.getNextRef();
                var unitType = AjaxWar.ui.indicator.cursor;
                mousePos = AjaxWar.util.relPosition("#"+AjaxWar.playfieldId, e.pageX, e.pageY);

                var unit = AjaxWar.game.getPlayer().createUnit(id, unitType, mousePos.x, mousePos.y);
                AjaxWar.game.send('unitcreate', {'unit': unit.serialize()});

                return false;
            });
            
        }
    }
    
    $("#"+AjaxWar.playfieldId).prepend(div);
    
    $('#'+id).click(function(e) {
        AjaxWar.ui.clickUnit(id);
        return false;
    });
    
    log('created unit #'+id+' ('+unittype+')');
    
    this.div = div;
}

AjaxWar.Unit.prototype = {
    radiusColor : '#F00', 
    range : 80, //range, in pixels
    speed : 50, //pixels per second
    
    calculateTimeToDestination : function(x, y) {
        var x = Math.pow((this.x - x), 2);
        var y = Math.pow((this.y - y), 2);
        var d = Math.sqrt(x+y);
        return (d / this.speed) * 1000;
    },
    
    move : function(x, y) {
      var animTime = this.calculateTimeToDestination(x, y);
      var tank = this;
      this.div.animate({ 
          left: x,
          top: y,
          }, {
              duration : animTime,
              step :  function(evt,obj) { 
                  tank.x = tank.div.position().left;
                  tank.y = tank.div.position().top;
                  if (tank.rangeCircle) {
                      tank.rangeCircle.animate({cx:tank.x, cy:tank.y}, 0)
                  }
              }
          } 
      );
    },
    
    serialize: function() {
      return {id: this.id, type: this.type, x: this.x, y: this.y};  
    },
};
//////// End Unit Class

AjaxWar.util = {};
AjaxWar.ui = {};

AjaxWar.util.relPosition = function (element, mouseX, mouseY) {
    var offset = $(element).offset();
    var x = mouseX - offset.left;
    var y = mouseY - offset.top;
    
    return {'x': parseInt(x), 'y': parseInt(y)};
}

AjaxWar.util.inArray = function (haystack, needle) {
    if( haystack.length ) {
        for (var i=0; i < haystack.length; i++) {
            if (haystack[i] === needle) {
                 return true;
            }
        }
    } else {
        for( var i in haystack ) {
            if (haystack[i] === needle) {
                 return true;
            }                    
        }
    }
    return false;
};

AjaxWar.util.count = function( obj ) {
    var count = 0;
    for( var k in obj ) {
        if( obj.hasOwnProperty(k) ) {
           ++count;
        }
    }
    
    return count;
}

AjaxWar.ui.clickUnit = function(id) {
    log('CLICKED UNIT ' + id);
}

AjaxWar.ui.indicator = {};
AjaxWar.ui.indicator.clearIndicator = function() {
    //$('#tank_indicator').css('border', 'solid 4px white');
    //$('#production_indicator').css('border', 'solid 4px white');
    //$('#tower_indicator').css('border', 'solid 4px white');
}

AjaxWar.ui.indicator.cursor_idx = 0;
AjaxWar.ui.indicator.cursor = 'not_a_unit';
AjaxWar.ui.indicator.keyMappings = {
    1 : 'tank',
    2 : 'tower',
    3 : 'production'
};
AjaxWar.ui.indicator.isValid = function() {
    return AjaxWar.util.inArray(AjaxWar.ui.indicator.keyMappings, AjaxWar.ui.indicator.cursor);
}

AjaxWar.ui.updateSelector = function(key) {
    var map = AjaxWar.ui.indicator.keyMappings[key];
    
    if( map ) {
        AjaxWar.ui.indicator.clearIndicator();
        
        //$('#'+map+'_indicator').css('border', 'solid 4px red');
        AjaxWar.ui.indicator.cursor_idx = +key;
        AjaxWar.ui.indicator.cursor = map;
    }            
}

AjaxWar.ui.updateSelector(1);

AjaxWar.ui._ghost = false; //lazy grue is lazy
AjaxWar.ui._ghostBuster = function() {
    if(AjaxWar.ui._ghost) {
        var id = AjaxWar.ui._ghost.id;
        $( '#' + id ).remove();
        AjaxWar.killRef(id);
    }
    
    AjaxWar.ui._ghost = false;
}

AjaxWar.ui.dragTank = function(id, evt, ui) {
    log( 'startTankMove: ' + id );
    AjaxWar.ui._ghostBuster();
    
    var myTank = AjaxWar.getUnitById(id);
    var ghost = new AjaxWar.Unit(id+'-movement_ghost', 'ghosttank', myTank.x, myTank.y, AjaxWar.game.getPlayer());
    
    ghost.div.css( 'opacity', '.5' );
    AjaxWar.ui._ghost = ghost;
}

AjaxWar.ui.dropTank = function(id, evt, ui) {
    log( 'endTankMove: ' + id );
    AjaxWar.ui._ghostBuster();
    
    var myTank = AjaxWar.getUnitById(id);
    
    myTank.div.css( 'left', myTank.x + 'px' );
    myTank.div.css( 'top', myTank.y + 'px' );
    
    endPos = AjaxWar.util.relPosition("#"+AjaxWar.playfieldId, evt.pageX, evt.pageY);
    
    myTank.move(endPos.x, endPos.y);
    AjaxWar.game.send('unitmove', {'unit': myTank.serialize(), 'x': endPos.x, 'y': endPos.y});
}

AjaxWar.init = function(playfieldId, color, game) {
    AjaxWar.playfieldId = playfieldId;
    AjaxWar.playerColor = color;
    AjaxWar.game = game;
    
    $(document).keypress(function (eh){
        var key = parseInt(String.fromCharCode(eh.charCode));
        AjaxWar.ui.updateSelector(key);
        
    });
    $(document).keydown(function (eh) {
        // Press R
        if (eh.keyCode == 82) {
          $(".player-"+game.clientId+".tank,.player-"+game.clientId+".tower").each(function(i,el) {
              AjaxWar.getUnitById(el.id).rangeCircle.show();
          })
        } 
    });
    $(document).keyup(function (eh) {
        // Press R
        if (eh.keyCode == 82) {
          $(".player-"+game.clientId+".tank,.player-"+game.clientId+".tower").each(function(i,el) {
              AjaxWar.getUnitById(el.id).rangeCircle.hide();
          })
        } 
    });

    
    $(document).bind('contextmenu', function(e) {
    
        AjaxWar.ui.indicator.cursor_idx
    
        AjaxWar.ui.indicator.cursor_idx++;
    
        if( AjaxWar.ui.indicator.cursor_idx > AjaxWar.util.count(AjaxWar.ui.indicator.keyMappings) ) {
            AjaxWar.ui.indicator.cursor_idx = 1;
        }
    
        AjaxWar.ui.updateSelector(AjaxWar.ui.indicator.cursor_idx);
    
        return false;
    });
    
    AjaxWar.svg.init();
    
    log('ajaxwar initialized');
}