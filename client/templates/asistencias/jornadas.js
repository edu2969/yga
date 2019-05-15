var EDITING_KEY = 'jornadas';
Session.setDefault(EDITING_KEY, false);

// Track if this is the first time the list template is rendered
var firstRender = true;
var listRenderHold = LaunchScreen.hold();
listFadeInHold = null;

Template.jornadas.rendered = function() {
  var initial = moment();

  $('.datetimepicker-component-year').datetimepicker({
    viewMode: 'years',
    format: 'YYYY',
    defaultDate: initial.toDate()
  });

  Session.set("PeriodoJornada", initial.year());
  Session.set('FechaSeleccionada', false);
}

Template.jornadas.events({
  'click .btn-agregar-jornada': function() {
    Session.set("FechaSeleccionada", false);
    $("#modal-editar-fecha-especial").modal('show');
  },
  'click .btn-eliminar-jornada': function (e) {
    e.preventDefault();    
    Session.set('Parametros', {
      entidad: "fechaespecial",
      id: e.currentTarget.id
    });
    $("#modal-confirmacion-eliminacion").modal('show');
  },
  'click .btn-editar-jornada': function(e) {
    e.preventDefault();
    Session.set("FechaSeleccionada", e.currentTarget.id);
    $("#modal-editar-fecha-especial").modal('show');
  },
  'focusout #input-periodo': function() {
    Session.set("PeriodoJornada", $("#input-periodo").val());
  }
})

Template.jornadas.helpers({
  definiciones: function () {
    var periodo = Session.get("PeriodoJornada");
    if(!periodo) return false;
    return FechasEspeciales.find({
      $and: [{ 
        fecha: { 
          $gte: moment().year(periodo).startOf("year").toDate(), 
          $lte: moment().year(periodo).endOf("year").toDate() 
        } 
      }]
    }, { sort: { fecha: 1 }}).map( function (a, index) {
      a.index = index
      a.glosa = a.tipo == 1 ? 'Feriado Legal' : a.tipo == 2 ? 'Compensado Vacaciones' : 'Medio Día'
      return a
    })
  }
});

Template.jornadas.destroyed = function() {
  delete Session.keys["PeriodoJornada"];
}
