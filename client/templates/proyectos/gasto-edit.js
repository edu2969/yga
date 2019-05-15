var EDITING_KEY = 'editingList';
Session.setDefault(EDITING_KEY, false);

// Track if this is the first time the list template is rendered
var firstRender = true;
var listRenderHold = LaunchScreen.hold();
listFadeInHold = null;

Template.gastoEdit.rendered = function() {
  $('.datetimepicker-component').datetimepicker({
    format: 'DD/MM/YY'
  })
}

Template.gastoEdit.helpers({
  cotizacionSeleccionada: function() {
    var cId = Session.get('CotizacionId')
    if(!cId) return false
    return Cotizaciones.findOne({ _id: cId })
  },
  itemsCounter: function() {
    var cId = Session.get('CotizacionId')
    if(!cId) return false
    return Items.find({ cotizacionId: cId }).count()
  },
  items: function () {
    var cId = Session.get('CotizacionId')
    if(!cId) return false
    return Items.find({ cotizacionId: cId }).map( function (a, index) {
      a.indice = index + 1
      a.total = a.cantidad * a.valor
      return a
    })
  }
})

Template.gastoEdit.events({
  'click .btn-add-proveedor': function (e) {
    e.preventDefault()
    Session.set('Parametros', false)
    $('#modal-add-proveedor').modal('show')
  }
})