var EDITING_KEY = 'proyectoEdit';
Session.setDefault(EDITING_KEY, false);

// Track if this is the first time the list template is rendered
var firstRender = true;
var listRenderHold = LaunchScreen.hold();
listFadeInHold = null;

Template.proyectoEdit.rendered = function () {
  $('.datetimepicker-component').datetimepicker({
    format: 'DD/MM/YY'
  });
}

Template.proyectoEdit.helpers({
  proyecto: function () {
    var p = Session.get('Proyecto');
    if (!p) return {
      fechaCreacion: new Date()
    };
    return p;
  },
  contadorCotizaciones: function () {
    var pId = Router.current().params._pId;
    if (!pId) return 0;
    return Cotizaciones.find({
      proyectoId: pId
    }).count();
  },
  cotizaciones: function () {
    var pId = Router.current().params._pId;
    if (!pId) return false;
    return Cotizaciones.find({
      proyectoId: pId
    }).map(function (a, i) {
      a.indice = i + 1;
      return a;
    });
  },
  esEditada: function () {
    var p = Session.get("Proyecto");
    return p && p._id;
  },
  empresas: function () {
    return Empresas.find();
  },
  contadorGastos: function () {
    var pId = Router.current().params._pId;
    if (!pId) return false;
    return Gastos.find({
      gastoId: pId
    }).count();
  },
  gastos: function () {
    var pId = Router.current().params._pId;
    if (!pId) return false;
    return Gastos.find({
      proyectoId: pId
    });
  }
});

Template.proyectoEdit.events({
  'click .btn-agregar-cotizacion': function (e) {
    e.preventDefault();
    Session.set('Cotizacion', false);
    AddNav('/proyectoEdit/' + Session.get('Proyecto')._id);
    Router.go('/cotizacionEdit/' + Session.get('Proyecto')._id);
  },
  'click .btn-editar-cotizacion': function (e) {
    e.preventDefault();
    var id = e.currentTarget.id;
    Session.set('Cotizacion', Cotizaciones.findOne(id));
    AddNav('/proyectoEdit/' + Session.get('Proyecto')._id);
    Router.go('/cotizacionEdit/' + Session.get('Proyecto')._id);
  },
  'click .btn-eliminar-cotizacion': function (e) {
    e.preventDefault();
    var id = e.currentTarget.id;
    Session.set('Parametros', {
      entidad: 'cotizacion',
      id: id
    });
    $('#modal-confirmacion-eliminacion').modal('show');
  },
  'click .btn-pdf-cotizacion': function (e) {
    e.preventDefault();
    var id = e.currentTarget.id;
    Router.go('/cotizacionPDF/' + id);
  },
  'click .btn-agregar-gasto': function (e) {
    e.preventDefault();
    Session.set('GastoId', false);
    AddNav('/proyectoEdit/' + Session.get('Proyecto')._id);
    Router.go('/gastoEdit');
  },
  'click .btn-editar-gasto': function (e) {
    e.preventDefault();
    var id = e.currentTarget.id;
    Session.set('GastoId', id);
    AddNav('/proyectoEdit/' + Session.get('Proyecto')._id);
    Router.go('/gastoEdit');
  },
  'click .btn-eliminar-gasto': function (e) {
    e.preventDefault();
    var id = e.currentTarget.id
    Session.set('Parametros', {
      entidad: 'gasto',
      id: id
    })
    $('#modal-confirmacion-eliminacion').modal('show')
  },
  'click #btn-nueva-empresa': function () {
    AddNav('/proyectoEdit/' + Session.get('Proyecto')._id);
    delete Session.keys["Empresa"];
    Router.go('/empresaEdit');
  },
  'focusout .form-control': function (e) {
    var id = e.currentTarget.id;
    var tipo = e.currentTarget.attributes.tipo.value;
    var value = e.currentTarget.value;
    var valor = (
      tipo == 'fecha' ? moment(value, 'DD/MM/YY').toDate() :
      tipo == 'select-id' ? (
        e.currentTarget.selectedIndex ? e.currentTarget.options[e.currentTarget.selectedIndex].id : ""
      ) : value
    );
    var proyecto = Session.get('Proyecto') ? Session.get('Proyecto') : {};
    var atributo = id.split('-')[2];
    var v0 = eval('proyecto.' + atributo);
    var doc = {};
    doc[atributo] = valor;
    if (v0 != valor) {
      if (!proyecto._id) {
        proyecto = {
          estado: 0,
          total: 0,
          fechaCreacion: new Date(),
          usuarioId: Meteor.userId(),
          empresaId: Equipos.findOne().empresaId
        }; // Mejorar para selección de empresa en el combo
        proyecto[atributo] = valor;
        Meteor.call("CrearProyecto", proyecto, function (err, resp) {
          if (!err) {
            Session.set('Proyecto', Proyectos.findOne({
              _id: resp
            }));
          }
        });
      } else {
        Proyectos.update({
          _id: proyecto._id
        }, {
          $set: doc
        });
      }
    }
  }
});