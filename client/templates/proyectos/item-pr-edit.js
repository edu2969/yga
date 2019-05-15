var EDITING_KEY = 'itemPREdit';
Session.setDefault(EDITING_KEY, false);

// Track if this is the first time the list template is rendered
var firstRender = true;
var listRenderHold = LaunchScreen.hold();
listFadeInHold = null;

Template.itemPREdit.rendered = function () {
  Session.set('ItemTypeSelected', 'Productos');
  Meteor.typeahead('#input-item-nombre');
}

Template.itemPREdit.helpers({
  codigos: function () {
    return Items.find({ prId: { $exists: true } }).fetch().map( function(it){ 
      return it.codigo + '-' + it.nombre 
    })
  },
  categoriesCounter: function () {
    return ConfigHierarchy.find({
      key: 'Item Cotización'
    }).count();
  },
  categories: function () {
    return ConfigHierarchy.find({
      key: 'Item Cotización'
    });
  },
  subcategoriesCounter: function () {
    var type = Session.get('ItemTypeSelected');
    return ConfigHierarchy.find({
      key: type
    }).count();
  },
  subcategories: function () {
    var type = Session.get('ItemTypeSelected');
    return ConfigHierarchy.find({
      key: type
    });
  },
  itemSeleccionado: function () {
    var itemId = Session.get('ItemId');
    if (!itemId) return false;
    return Items.findOne(itemId);
  }
});

Template.itemPREdit.events({
  'change #select-item-tipo': function () {
    var selectHTML = document.getElementById('select-item-tipo');
    var type = selectHTML.options[selectHTML.selectedIndex].id;
    Session.set('ItemTypeSelected', type);
  },
  'keyup #input-item-nombre': _.throttle(function (e) {
    var text = $(e.target).val().trim();
    CodeSearch.search(text);
  }, 200),
  'focusout .form-control': function (e) {
    e.preventDefault();
    var id = e.currentTarget.id;
    var tipo = e.currentTarget.attributes.tipo.value;
    var value = e.currentTarget.value;
    //console.log(id + '|' + tipo + '|' + value);
    var codigo = tipo == 'codigo' ? value.split('-')[0] : false;
    var valor = (tipo == 'codigo' || tipo == 'texto-codificado' ? value.split('-')[1] :
      tipo == 'moneda' ? value.split('(')[1].substring(0, value.split('(')[1].length - 1) :
      tipo == 'numero' ? Number(value) : value);
    var itemId = Session.get('ItemId');
    if (!itemId) {
      var prId = Session.get('PRId');
      if (!prId) {
        itemId = Items.insert({
          cantidad: 0,
          tipo: 'Productos',
          moneda: '$',
          valor: 0,
          nombre: '',
          prId: prId
        });
        Session.set('ItemId', itemId);
      }
    }
    var item = Items.findOne({
      _id: itemId
    });
    var atributo = id.split('-')[2];
    console.log('item.' + atributo + '<' + tipo + '>');
    var v0 = eval('item.' + atributo);
    var doc = {};
    if (codigo) {
      if (atributo == 'subtipo') {
        doc.subtipo = valor;
      } else if (atributo == 'nombre') {
        doc.codigo = codigo;
        doc.nombre = valor;
      }
    } else {
      if (atributo == 'moneda') {
        doc.moneda = valor
      } else if (atributo == 'cantidad' || atributo == 'valor') {
        doc[atributo] = Number(value);
      } else {
        doc[atributo] = value;
      }
    }
    if (v0 == valor) {
      //console.log('Sin cambios');
    } else {
      //console.log('Cambio desde / ' + v0 + ' ->' + JSON.stringify(doc));
      Items.update({
        _id: itemId
      }, {
        $set: doc
      });
      // Actualizar vistas BI
      if (atributo == 'cantidad' || atributo == 'valor') {
        Meteor.call('procesarItem', itemId);
      }
    }
  }
});