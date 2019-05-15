var EDITING_KEY = 'holdingEdit';
Session.setDefault(EDITING_KEY, false);

var firstRender = true;
var listRenderHold = LaunchScreen.hold();
listFadeInHold = null;

Template.holdingEdit.rendered = function () {
  Meteor.typeahead('#input-empresaId', function () {
    // create list of abbreviations
    var empresas = Empresas.find().fetch().map(function (doc) {
        return { id: doc._id, value: doc.razon };
    });
    // return the sorted list
    return empresas.sort(); 
  });
}

Template.holdingEdit.helpers({
  empresa: function () {
    return Empresas.findOne(Router.current().params._empresaId);
  },
  empresas: function() {
    return Empresas.find({ empresaId: { $ne: Router.current().params._empresaId }, });
  },
  holdingSeleccionado: function(event, suggestion, datasetName) {
    Session.set('SubempresaId', suggestion.id);
  }
});

Template.holdingEdit.events({
  'focusout .form-control': function(e) {
    e.preventDefault();
    var id = e.currentTarget.id;
    var tipo = e.currentTarget.attributes.tipo.value;
    var value = e.currentTarget.value;
    var holdingId = Session.get('HoldingId');
    var subempresaId = Session.get('SubempresaId');
    var valor = ( tipo =='session-id' ? subempresaId : value );
    if(!holdingId) {
      holdingId = Holdings.insert({ 
        fecha: new Date(), 
        holdingId: Router.current().params._empresaId, 
        empresaId: subempresaId 
      });
      Session.set('HoldingId', holdingId);
    } 
    var holding = Holdings.find({ _id: holdingId });
    var atributo = id.split('-')[1];
    var v0 = eval('holding.' + atributo);
    var doc = {};
    doc[atributo] = valor;
    if(v0==valor) {
      //console.log('Sin cambios');
    } else {
      //console.log('Cambio desde / ' + v0 + ' ->' + JSON.stringify(doc));
      Holdings.update({ _id: holdingId }, { $set: doc });
    }
  }
});