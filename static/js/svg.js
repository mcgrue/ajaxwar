
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