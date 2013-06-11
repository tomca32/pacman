var requestAnimFrame = (function() {
	return window.requestAnimationFrame       ||
	window.webkitRequestAnimationFrame ||
	window.mozRequestAnimationFrame    ||
	window.oRequestAnimationFrame      ||
	window.msRequestAnimationFrame     ||
	function(callback){
		window.setTimeout(callback, 1000 / 60);
};
}());
function getMousePos(c, e) {
    var rect = c.getBoundingClientRect();
    return {x: e.clientX - rect.left,y: e.clientY - rect.top};
}
var world,
	map = {
	bgColor: "rgb(0,0,0)",
	wallColor: "rgb(0,34,255)",
	pelletColor: "rgb(255,255,0)",
	boosterColor: "rgb(255,60,0)",
	gateColor: "rgba(255,255,255, 0.5)",
	speed: 10,
	data: [
	"XXXXXXXXXXXXXXXXXXXXXXXXXXXX",
	"XooooooooooooXXooooooooooooX", 
	"XOXXXXoXXXXXoXXoXXXXXoXXXXOX", 
	"XoXXXXoXXXXXoXXoXXXXXoXXXXoX", 
	"XoXXXXoXXXXXoXXoXXXXXoXXXXoX", 
	"XooooooooooooooooooooooooooX", 
	"XoXXXXoXXoXXXXXXXXoXXoXXXXoX", 
	"XoXXXXoXXoXXXXXXXXoXXoXXXXoX",
	"XooooooXXooooXXooooXXooooooX", 
	"XXXXXXoXXXXX.XX.XXXXXoXXXXXX", 
	".....XoXXXXX.XX.XXXXXoX.....",
	".....XoXX..........XXoX.....",
	".....XoXX.XXXGGXXX.XXoX.....",
	"XXXXXXoXX.X......X.XXoXXXXXX",
	"T.....o...X......X...o.....T",
	"XXXXXXoXX.X......X.XXoXXXXXX",
	".....XoXX.XXXXXXXX.XXoX.....",
	".....XoXX.....S....XXoX.....",
	".....XoXX.XXXXXXXX.XXoX.....",
	"XXXXXXoXX.XXXXXXXX.XXoXXXXXX",
	"XooooooooooooXXooooooooooooX",
	"XoXXXXoXXXXXoXXoXXXXXoXXXXoX",
	"XoXXXXoXXXXXoXXoXXXXXoXXXXoX",
	"XOooXXooooooo..oooooooXXooOX",
	"XXXoXXoXXoXXXXXXXXoXXoXXoXXX",
	"XXXoXXoXXoXXXXXXXXoXXoXXoXXX",
	"XooooooXXooooXXooooXXooooooX",
	"XoXXXXXXXXXXoXXoXXXXXXXXXXoX",
	"XoXXXXXXXXXXoXXoXXXXXXXXXXoX",
	"XooooooooooooooooooooooooooX",
	"XXXXXXXXXXXXXXXXXXXXXXXXXXXX"]
};

function getTileSize(map, canvasWidth, canvasHeight) {
	//calculates tile dimensions
	if (canvasWidth/map.data[0].length<canvasHeight/map.data.length){
		return Math.floor(canvasWidth/map.data[0].length);
	}
	return Math.floor(canvasHeight/map.data.length);
}

function tileExists(posX,posY){
	//check if tile is within world bounds
	if (isNaN(posX) || isNaN(posY) || posX === undefined || posY === undefined){
	 return false;
	}

	if (posX < 0 || posY < 0 || posX > world.data[0].length-1 || posY > world.data.length -1) {
		return false;
	}

	return true;
}

