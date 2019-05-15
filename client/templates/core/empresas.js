var EDITING_KEY = 'empresas';
Session.setDefault(EDITING_KEY, false);

var firstRender = true;
var listRenderHold = LaunchScreen.hold();
listFadeInHold = null;

Template.empresas.rendered = function () {
  delete Session.keys["Empresa"];
}

Template.empresas.destroyed = function() {
  
}

Template.empresas.helpers({
  empresas: function () {
    var identificador = Session.get("IdentificadorEmpresa") ? Session.get("IdentificadorEmpresa").identificador : false;
    if(!identificador) return;
    return Empresas.find({}).map(function(o, i) {
      var user = Meteor.users.findOne(o.creadorId);
      o.esAdmin = Meteor.user().profile.role==1 ? true : o.creadorId==Meteor.userId();
      o.esPropietario = Session.get("IdentificadorEmpresa")._id==o._id;
      return o;
    });
  },
  estiloListContainer: function() {
    var ide = Session.get("IdentificadorEmpresa");
    if(!ide) return "";
    return "background-color:" + RGBA(ide.color, "0.4");
  }
});

Template.empresas.events({
  'click .btn-agregar': function () {
    Session.set('Empresa', false);
    AddNav("/empresas");
    Router.go('/empresaEdit/0');
  },
  'click .btn-editar': function (e) {
    e.preventDefault();
    var id = e.currentTarget.id;
    Session.set('Empresa', Empresas.findOne(id));
    AddNav('/empresas');
    Router.go('/empresaEdit/' + id);
  },
  'click .btn-eliminar': function (e) {
    e.preventDefault();
    var id = e.currentTarget.id;
    var empresa = Empresas.findOne(id);
    Session.set('Parametros', { 
      id: id, 
      entidad: "empresa", 
      identificacion: (empresa?empresa.razon:'ERROR!')
    });
    $('#modal-confirmacion-eliminacion').modal('show');
  }
});
