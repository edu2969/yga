var EDITING_KEY = 'cotizacionEdit';
Session.setDefault(EDITING_KEY, false);

// Track if this is the first time the list template is rendered
var firstRender = true;
var listRenderHold = LaunchScreen.hold();
listFadeInHold = null;

Template.cotizacionEdit.rendered = function () {
  $('.datetimepicker-component').datetimepicker({
    format: 'DD/MM/YY'
  });
  var entorno = Session.get("IdentificadorEmpresa");
  var cotizacion = Session.get("Cotizacion");
  if (!cotizacion) {
    var uc = Cotizaciones.findOne({}, {
      sort: {
        numero: -1
      },
      limit: 1
    });
    cotizacion = {
      creadorId: Meteor.userId(),
      fecha: new Date(),
      estado: 1,
      total: 0,
      numero: (uc ? uc.numero : 1235813) + 1,
      moneda: "$",
      vendedorId: Meteor.userId(),
      plazo: "6 meses",
      pago: "Depósito Cta.Cte.",
      empresaId: entorno._id
    }
    Session.set("Cotizacion", cotizacion);
  }
  hayErrores();
}

Template.cotizacionEdit.destroyed = function () {
  delete Session.keys["ObjetivoAntiguo"];
  delete Session.keys["RequerimientoAntiguo"];
  delete Session.keys["NotaAntigua"];
}

Template.cotizacionEdit.helpers({
  cotizacion: function () {
    var c = Session.get('Cotizacion');
    if (!c) return {
      fecha: new Date(),
      moneda: "$"
    };
    return c;
  },
  vendedores: function () {
    return Meteor.users.find({
      "profile.role": 2
    });
  },
  esUnicoVendedor: function () {
    return Meteor.users.find({
      "profile.role": 2
    }).count() == 1;
  },
  items: function () {
    var c = Session.get('Cotizacion');
    var entorno = Session.get("IdentificadorEmpresa");
    if (!c) return false;
    return Items.find({
      cotizacionId: c._id
    }).map(function (a, index) {
      a.indice = index + 1;
      a.total = a.cantidad * a.valor;
      a.titulo = a.descripcion.split("\n")[0];
      return a;
    });
  },
  empresas: function () {
    var e = Session.get("IdentificadorEmpresa");
    if (!e) return [{
      razon: "ERROR!"
    }];
    return Empresas.find().map(function (o) {
      if (o._id.includes(e._id)) {
        o.esPropia = true;
      }
      return o;
    });
  },
  hayErrores: function () {
    return !_.isEmpty(Session.get("ImportMessages"));
  },
  estiloListContainer: function() {
    var ide = Session.get("IdentificadorEmpresa");
    if(!ide) return "";
    return "background-color:" + RGBA(ide.color, "0.4");
  },
  cuentasSimen: function() {
    var e = Empresas.findOne({ identificador: "simen" });
    return [
      { id: "1", banco: e.banco1, cuenta: e.cuenta1 },
      { id: "2", banco: e.banco2, cuenta: e.cuenta2 }
    ];
  },
  empresaTieneReferencia: function() {
    return Session.get("IdentificadorEmpresa").identificador=="simen";
  }
})

