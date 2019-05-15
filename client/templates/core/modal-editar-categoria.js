Template.modalEditarCategoria.rendered = function() {
}

Template.modalEditarCategoria.helpers({
  categoria: function() {
    return Session.get("Categoria");
  },
  subcategorias: function() {
    return !Session.get("Categoria") || !Session.get("Categoria").llave ? Categorias.find({ llave: { $exists: true }}) : false;
  }
});

Template.modalEditarCategoria.events({
  "change #select-llave": function() {
    var c = Session.get("Categoria");
    c.llave = $("#select-llave").find(":selected").attr("id");
    Session.set("Categoria", c);
  },
  "click #btn-aceptar": function() {
    var c = Session.get("Categoria");
    var llave = $("#select-llave").find(":selected").attr("id");
    var padreId = $("#select-padreId").find(":selected").attr("id");
    var codigo = $("#categoria-codigo").val();
    var valor = $("#categoria-valor").val();
    //var empresaId = $("#select-empresaId").find(":selected").attr("id");
    if(!c || !c._id) {
      var doc = {};
      if(!_.isEmpty(padreId)) doc.padreId = padreId;
      if(!_.isEmpty(llave)) doc.llave = llave;
      doc.codigo = codigo;
      doc.valor = valor;
      doc.empresaId = c.empresaId;
      Meteor.call("AgregarCategoria", doc, function(err, resp) {
        c._id = resp;
        Session.set("Categoria", c);
      });
    } else {
      Categorias.update(c._id, {
        $set: {
          codigo: codigo,
          valor: valor,
          padreId: padreId
        }
      });
    }
    $("#modal-editar-categoria").modal("hide");
    delete Session.keys["Categoria"];
  }
});