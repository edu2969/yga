var MENU_KEY = 'menuOpen';
Session.setDefault(MENU_KEY, false);

var USER_MENU_KEY = 'userMenuOpen';
Session.setDefault(USER_MENU_KEY, false);

var SHOW_CONNECTION_ISSUE_KEY = 'showConnectionIssue';
Session.setDefault(SHOW_CONNECTION_ISSUE_KEY, false);

var CONNECTION_ISSUE_TIMEOUT = 5000;

Meteor.startup(function () {
  Session.set("IdentificadorEmpresa", false);
  //Typeahead instances
  Meteor.typeahead.inject();
  
  // set up a swipe left / right handler
  $(document.body).touchwipe({
    wipeLeft: function () {
      Session.set(MENU_KEY, false);
    },
    wipeRight: function () {
      Session.set(MENU_KEY, true);
    },
    preventDefaultEvents: false
  });

  // Only show the connection error box if it has been 5 seconds since
  // the app started
  setTimeout(function () {
    // Launch screen handle created in lib/router.js
    dataReadyHold.release();

    // Show the connection error box
    Session.set(SHOW_CONNECTION_ISSUE_KEY, true);
  }, CONNECTION_ISSUE_TIMEOUT);
});

Template.appBody.rendered = function () {
  this.find('#content-container')._uihooks = {
    insertElement: function (node, next) {
      $(node)
        .hide()
        .insertBefore(next)
        .fadeIn(function () {
          if (listFadeInHold) listFadeInHold.release();
        });
    },
    removeElement: function (node) {
      $(node).fadeOut(function () {
        $(this).remove();
      });
    }
  };
  
  Meteor.users.find({ _id: Meteor.userId() }).observeChanges({
    changed: function(id, fields) {
      console.log("changed id", id, "fields", fields);
    },
    added: function(id, fields) {
      console.log("added id", id, "fields", fields);
      if(!Session.get("IdentificadorEmpresa")) {
        console.log("Cargando nuevamente entorno");
        Meteor.call("CargarEntorno", false, function(err, resp) {
          if(!err) {
            Session.set("IdentificadorEmpresa", resp);
            console.log(resp);
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
    }
  });
};

Template.appBody.helpers({
  menuOpen: function () {
    return Session.get(MENU_KEY) && 'menu-open';
  },
  cordova: function () {
    return Meteor.isCordova && 'cordova';
  },
  emailLocalPart: function () {
    var email = Meteor.user().emails[0].address;
    return email.substring(0, email.indexOf('@'));
  },
  userMenuOpen: function () {
    return Session.get(USER_MENU_KEY);
  },
  connected: function () {
    if (Session.get(SHOW_CONNECTION_ISSUE_KEY)) {
      return Meteor.status().connected;
    } else {
      return true;
    }
  },
  descripcionPagina: function() {
    return Session.get("DescripcionPagina");
  },
  empresas: function() {
    return Empresas.find({ _id: {
      $in: Equipos.find({ usuarioId: Meteor.userId() }).map(function(o) {
        return o.empresaId;
      })
    }});
  },
  entorno: function() {
    return Session.get("IdentificadorEmpresa");
  },
  selectorEmpresasVisible: function() {
    var ide = Session.get("IdentificadorEmpresa");
    if(!ide) return false;
    return ide.identificador=="tyt" || ide.identificador=="yga";
  }
});

Template.appBody.events({
  'click .js-menu': function () {
    Session.set(MENU_KEY, !Session.get(MENU_KEY));
  },
  'click .content-overlay': function (event) {
    Session.set(MENU_KEY, false);
    event.preventDefault();
  },
  'click .js-user-menu': function (event) {
    Session.set(USER_MENU_KEY, !Session.get(USER_MENU_KEY));
    // stop the menu from closing
    event.stopImmediatePropagation();
  },
  'click #menu a': function () {
    Session.set(MENU_KEY, false);
  },
  'click .js-logout': function () {
    Meteor.logout();
    Router.go("/" + ( Session.get("IdentificadorEmpresa") ? "login/" + Session.get("IdentificadorEmpresa").identificador : "" ));
  },
  "change #selector-empresa": function() {
    var id = $("#selector-empresa option:selected").attr("id");
    var identificador = Empresas.findOne({ _id: id }).identificador;
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
});