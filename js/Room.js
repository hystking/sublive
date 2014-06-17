var Room = function(io, name_room, key){
  this._room = io.of("/"+name_room);
  this._sockets = [];
  this._users = 0;
  this._io = io;
  this._key = key || null;
  this._name = name_room;
  this._master = null;
  this._room.on("connection", this._onConnection.bind(this));
  this._room.on("disconnect", this._onDisconnect.bind(this));


  /*becon*/
  setInterval(function(){
  }, 5000);
};

Room.prototype._checkKey = function(key){
  return key === this._key;
};

Room.prototype._onConnection = function(socket){
  this._users++;
  this._sockets.push(socket);
  socket.on("echo", this._onEcho.bind(this, socket));
  socket.on("close", this._onClose.bind(this, socket));
  socket.on("disconnect", this._onDisconnect.bind(this, socket));
  socket.on("registerMaster", this._onRegisterMaster.bind(this, socket));
  socket.on("peerIdUser", this._onPeerIdUser.bind(this, socket));
  console.log(this._name, this._users);
  this._emitCountUsers();
};

Room.prototype._onRegisterMaster = function(socket, data){
  if(this._checkKey(data.key)){
    console.log('register master');
    this._master = socket;
    socket.emit('responceRegister', {'registered': true});
  }else{
    console.log('failed to register master');
    socket.emit('responceRegister', {'registered': false});
  }
};

Room.prototype._emitCountUsers = function(){
  this._room.emit('countUsers', {'count': this._users});
};

Room.prototype._onPeerIdUser = function(socket, data){
  console.log('peeer id user', data);
  if(!this._master){
    return;
  }
  this._master.emit('peerIdUser', data);
};

Room.prototype._onEcho = function(socket, data){
  this._room.emit("echo", data);
};

Room.prototype._onClose = function(socket, data){
  this._users = -1;
  this._room.emit("close", data);
};

Room.prototype._onDisconnect = function(socket){
  this._users--;
  this._emitCountUsers();
};

exports.Room = Room;
