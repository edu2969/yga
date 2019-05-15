Template.modalConfirmacionEliminacion.helpers({
  parametros: function () {
    var params = Session.get('Parametros');
    if(!params) return false;
    return params;
  }
});

Template.modalConfirmacionEliminacion.events({
  'click #btn-confirm': function (e) {
    e.preventDefault();
    var params = Session.get('Parametros');
    if (!params) return;
    $('#modal-confirmacion-eliminacion').modal('hide');
    var ruta = false;
    switch(params.entidad) {
      case "integrante": Equipos.remove(params.id); ruta = '/empresaEdit/' + params.empresaId; break;
      case "empresa": Meteor.call("EliminarEmpresa", params.id); break;
      case "categoria": Categorias.remove(params.id); ruta='/categoriasEdit'; break;
      case "item": Items.remove(params.id); break;
      case "proyecto": Proyectos.remove(params.id); break;
      case "fechaespecial": FechasEspeciales.remove(params.id); break;
      case "cotizacion": Items.find({ cotizacionId: params.id }).forEach(function(o) { Items.remove(o._id); }); Cotizaciones.remove(params.id); break;
      case "usuario": Meteor.call("EliminarUsuario", params.id); break;
    }
    
    delete Session.keys["Parametros"];
    if(ruta) Router.go(ruta);
  }
});