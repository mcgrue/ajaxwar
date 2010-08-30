function rnd(num)   { return Math.floor(Math.random()*num); }
function log(s)     { try { console.log(s) } catch (e) { } }
function defined(o) { return (typeof(o)!="undefined"); }
function rgb2hex(rgbString) {
    if (typeof(rgbString)!="string" || !defined(rgbString.match)) { return null; }
    var result = rgbString.match(/^\s*rgb\s*\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*/);
    if (result==null) { return rgbString; }
    var rgb = +result[1] << 16 | +result[2] << 8 | +result[3];
    var hex = "";
    var digits = "0123456789abcdef";
    while(rgb!=0) { 
        hex = digits.charAt(rgb&0xf)+hex; 
        rgb>>>=4; 
    } 
    while(hex.length<6) { hex='0'+hex; }
    return "#" + hex;
}
function len(obj) {
    var size = 0, key;
    for (key in obj) {
        if (obj.hasOwnProperty(key)) size++;
    }
    return size;
}
