var EDITING_KEY = 'importarAsistencia';
Session.setDefault(EDITING_KEY, false);

// Track if this is the first time the list template is rendered
var firstRender = true;
var listRenderHold = LaunchScreen.hold();
listFadeInHold = null;

Template.importarAsistencia.rendered = function () {
  Session.set('ImportMessages', false);
}

Template.importarAsistencia.helpers({
  period: function () {
    var params = Session.get('AssistanceParams').split('-');
    var month = Number(params[0]);
    var year = Number(params[1]);
    return month + '/' + year;
  },
  messages: function () {
    var messages = Session.get('ImportMessages');
    return messages;
  }
});

Template.importarAsistencia.events({
  'click #btn-import': function () {
    var totalImported = 0;
    var text2Import = $('#text-2-import').val().trim();

    if (text2Import.length == 0) {
      Session.set('ImportMessages', { "messages.danger": [{ item: 'Se requieren datos para importar' }] });
      return;
    }
    
    var entradas = text2Import.split(/\r\n|\n|\r/);
    for (var i = 1; i < entradas.length; i++) {
      var datos = entradas[i].trim().split("\t");
      var bioId = Number(datos[0]);      
      Meteor.call("ProcesarAsistencia", bioId, datos[1], function(err, resp) {
        if(!err) {
          if(resp) {
            var messages = Session.get('ImportMessages');
            if(!messages) messages = {};
            if(!messages.danger) messages.danger = [];
            messages.danger.push(resp);
            Session.set('ImportMessages', messages);
          }            
        }          
      });
    }
    var messages = Session.get('ImportMessages');
    if(!messages) messages = {};
    if(!messages.success) messages.success = [];
    messages.success.push({ item: ( entradas.length - 1 ) + " registros procesador exitósamente" });
    Session.set('ImportMessages', messages);
    setTimeout(function() {
      Session.set("ImportMessages", false);
    }, 5000);
    $('#text-2-import').val('');
  },
  "click h3.glyphicon-question-sign"() {
    $(".tooltip-ayuda").toggleClass("activo");
  }
});