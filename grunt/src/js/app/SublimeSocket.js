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
