Template.modalAddProveedor.helpers({
  proveedor: function () {
    var p = Session.get('Paramstros')
    return p ? p.proveedor : false
  },
  ciudades: function () {
    var region = Session.get('RegionSeleccionada')
    if (region) {
      var regs = eval("ciudades_" + region)
      for(var i=0; i<regs.length; i++) {
        regs[i] = { indice: i, nombre: regs[i] }
      }
      return regs
    }
    return [{ indice: 0, nombre: "Seleccione Comuna"}]
  }
})

Template.modalAddProveedor.events({
  'click #btn-confirm': function (e) {
    e.preventDefault();
    var params = Session.get('Parametros')
    if (!params) return
    
    if(params.entidad=='cotizacion') {
      Cotizaciones.remove(params.id)
    } else {
      Gastos.remove(params.id)
    }
    $('#modal-add-proveedor').modal('hide');
  },
  'click #btn-cancel': function (e) {
    e.preventDefault();
    $('#modal-add-proveedor').modal('hide');
  },
  'change #select-region': function () {
    var indice = $('#select-region').children(":selected").attr("value")
    //console.log('indice: ' + indice)
    Session.set('RegionSeleccionada', indice)
  }
});

