Template.ots.rendered = function() {
  $('.datetimepicker-component').datetimepicker({
    format: 'dd DD/MMM/YY',
    defaultDate: new Date()
  });
}

Template.ots.helpers({
    tareas() {
        return [{}];
    }
})

Template.ots.events({
    "click .boton-simple.label-danger"() {
        $(".item[id='-1']").toggle();
    },
    "click .boton-simple.label-success"() {
        $(".item[id='-1']").toggle();
    },
    "click .boton-simple.glyphicon-edit, click .boton-simple.glyphicon-plus"() {
        $(".item[id='-1']").toggle();
    },
    "click .boton-simple.glyphicon-trash"() {
        $("#modalconfirmareliminaciontarea").modal("show");
    }
})