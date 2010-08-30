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
    for(var i in AjaxWar._objRefIds) {
        if( AjaxWar._objRefIds[i] === id ) {
            AjaxWar._objRefIds.splice(i,1);
            break;
        }
    }
    
    delete AjaxWar._objRefs[id];
}

AjaxWar.seek = function(unit) {
    log("seek")
    if (unit.seeking) {
        unit.findTarget();
        setTimeout(function() { AjaxWar.seek(unit) }, 2000);
    }
}

AjaxWar.getUnitById = function(id) {
    return AjaxWar._objRefs[id];
}

AjaxWar.util = {};

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