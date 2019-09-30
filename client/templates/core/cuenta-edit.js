Template.cuentaEdit.rendered = function () {
    Session.set('ImportMessages', false);
    if (Meteor.user() && !Meteor.user().profile.cuentaEdit) {
        Meteor.call("ActualizarPerfil", {
            "profile.cuentaEdit.tab": "tab-datos"
        });
    }
    $("#cuenta-appz").tagsinput();
    hayErrores();
}

Template.cuentaEdit.destroyed = function () {
    delete Session.keys["ImporMessages"];
}

Template.cuentaEdit.helpers({
    esAdmin: function () {
        return Meteor.user() && Meteor.user().profile.role == 1;
    },
    esTrabajador: function () {
        return Session.get('RolSeleccionado') == 6;
    },
    desvinculado: function() {
        return Session.get('RolSeleccionado') == 7;
    },
    esCliente: function () {
        return Session.get('RolSeleccionado') == 3;
    },
    cuentaSel: function () {
        return Session.get('UsrSel');
    },
    messages: function () {
        return Session.get('ImportMessages');
    },
    nombreRol: function () {
        var rolSel = Session.get('RolSeleccionado');        
        return NOMBRES_ROLES(rolSel);
    },
    profile: function () {
        return Meteor.user() ? Meteor.user().profile : {};
    }
});

Template.cuentaEdit.events({
    "change #cuenta-bioId": function (e) {
        hayErrores();
    },
    "keyup .form-control": function (e) {
        hayErrores();
    },
    "click #btn-guardar": function (e) {
        if (hayErrores()) return;
        var rolactual = Session.get("RolSeleccionado");
        var docSet = {
                profile: {}
            },
            docUnset = {
                profile: {}
            };
        var inputs = $(".form-control");
        var usuario = Session.get("UsrSel");
        $.map($(".form-control"), function (entrada) {
            if (entrada.id && entrada.id.includes("cuenta")) {
                var valor = entrada.id.split("-")[1] == "rut" ||
                    entrada.id.split("-")[1] == "bioId" ||
                    entrada.id.split("-")[1] == "prioridad" ?
                    Number(entrada.value) : entrada.value;
                var atributo = entrada.id.split("-")[1];
                var usuario = Session.get("UsrSel");
                var oldval = atributo == "email" ? eval("usuario.emails[0].address") : eval("usuario.profile." + atributo);
                if (oldval != valor) {
                    if (!valor) {
                        if (!atributo.includes("password") && !usuario._id) {
                            docUnset.profile[atributo] = valor;
                        }
                    } else {
                        if (atributo == "email") {
                            if (usuario._id) {
                                docSet["emails"] = [{
                                    address: valor
                                }];
                            } else {
                                docSet["email"] = valor;
                            }
                        } else {
                            if (usuario._id) {
                                if (!atributo.includes("password")) {
                                    if (!valor) {
                                        docUnset.profile[atributo] = valor;
                                    } else {
                                        docSet["profile." + atributo] = valor;
                                    }
                                }
                            } else {
                                if(rolactual==6 && atributo!="bioid" && atributo!="prioridad") {
                                    docSet.profile[atributo] = valor;
                                }                                
                            }
                        }
                    }
                }
            }
        });

        if (rolactual==6 && $("#checkbox-desvincular").is(":checked")) {
            if(!usuario._id) {
                docSet.profile.role = 7;
            } else {
                docSet["profile.role"] = 7;
            }            
        }
        if (rolactual==7 && $("#checkbox-reintegrar").is(":checked")) {        
            if(!usuario._id) {
                docSet.profile.role = 6;
            } else {
                docSet["profile.role"] = 6;
            }            
        }
        if (!usuario._id && docSet.profile.role) {
            if(!usuario._id) {
                docSet.profile.role = rolactual;
            } else {
                docSet["profile.role"] = rolactual;
            }            
        }
        
        if (_.isEmpty(docSet.profile)) delete docSet.profile;
        if (_.isEmpty(docUnset.profile)) delete docUnset.profile;

        if (usuario._id && !_.isEmpty($("#cuenta-password").val())) {
            Meteor.call("ActualizarPassword", usuario._id, $("#cuenta-password").val(), function (err, resp) {
                if (err) {
                    Session.set("ImportMessages", {
                        danger: [{
                            item: resp
                        }]
                    });
                } else {
                    Session.set("ImportMessages", {
                        success: [{
                            item: "Password actualizado correctamente"
                        }]
                    });
                }
            });
        }

        if (_.isEmpty(docSet) && _.isEmpty(docUnset.profile)) {
            if (_.isEmpty($("#cuenta-password").val())) {
                Session.set("ImportMessages", {
                    warning: [{
                        item: "Sin cambios"
                    }]
                });
                setTimeout(function () {
                    Session.set("ImportMessages", []);
                }, 5000);
            }
            return;
        }

        Meteor.call("ActualizarUsuario", usuario._id, docSet, docUnset, function (err, resp) {
            if (err) {
                Session.set("ImportMessages", {
                    danger: [{
                        item: resp
          }]
                });
            } else {
                Session.set("ImportMessages", {
                    success: [{
                        item: "Datos actualizados"
          }]
                });
                var usuario = Session.get("UsrSel");
                usuario._id = resp;
                setTimeout(function () {
                    Session.set("ImportMessages", []);
                }, 5000);
            }
        });
    },
    "click .btn-cancelar": function (e) {
        Router.go("/cuentas");
    }
});

var hayErrores = function () {
    var msgs = {
        danger: []
    };
    if (_.isEmpty($("#cuenta-name").val())) {
        msgs.danger.push({
            item: "NOMBRE es requerido"
        });
    }
    if (_.isEmpty($("#cuenta-email").val())) {
        msgs.danger.push({
            item: "EMAIL es requerido"
        });
    }
    if (Session.get("RolSeleccionado") == 6) {
        if (_.isEmpty($("#cuenta-bioId").val())) {
            msgs.danger.push({
                item: "ID biométrico es requerido"
            });
        } else {
            if (!isNaN(Number($("#cuenta-bioId").val()))) {
                Meteor.users.find({
                    "profile.role": { $in: [6, 7]}
                }).forEach(function (o) {
                    if (o._id != Session.get("UsrSel")._id && o.profile.bioId == Number($("#cuenta-bioId").val())) {
                        msgs.danger.push({
                            item: "ID biométrico ya registrado a " + o.profile.name
                        });
                    }
                });
            } else {
                msgs.danger.push({
                    item: "ID biométrico debe ser numérico"
                });
            }
        }
    }

    if (!/^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/.test($("#cuenta-email").val())) {
        msgs.danger.push({
            item: "EMAIL mal formado"
        });
    }
    if (!_.isEmpty(msgs.danger)) {
        $("#cuenta-password").attr("disabled", "disabled");
        $("#cuenta-repassword").attr("disabled", "disabled");
    } else {
        $("#cuenta-password").removeAttr("disabled");
        $("#cuenta-repassword").removeAttr("disabled");
        if ($("#cuenta-password").val() != $("#cuenta-repassword").val()) {
            msgs.danger.push({
                item: "Ambos PASSWORDS deben coincidir"
            });
        }
    }
    Session.set("ImportMessages", msgs);
    return !_.isEmpty(msgs.danger);
}
