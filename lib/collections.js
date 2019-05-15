Asistencias = new Meteor.Collection('asistencias');
Asistencias.allow({
  insert: function() {
    return false;
  },
  update: function() {
    return false;
  },
  remove: function() {
    return false;
  }
});

BIAsistencias = new Meteor.Collection('biasistencias');
BIAsistencias.allow({
  insert: function() {
    return false;
  },
  update: function() {
    return false;
  },
  remove: function() {
    return false;
  }
});

Convenios = new Meteor.Collection('convenios');
Convenios.allow({
  insert: function() {
    return false;
  },
  update: function() {
    return false;
  },
  remove: function() {
    return false;
  }
});

// Feriados
FechasEspeciales = new Meteor.Collection('fechasespeciales');
FechasEspeciales.allow({
  insert: function () {
    return false;
  },
  update: function () {
    return false;
  },
  remove: function () {
    return false;
  }
});

Empresas = new Meteor.Collection('empresas');
Empresas.allow({
  insert: function() {
    return false;
  },
  update: function() {
    return false;
  },
  remove: function() {
    return false;
  }
});

Equipos = new Meteor.Collection('equipos');
Equipos.allow({
  insert: function() {
    return false;
  },
  update: function() {
    return false;
  },
  remove: function() {
    return false;
  }
});

Pacientes = new Meteor.Collection('pacientes');
Pacientes.allow({
  insert: function() {
    return false;
  },
  update: function() {
    return false;
  },
  remove: function() {
    return false;
  }
});

Categorias = new Meteor.Collection('categorias');
Categorias.allow({
  insert: function() {
    return false;
  },
  update: function() {
    return false;
  },
  remove: function() {
    return false;
  }
});

Proyectos = new Meteor.Collection('proyectos');
Proyectos.allow({
  insert: function() {
    return false;
  },
  update: function() {
    return false;
  },
  remove: function() {
    return false;
  }
});

Cotizaciones = new Meteor.Collection('cotizaciones');
Cotizaciones.allow({
  insert: function() {
    return false;
  },
  update: function() {
    return false;
  },
  remove: function() {
    return false;
  }
});

Gastos = new Meteor.Collection('gastos');
Gastos.allow({
  insert: function() {
    return false;
  },
  update: function() {
    return false;
  },
  remove: function() {
    return false;
  }
});

Items = new Meteor.Collection('items');
Items.allow({
  insert: function() {
    return false;
  },
  update: function() {
    return false;
  },
  remove: function() {
    return false;
  }
});

Ymvo = new Meteor.Collection("ymvo");
Ymvo.allow({
  insert: function() { return false; },
  update: function() { return false; },
  remove: function() { return false; }
});

BIPSU = new Meteor.Collection("bipsu");
BIPSU.allow({
  insert: function() { return false; },
  update: function() { return false; },
  remove: function() { return false; }
});

Documentos = new Meteor.Collection("documentos");
Documentos.allow({
  insert: function() { return false; },
  update: function() { return false; },
  remove: function() { return false; }
});

Ventas = new Meteor.Collection("ventas");
Ventas.allow({
  insert: function() { return false; },
  update: function() { return false; },
  remove: function() { return false; }
});

Fichas = new Meteor.Collection("fichas");
Fichas.allow({
  insert: function() { return false; },
  update: function() { return false; },
  remove: function() { return false; }
});

Especialistas = new Meteor.Collection("especialistas");
Especialistas.allow({
  insert: function() { return false; },
  update: function() { return false; },
  remove: function() { return false; }
});

Prestaciones = new Meteor.Collection("prestaciones");
Prestaciones.allow({
  insert: function() { return false; },
  update: function() { return false; },
  remove: function() { return false; }
});

// Users - Permission
Meteor.users.allow({
  insert: function () {
    return false;
  },
  update: function () {
    return false;
  },
  remove: function () {
    return false;
  }
});
