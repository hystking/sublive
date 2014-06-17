
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
