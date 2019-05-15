var EDITING_KEY = 'cotizaciones';
Session.setDefault(EDITING_KEY, false);

// Track if this is the first time the list template is rendered
var firstRender = true;
var listRenderHold = LaunchScreen.hold();
listFadeInHold = null;

Template.cotizaciones.rendered = function () {
  Session.set('ClienteIdSeleccionado', false);
  Session.set('CotizacionIdSeleccionada', false);
  Session.set('EstadoSeleccionado', false);
  Session.set("FechaSeleccionada", false);
  delete Session.keys["CotizacionParams"];
  Meteor.typeahead.inject();
  
  $('.datetimepicker-component').datetimepicker({
    format: 'DD/MM/YY'
  });
}

Template.cotizaciones.destroyed = function() {
  delete Session.keys["ClienteIdSeleccionado"];
  delete Session.keys["CotizacionIdSeleccionada"];
}


Template.cotizaciones.helpers({
  cotizaciones: function () {
    var cId = Session.get('ClienteIdSeleccionado');
    var cId = Session.get("CotizacionIdSeleccionada");
    var eSel = Session.get("EstadoSeleccionado");
    var fSel = Session.get("FechaSeleccionada");
    var doc = { empresaId: Session.get("IdentificadorEmpresa")._id };
    if(cId) {
      doc["clienteId"] = cId;
    };
    if(cId) {
      doc["_id"] = cId;
    }
    if(eSel) {
      doc["estado"] = eSel;
    }
    if(fSel) {
      fecha["fecha"] = { 
        $gte: moment(fSel, "DD/MM/YY").startOf("day").toDate(), 
        $lt: moment(fSel, "DD/MM/YY").endOf("day").toDate() 
      };
    } 
    return Cotizaciones.find(doc, { sort: { numero: -1 }}).map(function (a, index) {
      a.index = index;
      a.cliente = Empresas.findOne({ _id: a.clienteId });
      a.estarechazada = ( a.estado==4 && a.rechazo );
      if(a.estado==3 && a.factura) {
        a.pagos = Categorias.findOne({ llave: "EST_FAC", codigo: a.factura.estado }).glosa;
      }
      return a;
    });
  },
  empresasSugeridas: function() {
    return Empresas.find().fetch().map(function (a, index) {
      return { id: a._id, value: a.razon };
    });
  },
  empresaSeleccionada: function(event, suggestion, datasetName) {
    Session.set('ClienteIdSeleccionado', suggestion.id);
  },
  titulosSugeridos: function() {
    return Cotizaciones.find().map(function(a) {
      return { id: a._id, value: a.titulo };
    });
  },
  numerosSugeridos: function() {
    return Cotizaciones.find().map(function(a) {
      return { id: a._id, value: a.numero };
    });
  },
  cotizacionSeleccionada: function(event, suggestion, datasetName) {
    Session.set("CotizacionIdSeleccionada", suggestion.id);
  },
  estiloListContainer: function() {
    var ide = Session.get("IdentificadorEmpresa");
    if(!ide) return "";
    return "background-color:" + RGBA(ide.color, "0.4");
  },
  estados: function() {
    return Categorias.find({ llave: "EST_COT" }).map(function(a) {
      a.cantidad = Cotizaciones.find({ estado: a.codigo }).count();
      return a;
    });
  }
});

Template.cotizaciones.events({
  'click .btn-new': function (e) {
    e.preventDefault();
    Session.set('Cotizacion', false);
    AddNav('/cotizaciones');
    Router.go('/cotizacionEdit/0');
  },
  'click .btn-edit': function (e) {
    e.preventDefault();
    var id = e.currentTarget.id;
    Session.set('Cotizacion', Cotizaciones.findOne(id));
    AddNav('/cotizaciones');
    Router.go('/cotizacionEdit/' + id);
  },
  'click .btn-eliminar': function (e) {
    e.preventDefault();
    Session.set('Parametros', {
      entidad: "cotizacion", 
      id: e.currentTarget.id
    });
    $('#modal-confirmacion-eliminacion').modal('show');
  },
  'change #select-estado-cotizacion': function(e) {
    var select = e.currentTarget;
    var id = select.attributes["cotizacion"].value;
    var codigo = Number(select.options[select.selectedIndex].id);
    var categoria = Categorias.findOne({ llave: "EST_COT", codigo: codigo });
    Session.set("CotizacionParams", { 
      cotizacionId: id, 
      categoria: categoria, 
      anterior: Cotizaciones.findOne({ _id: id }).estado,
      rechazo: Cotizaciones.findOne({ _id: id }).rechazo
    });
    $("#modal-confirmar-estado-cotizacion").modal("show");
    return false;
  },
  "focusout #input-empresas-search": function(e) {
    if(e.currentTarget.value=="") Session.set("ClienteIdSeleccionado", false);
  },
  "focusout #input-titulos-search": function(e) {
    if(e.currentTarget.value=="") Session.set("CotizacionIdSeleccionada", false);
  },
  "change #select-estado-search": function(e) {
    var select = e.currentTarget;
    var valor = select.options[select.selectedIndex].id;
    Session.set("EstadoSeleccionado", Number(valor));
  },
  "dp.change #input-fecha-search": function() {
    Session.set("FechaSeleccionada", $("#input-fecha-search").val());
  },
  'click .btn-imprimir': function (e) {
    e.preventDefault();
    var id = e.currentTarget.id;
    var cotizacion = Cotizaciones.findOne({ _id: id });
    Meteor.call('ObtenerPDF', 'simen', 'cotizacion', { cotizacionId: id }, function(err, res){
      var dl = document.createElement("a");
      dl.href = "data:application/pdf;base64, " + res;
      dl.download = "cotizacion_" + cotizacion.numero + "_" + Normalizar(Empresas.findOne(cotizacion.empresaId).razon).replace(/ /g, "") + ".pdf";
      document.body.appendChild(dl);
      dl.click();
      document.body.removeChild(dl);
    });
  },
});
