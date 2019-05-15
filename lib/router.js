Router.configure({
  layoutTemplate: 'appBody',
  notFoundTemplate: 'appNotFound',
  loadingTemplate: 'appLoading',
  onBeforeAction: function() {
    if(!Meteor.userId) {
      this.render("login");
    } else {
      this.next();
    }
  },
  waitOn: function () {
    return [
      Meteor.subscribe('users'),
      Meteor.subscribe('empresasUsuario')
    ];
  }
});

dataReadyHold = null;

if (Meteor.isClient) {
  dataReadyHold = LaunchScreen.hold();
  Router.onBeforeAction('loading', {
    except: ['login']
  });
  Router.onBeforeAction('dataNotFound', {
    except: ['login']
  });
}

Router.route('login', {
  path: '/login',
  template: 'login',
  layoutTemplate: 'appBody',
  waitOn: function () {
    return [];
  },
  action: function () {
    this.render()
  }
});

Router.route('loginEnmascarado', {
  path: '/login/:_empresa',
  template: 'login',
  layoutTemplate: 'appBody',
  waitOn: function () {
    return [
    ];
  },
  action: function () {
    this.render()
  }
});

Router.route('cuentas', {
  path: '/cuentas',
  template: 'cuentas',
  layoutTemplate: 'appBody',
  waitOn: function () {
    return [
    ];
  },
  action: function () {
    this.render()
  }
});

Router.route('equipo', {
  path: '/equipo',
  template: 'cuentas',
  layoutTemplate: 'appBody',
  waitOn: function () {
    return [
    ];
  },
  action: function () {
    this.render()
  }
});

Router.route('cuentaEdit', {
  path: '/cuentaEdit',
  template: 'cuentaEdit',
  layoutTemplate: 'appBody',
  waitOn: function () {
    return [
    ];
  },
  action: function () {
    this.render()
  }
});

Router.route('empresas', {
  path: '/empresas',
  template: 'empresas',
  layoutTemplate: 'appBody',
  waitOn: function () {
    return Meteor.subscribe('empresas')
  },
  action: function () {
    this.render();
  }
});

Router.route('empresaEdit', {
  path: '/empresaEdit/:_empresaId',
  template: 'empresaEdit',
  layoutTemplate: 'appBody',
  waitOn: function () {
    return Meteor.subscribe('empresa', this.params._empresaId);
  },
  action: function () {
    this.render()
  }
});

Router.route('integranteEdit', {
  path: '/integranteEdit/:_empresaId',
  template: 'integranteEdit',
  layoutTemplate: 'appBody',
  waitOn: function () {
    return Meteor.subscribe('empresa', this.params._empresaId);
  },
  action: function () {
    this.render()
  }
});

Router.route('ficha', {
  path: '/ficha/:_rut',
  template: 'ficha',
  layoutTemplate: 'appBody',
  waitOn: function () {
    return [
      Meteor.subscribe('paciente', this.params._rut)
      ];
  },
  action: function () {
    this.render()
  }
});

Router.route('psuPanel', {
  path: '/psuPanel',
  template: 'psuPanel',
  layoutTemplate: 'appBody',
  waitOn: function () {
    return Meteor.subscribe('bipsu');
  },
  action: function () {
    this.render()
  }
});

Router.route('proyectos', {
  path: '/proyectos',
  template: 'proyectos',
  layoutTemplate: 'appBody',
  waitOn: function () {
    return [
      Meteor.subscribe('proyectosUsuario'),
      Meteor.subscribe('empresas')
    ];
  },
  action: function () {
    this.render()
  }
});

Router.route('proyectoEdit', {
  path: '/proyectoEdit/:_pId',
  template: 'proyectoEdit',
  layoutTemplate: 'appBody',
  waitOn: function () {
    return [
      Meteor.subscribe('proyecto', this.params._pId)
    ];
  },
  action: function () {
    this.render()
  }
});

Router.route('puntoventa', {
  path: '/puntoventa',
  template: 'puntoventa',
  layoutTemplate: 'puntoventa',
  waitOn: function () {
    return [
      Meteor.subscribe("ventas")
    ];
  },
  action: function () {
    this.render()
  }
});

Router.route('cotizaciones', {
  path: '/cotizaciones',
  template: 'cotizaciones',
  layoutTemplate: 'appBody',
  waitOn: function () {
    return [
      Meteor.subscribe('cotizacionesEmpresa'),
      Meteor.subscribe('estadosCotizaciones'),
      Meteor.subscribe('empresas'),
      Meteor.subscribe('estadosFacturas')
      ];
  },
  action: function () {
    this.render();
  }
});


