var requestAnimFrame = (function(){
	return window.requestAnimationFrame       ||
	window.webkitRequestAnimationFrame ||
	window.mozRequestAnimationFrame    ||
	window.oRequestAnimationFrame      ||
	window.msRequestAnimationFrame     ||
	function(callback){
		window.setTimeout(callback, 1000 / 60);
	};
})();
var world;
var map = {
	bgColor: "rgb(0,0,0)",
	wallColor: "rgb(0,34,255)",
	pelletColor: "rgb(255,255,0)",
	boosterColor: "rgb(255,60,0)",
	gateColor: "rgba(255,255,255, 0.5)",
	data: [
	"XXXXXXXXXXXXXXXXXXXXXXXXXXXX",
	"XooooooooooooXXooooooooooooX", 
	"XOXXXXoXXXXXoXXoXXXXXoXXXXOX", 
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
	"......o...X......X...o......",
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

$(document).ready(function() {
var wHeight = $(window).innerHeight();
var wWidth = $(window).innerWidth();
function getTileSize(map) {
	var cW = $('#gameCanvas').innerWidth();	
	var cH = $('#gameCanvas').innerHeight();
	if (cW/map.width<cH/map.data.length){
		console.log(cW/map.data[0].length);
		return Math.floor(cW/map.data[0].length);
	}
	return Math.floor(cH/map.data.length);
}
var tileSize = getTileSize(map);
console.log(tileSize);
var ctx = document.getElementById('gameCanvas').getContext('2d');
function Tile (tileInfo,posX,posY) {
	this.type = tileInfo;
	this.posX = posX;
	this.posY = posY;
}
function getStartX(w){
	return ($('#gameCanvas').innerWidth() - w*tileSize)/2;
}
function getStartY(h){
	return ($('#gameCanvas').innerHeight() - h*tileSize)/2;
}

function parseMap(map){
	world = {
		height:  map.data.length,
		width:  map.data[0].length,
		data: [],
		bgColor: map.bgColor,
		pelletColor: map.pelletColor,
		boosterColor: map.boosterColor,
		wallColor: map.wallColor,
		gateColor: map.gateColor
	};
	var newTile, newLine;
	var l = map.data.length;
	for (var i = 0; i <l; i++) {
		var line = map.data[i];
		var lineL = line.length;
		newLine = [];
		for (var j = 0; j < lineL; j++) {
		var tile = map.data[i][j];

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

				case "S":
				newTile = new Tile("start",j,i);
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

function tileExists(posX,posY){
	//check if tile out of world bounds
	if (isNaN(posX) || isNaN(posY) || typeof posX =='undefined' || typeof posY == 'undefined') return false;

	if (posX < 0 || posY < 0 || posX > world.data[0].length-1 || posY > world.data.length -1) return false;

	return true;
}

function insertTile(tile, redrawTile){
	world.data[tile.posY][tile.posX] = tile;

	if (redrawTile){
		for (var i =0; i<3; i++){
			for (var j=0; j<3; j++){
				if (tileExists(tile.posX+j-1, tile.posY+i-1)){
					var tempTile = new Tile(world.data[tile.posY+i-1][tile.posX+j-1].type, tile.posX+j-1, tile.posY+i-1);	
					drawTile(tempTile);
				}
			}
		}
	}
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

function isWall(tile){
	if (tile) {
		if (!tileExists(tile.posX, tile.posY) || tile.type ==='wall' || tile.type ==='gate') return true;
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
		if (!isWall(left(tile)) || !isWall(right(tile))) return true;
	}
	return false;
}

function isHorizontalWall(tile) {
	if (isWall(left(tile)) && isWall(right(tile))){
		if (!isWall(upper(tile)) || !isWall(lower(tile))) return true;
	}
	return false;
}

function deleteTileGraphic(x,y,tile){
	ctx.fillStyle=world.bgColor;
	ctx.clearRect(x,y,tileSize,tileSize);
	//ctx.fill();
}

function drawVerticalWall(x,y,tile){
	ctx.beginPath();
	if (!isWall(left(tile))){
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

function drawHorizontalWall(x,y,tile){
	ctx.beginPath();
	if (!isWall(upper(tile))){
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

function drawUpRightCornerInner(x,y,tile) {
	ctx.beginPath();
	ctx.arc(x,y+tileSize,tileSize/3,Math.PI*3/2,0, false);
	ctx.stroke();
}

function drawUpLeftCornerInner (x,y,tile) {
	ctx.beginPath();
	ctx.arc(x+tileSize,y+tileSize,tileSize/3,Math.PI*3/2,Math.PI, true);
	ctx.stroke();
}

function drawDownRightCornerInner (x,y,tile) {
	ctx.beginPath();
	ctx.arc(x,y,tileSize/3,0,Math.PI/2, false);
	ctx.stroke();	
}

function drawDownLeftCornerInner (x,y,tile) {
	ctx.beginPath();
	ctx.arc(x+tileSize,y,tileSize/3,Math.PI,Math.PI/2, true);
	ctx.stroke();
}

function drawUpRightCornerOuter(x,y,tile) {
	ctx.beginPath();
	ctx.arc(x,y+tileSize,tileSize*2/3,Math.PI*3/2,0, false);
	ctx.stroke();
}

function drawUpLeftCornerOuter (x,y,tile) {
	ctx.beginPath();
	ctx.arc(x+tileSize,y+tileSize,tileSize*2/3,Math.PI*3/2,Math.PI, true);
	ctx.stroke();
}

function drawDownLeftCornerOuter (x,y,tile) {
	ctx.beginPath();
	ctx.arc(x+tileSize,y,tileSize*2/3,Math.PI,Math.PI/2, true);
	ctx.stroke();
}

function drawDownRightCornerOuter (x,y,tile) {
	ctx.beginPath();
	ctx.arc(x,y,tileSize*2/3,0,Math.PI/2, false);
	ctx.stroke();	
}

function drawCorner(x,y,tile){
	if (!isWall(upper(left(tile)))) {
		drawDownRightCornerInner(x,y,tile);
	}
	if (!isWall(upper(right(tile)))) {
		drawDownLeftCornerInner(x,y,tile);		
	}
	if (!isWall(lower(left(tile)))) {
		drawUpRightCornerInner(x,y,tile);
	}
	if (!isWall(lower(right(tile)))) {
		drawUpLeftCornerInner(x,y,tile);
	}
}

function drawIsolatedWall(x,y,tile){
	ctx.beginPath();
	ctx.arc(x+tileSize/2, y+tileSize/2,tileSize/6,0, Math.PI*2,true);
	ctx.stroke();
} 

function drawLeftEnd(x,y,tile) {
	ctx.moveTo(x+tileSize,y+tileSize/3);
	ctx.lineTo(x+tileSize/3, y+tileSize/3);
	ctx.moveTo(x+tileSize,y+tileSize*2/3);
	ctx.lineTo(x+tileSize/3, y+tileSize*2/3);
	ctx.stroke();
	ctx.beginPath();
	ctx.arc(x+tileSize/3, y+tileSize/2,tileSize/6,Math.PI*3/2, Math.PI/2,true);
	ctx.stroke();
}

function drawRightEnd(x,y,tile) {
	ctx.moveTo(x,y+tileSize/3);
	ctx.lineTo(x+tileSize*2/3, y+tileSize/3);
	ctx.moveTo(x,y+tileSize*2/3);
	ctx.lineTo(x+tileSize*2/3, y+tileSize*2/3);
	ctx.stroke();
	ctx.beginPath();
	ctx.arc(x+tileSize*2/3, y+tileSize/2,tileSize/6,Math.PI*3/2, Math.PI/2,false);
	ctx.stroke();
}

function drawTopEnd(x,y,tile) {
	ctx.moveTo(x+tileSize/3,y+tileSize);
	ctx.lineTo(x+tileSize/3, y+tileSize/3);
	ctx.moveTo(x+tileSize*2/3,y+tileSize);
	ctx.lineTo(x+tileSize*2/3, y+tileSize/3);
	ctx.stroke();
	ctx.beginPath();
	ctx.arc(x+tileSize/2, y+tileSize/3,tileSize/6,0, Math.PI,true);
	ctx.stroke();	
}

function drawBottomEnd(x,y,tile) {
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
		drawDownLeftCornerOuter(x,y,tile);
		if (!isWall(upper(right(tile)))) drawDownLeftCornerInner(x,y,tile);

	} else if (isWall(upper(tile)) && isWall(left(tile))) {
		drawDownRightCornerOuter(x,y,tile);
		if (!isWall(upper(left(tile)))) drawDownRightCornerInner(x,y,tile);
		
	} else if (isWall(lower(tile)) && isWall(right(tile))) {
		drawUpLeftCornerOuter(x,y,tile);
		if (!isWall(lower(right(tile)))) drawUpLeftCornerInner(x,y,tile);
		
	} else if (isWall(lower(tile)) && isWall(left(tile))) {
		drawUpRightCornerOuter(x,y,tile);
		if (!isWall(lower(left(tile))))	drawUpRightCornerInner(x,y,tile);
		
	} else {
		//Not corner but a last tile in line
		if (isWall(right(tile))){
			drawLeftEnd(x,y,tile);
		} else if (isWall(left(tile))){
			drawRightEnd(x,y,tile);
		} else if (isWall(lower(tile))){
			drawTopEnd(x,y,tile);
		} else if (isWall(upper(tile))){
			drawBottomEnd(x,y,tile);
		}
	}
}

function drawWallTile(x,y, tile){
	ctx.strokeStyle = world.wallColor;
	//ctx.fillStyle = "rgb(0,34,255)";
	if (tileBlocked(tile)){
		drawCorner(x,y,tile);
	} else if (isolatedTile(tile)){
		drawIsolatedWall(x,y,tile);
	} else{
		if (isVerticalWall(tile)) {
			drawVerticalWall(x,y,tile);
		} else if (isHorizontalWall(tile)){
			drawHorizontalWall(x,y,tile);
		} else {
			drawCornerTile(x,y,tile);
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
	ctx.fillStyle = world.gateColor;
	if (isWall(left(tile)) || isWall(right(tile))){
		ctx.fillRect(x, y+tileSize/3, tileSize, tileSize/3);
	}
	
	//ctx.fillRect(x,y,tileSize,tileSize);	
}

function drawWorld(world) {
	var x,y, row;
	worldL = world.data.length;
	ctx.fillStyle= world.bgColor;
	ctx.fillRect(0,0,$('#gameCanvas').width(), $('#gameCanvas').height());
	for (var i = 0; i < worldL; i++){
		row = world.data[i].length;
		for (var j = 0; j < row; j++) {
			var tile = world.data[i][j];
			drawTile(tile);
		}
	}
}


function drawTile(tile){
	x = getStartX(world.width) + tile.posX * tileSize;
	y = getStartY(world.height)+ tile.posY*tileSize;
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

$(window).load(function(){
	world = parseMap(map);
	drawWorld(world);

	$(document).on('click','#editor', startEditor);
	//startGame();
});

$(window).resize(function(){
	wHeight = $(window).innerHeight();
	wWidth = $(window).innerWidth();
	//$('#gameCanvas').css({'width':'100%', 'height':'100%'});
	//tileSize = $('#gameCanvas').innerHeight()/map.height;
	//world = parseMap(map);
	//drawWorld(world);
});

function startGame() {

}

function getMousePos(c, e) {
    var rect = c.getBoundingClientRect();
    return {
          x: e.clientX - rect.left,
          y: e.clientY - rect.top
    };
}

function getTileAt(x,y) {
	return getTile(Math.floor((x-getStartX(world.width))/tileSize), Math.floor((y-getStartY(world.height))/tileSize));
}

function drawEditor(tile) {
	var ctxed = document.getElementById('editorCanvas').getContext('2d');
	var x = tile.posX*tileSize + getStartX(world.width);
	var y = tile.posY*tileSize + getStartY(world.height);
	ctxed.clearRect(0,0,$('#editorCanvas').innerWidth(), $('#editorCanvas').innerHeight());
	ctxed.fillStyle="rgba(255,255,255,0.5)";
	ctxed.clearRect(0,0,editor.width, editor.height);
	ctxed.fillRect(x,y,tileSize,tileSize);
}

function startEditor(){
	$('#editor').html('Close Editor');
	$(document).off('click','#editor');
	$(document).on('click', '#editor', closeEditor);

	TweenLite.to('aside', 0.5, {left:0});
	var mousePos;
	var activeTile;
	var editor = document.createElement("canvas");
	editor.id = "editorCanvas";
	editor.height = $('#gameCanvas').innerHeight();
	editor.width = $('#gameCanvas').innerWidth();
	document.body.appendChild(editor);
	$('#editorCanvas').css({'position':'absolute','left':$('#gameCanvas').offset().left, 'top':$('#gameCanvas').offset().top});
	var ctxed = editor.getContext('2d');
	
	var action = false;
	var undoStack = [];

	var beforePreview = false;

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
	
	editor.addEventListener('mousemove', function(e){
		mousePos = getMousePos(editor,e);
		var tile = getTileAt(mousePos.x, mousePos.y);
		var redraw = false; //if redraw needed
		if (tile && (typeof activeTile ==='undefined' || tile.posX !== activeTile.posX || tile.posY !== activeTile.posY)) {
			activeTile = tile;
			drawEditor(activeTile);

			if (action) {
				if (beforePreview){
					//restoring previewed tile
					if (world.data[beforePreview.posY][beforePreview.posX].type !== beforePreview.type){
						insertTile(new Tile (beforePreview.type, beforePreview.posX, beforePreview.posY), true);
					}
				}
				var newT = action();
				if (activeTile.type !== newT.type){
					//drawing preview tile
					beforePreview = activeTile;
					insertTile(new Tile (newT.type, newT.posX, newT.posY), true);
				}
			}
		}
	});

	editor.addEventListener('click', function(e){
		if (!action || activeTile.type === action().type) return false;
		activeTile = action();
		undoStack.push(new Tile(beforePreview.type, beforePreview.posX, beforePreview.posY));
		insertTile(new Tile(activeTile.type, activeTile.posX, activeTile.posY), true);//new Tile ("wall", activeTile.posX, activeTile.posY);
		beforePreview = false;
	});

	$('#undoButton').css({display: 'inline'});

	$(document).on('click','#undoButton', function(e){
		if (undoStack.length) {
			var oldTile = undoStack.pop();
			console.log(oldTile);
			insertTile(oldTile);
			drawWorld(world);
		}
	});

}

function closeEditor() {
	TweenLite.to('aside', 0.5, {left:-200});
	$(document).off('click','#editor');
	$('#editor').html('Editor');
	$(document).on('click','#editor', startEditor);
	document.body.removeChild(document.getElementById('editorCanvas'));
}

});