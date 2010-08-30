
AjaxWar.init = function(playfieldId, color, game) {
    AjaxWar.playfieldId = playfieldId;
    AjaxWar.playerColor = color;
    AjaxWar.game = game;
    
    $(document).mousemove(function (eh) {
        $('#mouse_selector').css({ 'left': eh.pageX + 'px', 'top' : (eh.pageY+16) + 'px' });
    });
    
    $(document).keypress(function (eh) {
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