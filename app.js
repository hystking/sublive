var express = require("express")
var app = express();
var http = require("http");
var server = http.createServer(app);
var io = require("socket.io").listen(server, {"log level": 1});

var RoomManager = require("./js/RoomManager").RoomManager;

var getRandomKey = function(n){
  var key = "";
  var i = 0;
  for(; i<n; i++){
    key += "ABCDEFGHJKLMNOPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz0123456789"[Math.random()*60|0];
  }
  return key;
};

io.configure(function () { 
  io.set("transports", ["xhr-polling"]); 
  io.set("polling duration", 10);
});

var port = process.env.PORT || 5000;
server.listen(port);

app.get("/", function(req, res){
  res.sendfile("templates/index.html");
});

var namePtn = /^\/([a-zA-Z0-9_]+)$/;
app.get(namePtn, function(req, res){
	var name_room = req.params[0];
	console.log("get room: ", name_room);
	var room = rm.getRoom(name_room);
  if(room){
    res.sendfile("templates/room.html");
  }else{
    res.status(404);
    res.sendfile('templates/404.html');
  }
});

app.post(namePtn, function(req, res){
	var name_room = req.params[0];
	var url = "/"+name_room;
  var key = getRandomKey(16);
  if(rm.createRoom(name_room, key)){
    res.cookie("key_"+name_room, key);
  }
  res.redirect(url);
});

app.use(express.static(__dirname + "/htdocs"));
var rm = new RoomManager(io, namePtn);

rm.createRoom("test");
