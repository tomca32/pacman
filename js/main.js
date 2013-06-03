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

var map = {
	width:10,
	height:10,
	data: [
	"XXXXXXXXXX",
	"XooooooooX", 
	"X.XXX..XoX", 
	"X.X.X..XoX", 
	"X.X.X..XXX", 
	"XXX.X....X", 
	"X........X", 
	"X........X", 
	"X........X", 
	"XXXXXXXXXX"]
};
//Maze dimensions 28 x 31

$(document).ready(function() {




var wHeight = $(window).innerHeight();
var wWidth = $(window).innerWidth();
var tileSize = parseInt($('#gameCanvas').innerHeight()/map.height);
console.log(tileSize);
var ctx = document.getElementById('gameCanvas').getContext('2d');
function Tile (tileInfo) {
	this.type = tileInfo;
}


function parseMap(map){
	var world = {
		height:  map.height,
		width:  map.width,
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
				newTile = new Tile ("closed");
				break;

				case ".":
				newTile = new Tile ("open");
				break;	

				case "o":
				newTile = new Tile ("pellet");
				break;

				case "O":
				newTile = new Tile ("booster");
				break;
			}
			newLine.push(newTile);
		}
		world.data.push(newLine);
	}
	return world;
}

function drawClosedTile(x,y){
	ctx.fillStyle = "rgb(0,34,255)";
	ctx.strokeStyle = "rgb(0,34,255)";
	ctx.fillRect(x,y,tileSize,tileSize);
}

function drawPelletTile(x,y){
	x = (x+tileSize/2);
	y = (y+tileSize/2);
	console.log(x,y);
	ctx.fillStyle= "rgb(255,255,0)";
	ctx.beginPath();
	ctx.arc(x,y,tileSize/10, 0, Math.PI *2, true);
	ctx.closePath();
	ctx.fill();
}

function drawWorld(world) {
	var x,y, row;
	worldL = world.data.length;
	for (var i = 0; i < worldL; i++){
		y = i*tileSize;
		row = world.data[i].length;
		for (var j = 0; j < row; j++) {
			x = j * tileSize;
			var tile = world.data[i][j];
			switch (tile.type) {
				case "open":
				break;

				case "closed":
				drawClosedTile(x,y);
				break;

				case "pellet":
				drawPelletTile(x,y);
				break;

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