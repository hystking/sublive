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
