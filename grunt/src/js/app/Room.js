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
