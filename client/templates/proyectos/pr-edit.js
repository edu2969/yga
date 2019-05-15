var EDITING_KEY = 'prEdit';
Session.setDefault(EDITING_KEY, false);

// Track if this is the first time the list template is rendered
var firstRender = true;
var listRenderHold = LaunchScreen.hold();
listFadeInHold = null;

Template.prEdit.rendered = function() {
  $('.datetimepicker-component').datetimepicker({
    format: 'DD/MM/YY'
  });
}

Template.prEdit.helpers({
  pr: function () {
    var prId = Session.get('PRId');
    if(!prId) {
      return {
        fecha: new Date()
      }
    }
    return PRs.findOne({ _id: prId });
  },
  items: function () {
    var prId = Session.get('PRId');
    if(!prId) return false;
    return Items.find({ prId: prId }).map(function(a, i) {
      a.indice = i + 1;
      return a;
    });
  },
  esEditada: function () {
    return Session.get('PRId')!='0';
  },
  clientes: function () {
    return Meteor.users.find({
      "profile.role": 5
    });
  }
});

Template.prEdit.events({
  'click .btn-agregar-item': function (e) {
    e.preventDefault();
    AddNav('/prEdit/' + Router.current().params._prId );
    Session.set('ItemId', false);
    Router.go('/itemPREdit/0');
  },
  'click .btn-editar-item': function (e) {
    e.preventDefault();
    var id = e.currentTarget.id;
    AddNav('/prEdit/' + Router.current().params._prId );
    Session.set('ItemId', id);
    Router.go('/itemPREdit/' + id);
  },
  'click .btn-eliminar-item': function(e) {
    e.preventDefault();
    var id = e.currentTarget.id;
    Session.set('Parametros', { entidad: 'pr', id: id });
    $('#modal-confirmacion-eliminacion').modal('show');
  },
  'click .btn-pdf': function (e) {
    e.preventDefault();
    var id = Router.current().params._prId;
    Router.go('/OCPDF/' + id);
  },
  'focusout .form-control': function(e) {
    e.preventDefault();
    var id = e.currentTarget.id;
    var tipo = e.currentTarget.attributes.tipo.value;
    var value = e.currentTarget.value;
    var valor = ( tipo =='fecha' ? moment(value, 'DD/MM/YY').toDate() : 
                 tipo=='select-id' ? e.currentTarget.options[e.currentTarget.selectedIndex].id
                 : value );
    var prId = Session.get('PRId');
    if(!prId) {
      var ultimaPR = PRs.findOne({});
      prId = PRs.insert({ 
        numero: ( ultimaPR ? ultimaPR.numero : 142857 ),
        fecha: new Date()
      });
      Session.set('PRId', prId);
    }
    var p = PRs.findOne({ _id: prId });
    var atributo = id.split('-')[2];
    var v0 = eval('p.' + atributo);
    var doc = {};
    doc[atributo] = valor;
    if(v0!=valor) {
      PRs.update({ _id: prId }, { $set: doc });
    }
  }
})