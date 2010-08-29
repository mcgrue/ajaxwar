



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