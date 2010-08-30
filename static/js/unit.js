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
    
    if (unittype == 'production' || unittype == 'tank' || unittype == 'tower' ) {
        var buildtimer = $("<div>").html("");
        
        var targ_y = (y + div.height() + 30);
        if(unittype == 'tank') {
            targ_y -= 15;
        }
        
        buildtimer.css( 'left', (x-30) + 'px' );
        buildtimer.css( 'top', targ_y + 'px' );
        buildtimer.attr('id', 'buildtimer');
        
        $("#"+AjaxWar.playfieldId).prepend(buildtimer);
        
        var buildtimer_bar = $("<div>").html("");
        buildtimer_bar.attr('id', 'buildtimer_bar');
        
        $("#buildtimer").prepend(buildtimer_bar);
        
        $("#buildtimer_bar").animate(
            { width: "100%",},
            {
                duration : AjaxWar.gamestuff.calcBuildTime(unittype),
                complete: function() {
                    $("#buildtimer").attr('id', 'dying_bar');
                    $("#dying_bar").animate(
                        { opacity: 0,},
                        {
                            duration : 500,
                            complete: function() {
                                $(this).remove();
                            }
                        }
                    );
                }
            }
        );
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
                
                if( !AjaxWar.gamestuff.canBuild() ) {
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