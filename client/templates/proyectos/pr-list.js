var EDITING_KEY = 'prList';
Session.setDefault(EDITING_KEY, false);

// Track if this is the first time the list template is rendered
var firstRender = true;
var listRenderHold = LaunchScreen.hold();
listFadeInHold = null;

var options = {
  keepHistory: 1000 * 60 * 5,
  localSearch: true
};
var fields = ['nombre'];

PRsSearch = new SearchSource('prs', fields, options);

Template.prList.rendered = function () {
  Session.set('NavigationPath', false);
  PRsSearch.search('');
  Meteor.typeahead('#input-client-search', function () {
    // create list of abbreviations
    var clients = Meteor.users.find({ "profile.role": 5 }).fetch().map(function (doc) {
        return { id: doc._id, value: doc.profile.name };
    });
    // return the sorted list
    return clients.sort();
  });
}

Template.prList.helpers({
  isLoading: function() {
    return PRsSearch.getStatus().loading;
  },
  prs: function () {
    var userId = Session.get('UserIdSelected');
    if(!userId) {
      return PRsSearch.getData({
        docTransform: function(doc) {
          return _.extend(doc, {
            cliente: function() {
              var cli
              if(!this.clienteId) {
                cli = { "profile.email": 'Error al obtener contacto' };
              } else {
                cli = Meteor.users.findOne({_id: this.clienteId})
                if(!cli.profile || cli.profile.email)
                  cli.profile.email = 'Sin contacto';
              }
              return cli;
            },
            estado: function () {
              return 'Activo';
            }
          })
        },
        transform: function(matchText, regExp) {
          return matchText.replace(regExp, "<b>$&</b>");
        },
        sort: {isoScore: -1}
      });
    }
    var userId = Session.get('UserIdSelected');
    return PRs.find({ clienteId: userId }, { sort: { number: -1 }}).map(function (a, index) {
      a.index = index;
      a.cliente = Meteor.users.findOne(a.clienteId);
      if(!a.cliente.email) 
        a.cliente.email = 'Sin contacto';
      return a;
    });
  },
  clientes: function() {
    return Meteor.users.find().fetch().map(function(it){ return it.profile.name; });
  },
  selected: function(event, suggestion, datasetName) {
    Session.set('UserIdSelected', suggestion.id);
    //console.log(suggestion.id);
  }
});

Template.prList.events({
  'keyup #input-quote-search': _.throttle(function(e) {
    var text = $(e.target).val().trim();
    PRsSearch.search(text);
    Session.set('UserIdSelected', false);
    $('#input-client-search').val('');
  }, 200),
  'click .btn-new': function (e) {
    e.preventDefault();
    Session.set('PRId', false);
    AddNav('/prList');
    Router.go('/prEdit/0');
  },
  'click .btn-edit': function (e) {
    e.preventDefault();
    var id = e.currentTarget.id;
    Session.set('PRId', id);
    AddNav('/prList');
    Router.go('/prEdit/' + id);
  },
  'click .btn-eliminar': function (e) {
    e.preventDefault();
    var id = e.currentTarget.id;
    Session.set('Parametros', { entidad: 'pr', id: id, identificacion: 'n&deg; ' + PRs.findOne(id).numero });
    $('#modal-confirmacion-eliminacion').modal('show');
  }
});
