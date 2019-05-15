var ERRORS_KEY = 'loginErrors';

Template.login.created = function () {
  Session.set(ERRORS_KEY, {});
};

Template.login.rendered = function() {
  var identificador = Router.current().params._empresa;
  Meteor.call("CargarEntorno", identificador, function(err, resp) {
    if(!err) {
      Session.set("IdentificadorEmpresa", resp);
      if(!resp) return;
      document.title = resp.razon;
      var link = document.querySelector("link[rel*='icon']") || document.createElement('link');
      link.type = 'image/x-icon';
      link.rel = 'shortcut icon';
      link.href = '/favicon/favicon-' + resp.identificador + '.ico';
      document.getElementsByTagName('head')[0].appendChild(link);

      $(".btn-primary").css("background-color", resp.color);
      $("section#menu").css("background-color", resp.color);
      $(".page.lists-show nav").css("background-color", resp.color);
      $(".element-list-container").css("background-color", RGBA(resp.color, "0.4"));
    }
  });
}

Template.login.helpers({
  errorMessages: function () {
    return _.values(Session.get(ERRORS_KEY));
  },
  errorClass: function (key) {
    return Session.get(ERRORS_KEY)[key] && 'error';
  },
  entornoApp: function () {
    return Session.get("IdentificadorEmpresa");     
  }
});

Template.login.events({
  'submit': function (event, template) {
    event.preventDefault();

    var email = template.$('[name=email]').val();
    var password = template.$('[name=password]').val();

    var errors = {};

    if (!email) {
      errors.email = 'Email is required';
    }

    if (!password) {
      errors.password = 'Password is required';
    }

    Session.set(ERRORS_KEY, errors);
    if (_.keys(errors).length) {
      return;
    }
    
    // Si no está

    Meteor.loginWithPassword(email, password, function (error) {
      if (error) {
        return Session.set(ERRORS_KEY, { 'none': error.reason });
      }
      
      var appz = Meteor.user().profile.appz;
      if(!appz && Meteor.user().profile.role==1) {
        appz = "cuentas, mantencion, empresas, aliados";
      }
      var path = "/appNotFound";
      if(appz) {
        path = "/" + appz.split(",")[0];
      }
      Router.go(path);
    });
  }
});