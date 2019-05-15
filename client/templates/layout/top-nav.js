Template.topNav.rendered = function () {
  $('.dropdown-toggle').dropdown();
}

Template.topNav.events({
  'click #btn-nav-back' : function (e) {
    NavBack();
  },
  'click .js-btn-aliados': function (e) {
    e.preventDefault();
    Session.set("MenuAliadoAbierto", !Session.get("MenuAliadoAbierto"));
  }
});

Template.topNav.helpers({
  navLastPage: function () {
    return Session.get('NavigationPath');
  },
  aliadoSesion: function() {
    var sesion = Session.get("SesionAliado");
    var empresa = Empresas.findOne({ _id: sesion.empresaId });
    if(empresa) return empresa.razon;
    return false;
  },
  menuSesionAbierto: function() {
    return Session.get("MenuAliadoAbierto");
  },
  aliados: function() {
    return Empresas.find();
  },
  entorno: function() {
    return Session.get("IdentificadorEmpresa");
  }
});