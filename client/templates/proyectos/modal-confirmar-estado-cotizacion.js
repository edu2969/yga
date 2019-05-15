Template.modalConfirmarEstadoCotizacion.helpers({
  params: function() {
    return Session.get("CotizacionParams");
  },
  esRechazada: function() {
    var params = Session.get("CotizacionParams");
    return params && !params.soloComentar && params.categoria.codigo==4;
  }
})

Template.modalConfirmarEstadoCotizacion.events({
  'click #btn-confirm': function (e) {
    e.preventDefault();
    var params = Session.get('CotizacionParams');
    if (!params) return;
    
    var doc = {};
    var rechazo = $("#textarea-rechazo").val();
    if(rechazo) {
      doc["rechazo"] = rechazo;
    }
    doc["estado"] = Number(params.categoria.codigo);
    if(doc.estado==3) {
      doc.factura = { estado: 1 }
    }
    
    Meteor.call("ActualizarCotizacion", params.cotizacionId, { $set: doc }, function(err, resp) {
      $('#modal-confirmar-estado-cotizacion').modal('hide');
    });
  },
  'click #btn-cancel': function(e) {
    e.preventDefault();
    var params = Session.get('CotizacionParams');
    if (!params) return;
    $("#select-estado-cotizacion[cotizacion='" + params.cotizacionId + "']")[0]
      .selectedIndex = Number(params.anterior - 1);
    $('#modal-confirmar-estado-cotizacion').modal('hide');
  }
});

