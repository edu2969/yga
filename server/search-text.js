SearchSource.defineSource('empresas', function(searchText, options) {
  var options = { sort: { razon: -1 }, limit: 20 }; 
  if(searchText) {
    var regExp = buildRegExp(searchText);
    var selector = { $or: [ {razon: regExp} ] };
    return Empresas.find(selector, options).fetch();
  } else {
    return Empresas.find({}, options).fetch();
  }
});

SearchSource.defineSource('cotizaciones', function(searchText, options) {
  var equipos = Equipos.find({ usuarioId: options.usuarioId });
  var empresasId = [];
  equipos.forEach(function(equipo) {
    empresasId.push(equipo.empresaId);
    console.log("Proyecto agregado: " + equipo.empresaId);
  });
  
  var options = { sort: { fechaCreacion: -1 }, limit: 20 }
  
  if(searchText) {
    var regExp = buildRegExp(searchText)
    var selector = { $or: [ {nombre: regExp} ], empresasId: { $in: empresasId } };
    return Proyectos.find(selector, options).fetch()
  } else {
    return Proyectos.find({ empresaId: { $in: empresasId }}, options).fetch()
  }
});


SearchSource.defineSource('facturas', function(searchText, options) {
  var equipos = Equipos.find({ usuarioId: options.usuarioId });
  var empresasId = [];
  equipos.forEach(function(equipo) {
    empresasId.push(equipo.empresaId);
    console.log("Proyecto agregado: " + equipo.empresaId);
  });
  
  var options = { sort: { fechaCreacion: -1 }, limit: 20 }
  
  if(searchText) {
    var regExp = buildRegExp(searchText)
    var selector = { $or: [ {nombre: regExp} ], empresasId: { $in: empresasId } };
    return Proyectos.find(selector, options).fetch()
  } else {
    return Proyectos.find({ empresaId: { $in: empresasId }}, options).fetch()
  }
});

SearchSource.defineSource('codigosCotizacion', function(searchText, options) {
  var options = { sort: { nombre: 1 }, limit: 20 };
  
  if(searchText) {
    var regExp = buildRegExp(searchText);
    var selector = { cotizacionId: { $exists: true }, $or: [ { codigo: regExp } ] }
    return Items.find(selector, options).fetch();
  } else {
    return Items.find({}, options).fetch();
  }
});

SearchSource.defineSource('codigosInventario', function(searchText, options) {
  var options = { sort: { codigo: 1 }, limit: 20 };
  
  if(searchText) {
    var regExp = buildRegExp(searchText);
    var selector = { cotizacionId: { $exists: true }, $or: [ { codigo: regExp }, { nombre: regExp } ] }
    return Items.find(selector, options).fetch();
  } else {
    return Items.find({}, options).fetch();
  }
});

function buildRegExp(searchText) {
  // this is a dumb implementation
  var parts = searchText.trim().split(/[ \-\:]+/);
  return new RegExp("(" + parts.join('|') + ")", "ig");
}