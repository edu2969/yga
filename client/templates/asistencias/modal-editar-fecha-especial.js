Template.modalEditarFechaEspecial.rendered = function() {
  var initial = moment().toDate();
  $('.datetimepicker-component').datetimepicker({
    format: 'DD/MM',
    defaultDate: initial
  });
}

Template.modalEditarFechaEspecial.helpers({
  isEditing: function () {
    return !Session.get('FechaSeleccionada');    
  }
});

Template.modalEditarFechaEspecial.events({
  'click #btn-confirm': function (e) {
    var id = Session.get("FechaSeleccionada");
    var fecha = $("#input-fecha").val();
    if(!id) {
      FechasEspeciales.insert({
        fecha: moment(fecha + '/' + Session.get("PeriodoJornada"), "DD/MM/YYYY").toDate(),
        tipo: $("#select-tipo-jornada").children(":selected").attr("id")
      });
    } else {
      FechasEspeciales.update({ 
        _id: id 
      }, {
        $set: {
          fecha: moment(fecha + '/' + Session.get("PeriodoJornada"), "DD/MM/YYYY").toDate(),
          tipo: $("#select-tipo-jornada").children(":selected").attr("id")
        }
      });
    }
    $("#modal-editar-fecha-especial").modal("hide");
  }
});
