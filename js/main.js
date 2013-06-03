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
	width:28,
	height:31,
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
	".....XoXX..........XXoX.....",
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
	"xooooooooooooooooooooooooooX",
	"XXXXXXXXXXXXXXXXXXXXXXXXXXXX"]
};
//Maze dimensions 28 x 31

$(document).ready(function() {




var wHeight = $(window).innerHeight();
var wWidth = $(window).innerWidth();
function getTileSize(map) {
	var cW = $('#gameCanvas').innerWidth();	
	var cH = $('#gameCanvas').innerHeight();
	if (cW/map.width<cH/map.height){
		console.log(cW/map.width);
		return Math.floor(cW/map.width);
	}
	console.log(cW);
	return Math.floor(cH/map.height);
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
		data: []
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
			}
			newLine.push(newTile);
		}
		world.data.push(newLine);
	}
	return world;
}

function getTile(posX,posY){
	if (tileExists(posX,posY)){
		
		return world.data[posY][posX];	
	}
	return false;
}

function tileExists(posX,posY){
	//check if tile out of world bounds

	if (posX < 0 || posY < 0 || posX > world.data.length-1 || posY > world.data[0].length-1) return false;

	return true;
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
	if (tile && tile.type ==='wall') return true;
	return false;
}

function tileBlocked(tile){
	//check if tile surounded by walls
	return (isWall(upper(tile)) && isWall(lower(tile)) && isWall(left(tile)) && isWall(right(tile)));
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

function drawVerticalWall(x,y,tile){
	ctx.beginPath();
	if (!isWall(left(tile))){
		ctx.moveTo(x+tileSize/3, y);
		ctx.lineTo(x+tileSize/3,y+tileSize);
		ctx.stroke();
	}
	if (!isWall(right(tile))){
		ctx.moveTo(x+tileSize*2/3, y);
		ctx.lineTo(x+tileSize*2/3,y+tileSize);
		ctx.stroke();	
	}
}

function drawHorizontalWall(x,y,tile){
	ctx.beginPath();
	if (!isWall(upper(tile))){
		ctx.moveTo(x, y+tileSize/3);
		ctx.lineTo(x+tileSize,y+tileSize/3);
		ctx.stroke();
	}
	if (!isWall(lower(tile))){
		ctx.moveTo(x, y+tileSize*2/3);
		ctx.lineTo(x+tileSize,y+tileSize*2/3);
		ctx.stroke();	
	}
}

function drawWallTile(x,y, tile){
	ctx.strokeStyle = "rgb(0,34,255)";
	ctx.fillStyle = "rgb(0,34,255)";
	if (tileBlocked(tile)){
		console.log("blocked");
		if (!isWall(upper(left(tile)))) {
			ctx.beginPath();
			ctx.arc(x,y,tileSize/3,0,Math.PI/2, false);
			ctx.stroke();
		}
		if (!isWall(upper(right(tile)))) {
			ctx.beginPath();
			ctx.arc(x+tileSize,y,tileSize/3,Math.PI,Math.PI/2, true);
			ctx.stroke();
		}
		if (!isWall(lower(left(tile)))) {
			ctx.beginPath();
			ctx.arc(x,y+tileSize,tileSize/3,Math.PI*3/2,0, false);
			ctx.stroke();
		}
		if (!isWall(lower(right(tile)))) {
			ctx.beginPath();
			ctx.arc(x+tileSize,y+tileSize,tileSize/3,Math.PI*3/2,Math.PI, true);
			ctx.stroke();
		}
	} else {
		if (isVerticalWall(tile)) {
			drawVerticalWall(x,y,tile);
		} else if (isHorizontalWall(tile)){
			drawHorizontalWall(x,y,tile);
		} else {
			ctx.fillRect(x,y,tileSize,tileSize);
		}
		
	}
	
	
}

function drawPelletTile(x,y){
	x = x+tileSize/2;
	y = y+tileSize/2;
	ctx.fillStyle= "rgb(255,255,0)";
	ctx.beginPath();
	ctx.arc(x,y,tileSize/10, 0, Math.PI *2, true);
	ctx.closePath();
	ctx.fill();
}

function drawBoosterTile(x,y){
	x = x+tileSize/2;
	y = y+tileSize/2;
	ctx.fillStyle= "rgb(255,60,0)";
	ctx.beginPath();
	ctx.arc(x,y,tileSize/5, 0, Math.PI *2, true);
	ctx.closePath();
	ctx.fill();	
}

function drawGateTile(x,y){
	ctx.fillStyle = "rgb(255,255,255)";
	ctx.fillRect(x,y,tileSize,tileSize);	
}

function drawWorld(world) {
	var x,y, row;
	worldL = world.data.length;
	for (var i = 0; i < worldL; i++){
		y = getStartY(world.height)+i*tileSize;
		row = world.data[i].length;
		for (var j = 0; j < row; j++) {
			x = getStartX(world.width) + j * tileSize;
			var tile = world.data[i][j];
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
				drawGateTile(x,y);

			}
		}

	}
}


$(window).load(function(){
	var world = parseMap(map);
	drawWorld(world);

});

$(window).resize(function(){
	wHeight = $(window).innerHeight();
	wWidth = $(window).innerWidth();

	tileSize = $('#gameCanvas').innerHeight()/map.height;
});




});