Router.route('facturas', {
  path: '/facturas',
  template: 'facturas',
  layoutTemplate: 'appBody',
  waitOn: function () {
    return [
      Meteor.subscribe('facturasEmpresa'),
      Meteor.subscribe('empresas'),
      Meteor.subscribe('estadosFacturas')
      ];
  },
  action: function () {
    this.render()
  }
});

Router.route('cotizacionEdit', {
  path: '/cotizacionEdit/:_pId',
  template: 'cotizacionEdit',
  layoutTemplate: 'appBody',
  waitOn: function () {
    return [
      Meteor.subscribe('proyectosUsuario'),
      Meteor.subscribe("cotizacionesEmpresa"),
      Meteor.subscribe('empresas')
      ];
  },
  action: function () {
    this.render()
  }
});

Router.route('itemCotizacionEdit', {
  path: '/itemCotizacionEdit',
  template: 'itemCotizacionEdit',
  layoutTemplate: 'appBody',
  waitOn: function () {
    return [
      Meteor.subscribe("categorias"),
      Meteor.subscribe("proyectosUsuario")
    ];
  },
  action: function () {
    this.render()
  }
});

Router.route('categoriasEdit', {
  path: '/categoriasEdit',
  template: 'categoriasEdit',
  layoutTemplate: 'appBody',
  waitOn: function () {
    return [
      Meteor.subscribe("categorias"),
      ];
  },
  action: function () {
    this.render()
  }
});

Router.route('ymvo', {
  path: '/ymvo',
  template: 'ymvo',
  layoutTemplate: 'appBody',
  waitOn: function () {
    return [];
  },
  action: function () {
    this.render()
  }
});

Router.route('jornadas', {
  path: '/jornadas',
  template: 'jornadas',
  layoutTemplate: 'appBody',
  waitOn: function () {
    return Meteor.subscribe('fechasEspeciales');
  },
  action: function () {
    this.render()
  }
});

Router.route('asistencias', {
  path: '/asistencias',
  template: 'asistencias',
  layoutTemplate: 'appBody',
  waitOn: function () {
    return [
      Meteor.subscribe("asistencias"),
      Meteor.subscribe("biasistencias")
      ];
  },
  action: function () {
    this.render()
  }
});


Router.route('panelTrabajador', {
  path: '/panelTrabajador',
  template: 'panelTrabajador',
  layoutTemplate: 'appBody',
  action: function () {
    this.render()
  }
});

Router.route('asistenciaDetalle', {
  path: '/asistenciaDetalle',
  template: 'asistenciaDetalle',
  layoutTemplate: 'appBody',
  waitOn: function () {
    return [
      Meteor.subscribe('asistencias'),
      Meteor.subscribe('fechasEspeciales')
    ];
  },
  action: function () {
    this.render()
  }
});

Router.route('importarAsistencia', {
  path: '/importarAsistencia',
  template: 'importarAsistencia',
  layoutTemplate: 'appBody',
  waitOn: function () {
    return [];
  },
  action: function () {
    this.render();
  }
});


Router.route('mantencion', {
  path: '/mantencion',
  template: 'mantencion',
  layoutTemplate: 'appBody',
  waitOn: function () {
    return [
    ];
  },
  action: function () {
    this.render();
  }
});

Router.route('notaria', {
  path: '/notaria',
  template: 'notaria',
  layoutTemplate: 'appBody',
  waitOn: function () {
    return [
      Meteor.subscribe("documentos")
     ];
  },
  action: function () {
    this.render();
  }
});

Router.route("gestionpacientes", {
  path: '/gestionpacientes',
  template: 'gestionpacientes',
  layouTemplate: 'appBody',
  waitOn: function() {
    return [
      Meteor.subscribe("pacientes"),
      Meteor.subscribe("fichas"),
      Meteor.subscribe("especialistas")
    ];
  },
  action() {
    this.render();
  }
});

Router.route("editarpaciente", {
  path: '/editarpaciente',
  template: 'editarpaciente',
  layouTemplate: 'appBody',
  waitOn: function() {
    return [
      Meteor.subscribe("pacientes"),
      Meteor.subscribe("fichas"),
      Meteor.subscribe("convenios"),
      Meteor.subscribe("especialistas"),
      Meteor.subscribe("prestaciones")
      ];
  },
  action() {
    this.render();
  }
});