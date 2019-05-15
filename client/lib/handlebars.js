ES_LOCAL = d3.locale({
  "dateTime": "%A, %e de %B de %Y, %X",
  "date": "%d/%m/%Y",
  "time": "%H:%M:%S",
  "periods": ["AM", "PM"],
  "days": ["domingo", "lunes", "martes", "miércoles", "jueves", "viernes", "sábado"],
  "shortDays": ["dom", "lun", "mar", "mié", "jue", "vie", "sáb"],
  "months": ["enero", "febrero", "marzo", "abril", "mayo", "junio", "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre"],
  "shortMonths": ["ene", "feb", "mar", "abr", "may", "jun", "jul", "ago", "sep", "oct", "nov", "dic"]
});

StateNames = ['Creación', 'Espera de respuesta', 'Ejecución', 'Evaluación', 'Cerrada'];


// Navegacion

AddNav = function (path) {
  var navObj = Session.get('NavigationPath');
  if(!navObj) navObj = [];
  navObj.push(path);
  Session.set('NavigationPath', navObj);
}

NavBack = function () {
  var navObj = Session.get('NavigationPath');
  if(!navObj) return false;
  Router.go(navObj.pop());
  Session.set('NavigationPath', navObj);
}


SubstringMatcher = function(strs) {
  return function findMatches(q, cb) {
    var matches, substringRegex;

    // an array that will be populated with substring matches
    matches = [];

    // regex used to determine if a string contains the substring `q`
    substrRegex = new RegExp(q, 'i');

    // iterate through the pool of strings and for any string that
    // contains the substring `q`, add it to the `matches` array
    $.each(strs, function(i, str) {
      if (substrRegex.test(str)) {
        matches.push(str);
      }
    });

    cb(matches);
  };
};

// Handlebars
Handlebars.registerHelper("formatDate", function (date, m) {
  if(!m) m = "DD/MM/YYYY";
  return moment(new Date(date)).format(m);
});

Handlebars.registerHelper("evalActive", function (a, b) {
  return a == b ? "active" : "";
});

Handlebars.registerHelper("inputDate", function (d) {
  if( !d ) return 'null';
  return d.getFullYear() + '-' 
    + ( ( d.getMonth() + 1 ) < 10 ? '0' + ( d.getMonth() + 1 ):( d.getMonth() + 1 ) ) + '-' 
    +  ( ( d.getDate() + 1 ) < 10 ? '0' + ( d.getDate() + 1 ) : ( d.getDate() + 1 ) );
});

Handlebars.registerHelper("selectedEval", function (idOption, idSelected) {
  //console.log("comparando", idOption, idSelected, idOption==idSelected, idOption===idSelected);
  if(idOption==idSelected) return 'selected';
  return '';
});

Handlebars.registerHelper("colorateDate", function (date) {
  if(new Date() < date) return "color:red";
  return "";
})

Handlebars.registerHelper("maskPrice", function (str, simbolo) {
  return MaskPrice(str, simbolo);
})

Handlebars.registerHelper("timeFormat", function(ms) {
    var hours = Math.floor( ms / 3600000 );
    hours = hours + 12 * (hours < 12?1:-1);
    var minutes = Math.floor( Math.floor((ms - Math.floor( ms / 3600000 ) * 1000 * 60 * 60)) / 1000 / 60 );
    
    var str = ( hours < 10 ? "0" + hours : hours ) + ":" 
        + ( minutes < 10 ? "0" + minutes : minutes )  + ":00";
    return str;
});

Handlebars.registerHelper("hours2Days", function (hours) {
  if (Math.abs(hours) < 9) return hours + 'h';
  return (hours < 0 ? '-' : '') + Math.floor(Math.abs(hours) / 9) + 'd ' + (Math.abs(hours) % 9) + 'h';
});

Handlebars.registerHelper("formatoRut", function(rut) {
  var dv = DigitoVerificadorRut(rut);
  return MaskPrice(rut, '') + "-" + dv;
});

Handlebars.registerHelper("calculoEdad", function(fecha) {
  return moment(fecha).add(1, "months").fromNow().replace("hace ", "");
});

Handlebars.registerHelper("digitoVerificador", function(rut) {
  return rut ? DigitoVerificadorRut(rut) : "";
});

Handlebars.registerHelper("nombreCorto", function(cadena) {
  if(!cadena) return "SIN DEFINIR";
  var spl = cadena.split(" ");
  return spl[0] + " " + ( spl[2] ? spl[2] : spl[1] );
});



