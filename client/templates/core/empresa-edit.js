var EDITING_KEY = 'empresaEdit';
Session.setDefault(EDITING_KEY, false);

var firstRender = true;
var listRenderHold = LaunchScreen.hold();
listFadeInHold = null;

Template.empresaEdit.rendered = function () {
  var e = Session.get("Empresa");
  if(!e) e = {
    creadorId: Meteor.userId(),
    creacion: new Date(),
    color: "#000"
  }
  Session.set("Empresa", e);
  $('.datetimepicker-component').datetimepicker({
    format: 'DD/MM/YY'
  });
  
  $('#color-picker-component').colorpicker();
  hayErrores();
}

Template.empresaEdit.destroyed = function() {
  delete Session.keys["ImportMessages"];
}

Template.empresaEdit.helpers({
  esAdmin: function() {
    return Meteor.user().profile.role==1;
  },
  empresa: function () {
    return Session.get('Empresa');
  },
  integrantes: function () {
    var e = Session.get("Empresa");
    return _.isEmpty(e) || _.isEmpty(e._id) ? false : Equipos.find({ empresaId: e._id }).map(function(a, i) {
      a.nombre = a.usuarioId && Meteor.users.findOne(a.usuarioId) ? Meteor.users.findOne(a.usuarioId).profile.name:'Sin definir';
      a.rol = a.rol?a.rol:'Sin Rol definido'
      return a;
    });
  },
  cantidadIntegrantes: function () {
    var e = Session.get("Empresa");
    return !_.isEmpty(e) && !_.isEmpty(e._id) && Equipos.find({ empresaId: e._id })?Equipos.find({ empresaId: e._id }).count():0;
  },
  profile: function () {
    return Meteor.user().profile;
  },
  creadores: function() {
    return Meteor.users.find({ "profile.role": { $in: [1, 2] }});
  },
  estiloListContainer: function() {
    var ide = Session.get("IdentificadorEmpresa");
    if(!ide) return "";
    return "background-color:" + RGBA(ide.color, "0.4");
  },
  esSimen: function() {
    return Session.get("Empresa").identificador.includes("simen");
  }
});

Template.empresaEdit.events({
  'focusout .form-control, focusout .colorpicker-component': function(e) {
    if(hayErrores()) return;
    e.preventDefault();
    var id = e.currentTarget.id;
    var tipo = e.currentTarget.attributes.tipo.value;
    var value = e.currentTarget.value;
    var valor = ( tipo =='fecha' ? moment(value, 'DD/MM/YY').toDate() : 
                 tipo=='select-id' ? e.currentTarget.options[e.currentTarget.selectedIndex].id
                 : value );
    var empresa = Session.get('Empresa');
    if(!empresa) return;
    var doc = {};
    var atributo = id.split('-')[1];
    var v0 = eval('empresa.' + atributo);
    doc[atributo] = valor;
    if(v0==valor) {
      //console.log('Sin cambios');
    } else {
      //console.log('Cambio desde / ' + v0 + ' ->' + JSON.stringify(doc));
      if(atributo=="razon") {
        doc["identificador"] = valor.split(" ")[0].toLocaleLowerCase();
        empresa.identificador = doc.identificador;
      }
      empresa[atributo] = valor;
      Session.set("Empresa", empresa);
      if(empresa._id) {
        Empresas.update({ _id: empresa._id }, { $set: doc });
      } else {
        empresa[atributo] = valor;
        Meteor.call("CrearEmpresa", empresa, function(err, empresaId) {
          if(!err) {
            var e = Session.get("Empresa");
            e._id = empresaId;
            Session.set("Empresa", e);            
          }
        });
      }      
    }
  },
  'click li a': function(e) {
    e.preventDefault();
    $(this).tab('show');
  },
  'click .btn-agregar-integrante': function (e) {
    e.preventDefault();
    Session.set('Integrante', false);
    AddNav('/empresaEdit/' + Session.get('Empresa')._id);
    Router.go('/integranteEdit/' + Router.current().params._empresaId);
  },
  'click .btn-editar-integrante': function (e) {
    e.preventDefault();
    var id = e.currentTarget.id;
    Session.set('Integrante', Equipos.findOne(id));
    AddNav('/empresaEdit/' + Session.get('Empresa')._id);
    Router.go('/integranteEdit/' + Router.current().params._empresaId);
  },
  'click .btn-eliminar-integrante': function (e) {
    e.preventDefault();
    var id = e.currentTarget.id;
    var integrante = Equipos.findOne(id);
    Session.set('Parametros', { 
      id: id , 
      entidad: "integrante", 
      identificacion: (integrante.usuarioId?Meteor.users.findOne(integrante.usuarioId).profile.name:'Sin definir, rol ' 
                       + (integrante.rol?integrante.rol:' Sin rol definido')), 
      empresaId: Router.current().params._empresaId 
    });
    $('#modal-confirmacion-eliminacion').modal('show');
  },
  'keyup .form-control': function() {
    hayErrores();
  }
});

var hayErrores = function() {
  var msgs = {
    danger: []
  };
  if (_.isEmpty($("#input-razon").val())) {
    msgs.danger.push({
      item: "RAZON es requerida"
    });
  }
  Session.set("ImportMessages", msgs);
  return !_.isEmpty(msgs.danger);
}