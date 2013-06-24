function collision (e1, e2) {
  if (Math.abs(e1.x - e2.x) <= tileSize && Math.abs(e1.y - e2.y) <= tileSize){
    return true;
  }
  return false;
}


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

Entity.prototype.update = function (){

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
  this.weapon = weapons.shotgun;

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
Pacman.prototype.fire = function(speed){
  return this.weapon.fire(this.x, this.y, this.orientation, speed)
}
///////////////////////////////////////////GHOST//////////////////////////////////////////////////
Ghost.prototype = new Entity();
Ghost.prototype.constructor = Ghost;
function Ghost (x,y,tile,speed,color, tactics, target) {

  Entity.call(this, x,y,tile,speed,color);
  this.steps = 20;
  this.isGhost = true;
  this.illegalTile = false;
  this.toStep = 5;
  this.path = [];
  this.oldTile = tile;
  this.tactics = tactics;
  this.initialized = false;
  this.target = target;


}
Ghost.prototype.updatePath = function() {
  console.log(this.orientation);
  this.path = this.tile.path(this, this.tactics(this.target));
  if (this.path.length < 1) {
    this.path = this.tile.path(this, this.target.tile);
  }
};

Ghost.prototype.init = function() {
  this.updatePath();
  this.toStep = this.steps;
  this.step();
  this.initialized = true;
};

Ghost.prototype.step = function() {
  this.moving = _.first(this.path);
  if (this.moving) {
    this.orientation = this.moving;  
  }
  this.illegalTile = this.tile.checkDirection(oppositeDirection(this.orientation));
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
  this.drawEyes(x,y);
};

Ghost.prototype.drawEyes = function (x,y) {
  //White Background
  gc.fillStyle="rgba(255,255,255,1)";
  gc.beginPath();
  gc.arc(x-tileSize/3, y- tileSize/6, tileSize*0.15, 0, 2*Math.PI, true);
  gc.closePath();
  gc.fill();
  gc.beginPath();
  gc.arc(x+tileSize/3, y - tileSize/6, tileSize*0.15, 0, 2*Math.PI, true);
  gc.closePath();
  gc.fill();

  //Pupils
  //vector calculation for determining direction to target
  var eyesDirection = [-this.tile.posX + this.target.tile.posX, -this.tile.posY + this.target.tile.posY]; //not sure why - +
  var length = Math.sqrt(Math.pow(eyesDirection[0],2) + Math.pow(eyesDirection[1],2));
  eyesDirection = _.map(eyesDirection, function(v){
    if (length === 0) return 0;
    return v/length;
  });  //normalization

  gc.fillStyle="rgba(0,0,0,1)";
  gc.beginPath();
  gc.arc(x+tileSize/3+eyesDirection[0]*tileSize*0.05, y-(tileSize/6)+eyesDirection[1]*tileSize*0.05,tileSize*0.1, 0 ,2*Math.PI, true);
  gc.closePath();
  gc.fill();
  gc.beginPath();
  gc.arc(x-tileSize/3+eyesDirection[0]*tileSize*0.05, y-(tileSize/6)+eyesDirection[1]*tileSize*0.05,tileSize*0.1, 0 ,2*Math.PI, true);
  gc.closePath();
  gc.fill();
}

function Bullet (x,y,direction, speed) {
  this.x = x;
  this.y = y;
  this.direction = direction;
  this.damage = 1;
  this.speed = speed;
}

Bullet.prototype.draw = function() {
  gc.strokeStyle = "rgba(255,255,255,1)";
  gc.beginPath();
  gc.moveTo(this.x, this.y);
  gc.lineTo(this.x-this.direction[0]*tileSize, this.y-this.direction[1]*tileSize);
  gc.stroke();
};

Bullet.prototype.step = function (dt) {
  this.x = this.x + this.direction[0]*dt*this.speed;
  this.y = this.y + this.direction[1]*dt*this.speed;
  if (this.x < startX) {
      this.x = gameCanvas.width-1-startX;
  } else if (this.x > gameCanvas.width-startX -1) {
      this.x = startX+1;
  }
  if (this.y < startY) {
      this.y = gameCanvas.height-1-startY;
  } else if (this.y > gameCanvas.height-startY -1) {
      this.y = startY+1;
  }
};

Bullet.prototype.destroy = function (index) {
  this.index = index;
  this.destroyed = true;
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
  },
  blueGhost: {
    color: "rgba(0,0,255,1)",
    tactics: function (target) {
      return getRandomTile(world, "any", ["wall"]);
    }
  }
};

var weapons = {
  shotgun: {
    frame: 0,

    fire: function(x,y,direction, speed){
      var toReturn = [], angle, startAngle, angularDistance, spread = Math.PI/12, bullets = 10;
      switch (direction) {
        case 'up':
          angle = Math.PI*3/2;
          break;
        case 'down':
          angle = Math.PI/2;
          break;
        case 'left':
          angle = Math.PI;
          break;
        case 'right':
          angle = Math.PI*2;
          break;
      }
      startAngle = angle - spread/2;
      angularDistance = spread/bullets;
      for (var i=0; i < bullets; i=i+1) {
        toReturn.push(new Bullet(x,y,[Math.cos(startAngle), Math.sin(startAngle)], speed));
        startAngle = startAngle + angularDistance;
      }
      return toReturn;
    }
  }
}