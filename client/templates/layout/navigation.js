Template.navigation.helpers({
  appz: function() {
    var iconos = {
      "asistencias": { icon: "time", etiqueta: "Asistencias" },
      "jornadas": { icon: "calendar", etiqueta: "Jornadas" },
      "cuentas": { icon: "cog", etiqueta: "Cuentas" },
      "empresas": { icon: "tree-deciduous", etiqueta: "Empresas" },
      "ficha": { icon: "heart", etiqueta: "Fichas" },
      "home": { icon: "home", etiqueta: "Inicio" },
      "mantencion": { icon: "wrench", etiqueta: "Mantención" },
      "panelTrabajador": { icon: "leaf", etiqueta: "Panel Trabajador" },
      "proyectos": { icon: "send", etiqueta: "Proyectos" },
      "psuPanel": { icon: "heart", etiqueta: "PSU-Trainer" },
      "cotizaciones": { icon: "leaf", etiqueta: "Cotizaciones" },
      "equipo": { icon: "wrench", etiqueta: "Equipo" },
      "facturas": { icon: "usd", etiqueta: "Facturación" },
      "notaria": { icon: "pencil", etiqueta: "Notaría" },
      "ymvo": { icon: "eye-open", etiqueta: "YoMeVeO" },
      "puntoventa": { icon: "map-marker", etiqueta: "PuntoVenta" },
      "gestionpacientes": { icon: "heart", etiqueta: "Gestión Pacientes" },
    }
    var a = [];
    var appz = Meteor.user().profile.appz;
    if(!appz) return;
    appz.split(",").forEach(function(o) {
      var nuevo = iconos[o] ? iconos[o] : iconos["cuentas"];
      nuevo.app = o;
      a.push(nuevo);
    });
    return a;
  }
});
