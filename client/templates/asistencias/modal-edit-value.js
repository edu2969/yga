Template.modalEditValue.helpers({
    isEditing: function () {
        var params = Session.get('MarcationParams');
        return !params ? false : params.index;
    },
    modalValues: function () {
        return Session.get('MarcationParams')
    },
    esGerente: function () {
        return Meteor.user() && Meteor.user().profile.role <= 2;
    },
    esAsesor: function () {
        return Meteor.user() && Meteor.user().profile.role == 3;
    }
});

Template.modalEditValue.events({
    'click #btn-confirm': function (e) {
        e.preventDefault();
        var params = Session.get('MarcationParams');
        var trabajador = Meteor.users.findOne({
            "profile.bioId": Session.get('BiometryId')
        });
        var nota = $('#change-log').val().trim();
        var docSet = {};
        var docUnset = {};
        var registro = Asistencias.findOne({
            _id: params.assistId
        });
        
        var tipo = $("#select-tipo-nota").children(":selected").attr("id");
        if(tipo) {
            docSet.tiponota = Number(tipo);
        } else {
            if(registro) {
                docUnset.tiponota = "";
            }
        }

        if (!params.isGlobal) {
            var hour = $('#assist-time').val();
            var hourParams = hour ? hour.split(':') : false;
            var msHour = Meteor.user().profile.role <= 2 ?
                (hour.indexOf('--') == -1 ? Number(hourParams[0]) * 60 * 60 * 3600 + Number(hourParams[1]) * 60 * 3600 : false) :
                registro.marcas[params.index].ms;
            var marcas = registro && registro.marcas ? registro.marcas : [];
            var forzada = Meteor.user().profile.role <= 2 ? $("#checkbox-forzada").is(":checked") : registro.marcas[params.index].forzada;
            var marca = {
                ms: msHour
            };

            marca.nota = nota;
            if (forzada) marca.forzada = true

            if (isNaN(params.index)) {
                marcas.push(marca);
            } else {
                marcas[params.index] = marca;
            }
            marcas = marcas.sort(function (x, y) {
                return x.ms - y.ms;
            });
            docSet.marcas = marcas;
            if (!registro) {
                var sessionParams = Session.get('AssistanceParams');
                if (!sessionParams) return;
                var valores = sessionParams.split('/');
                var month = Number(valores[0]) - 1;
                var year = Number(valores[1]);
                year = year < 1000 ? year + 2000 : year;

                docSet.userId = trabajador._id;
                docSet.month = month;
                docSet.year = year;
                docSet.day = params.day;
                if (forzada) {
                    docSet.forzada = params.forzada
                } else {
                    if (!_.isEmpty(registro) && registro.marcas[0].forzada) {
                        docUnset.marcas[0].forzada == "";
                    }
                }
            }
        } else {
            var doc = {
                userId: trabajador._id,
                month: params.month,
                year: params.year,
                day: params.day
            };
            var registro = params ? Asistencias.findOne(doc) : false;
            if (!registro) docSet = doc;
            params.assistId = registro ? registro._id : false;

            if (nota != "")
                docSet.nota = nota;
            else
                docUnset.nota = "";
        }

        var cambio = {};
        if (!_.isEmpty(docSet)) {
            cambio.$set = docSet;
        }
        if (!_.isEmpty(docUnset)) {
            cambio.$unset = docUnset;
        }

        Meteor.call("ProcesarCambioAsistencia", params.assistId, cambio, function (err, resp) {
            if (!err) {
                $('#modal-edit-value').modal('hide');
            }
        });
    },
    'focus .assistance-time': function (e) {
        e.preventDefault();
        if (e.currentTarget.value == '--:--')
            e.currentTarget.value = '';
        e.currentTarget.select();
        return false;
    },
    'keyup .assistance-time': function (e) {
        var text = e.currentTarget.value;
        text = text.replace(':', '');
        if (text.length >= 2) {
            text = text.substring(0, Math.floor(text.length / 2)) + ':' + text.substring(Math.floor(text.length / 2));
        }
        e.currentTarget.value = text;
        return false;
    },
    'click .assistance-time': function (e) {
        e.preventDefault();
        return false;
    },
    'click #btn-eliminar': function (e) {
        e.preventDefault();
        var params = Session.get('MarcationParams');
        var doc = {};

        var registro = Asistencias.findOne({
            _id: params.assistId
        });
        var marcas = registro.marcas ? registro.marcas : [];
        if (params.index >= 0) {
            marcas.splice(params.index, 1);
        }
        marcas = marcas.sort(function (x, y) {
            return x.ms - y.ms;
        });
        doc.marcas = marcas;

        Meteor.call("ProcesarCambioAsistencia", params.assistId, {
            $set: doc
        }, function (err, resp) {
            if (!err) {
                $('#modal-edit-value').modal('hide');
            }
        });
    }
});