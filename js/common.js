(function(exports) {
  //PI Definitions
  exports.pi = {};
  exports.pi.one = Math.PI;
  exports.pi.double = Math.PI *2;
  exports.pi.half = Math.PI /2;
  exports.pi.threeHalf = Math.PI *3/2;
  exports.pi.third = Math.PI / 3;
  exports.pi.twelfth = Math.PI / 12;

  exports.TileSize = function (size) {
    this.size = size;
    this.update(size);
  }

  exports.TileSize.prototype.update = function (size){
    this.size = size;
    this.double = size * 20/10;
    this.doubleThird = (size*2/3)*10/10;
    this.half = (size/2)*10/10;
    this.third = (size/3)*10/10;
    this.quarter = (size/4)*10/10;
    this.fifth = (size/5)*10/10;
    this.sixth = (size/6)*10/10;
    this.eighth = (size/8)*10/10;
    this.twelfth = (size/12)*10/10;
    this.o4 = (size*0.4)*10/10;
    this.o6 = (size*0.6)*10/10;
    this.o15 = (size*0.15);
    this.oo5 = (size*0.05);
    this.o1 =(size*0.1);
  };

})(this);