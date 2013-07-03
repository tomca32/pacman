function collision (e1, e2) {
  if (Math.abs(e1.x - e2.x) <= tileSize && Math.abs(e1.y - e2.y) <= tileSize){
    return true;
  }
  return false;
}


function Entity (x,y,tile, speed, color) {
  //Entity constructor
  this.dead = false;
  this.x = x;
  this.y = y;
  this.tile = tile;
  this.speed = speed;
  this.moving = false;
  this.nextMove = false;
  this.color = color;
}

Entity.prototype.update = function (dt){
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
    this.tile = getTileAt(this.x, this.y);
    if (this.inTileCenter(0.012 * this.speed/tileSize)) {
        
      if (this.isGhost) {
        if (this.tile.type === 'enemy' && this.HP < this.defaultHP) {
          this.HP = this.HP + 10;
          if (this.HP >= this.defaultHP) {
            this.dead = false;
            this.target = this.defaultTarget;
          }
        }
        if (!(this.tile.posX === this.oldTile.posX && this.tile.posY === this.oldTile.posY) || this.path.length <1){
          if (this.toStep <= 0 || this.path.length <1){
            this.init();
          } else {
            this.step();
          }
          this.oldTile = this.tile;
          //this.illegalTile = this.oldTile;
          
        }
      } else {

        if (tileIsWall(this.tile.checkDirection(this.moving))){
          this.moving = false;
          this.centerEntity();
        }

        if(!tileIsWall(this.tile.checkDirection(this.nextMove))) {
          this.moving = this.nextMove;
          if (this.nextMove){
            this.orientation = this.nextMove;
          }
        }
      }
    }
    this.centerEntity();
    if (this.moving) {
      this.moveEntity(dt); 
    }
    if (this.weapon) {
      this.weapon.update(dt);
    }
};

Entity.prototype.moveEntity = function (dt){
  switch (this.moving) {
    case 'up':
      this.y -= this.speed*dt;
      break;

    case 'down':
      this.y += this.speed*dt;
      break;

    case 'left':
      this.x -= this.speed*dt;
      break;

    case 'right':
      this.x += this.speed*dt;
      break;
  }
};

Entity.prototype.changeMovement = function(direction){
  this.nextMove = direction;
};

