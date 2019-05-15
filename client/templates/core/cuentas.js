Template.cuentas.rendered = function () {
  Session.set('NavigationPath', false);
  if(Meteor.user().profile.role==1) {
    Session.set('RolSeleccionado', 1);
  } else {
    Session.set('RolSeleccionado', 6);
  }
}

Template.cuentas.helpers({
  isAdmin: function () {
    return Meteor.user() && Meteor.user().profile.role == 1;
  },
  adminSel: function () {
    return Session.get('RolSeleccionado') == 1;
  },
  rol2Sel: function () {
    return Session.get('RolSeleccionado') == 2;
  },
  rol3Sel: function () {
    return Session.get('RolSeleccionado') == 3;
  },
  rol4Sel: function () {
    return Session.get('RolSeleccionado') == 4;
  },
  rol5Sel: function () {
    return Session.get('RolSeleccionado') == 5;
  },
  rol6Sel: function () {
    return Session.get('RolSeleccionado') == 6;
  },
  accountsCount: function () {
    var RolSeleccionado = Session.get('RolSeleccionado');
    var doc = {};
    if(Meteor.user().profile.role>=2) {
      doc["profile.role"] = (RolSeleccionado ? RolSeleccionado : 6);
    }
    var empresa = Session.get("IdentificadorEmpresa");
    var identificador = empresa.identificador;
    var usuarios = [];
    Meteor.users.find(doc, opciones).fetch().forEach(function(u) {
      if(u.emails[0].address.split("@")[1].split(".")[0]==identificador) {
        usuarios.push(u);
      }
    });
    
    return usuarios.length;
  },
  accounts: function () {
    if(!Empresas.findOne()) return [];
    var empresa = Session.get("IdentificadorEmpresa");
    var identificador = empresa.identificador;
    var RolSeleccionado = Session.get('RolSeleccionado');
    var doc = {};
    var opciones = { sort: { "profile.name": 1 }};
    doc["profile.role"] = (RolSeleccionado ? RolSeleccionado : 2);
    
    var usuarios = [];
    Meteor.users.find(doc, opciones).fetch().forEach(function(u) {
      if(u.emails[0].address.split("@")[1].split(".")[0]==identificador) {
        usuarios.push(u);
      }
    });
    
    return usuarios.map(function(a, index) {
      a.index = index + 1;
      return a;
    });
  },
  rolSeleccionado: function() {
    switch(Session.get('RolSeleccionado')) {
      case 1: return '_EdU_';
      case 2: return 'Gerente';
      case 3: return 'Asesores';
      case 4: return 'Socios';
      case 5: return 'Vendedores';
      case 6: return 'Trabajadores';
      default: return 'Rol desconocido' + Session.get('RolSeleccionado');
    }
  },
  tieneTrabajadores: function() {
    return Session.get("IdentificadorEmpresa") ? Session.get("IdentificadorEmpresa").identificador=="simen" || Meteor.user().profile.role==1 : false;
  },
  estiloListContainer: function() {
    var ide = Session.get("IdentificadorEmpresa");
    if(!ide) return "";
    return "background-color:" + RGBA(ide.color, "0.4");
  },
});

Template.cuentas.events({
  'click #tab-admin': function (e) {
    e.preventDefault();
    Session.set('RolSeleccionado', 1);
  },
  'click .tab-rol': function (e) {
    e.preventDefault();
    var id = e.currentTarget.id.substring(7);
    Session.set('RolSeleccionado', Number(id));
  },
  'click .btn-edit': function (e) {
    var btn = e.currentTarget;
    var userId = btn.id;
    var user = Meteor.users.findOne({
      _id: userId
    });
    if(user) {
      Session.set('UsrSel', user);
      AddNav('/cuentas');
      Router.go('/cuentaEdit');
    }
  },
  'click .btn-delete': function (e) {
    var btnid = e.currentTarget.id;
    Session.set('Parametros', {
      entidad: "usuario",
      id: btnid,
      identificacion: Meteor.users.findOne(btnid).profile.name
    });
    $('#modal-confirmacion-eliminacion').modal('show');
  },
  'click #btn-add-account': function (e) {
    e.preventDefault();
    Session.set("UsrSel", { profile: { role: Session.get("RolSeleccionado") }, emails: [{ address: "", verified: false }]});
    AddNav('/cuentas');
    Router.go('/cuentaEdit');
  }
});

