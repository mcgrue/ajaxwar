AjaxWar.ui = {};

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

AjaxWar.ui.indicator.iconMappings = {
    'tank' : '/static/icon-tank.png',
    'tower' : '/static/icon-tower.png',
    'production' : '/static/icon-prod.png'
}

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
        
        $('#mouse_selector').css({ 'background-image': 'url(' + AjaxWar.ui.indicator.iconMappings[map] + ')' });
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