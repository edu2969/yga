var EDITING_KEY = 'itemCotizacionEdit';
Session.setDefault(EDITING_KEY, false);

// Track if this is the first time the list template is rendered
var firstRender = true;
var listRenderHold = LaunchScreen.hold();
listFadeInHold = null;


Template.itemCotizacionEdit.rendered = function () {
  var i = Session.get("Item");
  var entorno = Session.get("EntornoEmpresa") ? Session.get("EntornoEmpresa") : { identificador: "ERROR" };
  if (!i) {
    var cat = Categorias.findOne({ llave: "CAT_ITEM" });
    if(!cat) return;
    var subcatogoriaId = Categorias.findOne({ padreId: cat._id })._id;
    i = {
      categoriaId: cat._id,
      valor: 0,
      cantidad: 0,
      cotizacionId: Session.get("Cotizacion")._id,
      moneda: entorno.identificador.includes("cheetah") ? "HH" : "$"
    }
    if(subcatogoriaId) {
      i.subcategoriaId = subcatogoriaId;
    }
    Session.set("Item", i);    
  }
  Session.set("CategoriaIdSeleccionada", i.categoriaId);
  
  Meteor.typeahead('#input-item-descripcion');
}

Template.itemCotizacionEdit.ondestroyed = function() {
  delete Session.keys["CategoriaIdSeleccionada"];
  delete Session.keys["Item"];
  delete Session.keys["Parametros"];
}

Template.itemCotizacionEdit.helpers({
  categorias: function () {
    return Categorias.find({
      llave: 'CAT_ITEM'
    });
  },
  subcategorias: function () {
    var c = Session.get('CategoriaIdSeleccionada');
    return c ? Categorias.find({
      padreId: c
    }) : false;
  },
  item: function () {
    return Session.get('Item');
  },
  descripcionesItem: function () {
    return Items.find().map(function(o) {
      return o.descripcion;
    });
  },
  tieneDescripcionLarga: function() {
    return Session.get("EntornoEmpresa") && Session.get("EntornoEmpresa").identificador ? Session.get("EntornoEmpresa").identificador.includes("simen") || Session.get("EntornoEmpresa").identificador.includes("yga") : false;
  },
  empresaUsaHH: function() {
    return Session.get("EntornoEmpresa") && Session.get("EntornoEmpresa").identificador ? Session.get("EntornoEmpresa").identificador.includes("cheetah"): false;
  },
  sinmoneda: function() {
    return Session.get("EntornoEmpresa") && Session.get("EntornoEmpresa").identificador ? Session.get("EntornoEmpresa").identificador.includes("simen"): false;
  },
  total: function() {
    var item = Session.get("Item");
    return item.cantidad * item.valor;
  }
});

Template.itemCotizacionEdit.events({
  'change #select-item-categoriaId': function (e) {
    Session.set('CategoriaIdSeleccionada', e.currentTarget.options[e.currentTarget.selectedIndex].id);
  },
  'click #btn-edit-categorias, click #btn-edit-subcategorias': function (e) {
    var id = e.currentTarget.id;
    AddNav("itemCotizacionEdit");
    Router.go("/categoriasEdit");
  },
  'focusout .form-control': function (e) {
    e.preventDefault();
    var id = e.currentTarget.id;
    var tipo = e.currentTarget.attributes.tipo.value;
    var value = e.currentTarget.value;
    var cot = Session.get("Cotizacion");
    //console.log(id + '|' + tipo + '|' + value);
    var codigo = tipo == 'codigo' ? value.split('-')[0] : false;
    var valor = (
      tipo == 'codigo' || tipo == 'texto-codificado' ? value.split('-')[1] :
      tipo == 'precio' ? Number(value.replace(/\$/g, "").replace(/\./g, "").trim()) :
      tipo == 'numero' ? Number(value) :
      tipo == "select-id" ? ( e.currentTarget.selectedIndex==-1 ? false : e.currentTarget.options[e.currentTarget.selectedIndex].id ) :
      value 
    );
    var atributo = id.split('-')[2];
    var item = Session.get("Item");
    if (!item) return;
    if (!item._id && atributo!=undefined) {
      item[atributo] = valor;
      if(cot) item["cotizacionId"] = cot._id; 
      
      Meteor.call("ActualizarItem", false, item, function (err, resp) {
        if (!err) {
          var i = Session.get("Item");
          console.log("Actualizando Item", resp);
          i._id = resp;
          Session.set("Item", i);
        }
      });
      return;
    }
    if (!item._id) return;
    //console.log('item.' + atributo + '<' + tipo +'>');
    var v0 = eval('item.' + atributo);
    if(atributo=="valor") {
      v0 = item.aux;
    }
    var doc = {};
    doc[atributo] = valor;
    if (v0!=valor && atributo!=undefined) {
      Meteor.call("ActualizarItem", {
        _id: item._id
      }, {
        $set: doc
      }, function (err, resp) {
        aux = valor;
      });
      item[atributo] = valor;
      Session.set("Item", item);
    }
  },
  "change #select-item-moneda": function(e) {
    var id = e.currentTarget.options[e.currentTarget.selectedIndex].id;
    if(!_.isEmpty(id) && id.includes("HH")) {
      $("#div-item-valor").hide();
    } else {
      $("#div-item-valor").show();
    }
  },
  "keyup #input-item-valor": function() {
    var value = $("#input-item-valor").val().replace(/\$/g, "").replace(/\./g, "").trim();
    var item = Session.get("Item");
    if(!item.aux) {
      aux = item.valor;
    }
    item.valor = Number(value);
    Session.set("Item", item);
  }
});
