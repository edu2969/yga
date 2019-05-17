MonthNames = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo',
                  'Junio', 'Julio', 'Agosto', 'Septiembre',
                  'Octubre', 'Noviembre', 'Diciembre'];

DayNames = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];

DayShortNames = ['Do', 'Lu', 'Ma', 'Mi', 'Ju', 'Vi', 'Sa'];

HourFormat = function (ms) {
  if (!ms) return '--:--';
  var hours = Math.floor(ms / 60 / 60 / 3600);
  var minutes = Math.floor((ms - hours * 60 * 60 * 3600) / 60 / 3600);
  return (hours < 10 ? '0' + hours : hours) + ':' + (minutes < 10 ? '0' + minutes : minutes);
}

Hours2Date = function (hours) {
  if(Math.abs(hours) < 9) return hours + 'h';
  return ( hours < 0 ? '-' : '' )
    + Math.floor(Math.abs(hours) / 9) + 'd '
    + (Math.abs(hours) % 9) + 'h';
}

GetBussinesTime = function (ms, forzada) {
  if (forzada) {
    console.log("Esta siendo forzada: " + HourFormat(ms))
  }
  // Entre 0:01 - 8:59 -> 8:30 si no está forzada
  if (ms > 0 * 60 * 60 * 3600 && ms < 9 * 60 * 60 * 3600 && !forzada) {
    return 8 * 60 * 60 * 3600 + 30 * 60 * 3600;
  }

  // Entre 12:51 - 13:44 -> 13.00
  if (ms > 12 * 60 * 60 * 3600 + 50 * 60 * 3600 && ms < 13 * 60 * 60 * 3600 + 45 * 60 * 3600) {
    return 13 * 60 * 60 * 3600;
  }

  // Entre 13:45 - 14:29 -> 14:00
  if (ms > 13 * 60 * 60 * 3600 + 45 * 60 * 3600 && ms < 14 * 60 * 60 * 3600 + 30 * 60 * 3600) {
    return 14 * 60 * 60 * 3600;
  }

  // Para el resto, aproxima segun los minutos:
  // <15 = 0,
  // >15 y <50 = 30
  // >=50 = 0 y agrega una hora
  var hours = Math.floor(ms / 60 / 60 / 3600);
  var minutes = Math.floor((ms - hours * 60 * 60 * 3600) / 60 / 3600);

  if (minutes <= 15) {
    minutes = 0;
  } else if (minutes > 15) {
    minutes = 30;
  }
  return hours * 60 * 60 * 3600 + minutes * 60 * 3600;
}