$(document).ready(function() {
var wHeight = $(window).innerHeight(),
		wWidth = $(window).innerWidth(),
		gameArea = document.getElementById('game'),
		mapCanvas = document.getElementById('mapCanvas'),
		ctx = mapCanvas.getContext('2d'),
		startX, startY, cW, cH, tileSize, resize = false, gameInProgress = false;
mapCanvas.width = wWidth * 0.9;
mapCanvas.height = wHeight * 0.8;
cW = mapCanvas.width;
cH = mapCanvas.height;
tileSize = getTileSize(map, cW, cH);


function Tile (tileInfo,posX,posY) {
	this.type = tileInfo;
	this.posX = posX;
	this.posY = posY;
}
function getStartX(){
	return (cW - world.data[0].length*tileSize)/2;
}
function getStartY(){
	return (cH - world.data.length*tileSize)/2;
}

function parseMap(map){
	//parses map from a string
	world = {
		data: [],
		bgColor: map.bgColor,
		pelletColor: map.pelletColor,
		boosterColor: map.boosterColor,
		wallColor: map.wallColor,
		speed: map.speed,
		gateColor: map.gateColor
	};
	var newTile, newLine, i, j, line, lineL, tile,
			l = map.data.length;
	for (i = 0; i <l; i=i+1) {
		line = map.data[i];
		lineL = line.length;
		newLine = [];
		for (j = 0; j < lineL; j=j+1) {
			tile = map.data[i][j];

			switch (tile) {
				case "X":
				newTile = new Tile ("wall", j, i);
				break;

				case ".":
				newTile = new Tile ("open", j, i);
				break;	

				case "o":
				newTile = new Tile ("pellet", j, i);
				break;

				case "O":
				newTile = new Tile ("booster", j ,i);
				break;

				case "G":
				newTile = new Tile("gate",j,i);
				break;

				case "T":
				newTile = new Tile("tunnel",j,i);
				break;

				case "S":
				newTile = new Tile("open",j,i);
				world.playerStart = {x:j,y:i};
				break;
			}
			newLine.push(newTile);
		}
		world.data.push(newLine);
	}
	return world;
}

function getTile(posX,posY){
	//gets tile by grid position
	if (tileExists(posX,posY)){
		return world.data[posY][posX];	
	}
	return false;
}

function getTileAt(x,y) {
	//gets tile by absolute x,y coords
	return getTile(Math.floor((x-startX)/tileSize), Math.floor((y-startY)/tileSize));
}

function getTilePosition(tile){
	//gets tile x,y coords
	return {x:tile.posX*tileSize + startX, y:tile.posY*tileSize + startY};
}

function getTileCenter(tile){
	var pos = getTilePosition(tile);
	return {x:pos.x+tileSize/2, y: pos.y +tileSize/2};
}

function upper(tile){
	return getTile(tile.posX,tile.posY-1);
}

function lower(tile){
	return getTile(tile.posX,tile.posY+1);
}

function left(tile){
	return getTile(tile.posX-1,tile.posY);
}

function right(tile){
	return getTile(tile.posX+1,tile.posY);
}

function checkDirection(tile, direction) {
	//returns the next tile in a specified direction
	switch(direction){
		case 'up':
		return upper(tile);

		case 'down':
		return lower(tile);

		case 'right':
		return right(tile);

		case 'left':
		return left(tile);
	}
}

function isWall(tile){
	if (tile) {
		if (!tileExists(tile.posX, tile.posY) || tile.type ==='wall' || tile.type ==='gate') {
			return true;
		}
	} 
	return false;
}

function tileBlocked(tile){
	//check if tile surounded by walls
	return (isWall(upper(tile)) && isWall(lower(tile)) && isWall(left(tile)) && isWall(right(tile)));
}

function isolatedTile(tile) {
	//check if tile has no wall around
	return (!isWall(upper(tile)) && !isWall(lower(tile)) && !isWall(left(tile)) && !isWall(right(tile)));
}

function isVerticalWall(tile) {
	if (isWall(upper(tile)) && isWall(lower(tile))){
		if (!isWall(left(tile)) || !isWall(right(tile))) {
			return true;
		}
	}
	return false;
}

function isHorizontalWall(tile) {
	if (isWall(left(tile)) && isWall(right(tile))){
		if (!isWall(upper(tile)) || !isWall(lower(tile))) {
			return true;
		}
	}
	return false;
}

//DRAWING FUNCTIONS BEGIN HERE
function deleteTileGraphic(x,y){
	ctx.fillStyle=world.bgColor;
	ctx.clearRect(x,y,tileSize,tileSize);
}

function drawUpRightCornerInner(x, y, gate) {
	ctx.beginPath();
	ctx.arc(x,y+tileSize,tileSize/3,Math.PI*3/2,0, false);
	ctx.stroke();
	if (gate) {
		ctx.fill();
	}
}

function drawUpLeftCornerInner (x, y, gate) {
	ctx.beginPath();
	ctx.arc(x+tileSize,y+tileSize,tileSize/3,Math.PI*3/2,Math.PI, true);
	ctx.stroke();
	if (gate) {
		ctx.fill();
	}
}

function drawDownRightCornerInner (x, y, gate) {
	ctx.beginPath();
	ctx.arc(x,y,tileSize/3,0,Math.PI/2, false);
	ctx.stroke();	
	if (gate) {
		ctx.fill();
	}
}

function drawDownLeftCornerInner (x, y, gate) {
	ctx.beginPath();
	ctx.arc(x+tileSize,y,tileSize/3,Math.PI,Math.PI/2, true);
	ctx.stroke();
	if (gate) {
		ctx.fill();
	}
}

function drawUpRightCornerOuter(x, y) {
	ctx.beginPath();
	ctx.arc(x,y+tileSize,tileSize*2/3,Math.PI*3/2,0, false);
	ctx.stroke();
}

function drawUpLeftCornerOuter (x, y) {
	ctx.beginPath();
	ctx.arc(x+tileSize,y+tileSize,tileSize*2/3,Math.PI*3/2,Math.PI, true);
	ctx.stroke();
}

function drawDownLeftCornerOuter (x, y) {
	ctx.beginPath();
	ctx.arc(x+tileSize,y,tileSize*2/3,Math.PI,Math.PI/2, true);
	ctx.stroke();
}

function drawDownRightCornerOuter (x, y) {
	ctx.beginPath();
	ctx.arc(x,y,tileSize*2/3,0,Math.PI/2, false);
	ctx.stroke();	
}

function drawCorner(x, y, tile, gate){
	if (!isWall(upper(left(tile)))) {
		drawDownRightCornerInner(x,y,tile, gate);
	}
	if (!isWall(upper(right(tile)))) {
		drawDownLeftCornerInner(x,y,tile, gate);		
	}
	if (!isWall(lower(left(tile)))) {
		drawUpRightCornerInner(x,y,tile, gate);
	}
	if (!isWall(lower(right(tile)))) {
		drawUpLeftCornerInner(x,y,tile, gate);
	}
}

function drawIsolatedWall(x,y){
	ctx.beginPath();
	ctx.arc(x+tileSize/2, y+tileSize/2,tileSize/6,0, Math.PI*2,true);
	ctx.stroke();
} 

function drawLeftEnd(x,y) {
	ctx.beginPath();
	ctx.moveTo(x+tileSize,y+tileSize/3);
	ctx.lineTo(x+tileSize/3, y+tileSize/3);
	ctx.moveTo(x+tileSize,y+tileSize*2/3);
	ctx.lineTo(x+tileSize/3, y+tileSize*2/3);
	ctx.stroke();
	ctx.beginPath();
	ctx.arc(x+tileSize/3, y+tileSize/2,tileSize/6,Math.PI*3/2, Math.PI/2,true);
	ctx.stroke();
}

function drawRightEnd(x,y) {
	ctx.beginPath();
	ctx.moveTo(x,y+tileSize/3);
	ctx.lineTo(x+tileSize*2/3, y+tileSize/3);
	ctx.moveTo(x,y+tileSize*2/3);
	ctx.lineTo(x+tileSize*2/3, y+tileSize*2/3);
	ctx.stroke();
	ctx.beginPath();
	ctx.arc(x+tileSize*2/3, y+tileSize/2,tileSize/6,Math.PI*3/2, Math.PI/2,false);
	ctx.stroke();
}

function drawTopEnd(x,y) {
	ctx.beginPath();
	ctx.moveTo(x+tileSize/3,y+tileSize);
	ctx.lineTo(x+tileSize/3, y+tileSize/3);
	ctx.moveTo(x+tileSize*2/3,y+tileSize);
	ctx.lineTo(x+tileSize*2/3, y+tileSize/3);
	ctx.stroke();	
	ctx.beginPath();
	ctx.arc(x+tileSize/2, y+tileSize/3,tileSize/6,0, Math.PI,true);
	ctx.stroke();	
}

function drawBottomEnd(x,y) {
	ctx.beginPath();
	ctx.moveTo(x+tileSize/3,y);
	ctx.lineTo(x+tileSize/3, y+tileSize*2/3);
	ctx.moveTo(x+tileSize*2/3,y);
	ctx.lineTo(x+tileSize*2/3, y+tileSize*2/3);
	ctx.stroke();	
	ctx.beginPath();
	ctx.arc(x+tileSize/2, y+tileSize*2/3,tileSize/6,0, Math.PI,false);
	ctx.stroke();	
}

function drawCornerTile(x,y,tile){
	if (isWall(upper(tile)) && isWall(right(tile))) {
		drawDownLeftCornerOuter(x,y);
		if (!isWall(upper(right(tile)))) {drawDownLeftCornerInner(x,y);}

	} else if (isWall(upper(tile)) && isWall(left(tile))) {
		drawDownRightCornerOuter(x,y);
		if (!isWall(upper(left(tile)))) {drawDownRightCornerInner(x,y);}
		
	} else if (isWall(lower(tile)) && isWall(right(tile))) {
		drawUpLeftCornerOuter(x,y);
		if (!isWall(lower(right(tile)))) {drawUpLeftCornerInner(x,y);}
		
	} else if (isWall(lower(tile)) && isWall(left(tile))) {
		drawUpRightCornerOuter(x,y);
		if (!isWall(lower(left(tile))))	{drawUpRightCornerInner(x,y);}
		
	} else {
		//Not corner but a last tile in line
		if (isWall(right(tile))){
			drawLeftEnd(x,y);
		} else if (isWall(left(tile))){
			drawRightEnd(x,y);
		} else if (isWall(lower(tile))){
			drawTopEnd(x,y);
		} else if (isWall(upper(tile))){
			drawBottomEnd(x,y);
		}
	}
}

function drawVerticalWall(x,y,tile, gate){
	if (!isWall(left(tile))){
		if (gate && !isWall(right(tile))) {
			ctx.fillRect(x+tileSize/3,y,tileSize/3, tileSize);
		}
		ctx.beginPath();
		ctx.moveTo(x+tileSize/3, y);
		ctx.lineTo(x+tileSize/3,y+tileSize);
		ctx.stroke();
	} else {
		if (!isWall(left(upper(tile)))){
			drawDownRightCornerInner(x,y,tile);
		} 
		if (!isWall(left(lower(tile)))) {
			drawUpRightCornerInner(x,y,tile);
		}
	}
	if (!isWall(right(tile))){
		ctx.beginPath();
		ctx.moveTo(x+tileSize*2/3, y);
		ctx.lineTo(x+tileSize*2/3,y+tileSize);
		ctx.stroke();	
	} else {
		if (!isWall(right(upper(tile)))){
			drawDownLeftCornerInner(x,y,tile);
		}
		if (!isWall(right(lower(tile)))){
			drawUpLeftCornerInner(x,y,tile);
		}
	}
}

function drawHorizontalWall(x,y,tile, gate){
	if (!isWall(upper(tile))){
		if (gate && !isWall(lower(tile))) {
			ctx.fillRect(x,y+tileSize/3,tileSize, tileSize/3);
		}
		ctx.beginPath();
		ctx.moveTo(x, y+tileSize/3);
		ctx.lineTo(x+tileSize,y+tileSize/3);
		ctx.stroke();
	} else {
		if (!isWall(upper(left(tile)))){
			drawDownRightCornerInner(x,y,tile);
		}
	    if (!isWall(upper(right(tile)))){
			drawDownLeftCornerInner(x,y,tile);
		}
	}
	if (!isWall(lower(tile))){
		ctx.beginPath();
		ctx.moveTo(x, y+tileSize*2/3);
		ctx.lineTo(x+tileSize,y+tileSize*2/3);
		ctx.stroke();	
	} else {
		if (!isWall(lower(left(tile)))){
			drawUpRightCornerInner(x,y,tile);
		}
		if (!isWall(lower(right(tile)))){
			drawUpLeftCornerInner(x,y,tile);
		}
	}
}

function drawWallTile(x,y, tile, gate){
	ctx.strokeStyle = world.wallColor;
	if (gate) {
		ctx.strokeStyle = world.gateColor;
		ctx.fillStyle = world.gateColor;
	}
	if (tileBlocked(tile)){
		drawCorner(x,y,tile, gate);
	} else if (isolatedTile(tile)){
		drawIsolatedWall(x,y,tile, gate);
	} else{
		if (isVerticalWall(tile)) {
			drawVerticalWall(x,y,tile,gate);
		} else if (isHorizontalWall(tile)){
			drawHorizontalWall(x,y,tile,gate);
		} else {
			drawCornerTile(x,y,tile, gate);
		}	
	}
}

function drawPelletTile(x,y){
	x = x+tileSize/2;
	y = y+tileSize/2;
	ctx.fillStyle= world.pelletColor;
	ctx.beginPath();
	ctx.arc(x,y,tileSize/10, 0, Math.PI *2, true);
	ctx.closePath();
	ctx.fill();
}

function drawBoosterTile(x,y){
	x = x+tileSize/2;
	y = y+tileSize/2;
	ctx.fillStyle = world.boosterColor;
	ctx.beginPath();
	ctx.arc(x,y,tileSize/5, 0, Math.PI *2, true);
	ctx.closePath();
	ctx.fill();	
}

function drawGateTile(x,y,tile){
	drawWallTile(x,y,tile,true);
}

function drawTile(tile){
	var x = startX + tile.posX * tileSize,
			y = startY+ tile.posY*tileSize;
	deleteTileGraphic(x,y,tile);
	switch (tile.type) {
		case "open":
		break;

		case "wall":
		drawWallTile(x,y, tile);
		break;

		case "pellet":
		drawPelletTile(x,y);
		break;

		case "booster":
		drawBoosterTile(x,y);
		break;

		case "gate":
		drawGateTile(x,y,tile);
		break;

	}
}

function insertTile(tile, redrawTile){
	//inserts tile at a position in the world (optional: redraws it)
	var i, j, tempTile;
	world.data[tile.posY][tile.posX] = tile;

	if (redrawTile){
		for (i =0; i<3; i=i+1){
			for (j=0; j<3; j=j+1){
				if (tileExists(tile.posX+j-1, tile.posY+i-1)){
					tempTile = new Tile(world.data[tile.posY+i-1][tile.posX+j-1].type, tile.posX+j-1, tile.posY+i-1);	
					drawTile(tempTile);
				}
			}
		}
	}
}

function drawWorld(world) {
	var i, j, row, tile,
		worldL = world.data.length;
	ctx.fillStyle= world.bgColor;
	ctx.fillRect(0,0,cW, cH);
	for (i = 0; i < worldL; i=i+1){
		row = world.data[i].length;
		for (j = 0; j < row; j=j+1) {
			tile = world.data[i][j];
			drawTile(tile);
		}
	}
}

function drawEditor(tile, editor) {
	var ctxed = document.getElementById('editorCanvas').getContext('2d'),
			x = tile.posX*tileSize + startX,
			y = tile.posY*tileSize + startY;
	ctxed.clearRect(0,0,$('#editorCanvas').innerWidth(), $('#editorCanvas').innerHeight());
	ctxed.fillStyle="rgba(255,255,255,0.5)";
	ctxed.clearRect(0,0,editor.width, editor.height);
	ctxed.fillRect(x,y,tileSize,tileSize);
}

function drawPacman(player, gc){
		gc.fillStyle= world.pelletColor;
		var angle = 0,
				x = player.x,
				y = player.y,
				beginArc, endArc;

		switch (player.orientation) {
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

		if (player.moving) {
			if (player.closing){
				player.frame-=0.02*player.speed/tileSize;
			} else {
				player.frame += 0.02*player.speed/tileSize;
			}
			
			if (player.frame >= 1) {
				player.closing = true;
			} else if (player.frame <=0){
				player.closing = false;
			}
		}
		//player.frame = 2;
		beginArc = angle+(Math.PI/3)*player.frame;
		endArc = Math.PI*2 + angle -(Math.PI/3)*player.frame;
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

//END DRAWING FUNCTIONS

function startEditor(){
	var mousePos, activeTile,
			action = false,
			undoStack = [], 
			beforePreview = false,  //storing old Tile before preview overrwrites it
			editor = document.createElement("canvas");
	editor.id = "editorCanvas";
	editor.height = $('#mapCanvas').innerHeight();
	editor.width = $('#mapCanvas').innerWidth();
	gameArea.appendChild(editor);

	function closeEditor() {
		//Closing editor animation
		TweenLite.to('aside', 0.5, {left:-200});
		$(document).off('click','#editor');
		$('#editor').html('Editor');
		$(document).on('click','#editor', startEditor);
		$('#startButton').css({'display': 'inline'});
		$('#undoButton').css({'display':'none'});
		document.getElementById('game').removeChild(document.getElementById('editorCanvas'));
	}
	$('#editorCanvas').css({'position':'absolute','left':$('#mapCanvas').offset().left, 'top':$('#mapCanvas').offset().top});
	$('#editor').html('Close Editor');
	$(document).off('click','#editor');
	$(document).on('click', '#editor', closeEditor);
	$('#startButton').css({display:'none'});

	TweenLite.to('aside', 0.5, {left:0});
	

	$(document).on('click', '#emptyOption', function(){
		action = function(){return new Tile ("open", activeTile.posX, activeTile.posY);};
	});
	$(document).on('click', '#wallOption', function(){
		action = function(){return new Tile ("wall", activeTile.posX, activeTile.posY);};
	});
	$(document).on('click', '#pelletOption', function(){
		action = function(){return new Tile ("pellet", activeTile.posX, activeTile.posY);};
	});
	$(document).on('click', '#boosterOption', function(){
		action = function(){return new Tile ("booster", activeTile.posX, activeTile.posY);};
	});
	$(document).on('click', '#gateOption', function(){
		action = function(){return new Tile ("gate", activeTile.posX, activeTile.posY);};
	});
	
	editor.addEventListener('mousemove', function(e){
		mousePos = getMousePos(editor,e);
		var newT, //New Preview Tile depending on selected action
				tile = getTileAt(mousePos.x, mousePos.y);

		if (tile && (activeTile === undefined || tile.posX !== activeTile.posX || tile.posY !== activeTile.posY)) {
			activeTile = tile;
			drawEditor(activeTile, editor);

			if (action) {
				if (beforePreview){
					//restoring previewed tile
					if (world.data[beforePreview.posY][beforePreview.posX].type !== beforePreview.type){
						insertTile(new Tile (beforePreview.type, beforePreview.posX, beforePreview.posY), true);
					}
				}
				newT = action();
				if (activeTile.type !== newT.type){
					//drawing preview tile
					beforePreview = activeTile;
					insertTile(new Tile (newT.type, newT.posX, newT.posY), true);
				}
			}
		}
	});

	editor.addEventListener('click', function(){
		if (!action || activeTile.type === action().type) {return false;}
		activeTile = action();
		undoStack.push(new Tile(beforePreview.type, beforePreview.posX, beforePreview.posY));
		insertTile(new Tile(activeTile.type, activeTile.posX, activeTile.posY), true);//new Tile ("wall", activeTile.posX, activeTile.posY);
		beforePreview = false;
	});

	$('#undoButton').css({display: 'inline'});

	$(document).on('click','#undoButton', function(){
		if (undoStack.length) {
			var oldTile = undoStack.pop();
			insertTile(oldTile);
			drawWorld(world);
		}
	});

}

function moveEntity(entity, dt){
	switch (entity.moving) {
		case 'up':
			entity.y -= entity.speed*dt;
			break;

		case 'down':
			entity.y += entity.speed*dt;
			break;

		case 'left':
			entity.x -= entity.speed*dt;
			break;

		case 'right':
			entity.x += entity.speed*dt;
			break;
	}
}

function changeMovement(entity, direction){
	entity.nextMove = direction;
}

function oppositeDirection(direction){
	switch (direction) {
		case 'up':
			return 'down';

		case 'down':
			return 'up';

		case 'left':
			return 'right';

		case 'right':
			return 'left';
	}
	return false;
}

function inTileCenter(x,y,tile, tolerance){
	var c = getTileCenter(tile);
	tolerance = tolerance !== undefined ? tolerance : 0;
	tolerance = tolerance*tileSize;
	if ((Math.round(x)- tolerance <= Math.round(c.x) + tolerance && Math.round(x) + tolerance >= Math.round(c.x) - tolerance) && (Math.round(y)-tolerance <= Math.round(c.y) + tolerance && Math.round(y) + tolerance >= Math.round(c.y) - tolerance)) {
		return true;
	}
	return false;
}

function centerEntity(entity){
	var c = getTileCenter(entity.tile);
	entity.x = c.x;
	entity.y = c.y;
}

function resizeMap() {
	wHeight = $(window).innerHeight();
	wWidth = $(window).innerWidth();
	mapCanvas.width = wWidth * 0.9;
	mapCanvas.height = wHeight * 0.8;
	cW = mapCanvas.width;
	cH = mapCanvas.height;
	tileSize = getTileSize(world, cW, cH);
	startX = getStartX();
	startY = getStartY();
	drawWorld(world);
}

function startGame() {
	//GAME SETUP
	var game = document.createElement("canvas"),
			gc = game.getContext('2d'),
			lastTime = Date.now(),
			player = {
				x:world.playerStart.x*tileSize+startX+tileSize/2,
				y:world.playerStart.y*tileSize+startY+tileSize/2,
				tile: world.playerStart,
				speed: tileSize*world.speed,
				orientation: 'right',
				frame: 0,
				moving: false,
				closing:false,
				nextMove: false
			};
	gameInProgress = true;
	$('.options').css({display:'none'});

	game.id = "gameCanvas";
	game.height = mapCanvas.height;
	game.width = mapCanvas.width;
	gameArea.appendChild(game);
	$('#gameCanvas').css({'position':'absolute','left':$('#mapCanvas').offset().left, 'top':$('#mapCanvas').offset().top});

	document.addEventListener('keydown', function(event){
		switch (event.keyCode) {
			case 37:
				changeMovement(player, 'left');
				break;
			case 38:
				changeMovement(player, 'up');
				break;
			case 39:
				changeMovement(player, 'right');
				break;
			case 40:
				changeMovement(player, 'down');
				break;
		}
	});
	//END GAME SETUP

	function updateEntity(entity, dt) {
		entity.tile = getTileAt(entity.x, entity.y);

		if (inTileCenter(entity.x, entity.y, entity.tile, 0.007 * player.speed/tileSize)) {
				
				if (isWall(checkDirection(entity.tile, entity.moving))){
					entity.moving= false;
					centerEntity(entity);
				}

				if(!isWall(checkDirection(entity.tile, entity.nextMove))) {
					entity.moving = entity.nextMove;
					entity.orientation = entity.nextMove;
				}
		}
		if (entity.moving) {
			moveEntity(entity, dt);	
		}
	}

	function removePellet(tile) {
		var newT = new Tile('open', tile.posX, tile.posY);
		world.data[tile.posY][tile.posX] = newT;
		drawTile(newT);
		tile = newT;
	}

	function update(dt) {
		updateEntity(player, dt);
		if (player.tile.type === 'pellet' || player.tile.type === 'booster') {
			removePellet(player.tile);
		}
	}

	function render() {
		gc.clearRect(0,0,game.width, game.height);
		drawPacman(player, gc);
	}

	function main() {
		var now = Date.now(),
				dt = (now - lastTime) / 1000.0;

		update(dt);
		render();
		//removal();

		lastTime = now;

		if (resize){
			var oldTileSize = tileSize;
			resizeMap();
			game.height = mapCanvas.height;
			game.width = mapCanvas.width;
			player.x = getTilePosition(player.tile).x + tileSize/2;
			player.y = getTilePosition(player.tile).y + tileSize/2;
			player.speed = tileSize*world.speed;
			resize = false;
		}

		requestAnimFrame(main);
	}
	main();
}

$(window).load(function(){
	world = parseMap(map);
	startX = getStartX();
	startY = getStartY();
	drawWorld(world);

	$(document).on('click','#editor', startEditor);
	$(document).on('click','#startButton', startGame);
	//startGame();
});

$(window).resize(function(){
	if (gameInProgress) {
		resize = true; //If game in progress, queue the resize after tick is done
	} else {
		resizeMap();
	}
});

});