function Entity (x,y,tile, speed, color) {
  //Entity constructor
  this.x = x;
  this.y = y;
  this.tile = tile;
  this.speed = speed;
  this.moving = false;
  this.nextMove = false;
  this.color = color;
}

Entity.prototype.centerEntity = function () {
  var c = this.tile.getTileCenter();
  if (this.moving === 'up' || this.moving === 'down'){
    this.x = c.x;
  } else if (this.moving === 'left' || this.moving === 'right') {
    this.y = c.y; 
  } else {
    this.x = c.x;
    this.y = c.y;
  }
}

Entity.prototype.inTileCenter = function(tolerance){
  var c = this.tile.getTileCenter();
  tolerance = tolerance !== undefined ? tolerance : 0;
  tolerance = tolerance*tileSize;
  if ((Math.round(this.x)- tolerance <= Math.round(c.x) + tolerance && Math.round(this.x) + tolerance >= Math.round(c.x) - tolerance) && (Math.round(this.y)-tolerance <= Math.round(c.y) + tolerance && Math.round(this.y) + tolerance >= Math.round(c.y) - tolerance)) {
    return true;
  }
  return false;
};


////////////////////////////////////////////////PACMAN////////////////////////////////////////////////////////
Pacman.prototype = new Entity();
Pacman.prototype.constructor = Pacman;
function Pacman (x,y,tile,speed, color) {
  Entity.call(this, x,y,tile,speed,color);
  this.orientation = "right";
  this.frame=0;
  this.closing = false;
  this.isGhost = false;

}
Pacman.prototype.drawPacman = function(){
    gc.fillStyle = this.color;
    var angle = 0,
        x = this.x,
        y = this.y,
        beginArc, endArc;

    switch (this.orientation) {
      case 'right':
        angle = 0;
        break;

      case 'down':
        angle = Math.PI/2;
        break;

      case 'left':
        angle = Math.PI;
        break;
      
      case 'up':
        angle = Math.PI * 3/2;
        break;

      default:
        angle = 0;

    }

    if (this.moving) {
      if (this.closing){
        this.frame-=0.02*this.speed/tileSize;
      } else {
        this.frame += 0.02*this.speed/tileSize;
      }
      
      if (this.frame >= 1) {
        this.closing = true;
      } else if (this.frame <=0){
        this.closing = false;
      }
    }
    //this.frame = 2;
    beginArc = angle+(Math.PI/3)*this.frame;
    endArc = Math.PI*2 + angle -(Math.PI/3)*this.frame;
    if(beginArc >= Math.PI*2) {
      beginArc -= Math.PI*2;
    } else if (endArc<=0) {
      endArc += Math.PI*2;
    }
    gc.beginPath();
    gc.arc(x,y,tileSize*0.6, beginArc, endArc, false);
    gc.lineTo(x,y);
    gc.closePath();
    gc.fill();
}

///////////////////////////////////////////GHOST//////////////////////////////////////////////////
Ghost.prototype = new Entity();
Ghost.prototype.constructor = Ghost;
function Ghost (x,y,tile,speed,color, tactics, target) {

  Entity.call(this, x,y,tile,speed,color);
  this.steps = 10;
  this.isGhost = true;
  this.illegalTile = false;
  this.toStep = 5;
  this.path = [];
  this.oldTile = tile;
  this.tactics = tactics;
  this.target = target;


}
Ghost.prototype.updatePath = function() {
  this.path = this.tile.path(this, this.tactics(this.target));
  if (this.path.length < 1) {
    this.path = this.tile.path(this, this.target.tile);
  }
};

Ghost.prototype.init = function() {
  this.updatePath();
  this.toStep = this.steps;
  this.step();
};

Ghost.prototype.step = function() {
  this.moving = _.first(this.path);
  this.path = _.rest(this.path);
  this.toStep = this.toStep -1;
};

Ghost.prototype.drawGhost = function () {
  gc.fillStyle = this.color;
  var x = this.x,
      y = this.y;
  gc.beginPath();
  gc.arc(x,y -tileSize/6, tileSize*0.6, 0, Math.PI, true);
  gc.moveTo(x - tileSize*0.6, y-tileSize/4);
  gc.lineTo(x- tileSize *0.6, y+ tileSize*0.6);
  gc.lineTo(x- tileSize *0.4, y+ tileSize*0.4);
  gc.lineTo(x- tileSize *0.2, y+ tileSize*0.6);
  gc.lineTo(x, y+ tileSize*0.4);
  gc.lineTo(x+ tileSize *0.2, y+ tileSize*0.6);
  gc.lineTo(x+ tileSize *0.4, y+ tileSize*0.4);
  gc.lineTo(x+ tileSize *0.6, y+ tileSize*0.6);
  gc.lineTo(x+ tileSize *0.6, y- tileSize/4);
  gc.closePath();
  gc.fill();
  gc.fillStyle="rgba(0,0,0,1)";
  gc.beginPath();
  
  gc.arc(x-tileSize/3, y- tileSize/6, tileSize*0.15, 0, 2*Math.PI, true);
  gc.closePath();
  gc.fill();
  gc.beginPath();
  gc.arc(x+tileSize/3, y - tileSize/6, tileSize*0.15, 0, 2*Math.PI, true);
  gc.closePath();
  gc.fill();
}

var ghostTypes = {
  redGhost: {
    color: "rgba(255,0,0,1)",
    tactics: function (target) {
      var currentTarget = target.tile, distance = 5, toReturn;
      function getTargetTile(target) {
        var validTiles = [];
        while (distance > 0) {
          if (currentTarget.checkDirection(target.orientation)) {
            currentTarget = currentTarget.checkDirection(target.orientation);
            if (!currentTarget.isWall()) {
              validTiles.push(currentTarget);
            }
          }
          distance = distance - 1;
        }
        if (validTiles.length > 0) {
          toReturn = _.last(validTiles);          
          if (toReturn.posX == this.tile.posX && toReturn.posY == this.tile.posY) {
            toReturn = target.tile;
          }
        } else {
          toReturn = target.tile;
        }
        return toReturn;
      }
      return getTargetTile.call(this, target);
    }
  },
  greenGhost: {
    color: "rgba(0,255,0,1)",
    tactics: function (target) {
      var currentTarget = target.tile, distance = 5, toReturn;
      function getTargetTile(target) {
        var validTiles = [];
        while (distance > 0) {
          if (currentTarget.checkDirection(oppositeDirection(target.orientation))) {
            currentTarget = currentTarget.checkDirection(oppositeDirection(target.orientation));
            if (!currentTarget.isWall()) {
              validTiles.push(currentTarget);
            }
          }
          distance = distance - 1;
        }
        if (validTiles.length > 0) {
          toReturn = _.last(validTiles);          
          if (toReturn.posX == this.tile.posX && toReturn.posY == this.tile.posY) {
            toReturn = target.tile;
          }
        } else {
          toReturn = target.tile;
        }
        return toReturn;
      }
      return getTargetTile.call(this, target);
    }
  }
};