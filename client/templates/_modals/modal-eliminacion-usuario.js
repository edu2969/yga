Template.modalEliminacionUsuario.helpers({
  usuario: function () {
    var p = Session.get('UserIdToRemove');
    return Meteor.users.findOne(p);
  }
});

Template.modalEliminacionUsuario.events({
  'click #btn-confirm': function (e) {
    e.preventDefault();
    var params = Session.get('UserIdToRemove');
    if (!params) return;

    Meteor.call('EliminarUsuario', params);
    
    $("#modal-eliminacion-usuario").modal('hide');
  }
});