// Conteo de horas trabajadas y extras
ProcessAssistanceHH = function (id) {
  var reg = Asistencias.findOne(id);
  if (!reg) reg = {};

  var date = new Date(reg.year, reg.month, reg.day);

  var marcas = reg.marcas ? reg.marcas : [];

  var lastHHNormal = reg.hhNormal ? reg.hhNormal : 0,
    lastHHExt50 = reg.hhExt50 ? reg.hhExt50 : 0,
    lastHHExt100 = reg.hhExt100 ? reg.hhExt100 : 0;

  // Cuenta las horas a intervalos pares de entrada
  // ejem: 8:30, 12:45, 13:30, 19:00, cuenta msCounter = ms entre 8:30 y 12:45
  //       + ms entre 13:30 y 19:00
  // ejem: 8:30, 8:31, 12:45, 13:30, 19:00, error @TODO Corregir
  var msCounter = 0

  var index = 0;
  var msIn = false,
    msOut = false,
    forzada = marcas && marcas[0] ? marcas[0].forzada : false;
  do {
    while (marcas[index] && marcas[index].invalida) index++
      msIn = marcas[index] ? marcas[index].ms : false
    while (index > 0 && (marcas[index - 1] ? msIn - marcas[index - 1].ms < 10 * 60 * 3600 : false)) {
      index++;
      msIn = marcas[index] ? marcas[index].ms : false
    }
    index++;
    while (marcas[index] && (
        (index < marcas.length && marcas[index].ms - msIn < 10 * 60 * 3600) || (marcas[marcas.length - 1].ms > 19 * 60 * 60 * 3600 && marcas[index].ms > 18 * 60 * 60 * 3600 && marcas[index].ms < 19 * 60 * 60 * 3600) || marcas[index].invalida
      )) {
      index++;
    }
    msOut = marcas[index] ? marcas[index].ms : false
    if (msIn && msOut) {
      msCounter = msCounter + GetBussinesTime(msOut, false) - GetBussinesTime(msIn, forzada);
      forzada = false
      msIn = false;
      msOut = false;
    }

    index++;
  } while (index < marcas.length);

  reg.hhNormal = 0;
  reg.hhExt50 = 0;
  reg.hhExt100 = 0;

  if (!reg.vacacion) {
    if (!TipoJornada(date) && date.getDay() != 0 && date.getDay() != 6) {
      // Si la cantidad total de horas trabajadas en un día normal
      // es a lo menos 9 horas, completa el registro de hhNomral y hh50Ext
      if (msCounter > 9 * 60 * 60 * 3600) {
        reg.hhNormal = 0;
        reg.hhExt50 = Math.floor(((msCounter - 9 * 60 * 60 * 3600) / (60 * 60 * 3600)) * 2) / 2;
      } else {
        reg.hhNormal = Math.floor(((msCounter - 9 * 60 * 60 * 3600) / (60 * 60 * 3600)) * 2) / 2
      }
    } else if (!TipoJornada(date) && date.getDay() == 6) {
      reg.hhExt50 = Math.floor((msCounter / (60 * 60 * 3600)) * 2) / 2;
    } else if (!TipoJornada(date) && date.getDay() == 0) {
      reg.hhExt100 = Math.floor((msCounter / (60 * 60 * 3600)) * 2) / 2;
    } else if (TipoJornada(date) == 1 || TipoJornada(date) == 2) {
      if (date.getDay() == 0 || TipoJornada(date) == 1 || TipoJornada(date) == 2) {
        reg.hhExt100 = Math.floor((msCounter / (60 * 60 * 3600)) * 2) / 2;
      } else {
        reg.hhExt50 = Math.floor((msCounter / (60 * 60 * 3600)) * 2) / 2;
      }
    }
  } 

  /*else if( TipoJornada(date)==3 ) {
    // Media Jornanda
    reg.hhNormal = reg.hhNormal + 4.5;
  }*/
  
  var doc = !reg.vacacion ? {
    $set: {
      hhNormal: reg.hhNormal ? reg.hhNormal : 0,
      hhExt50: reg.hhExt50 ? reg.hhExt50 : 0,
      hhExt100: reg.hhExt100 ? reg.hhExt100 : 0,
      marcas: marcas
    }
  }: {
    $unset: {
      hhNormal: "",
      hhExt50: "",
      hhExt100: ""
    }
  };
  
  Asistencias.update({
    _id: reg._id
  }, doc);

  var bi = BIAsistencias.findOne({
    userId: reg.userId,
    month: reg.month,
    year: reg.year
  });
  if (!bi) {
    var biId = BIAsistencias.insert({
      month: reg.month,
      year: reg.year,
      userId: reg.userId,
      hhNormal: reg.hhNormal ? reg.hhNormal : 0,
      hhExt50: reg.hhExt50 ? reg.hhExt50 : 0,
      hhExt100: reg.hhExt100 ? reg.hhExt100 : 0
    });
    bi = BIAsistencias.findOne(biId);
  } else {
    if(reg.vacacion) reg.hhNormal = 0;
    var calculatedNorm = bi.hhNormal + (reg.hhNormal ? reg.hhNormal : 0 ) - lastHHNormal;
    var calculated50 = bi.hhExt50 + (reg.hhExt50 ? reg.hhExt50 : 0) - lastHHExt50;
    var calculated100 = bi.hhExt100 + (reg.hhExt100 ? reg.hhExt100 : 0) - lastHHExt100;
    BIAsistencias.update({
      _id: bi._id
    }, {
      $set: {
        hhNormal: calculatedNorm,
        hhExt50: calculated50,
        hhExt100: calculated100,
      }
    });
    //console.log("BIProcess> " + bi._id);
  }
}

TipoJornada = function (date) {
  var from = moment(date).startOf('day').toDate();
  var to = moment(date).endOf('day').toDate();
  var reg = FechasEspeciales.findOne({
    fecha: { $gte: from, $lt: to }
  })
  if (reg) {
    return reg.tipo;
  }
  return false;
}

Normalizar = function (str) {
  var from = "ÃÀÁÄÂÈÉËÊÌÍÏÎÒÓÖÔÙÚÜÛãàáäâèéëêìíïîòóöôùúüûÑñÇç -",
    to = "AAAAAEEEEIIIIOOOOUUUUaaaaaeeeeiiiioooouuuunncc__",
    mapping = {};

  for (var i = 0, j = from.length; i < j; i++)
    mapping[from.charAt(i)] = to.charAt(i);
  var ret = [];
  for (var i = 0, j = str.length; i < j; i++) {
    var c = str.charAt(i);
    if (mapping.hasOwnProperty(str.charAt(i)))
      ret.push(mapping[c]);
    else
      ret.push(c);
  }
  return ret.join('');
};


MaskPrice = function (str, moneda) {
  var parts = (str + "").split("."),
    main = parts[0],
    len = main.length,
    output = "",
    i = len - 1;

  while (i >= 0) {
    output = main.charAt(i) + output;
    if ((len - i) % 3 === 0 && i > 0) {
      output = "." + output;
    }
    --i;
  }
  // put decimal part back
  if (moneda == "UF $" && parts.length > 1) {
    output += "," + parts[1].substr(0, 2)
  }
  return (moneda ? moneda + " " : "") + output;
}

RGBA = function(color, opacity) {
  return 'rgba(' + parseInt(color.slice(-6,-4),16)
          + ',' + parseInt(color.slice(-4,-2),16)
          + ',' + parseInt(color.slice(-2),16)
          +',' + opacity + ')';
}

NOMBRES_ROLES = function(rol) {
  var roles = [ 'None', '_EdU_', 'Gerente', 'Asesor', 'Socio', 'Vendedor', 'Trabajador', 'Desvinculado' ];
  return roles[rol];
};

DigitoVerificadorRut = function(T) {
      var M=0,S=1;
	  for(;T;T=Math.floor(T/10))
      S=(S+T%10*(9-M++%6))%11;
      return (S?S-1:'k');
}

FormatoRut = function(rut) {
  return MaskPrice(rut, "") + "-" + DigitoVerificadorRut(rut);
}
