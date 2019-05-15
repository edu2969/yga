var EDITING_KEY = 'proyectos';
Session.setDefault(EDITING_KEY, false);

// Track if this is the first time the list template is rendered
var firstRender = true;
var listRenderHold = LaunchScreen.hold();
listFadeInHold = null;

Template.proyectos.rendered = function () {
  Session.set('EmpresaIdSeleccionada', false);
  Meteor.typeahead('#input-empresas-search', function () {
    // return the sorted list
    return Empresas.find().map(function (doc) {
      return { id: doc._id, value: doc.razon };
    }).sort();
  });
}

Template.proyectos.destroyed = function() {
  delete Session.keys["EmpresaIdSeleccionada"];
}


Template.proyectos.helpers({
  proyectos: function () {
    var eId = Session.get('EmpresaIdSeleccionada');
    return Proyectos.find(eId ? { empresaId: eId } : {}, { sort: { number: -1 }}).map(function (a, index) {
      a.index = index;
      a.estado = 'En ejecución';
      a.empresa = Empresas.findOne({ _id: a.empresaId });
      return a;
    });
  },
  empresas: function() {
    return Empresas.find().fetch().map(function(it){ return it.razon; });
  },
  selected: function(event, suggestion, datasetName) {
    Session.set('EmpresaIdSeleccionada', suggestion.id);
    //console.log(suggestion.id);
  }
});

Template.proyectos.events({
  'click .btn-new': function (e) {
    e.preventDefault();
    Session.set('Proyecto', false);
    AddNav('/proyectos');
    Router.go('/proyectoEdit/0');
  },
  'click .btn-edit': function (e) {
    e.preventDefault();
    var id = e.currentTarget.id;
    Session.set('Proyecto', Proyectos.findOne(id));
    AddNav('/proyectos');
    Router.go('/proyectoEdit/' + id);
  },
  'click .btn-eliminar': function (e) {
    e.preventDefault();
    Session.set('Parametros', {
      entidad: "proyecto", 
      id: e.currentTarget.id
    });
    $('#modal-confirmacion-eliminacion').modal('show');
  }
});
