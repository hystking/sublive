var Room = require("./Room").Room;

var RoomManager = function(io, ptn){
  this._rooms = {};
  this._ptn = ptn;
  this._io = io;
}
RoomManager.prototype.getRoom = function(name_room){
  return this._rooms[name_room] || null;
};
RoomManager.prototype.createRoom = function(name_room, key){
  var room = this._rooms[name_room] || null;
  if(room){
    return null;
  }
  room = new Room(this._io, name_room, key);
  this._rooms[name_room] = room;
  return room;
};

exports.RoomManager = RoomManager;
