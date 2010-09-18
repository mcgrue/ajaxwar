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
    this.div = div;
    
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
    
    
    if (unittype == 'production' || unittype == 'tank' || unittype == 'tower' ) {
        if (!this.isLocal() || this.player.units.length == 0) {
            this.finishBuild();
        } else {
            this.startBuild();
        }
    }
    
    $("#"+AjaxWar.playfieldId).prepend(div);
    
    $('#'+id).click(function(e) {
        AjaxWar.ui.clickUnit(id);
        return false;
    });
    
    
}

AjaxWar.Unit.prototype = {
    radiusColor : '#F00', 
    range : 80, //range, in pixels
    speed : 50, //pixels per second
    target: null,
    seeking: null,
    
    calculateTimeToDestination : function(x, y) {
        var x = Math.pow((this.x - x), 2);
        var y = Math.pow((this.y - y), 2);
        var d = Math.sqrt(x+y);
        return (d / this.speed) * 1000;
    },
    
    startBuild: function() {
        var buildtimer = $("<div>").html("");
        
        var targ_y = (this.y + this.div.height() + 30);
        if(this.type == 'tank') {
            targ_y -= 15; // offsetting because of odd tank size
        }
        
        buildtimer.css( 'left', (this.x-30) + 'px' );
        buildtimer.css( 'top', targ_y + 'px' );
        buildtimer.attr('id', 'buildtimer');
        
        $("#"+AjaxWar.playfieldId).prepend(buildtimer);
        
        var buildtimer_bar = $("<div>").html("");
        buildtimer_bar.attr('id', 'buildtimer_bar');
        
        $("#buildtimer").prepend(buildtimer_bar);
        
        var unit = this;
        $("#buildtimer_bar").animate(
            { width: "100%" },
            {
                duration : AjaxWar.gamestuff.calcBuildTime(this.type),
                easing: 'linear',
                complete: function() {
                    $("#buildtimer").attr('id', 'dying_bar');
                    $("#dying_bar").animate(
                        { opacity: 0 },
                        {
                            duration : 500,
                            complete: function() {
                                unit.finishBuild();
                                $(this).remove();
                            }
                        }
                    );
                }
            }
        );
    },
    
    finishBuild: function() {
        if (this.isLocal()) { 
            if (this.player.units.length > 1) {
                AjaxWar.game.send('unitcreate', {'unit': this.serialize()});
            }
            
            if( this.type === 'tank' || this.type === 'tower' ) {
                if (this.type === 'tank') {
                    this.div.draggable({
                        start: function(evt, ui) {
                            AjaxWar.ui.dragTank(this.id, evt, ui);
                        },
                        stop: function(evt, ui) {
                            AjaxWar.ui.dropTank(this.id, evt, ui);
                        }
                    });
                    this.div.css('position', 'absolute'); // no, jquery, I don't want draggable things to always be relative.
                }
                this.rangeCircle = AjaxWar.svg.makeCircle(this.x,this.y,this.range,'red','red');
                this.rangeCircle.hide();
            } else if (this.type === 'production') {
                this.range = 120;
                this.rangeCircle = AjaxWar.svg.makeCircle(this.x,this.y,this.range,this.player.color);
                this.rangeCircle.click(function(e){
                    if( !AjaxWar.ui.indicator.isValid() ) {
                        return;
                    }

                    if( !AjaxWar.gamestuff.canBuild() ) {
                        return;
                    }

                    var id = AjaxWar.getNextRef();
                    var unitType = AjaxWar.ui.indicator.cursor;
                    var mousePos = AjaxWar.util.relPosition("#"+AjaxWar.playfieldId, e.pageX, e.pageY);

                    var unit = AjaxWar.game.getPlayer().createUnit(id, unitType, mousePos.x, mousePos.y);

                    return false;
                });

            }
        }
        
        
        log('created unit #'+this.id+' ('+this.type+')');
    },
    
    blink: function() {
        $(this.div).fadeOut(100).fadeIn(100);
    },
    
    isEnemyOf: function(unit) {
        return (unit.player.id != this.player.id);
    },
    
    isLocal: function() {
        return (this.player.id == AjaxWar.game.clientId);
    },
    
    findTarget: function() {
        for (var id in AjaxWar._objRefs) {
            var o = AjaxWar._objRefs[id];
            if (o.hasOwnProperty('player') && o.isEnemyOf(this) && o.inRangeOf(this)) {
                this.attack(o);
                break;
            }
        }
    },
    
    attack: function(unit) {
        clearInterval(this.seeking);
        log("attack! ("+this.id+" on "+unit.id+" violenced)");
        unit.blink();
        if (rnd(100) < 20)
            unit.die();
        var tank = this;
        //setTimeout(function() { tank.findTarget() }, 2000);
    },
    
    die: function() {
        log("die");
        this.div.remove();
        AjaxWar.killRef(this.id);
    },
    
    inRangeOf: function(unit) {
        var x = Math.pow((this.x - unit.x), 2);
        var y = Math.pow((this.y - unit.y), 2);
        var d = Math.sqrt(x+y);
        return (d < unit.range);
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
              },

            complete: function() {
                clearInterval(tank.seeking);	
                tank.findTarget();
            }
        });
      
        this.findTarget();
        this.seeking = setInterval(function() { tank.findTarget() }, 2000);
    },
    
    serialize: function() {
      return {id: this.id, type: this.type, x: this.x, y: this.y};  
    },
};
//////// End Unit Class