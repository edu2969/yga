var EDITING_KEY = 'facturas';
Session.setDefault(EDITING_KEY, false);

// Track if this is the first time the list template is rendered
var firstRender = true;
var listRenderHold = LaunchScreen.hold();
listFadeInHold = null;

Template.facturas.rendered = function () {
  Session.set('EmpresaIdSeleccionada', false);
  Session.set('FacturaIdSeleccionada', false);
  Session.set('EstadoSeleccionado', false);

  Session.set('EmpresaResumenIdSeleccionada', false);
  Session.set('PeriodoSeleccionado', moment().startOf("month").format("MM/YY"));

  delete Session.keys["CotizacionParams"];
  Meteor.typeahead.inject();

  $('.datetimepicker-component').datetimepicker({
    viewMode: 'months',
    format: 'MMMM \'YY',
    defaultDate: new Date()
  });
}

Template.facturas.destroyed = function () {
  delete Session.keys["EmpresaIdSeleccionada"];
}

Template.facturas.helpers({
  facturas: function () {
    var eId = Session.get('EmpresaIdSeleccionada');
    var fId = Session.get("FacturaIdSeleccionada");
    var eSel = Session.get("EstadoSeleccionado");
    return Cotizaciones.find(
        eId ? {
          empresaId: eId
        } :
        fId ? {
          _id: fId
        } :
        eSel ? {
          "factura.estado": eSel
        } : {}, {
          sort: {
            number: -1
          }
        })
      .map(function (a, index) {
        a.index = index;
        a.empresa = Empresas.findOne({
          _id: a.empresaId
        });
        a.enHH = !_.isEmpty(a.moneda) && a.moneda.includes("HH");
        if (a.enHH) {
          a.totalCPL = a.valorHH * a.total;
        };
        a.estaFacturada = a.factura && a.factura.nsii;      
        a.pagos = a.factura && a.factura.pagos;

        a.recibeComentarios = a.factura && a.factura.estado >= 3;
        return a;
      });
  },
  facturasSugeridas: function () {
    var eId = Session.get('EmpresaIdSeleccionada');
    return Cotizaciones.find({}, {
      sort: {
        number: -1
      }
    }).map(function (a, index) {
      return {
        id: a._id,
        value: a.numero
      };
    });
  },
  facturaSeleccionada: function (event, suggestion, datasetName) {
    Session.set('FacturaIdSeleccionada', suggestion.id);
  },
  resumen: function () {
    var eId = Session.get("EmpresaResumenIdSeleccionada");
    /*var fDesde = Session.get("FechaDesdeSeleccionada");
    var fHasta = Session.get("FechaHastaSeleccionada");*/
    var fSel = Session.get("PeriodoSeleccionado");
    var doc = {};
    if (eId) doc.empresaId = eId;
    /*if(fDesde && !fHasta) doc.fecha = { $gte: fDesde };
    if(fHasta && !fDesde) doc.fecha = { $lte: fHasta };
    if(fDesde && fHasta) doc.fecha = { $gte: fDesde, $lte: fHasta };*/
    if (fSel) doc.fecha = {
      $gte: moment(fSel, 'MM/YY').startOf("month").toDate(),
      $lt: moment(fSel, 'MM/YY').endOf("month").toDate()
    };
    var cotizaciones = Cotizaciones.find(doc);
    if (cotizaciones.count() == 0) return false;
    return {
      facturas: cotizaciones.map(function (o) {
        o.empresa = Empresas.findOne({
          _id: o.empresaId
        }).razon;
        o.iva = o.total * 0.19;
        o.neto = o.total * 1.19;
        return o;
      }),
      iva: cotizaciones.map(function (o) {
        return o.total * 0.19;
      }).reduce(function (acum, c) {
        return acum + c;
      }),
      neto: cotizaciones.map(function (o) {
        return o.total * 1.19;
      }).reduce(function (acum, c) {
        return acum + c;
      }),
      total: cotizaciones.map(function (o) {
        return o.total;
      }).reduce(function (acum, c) {
        return acum + c;
      }),
    }
  },
  empresasSugeridas: function () {
    return Empresas.find().fetch().map(function (it) {
      return {
        id: it._id,
        value: it.razon
      };
    });
  },
  empresaSeleccionada: function (event, suggestion, datasetName) {
    Session.set('EmpresaIdSeleccionada', suggestion.id);
  },
  empresaResumenSeleccionada: function (event, suggestion, datasetName) {
    Session.set('EmpresaResumenIdSeleccionada', suggestion.id);
  },
  estados: function () {
    return Categorias.find({
      llave: "EST_FAC"
    }).map(function (a) {
      a.cantidad = Cotizaciones.find({
        "factura.estado": a.codigo
      }).count();
      return a;
    });
  },
  estiloListContainer: function() {
    var ide = Session.get("IdentificadorEmpresa");
    if(!ide) return "";
    return "background-color:" + RGBA(ide.color, "0.4");
  },
});

