Template.modalConfirmarEstadoFactura.helpers({
  params: function() {
    return Session.get("CotizacionParams");
  },
  facturada: function() {
    var params = Session.get("CotizacionParams");
    return params && params.categoria && params.categoria.codigo==2;
  },
  pagos: function() {
    var params = Session.get("CotizacionParams");
    return params && params.categoria && params.categoria.codigo>=3;
  }
})

Template.modalConfirmarEstadoFactura.events({
  'click #btn-confirm': function (e) {
    e.preventDefault();
    var params = Session.get('CotizacionParams');
    if (!params) return;
    
    var doc = { };
    if(!params.soloComentar) {
       doc["factura.estado"] = params.categoria.codigo;
    }
    var pagos = $("#textarea-pagos").val();
    if(pagos) {
      doc["factura.pagos"] = pagos;
    }
    var nsii = $("#input-nsii").val();
    if(nsii) {
      doc["factura.nsii"] = nsii;
    }
    
    Meteor.call("ActualizarCotizacion", params.cotizacionId, { $set: doc }, function(err, resp) {
      $('#modal-confirmar-estado-factura').modal('hide');
    });
  },
  'click #btn-cancel': function(e) {
    e.preventDefault();
    var params = Session.get('CotizacionParams');
    if (!params) return;
    $("#select-estado-factura[cotizacion='" + params.cotizacionId + "']")[0]
      .selectedIndex = Number(params.anterior - 1);
    $('#modal-confirmar-estado-factura').modal('hide');
  }
});

