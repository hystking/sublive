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
