Template.categoriasEdit.rendered = function() {
  delete Session.keys["CategoriaIdSeleccionada"];
}

Template.categoriasEdit.helpers({
  categorias: function() {
    return Categorias.find().map(function(o, i) {
      o.indice = i + 1;
      if(!o.llave) {
        o.padre = o.padreId ? Categorias.findOne({ _id: o.padreId }) : false;
      }
      return o;
    });
  },
  estiloListContainer: function() {
    var ide = Session.get("IdentificadorEmpresa");
    if(!ide) return "";
    return "background-color:" + RGBA(ide.color, "0.4");
  },
});

Template.categoriasEdit.events({
  "click #btn-agregar-categoria": function() {
    delete Session.keys["CategoriaIdSeleccionada"];
    Session.set("Categoria", {
      empresaId: Session.get("EntornoEmpresa") ? Session.get("EntornoEmpresa")._id : false,
      llave: "CAT_ITEM",
      codigo: "",
      valor: ""
    });
    $("#modal-editar-categoria").modal("show");
  },
  "click .btn-editar-categoria": function(e) {
    var categoria = Categorias.findOne(e.currentTarget.id);
    if(categoria.padreId) {
      categoria.padre = Categorias.findOne(categoria.padreId);
    }
    Session.set("Categoria", categoria);
    $("#modal-editar-categoria").modal("show");
  },
  "click .btn-eliminar-categoria": function(e) {
    Session.set("Parametros", {
      id: e.currentTarget.id,
      entidad: "categoria"
    });
    $('#modal-confirmacion-eliminacion').modal('show');   
  }
})