Template.facturas.events({
  "focusout #input-empresas-search": function (e) {
    if (e.currentTarget.value == "") Session.set("EmpresaIdSeleccionada", false);
  },
  "focusout #input-empresas-search-2": function (e) {
    if (e.currentTarget.value == "") Session.set("EmpresaResumenIdSeleccionada", false);
  },
  "focusout #input-facturas-search": function (e) {
    if (e.currentTarget.value == "") Session.set("FacturaIdSeleccionada", false);
  },
  "change #select-estado-search": function (e) {
    var select = e.currentTarget;
    var valor = select.options[select.selectedIndex].id;
    Session.set("EstadoSeleccionado", Number(valor));
  },
  "dp.change #datepicker-periodo": function () {
    Session.set("PeriodoSeleccionado", moment($("#input-periodo").val(), "MMMM'\YY").format("MM/YY"));
  },
  'change #select-estado-factura': function (e) {
    var select = e.currentTarget;
    var id = select.attributes["cotizacion"].value;
    var codigo = Number(select.options[select.selectedIndex].id);
    var categoria = Categorias.findOne({
      llave: "EST_FAC",
      codigo: codigo
    });
    var cotizacion = Cotizaciones.findOne({
      _id: id
    });
    Session.set("CotizacionParams", {
      cotizacionId: id,
      categoria: categoria,
      anterior: cotizacion.factura ? cotizacion.factura.estado : 1,
      pagos: cotizacion.factura ? cotizacion.factura.pagos : false,
      nsii: cotizacion.factura ? cotizacion.factura.nsii : false
    });
    $("#modal-confirmar-estado-factura").modal("show");
    return false;
  },
  "click .btn-libro-menor": function (e) {
    e.preventDefault();
    Meteor.call('ObtenerPDF', 'simen', 'libromenor', {
      periodo: Session.get("PeriodoSeleccionado")
    }, function (err, res) {
      var dl = document.createElement("a");
      dl.href = "data:application/pdf;base64, " + res;
      dl.download = "libromenor_" + moment(Session.get("PeriodoSeleccionado"), "MM/YY").format("MM_YYYY") + ".pdf";
      document.body.appendChild(dl);
      dl.click();
      document.body.removeChild(dl);
    });
  },
  "click .btn-comentar-pagos": function (e) {
    var id = e.currentTarget.attributes["cotizacion"].value;
    var cotizacion = Cotizaciones.findOne({
      _id: id
    });
    Session.set("CotizacionParams", {
      cotizacionId: id,
      soloComentar: true,
      anterior: cotizacion.factura ? cotizacion.factura.estado : 1,
      pagos: cotizacion.factura && cotizacion.factura.pagos ? cotizacion.factura.pagos : (moment().format("DD/MMM/YY") + ": "),
      nsii: cotizacion.factura ? cotizacion.factura.nsii : false
    });
    $("#modal-confirmar-estado-factura").modal("show");
  }
});