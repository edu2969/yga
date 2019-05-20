var EDITING_KEY = 'gestionots';
Session.setDefault(EDITING_KEY, false);

// Track if this is the first time the list template is rendered
var firstRender = true;
var listRenderHold = LaunchScreen.hold();
listFadeInHold = null;

Template.gestionots.rendered = function() {
    
}

Template.gestionots.helpers({
    tarjetas() {
        return [{}];
    }
});

Template.gestionots.events({
    "click .tarjeta"(e) {
        var bioid = e.currentTarget.id;
        Router.go("/ots/" + bioid);
    }
})