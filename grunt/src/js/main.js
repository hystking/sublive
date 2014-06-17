$(this).ready(function(w, d){
  var getRandomKey = function(n){
    var key = "";
    var i = 0;
    for(; i<n; i++){
      key += "ABCDEFGHJKLMNOPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz0123456789"[Math.random()*60|0];
    }
    return key;
  };

  room = new Room();
  editor = new Editor();
  videoStream = new VideoStream();

  $roomName = $('.room-name');
  $countUsers = $('.count-users');
  $roomName.text(room.name);

  var connect = function(){
    /* ughh 3 connections! */
    sublimeSockt = new SublimeSocket();
    peer = new Peer(getRandomKey(16), {key: 'r69lq1rlcyf7ds4i'});
    ioSocket = io.connect(w.location.href, {'sync disconnect on unload' : true});
    ioSocket.on('connect', handleIoSocketConnect);
  };

  var handleIoSocketConnect = function(){
    console.log('ioSocket connected');
    if(room.isMaster){
      onConnectionMaster();
    }else{
      onConnectionUser();
    }
    ioSocket.on('countUsers', function(data){
      console.log('countUsers', data);
      $countUsers.text(data.count);
    });
  };
  
  var onConnectionMaster = function(){
    var conns = [];
    ioSocket.emit('registerMaster', {'key': room.key});
    ioSocket.on('peerIdUser', function(data){
      console.log('io socket peer id user ');
      var id = data.id;
      var conn = peer.connect(id);
      videoStream.call(peer, id);
      conns.push(conn);
    });
    sublimeSockt.connect();
    sublimeSockt.socket.addEventListener('message', function(e){
      var i;
      var p = JSON.parse(e.data);
      editor.onReceive(p);
      for(i=0; i<conns.length; i++){
        conns[i].send({
          'type': 'lineData',
          'data': p
        });
      }
    });
  };

  var onConnectionUser = function(){
    console.log(peer.id);
    ioSocket.emit('peerIdUser', {id: peer.id});
    peer.on('connection', function(conn){
      console.log('peer connected');
      conn.on('data', function(data){
        if(data.type === 'lineData'){
          editor.onReceive(data.data);
        }
      });
    });
    peer.on('call', videoStream.onCall);
  };

  if(room.isMaster){
    videoStream.setStream(connect);
  }else{
    connect();
  }

}.bind(this, this, document));