Entity.prototype.centerEntity = function () {
  var c = this.tile.getTileCenter();
  if (this.orientation === 'up' || this.orientation === 'down'){
    this.x = c.x;
  } else if (this.orientation === 'left' || this.orientation === 'right') {
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

Entity.prototype.hit = function (damage) {
  if (this.dead) return;
  this.HP = this.HP - damage;
  if (this.HP<=0) this.die();
  SPREE.countdown = 3;
  SPREE.kills +=1;
  if (SPREE.kills === 2) {
    killSound(doubleKill, 'DOUBLE KILL');
  }
  if (SPREE.kills === 3) {
    killSound(multiKill, 'MULTI KILL');
  }
  if (SPREE.kills === 4) {
    killSound(monsterKill, 'MONSTER KILL');
  }
  if (SPREE.kills >= 5) {
    killSound(holyShit, 'HOLY SHIT');
  }
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
  this.weapon = new Weapon(weapons.zapGun);

}
Pacman.prototype.drawPacman = function(){
  if (this.dead) return;
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
Pacman.prototype.fire = function(){
  if (this.weapon.delay > 0) return false;
  this.weapon.delay = this.weapon.rof;
  return this.weapon.fire(this.x, this.y, this.orientation, this);

}
Pacman.prototype.die = function () {
  if (!this.dead){
    damn.play();
    this.dead = true;
  }
};
///////////////////////////////////////////GHOST//////////////////////////////////////////////////
Ghost.prototype = new Entity();
Ghost.prototype.constructor = Ghost;
function Ghost (x,y,tile,speed,color, tactics, fallback, target) {

  Entity.call(this, x,y,tile,speed,color);
  this.steps = 20;
  this.isGhost = true;
  this.illegalTile = false;
  this.toStep = 5;
  this.path = [];
  this.oldTile = tile;
  this.tactics = tactics;
  this.fallback = fallback;
  this.defaultTarget = target;
  this.target = target;
  this.defaultHP = 10;
  this.HP = 10;


}
Ghost.prototype.updatePath = function() {
  if (this.target.hasOwnProperty('type')) {
    this.path = this.tile.path(this, this.target);
  } else {
    this.path = this.tile.path(this, this.tactics(this.target));
    if (this.path.length < 1) {
      this.path = this.tile.path(this, this.fallback(this.target));
    }
  }
  if (!this.path.length && !this.dead) {
    console.log(this);
    //in case of a dead end - ghost can go back
    this.illegalTile = false;
    this.updatePath();
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

Ghost.prototype.die = function () {
  this.dead = true;
  this.target = randomTileFromArray(world.ghostStart);
}

Ghost.prototype.draw = function () {
  var x = this.x,
  y = this.y;
  gc.fillStyle = this.color;
  gc.globalAlpha = this.HP/1000 + 1;
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
  gc.globalAlpha = 1;
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
  if (this.target.hasOwnProperty('tile')){
    var eyesDirection = [-this.tile.posX + this.target.tile.posX, -this.tile.posY + this.target.tile.posY]; //not sure why - +  
  } else {
    var eyesDirection = [-this.tile.posX + this.target.posX, -this.tile.posY + this.target.posY]; //not sure why - +    
  }
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
  this.hitsGhosts = false;
  this.destroyed = false;
}

Bullet.prototype.draw = function() {
  gc.strokeStyle = "rgba(255,255,255,1)";
  gc.beginPath();
  gc.moveTo(this.x, this.y);
  gc.lineTo(this.x-this.direction[0]*tileSize, this.y-this.direction[1]*tileSize);
  gc.stroke();
};

Bullet.prototype.step = function (dt) {
  this.x = this.x + this.direction[0]*dt*this.speed*tileSize;
  this.y = this.y + this.direction[1]*dt*this.speed*tileSize;
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

Bullet.prototype.collide = function (enemy) {
  var tile = getTileAt(this.x, this.y);

  if (tile.isWall() || tile.isGate()) {
    tile.hit(this.damage);
    this.destroy();
  } else {
    if (collision(this, enemy)) {
      if (!enemy.isGhost) {
        enemy.hit(this.damage);
        this.destroy();
      }
    }
  }
};

Bullet.prototype.destroy = function () {
  this.destroyed = true;
};

function Zap (x,y,direction,owner) {
  this.x = x;
  this.y = y;
  this.direction = direction;
  this.range = 5;
  this.damage = 1000;
  this.hitsGhosts = true;
  this.owner = owner;
  this.tiles = this.getTiles();
  this.time = 5;
  this.destroyed = false;
}

Zap.prototype.step = function (dt) {
  if (this.time <0) {
    zap.stop();
    this.destroyed = true;
  } else {
    this.direction = this.owner.orientation;
    this.x = this.owner.x;
    this.y = this.owner.y;
    this.time = this.time - dt;
    this.tiles = this.getTiles();  
  }
};

Zap.prototype.collide = function (enemy) {
  var that = this;
  _.each(this.tiles, function (t){
    if (t.isSame(enemy.tile)) {
      if (enemy.isGhost) {
        enemy.hit(that.damage);
      }
    }
  });
};

Zap.prototype.draw = function () {
  var that = this;
  
  gc.beginPath();
  function drawHit(x,y,angle) {
    gc.strokeStyle = "rgba("+randomInt(0,255)+","+randomInt(0,255)+","+randomInt(0,255)+",1)";
    gc.lineWidth = 1;
    gc.moveTo(x,y);
    gc.lineTo(x+Math.cos(angle)*tileSize/2+randomFloat(-1,1)*Math.sin(angle)*tileSize/2, y+Math.sin(angle)*tileSize/2+randomFloat(-1,1)*Math.cos(angle)*tileSize/2);
    gc.moveTo(x,y);
    gc.stroke();
  }
  function drawAtRandom(x,y) {
    gc.strokeStyle = "rgba("+randomInt(0,255)+","+randomInt(0,255)+","+randomInt(0,255)+",1)";
    gc.lineWidth = 3;
    var x = x + (tileSize/3)*randomInt(-1,1);
    var y = y + (tileSize/3)*randomInt(-1,1);
    gc.lineTo(x,y);
    gc.stroke();
  }

  function drawWallEffect(tile, direction) {
    var pos = tile.getTileCenter(), angle;
    switch (direction) {
      case "up":
      angle = Math.PI/2;
      break;

      case "right":
      angle = Math.PI;
      break;

      case "down":
      angle =3* Math.PI /2;
      break;

      case "left":
      angle = 0;
      break;
    }
    for (var i = 0; i<randomInt(5,12); i = i+1){  
      drawHit(pos.x,pos.y,angle);
    }
  }

  function drawLightning (arr,d){

    if (arr.length <=0) {
      return;
    } else {
      var newT = arr.pop();
      gc.moveTo(newT.getTileEnd(d).x,newT.getTileEnd(d).y);
      for (var i = 0; i<randomInt(3,8); i = i+1){  
        drawAtRandom(newT.getTileEnd(oppositeDirection(d)).x,newT.getTileEnd(oppositeDirection(d)).y);
      }
      drawLightning(arr,d);
      if (newT.checkDirection(that.direction).isWall() || newT.checkDirection(that.direction).isGate()){
        //if lightning hits wall draws wall effect
        drawWallEffect(newT.checkDirection(that.direction), that.direction);
      }
    }
  }
  drawLightning(this.tiles, this.direction);
  gc.lineWidth = 1;

};

Zap.prototype.getTiles = function () {
  var arr = [];
  function tiles (t, d, r, a) {
    var newT = t.checkDirection(d);
    if (newT.isWall() || r<1) {
      return a;
    } else {
      a.push(newT);
      return tiles(newT,d,r-1, a);
    }
  }

  return tiles (this.owner.tile, this.direction, this.range, arr);
};

Zap.prototype.destroy = function () {
  this.destroyed = true;
};

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
    },
    fallback: function (target) {
      return target.tile;
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
    },
    fallback: function (target) {
      return target.tile;
    }
  },
  blueGhost: {
    color: "rgba(0,0,255,1)",
    tactics: function (target) {
      return getRandomTile(world, "any", ["wall"]);
    },
    fallback: function (target) {
      return getRandomTile(world, "any", ["wall"]);
    }
  },
  whiteGhost: {
    color: "rgba(255,255,255,1)",
    tactics: function (target) {
      return getRandomTile(world, "any", ["wall"]);
    },
    fallback: function (target) {
      return getRandomTile(world, "any", ["wall"]);
    }
  }
};

function Weapon (weapon) {
  this.delay = 0;
  this.rof = weapon.rof;
  this.fire = weapon.fire;
  this.bulletSpeed = weapon.bulletSpeed === undefined ? false : weapon.bulletSpeed;
  this.pickup = weapon.pickup;
}

Weapon.prototype.update = function (dt) {
  this.delay = this.delay - dt;
}

function randomWeapon() {
  var keys = Object.keys(weapons);
  return weapons[keys[keys.length*Math.random() << 0]];
}

var weapons = {
  shotgun: {
    rof:1,
    bulletSpeed: 30,
    fire: function(x,y,direction){
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
        toReturn.push(new Bullet(x,y,[Math.cos(startAngle), Math.sin(startAngle)], this.bulletSpeed));
        startAngle = startAngle + angularDistance;
      }
      shotgun.play();
      return toReturn;
    },
    draw: function (x,y) {
      var x = x+tileSize/2,
      y = y+tileSize/2;
      ctx.fillStyle = "rgba(80,47,11,1)";
      ctx.fillRect(x-tileSize/8,y, tileSize/2,tileSize/12);
      ctx.beginPath();
      ctx.moveTo(x-tileSize/6, y-tileSize/8);
      ctx.lineTo(x+tileSize/2, y-tileSize/8);
      ctx.lineTo(x+tileSize/2, y+tileSize/4);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = "rgba(45,45,45,1)";
      ctx.fillRect(x-tileSize/2,y-tileSize/8, 2*tileSize/3,tileSize/8);
      ctx.fillStyle = "rgba(0,0,0,1)";
    },
    pickup: function() {
      shotgunCock.play();
    }
  },
  zapGun: {
    rof: 10,
    fire: function (x,y,direction,owner) {
      zap.play();
      return [new Zap(x,y,direction, owner)];
    },
    draw: function (x,y) {
      var x = x+tileSize/2,
      y = y+tileSize/2;
      ctx.fillStyle = "rgba(0,0,200,1)";
      ctx.beginPath();
      ctx.arc(x,y,tileSize/5, 0, Math.PI *2, true);
      ctx.closePath();
      ctx.fill(); 
    },
    pickup: function() {
      console.log(zapPickup);
      zapPickup.play();
    }
  }
}

function randomTactics(target) {
  return getRandomTile(world, "any", ["wall"]);
}