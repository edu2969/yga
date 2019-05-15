Meteor.startup(function () {
  // test gmail. Se debe deshabilitar el envio desde aplicaciones no seguras en GMail.security
  process.env.MAIL_URL="smtp://edtronco%40gmail.com:;Eatm105.@smtp.gmail.com:465/";
});

if (Meteor.isServer) {
  Router.map(function() {
    this.route('serverRoute', {
      path: '/',
      where: 'server',
      action: function() {
        var contents = Assets.getText('index.html');
        this.response.end(contents);
      }
    });
  });
}