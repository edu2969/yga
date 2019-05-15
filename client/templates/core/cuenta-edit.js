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

Template.cuentaEdit.events({
    "change #cuenta-bioId": function (e) {
        hayErrores();
    },
    "keyup .form-control": function (e) {
        hayErrores();
    },
    "click #btn-guardar": function (e) {
        if (hayErrores()) return;
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
                //debugger;
                var oldval = atributo == "email" ? eval("usuario.emails[0].address") : eval("usuario.profile." + atributo);
                if (oldval != valor) {
                    //console.log("procesa", atributo, oldval, valor);
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
                                        docUnset["profile." + atributo] = valor;
                                    } else {
                                        docSet["profile." + atributo] = valor;
                                    }
                                }
                            } else {
                                docSet.profile[atributo] = valor;
                            }
                        }
                    }
                }
            }
        });

        if ($("#checkbox-desvincular").is(":checked") && !usuario.profile.desvinculado) {
            if (usuario._id) {
                docSet["profile.desvinculado"] = true;
            } else {
                docSet.profile["desvinculado"] = true;
            }
        }
        if (!$("#checkbox-desvincular").is(":checked") && usuario.profile.desvinculado) {
            if (usuario._id) {
                docUnset["profile.desvinculado"] = "";
            }
        }

        var doc = {};
        if (_.isEmpty(docSet.profile)) delete docSet.profile;
        if (!_.isEmpty(docSet)) {
            doc.$set = docSet;
        }
        if (_.isEmpty(docUnset.profile) && _.isEmpty(docUnset)) delete docUnset.profile;
        if (!_.isEmpty(docUnset)) {
            doc.$unset = docUnset;
        }
        if (usuario._id) doc._id = usuario._id;

        if (!doc._id && !doc.$set.profile.role) {
            doc.$set.profile.role = Session.get("RolSeleccionado");
        }

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
        //debugger;
        if (_.isEmpty(docSet)) {
            delete doc.$set;
        }
        if (_.isEmpty(docUnset.profile)) {
            delete doc.$unset;
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
        console.log(doc, docSet, docUnset);

        Meteor.call("ActualizarUsuario", Meteor.userId(), doc, function (err, resp) {
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

Template.cuentaEdit.helpers({
    esAdmin: function () {
        return Meteor.user() && Meteor.user().profile.role == 1;
    },
    esTrabajador: function () {
        return Session.get('RolSeleccionado') == 6;
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
        if (!rolSel) return '#&8*!@&ˆ#)';
        if (rolSel == 1) return '_EdU_';
        if (rolSel == 2) return 'Gerente';
        if (rolSel == 3) return 'Asesor';
        if (rolSel == 4) return 'Socio';
        if (rolSel == 5) return 'Vendedor';
        if (rolSel == 6) return 'Trabajador';
        return 'ERROR - Sin Rol';
    },
    profile: function () {
        return Meteor.user() ? Meteor.user().profile : {};
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
                    "profile.role": 6
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