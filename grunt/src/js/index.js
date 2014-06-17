$(this).ready(function(w, d){
  $createRoomForm = $('#create-room-form');
  $roomName = $('#room-name');
  $createRoomForm.submit(function(){
    $createRoomForm.attr(
      'action',
      '/'+$roomName.val()
      );
  });
}.bind(this, this, document));
