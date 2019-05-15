var EDITING_KEY = 'integranteEdit';
Session.setDefault(EDITING_KEY, false);

var firstRender = true;
var listRenderHold = LaunchScreen.hold();
listFadeInHold = null;

Template.integranteEdit.rendered = function () {
  var i = Session.get("Integrante");
  if(!i) {
    i= {
      usuarioId: Meteor.users.findOne()._id,
      empresaId: Router.current().params._empresaId ? Router.current().params._empresaId : "ERROR!"
    }
  }
  Session.set("Integrante", i);
}

Template.integranteEdit.destroyed = function() {
  delete Session.keys["Integrante"];
}

Template.integranteEdit.helpers({
  integrante: function () {
    return Session.get('Integrante');
  },
  usuarios: function () {
    return Meteor.users.find();
  },
  empresa: function () {
    return Empresas.findOne();
  }
});

Template.integranteEdit.events({
  'focusout .form-control': function(e) {
    debugger;
    e.preventDefault();
    var id = e.currentTarget.id;
    var atributo = id.split('-')[1];
    var tipo = e.currentTarget.attributes.tipo.value;
    var value = tipo=="select-id" ? e.currentTarget.options[e.currentTarget.selectedIndex].id : e.currentTarget.value;
    var integrante = Session.get('Integrante');
    if(!integrante) return;
    if(!integrante._id) {
      integrante[atributo] = value;
      console.log(JSON.stringify(integrante));
      Meteor.call("AgregarIntegrante", integrante, function(err, resp) {
        if(!err) {
          var i = Session.get("Integrante");
          i._id = resp;
          Session.set("Integrante", i);
        }
        return;
      });
    }
    var v0 = eval('integrante.' + atributo);
    var doc = {};
    doc[atributo] = value;
    if(v0==value) {
      //console.log('Sin cambios');
    } else {
      console.log('Cambio desde / ' + v0 + ' ->' + JSON.stringify(doc));
      Equipos.update({ _id: integrante._id }, { $set: doc });
      Session.get("Integrante", integrante);
    }
  }
});
