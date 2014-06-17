(function(w, d){
  Editor = function(){
    /*bind them all*/
    MethodBinder.bind(Editor, this);
    /*construct*/
    this.$editor = $('#editor');
    this.lines = [];
  };
  Editor.prototype = {
    'addLine': function(line){
      this.lines.push(line);
    },
    'get$LineAt': function(i){
      var j, word, $word;
      var line = this.lines[i];
      var len = line.length;
      $line = $('<p/>').addClass('line');
      $line.append($('<span/>').addClass('row-num').text(i+1));
      for(j=0; j<len; j++){
        word = line[j];
        $word = $('<span/>').addClass('word '+word[1]).text(word[0]);
        $line.append($word);
      }
      return $line;
    },
    'renderAt': function(i){
      this.$editor.find('.line').eq(i).replaceWith(this.get$LineAt(i));
    },
    'renderAll': function(){
      var i, j, line, len2, $line;
      var lines = this.lines;
      var len1 = lines.length;
      var $editor = this.$editor;
      $editor.html('');
      for(i=0; i<len1; i++){
        $editor.append(this.get$LineAt(i));
      }
    },
    'onReceive': function(p){
      if(p.row === 'all'){
        this.lines = p.lines;
        this.renderAll();
      }else{
        var row = parseInt(p.row);
        this.lines[row] = p.line;
        this.renderAt(row);
      }
    }
  };
})(this, document);


(function(w, d){
  MethodBinder = {
    /*bind them all*/
    /*construct*/
    'bind': function(klass, instance){
      var i;
      for(i in klass.prototype){
        instance[i] = klass.prototype[i].bind(instance);
      }
    }
  };
})(this, document);

(function(w, d){
  Room = function(){
    /*bind them all*/
    MethodBinder.bind(Room, this);
    /*construct*/
    this.name = window.location.href.match(/[a-zA-Z0-9]+$/)[0];
    var re = document.cookie.match("key_"+this.name+"=([a-zA-Z0-9]+)");
    if(re){
      this.isMaster = true;
      this.key = re[1];
    }else{
      this.isMaster = false;
      this.key = null;
    }
  };
  Room.prototype = {
  };
})(this, document);

(function(w, d){
  /*klass*/
  SublimeSocket = function(){
    /*bind them all*/
    MethodBinder.bind(SublimeSocket, this);
    /*construct*/
    this.socket = null;
  };
  SublimeSocket.prototype = {
    'connect': function(line){
      this.socket = new WebSocket('ws://localhost:25252');
    },
    'emit': function(p){
    }
  };
})(this, document);

(function(w, d){
  VideoStream = function(){
    /*bind them all*/
    MethodBinder.bind(VideoStream, this);
    /*construct*/
    this.$videoStream = $('.video-stream');
    navigator.getUserMedia = navigator.getUserMedia ||
                             navigator.webkitGetUserMedia ||
                             navigator.mozGetUserMedia;
    this.stream = null;
  };
  VideoStream.prototype = {
    'setStream': function(callback){
      var video = this.$videoStream[0];
      navigator.getUserMedia(
        {video: true, audio: true},
        function(stream) {
          video.src = URL.createObjectURL(stream);
          video.play();
          this.stream = stream;
          callback();
        }.bind(this),
        function(err) {
          console.log(error);
        }
      );
    },
    'call': function(peer, id){
      return peer.call(id, this.stream);
    },
    'onCall': function(call){
      var video = this.$videoStream[0];
      call.answer(null);
      call.on('stream', function(remoteStream) {
        video.src = URL.createObjectURL(remoteStream);
        video.play();
      });
    }
  };
})(this, document);

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
