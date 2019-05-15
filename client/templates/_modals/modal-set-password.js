Template.modalSetPassword.helpers({
  usuario: function () {
    var p = Session.get('UserId');
    return Meteor.users.findOne(p);
  },
  esAdmin: function() {
    return Meteor.user() && Meteor.user().profile ? Meteor.user().profile.rol == 1 : false;
  }
});

Template.modalSetPassword.events({
  'click #btn-confirm': function (e) {
    e.preventDefault();
    
    var userId = Session.get('UserId');
    if (!userId) return;
    
    if(Meteor.userId==userId) {
      Meteor.call("ResetPassword", userId, function(err, resp) {
        if(!err) {
          Session.set("ImportMessages", { success: [{ item: "Envío exitoso"}]});
          setTimeout(function() {
            $('#modal-eliminacion-usuario').modal('hide');
            delete Session.keys.ImportMessages;
          }, 3000);
        }
      });
    } else {
      var pass = $("#usuario-password").val();
      var repass = $("#usuario-repassword").val();
      if(pass!=repass) {
        Session.set("ImportMessages", { danger: [{ item: "Deben coincidir"}]});
        return;
      }    
      Meteor.call('CambiarPassword', userId, password, function(err, resp) {
        if(!err) {
          Session.set("ImportMessages", { success: [{ item: "Cambio exitoso"}]});
          setTimeout(function() {
            $('#modal-eliminacion-usuario').modal('hide');
            delete Session.keys.ImportMessages;
          }, 3000);
        }          
      });    
    }
  }
});