Template.cotizacionEdit.events({
  'click .btn-agregar-item': function (e) {
    e.preventDefault();
    Session.set('Item', false);
    AddNav('/cotizacionEdit/' + Session.get('Cotizacion')._id);
    Router.go('/itemCotizacionEdit');
  },
  'click .btn-editar-item': function (e) {
    e.preventDefault();
    var id = e.currentTarget.id;
    Session.set('Item', Items.findOne(id));
    AddNav('/cotizacionEdit/' + Session.get('Cotizacion')._id);
    Router.go('/itemCotizacionEdit');
  },
  'click .btn-eliminar-item': function (e) {
    e.preventDefault();
    var id = e.currentTarget.id;
    Session.set('Parametros', {
      entidad: 'item',
      id: id
    });
    $('#modal-confirmacion-eliminacion').modal('show');
  },
  'click .btn-pdf': function (e) {
    e.preventDefault();
    var cotizacion = Session.get('Cotizacion');
    Meteor.call('ObtenerPDF', 'simen', 'cotizacion', { cotizacionId: cotizacion._id }, function(err, res){
      var dl = document.createElement("a");
      dl.href = "data:application/pdf;base64, " + res;
      dl.download = "cotizacion_" + cotizacion.numero + "_" + Normalizar(Empresas.findOne(cotizacion.empresaId).razon).replace(/ /g, "") + ".pdf";
      document.body.appendChild(dl);
      dl.click();
      document.body.removeChild(dl);
    });
  },
  'focusout .form-control': function (e) {
    e.preventDefault();
    if (hayErrores()) return;
    var id = e.currentTarget.id;
    var tipo = e.currentTarget.attributes.tipo.value;
    var value = e.currentTarget.value;
    var codigo = tipo == 'codigo' ? value.split('-')[0] : false;
    var valor = (tipo == 'fecha' ? moment(value, 'DD/MM/YY').toDate() :
      tipo == 'numero' ? Number(value) :
      tipo == 'select-numero' ? Number(e.currentTarget.options[e.currentTarget.selectedIndex].id) :
      tipo == 'select-id' ? e.currentTarget.options[e.currentTarget.selectedIndex].id :
      value);
    var cotizacion = Session.get('Cotizacion');
    if (!cotizacion) return;

    var atributo = id.split('-')[2];
    if (!cotizacion._id) {
      cotizacion[atributo] = valor;
      Session.set("Cotizacion", cotizacion);
      Meteor.call("ActualizarCotizacion", false, cotizacion, function (err, resp) {
        if (!err) {
          var c = Session.get("Cotizacion");
          c._id = resp;
          Session.set('Cotizacion', c);
        }
      });
      return;
    }

    var doc = {};
    var v0 = eval('cotizacion.' + atributo);
    doc[atributo] = valor;
    if (v0 != valor) {
      Meteor.call("ActualizarCotizacion", cotizacion._id, {
        $set: doc
      });
      cotizacion[atributo] = valor;
      Session.set("Cotizacion", cotizacion);
    }
  },
  'click #checkbox-objetivo': function (e) {
    var c = Session.get("Cotizacion");
    if (!c) c = {
      objetivo: ""
    };
    if ($("#checkbox-objetivo").is(":checked")) {
      $("#textarea-objetivo").show();
      var o = Session.get("ObjetivoAntiguo");
      c.objetivo = o ? o : "";
    } else {
      $("#textarea-objetivo").hide();
      Session.set("ObjetivoAntiguo", $("#input-cotizacion-objetivo").val());
      delete c.objetivo;
    }
    if (!c._id) return;
    if (_.isEmpty(c.objetivo)) {
      Meteor.call("ActualizarCotizacion", c._id, {
        $unset: {
          objetivo: ""
        }
      });
    } else {
      Meteor.call("ActualizarCotizacion", c._id, {
        $set: {
          objetivo: c.objetivo
        }
      });
    }

    Session.set("Cotizacion", c);
  },
  'click #checkbox-requerimientos': function (e) {
    var c = Session.get("Cotizacion");
    if (!c) c = {
      requerimientos: ""
    };
    if ($("#checkbox-requerimientos").is(":checked")) {
      $("#textarea-requerimientos").show();
      var r = Session.get("RequerimientoAntiguo");
      c.requerimientos = r ? r : "";
    } else {
      $("#textarea-requerimientos").hide();
      Session.set("RequerimientoAntiguo", $("#input-cotizacion-requerimientos").val());
      delete c.requerimientos;
    }
    if (_.isEmpty(c.requerimientos)) {
      Meteor.call("ActualizarCotizacion", c._id, {
        $unset: {
          requerimientos: ""
        }
      });
    } else {
      Meteor.call("ActualizarCotizacion", c._id, {
        $set: {
          requerimientos: c.requerimientos
        }
      });
    }
    Session.set("Cotizacion", c);
  },
  'click #checkbox-subtotales': function (e) {
    var c = Session.get("Cotizacion");
    if (!c) c = {
      subtotales: true
    };
    if ($("#checkbox-subtotales").is(":checked")) {
      $("#textarea-subtotales").show();
      c.subtotales = true;
      Session.set("Cotizacion", c);
    } else {
      $("#textarea-subtotales").hide();
      delete c.subtotales;
    }
    if(c.subtotales) {
      Meteor.call("ActualizarCotizacion", c._id, {
        $set: {
          subtotales: true
        }
      });
    } else {
      Meteor.call("ActualizarCotizacion", c._id, {
        $unset: {
          subtotales: ""
        }
      });
    }

    Session.set("Cotizacion", c);
  },
  'click #btn-editar-empresa': function(e) {
    e.preventDefault();
    AddNav('/cotizacionEdit/' + Session.get("Cotizacion")._id);
    Router.go("/empresas");
  }
});

var hayErrores = function () {
  var msgs = {
    warning: []
  };
  var c = Session.get("Cotizacion");
  if (!_.isEmpty(c.moneda) && c.moneda.includes("HH")) {
    if (_.isEmpty($("#input-cotizacion-valorHH").val())) {
      msgs.warning.push({
        item: "Debe incluír el valor HH"
      });
    } else if (isNaN($("#input-cotizacion-valorHH").val())) {
      msgs.warning.push({
        item: "Valor HH debe ser numérico"
      });
    }
  }
  if (_.isEmpty($("#select-cotizacion-clienteId").children(":selected").attr("id"))) {
    msgs.warning.push({
      item: "Señale a que empresa va dirigida"
    });
  }
  if (_.isEmpty($("#input-cotizacion-titulo").val())) {
    msgs.warning.push({
      item: "El titulo es requerido"
    });
  }
  if (!_.isEmpty(msgs.warning)) {
    Session.set("ImportMessages", msgs);
  } else {
    Session.set("ImportMessages", []);
  }
}