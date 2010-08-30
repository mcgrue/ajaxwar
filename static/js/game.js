AjaxWar.gamestuff = {};

AjaxWar.gamestuff.calcBuildTime = function(unitType) {
    if( unitType == 'tower' ) {
        return 1000;
    }
    
    if( unitType == 'tank' ) {
        return 5000;
    }
    
    if( unitType == 'production' ) {
        return 10000;
    }
    
    return 1000000000;
}

AjaxWar.gamestuff.canBuild = function() {
    
    if( !document.getElementById('buildtimer') ) {
        return true;
    }
    
    return false;
}