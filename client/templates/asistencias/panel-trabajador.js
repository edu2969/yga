var EDITING_KEY = "panelTrabajador";
Session.setDefault(EDITING_KEY, false);

// Track if this is the first time the list template is rendered
var firstRender = true;
var listRenderHold = LaunchScreen.hold();
listFadeInHold = null;

Template.panelTrabajador.rendered = function () {
  Session.set('NavigationPath', false);
  var initial = moment().subtract(1, 'months').toDate();
  $('.datetimepicker-component').datetimepicker({
    viewMode: 'months',
    format: 'MMMM\'YYYY',
    defaultDate: initial
  });
}

Template.panelTrabajador.helpers({
  months: function () {
    monthsArray = [];
    for(var i=0; i<12; i++) {
      var m = new Object();
      m.number = i;
      m.name = MonthNames[i];
      monthsArray.push(m);
    }
    return monthsArray;
  },
  isColaborator: function () {
    return Meteor.user().profile.role==6;
  },
  trabajadores: function() {
    return Meteor.users.find({ 
      "profile.role": 6, 
      "profile.prioridad": { $exists: true }
    }, { sort: { "profile.prioridad": 1 }}).map(function(o) {
      a = { 
        id: o.profile.bioId, 
        nombre: o.profile.name
      }
      return a;
    });
  }
});

Template.panelTrabajador.events({
  'click .btn-view': function (e) {
    var periodo = moment($("#input-periodo").val(), "MMMM\'YYYY").format("MM/YY");
    var bioId = $("#select-trabajador").find(":selected")[0].id;
    Session.set('BiometryId', Number(bioId));
    Session.set('AssistanceParams', periodo);
    AddNav('panelTrabajador');
    Router.go('/asistenciaDetalle');
  }/*,
  'click .btn-print': function (e) {
    e.preventDefault(e);
    var periodo = moment($("#input-periodo").val(), "MMMM\'YYYY").format("MM/YY");
    var bioId = $("#select-trabajador").find(":selected")[0].id;
    Meteor.call('ObtenerPDF', 'simen', 'asistencia', { "periodo": periodo, "bioId": Number(bioId) }, function(err, res){
      var dl = document.createElement("a");
      dl.href = "data:application/pdf;base64, " + res;
      dl.download = "asistencia_" + periodo + "_" + Normalizar(Meteor.users.findOne({ "profile.bioId": Number(bioId) }).profile.name.toLowerCase().replace(/ /g, "_"));
      document.body.appendChild(dl);
      dl.click();
      document.body.removeChild(dl);
    });
  }*/
});
