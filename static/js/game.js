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