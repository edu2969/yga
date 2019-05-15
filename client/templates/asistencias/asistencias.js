var EDITING_KEY = 'asistencias';
Session.setDefault(EDITING_KEY, false);

// Track if this is the first time the list template is rendered
var firstRender = true;
var listRenderHold = LaunchScreen.hold();
listFadeInHold = null;

Template.asistencias.rendered = function () {
  Session.set('NavigationPath', false);
  loadGlobalChart();
  var initial = moment();
  $('.datetimepicker-component').datetimepicker({
    viewMode: 'months',
    format: 'MMMM \'YY',
    defaultDate: initial.toDate()
  });
  Session.set("AssistanceParams", moment(initial.toDate()).format("MM/YY"));
  Session.set("PeriodoResumen", initial.format("MMMM'YY"));
  
  if(Meteor.user().profile.role<=2) {
    bioId = -1;
  } else {
    bioId = Meteor.users.findOne({ "profile.prioridad": 1 }).profile.bioId;
  }
}

Template.asistencias.events({
  'click #tab-global': function (e) {
    e.preventDefault();
    $('#tab-global').addClass('active');
    $('#tab-colaborator').removeClass('active');
    $('#div-colaborator').hide();
    loadGlobalChart();
  },
  'click #tab-colaborator': function (e) {
    e.preventDefault();
    $('#tab-global').removeClass('active');
    $('#tab-colaborator').addClass('active');
    var id = $("#select-colaborator").children(":selected").attr("id");
    loadColaboratorsChart(id);
    $('#div-colaborator').show();
  },
  'change #select-colaborator': function (e) {
    var id = $("#select-colaborator").children(":selected").attr("id");
    loadColaboratorsChart(id);
    $('#div-colaborator').show();
  },
  'click .btn-view': function (e) {
    var periodo = moment($("#input-periodo").val(), "MMMM\'YY").format("MM/YY");
    selectHTML = document.getElementById('filter-rrhh-id');
    var bioId = selectHTML.options[selectHTML.selectedIndex].id;

    Session.set('BiometryId', Number(bioId));
    Session.set('AssistanceParams', periodo);
    AddNav('/asistencias');
    Router.go('/asistenciaDetalle');
  },
  'click .btn-import': function () {
    AddNav('/asistencias')
    Router.go('/importarAsistencia')
  },
  "change #filter-rrhh-id, dp.change .datetimepicker-component": function () {
    Session.set("AssistanceParams", moment($("#input-periodo").val(), "MMMM\'YY").format("MM/YY"));
    Session.set("PeriodoResumen", $("#input-periodo").val());
    var bioId = Number($("#filter-rrhh-id").children(":selected").attr("id"));
    Session.set("BiometryId", bioId);
    if(bioId==-1) {
      $(".btn-view").attr("disabled", "disabled");
    } else {
      $(".btn-view").removeAttr("disabled");
    }
  },
  "click #btn-reporte": function(e) {
    e.preventDefault();
    var periodo = Session.get('AssistanceParams');
    if (!periodo) return null;
    var bioId = Session.get('BiometryId');
    Meteor.call('ObtenerPDF', 'simen', 'asistencia', { "periodo": periodo, "bioId": bioId }, function(err, res){
      var dl = document.createElement("a");
      dl.href = "data:application/pdf;base64, " + res;
      if(bioId==-1) {
        dl.download = "asistencia_" + periodo;
      } else {
        dl.download = "asistencia_" + periodo + "_" + Normalizar(Meteor.users.findOne({ "profile.bioId": bioId }).profile.name.toLowerCase().replace(/\ /g, "_"));
      }      
      document.body.appendChild(dl);
      dl.click();
      document.body.removeChild(dl);
    });
  }
});

Template.asistencias.helpers({
  chart: function () {
    return Session.get('ChartParams');
  },
  colaborators: function () {
    var periodo = Session.get("PeriodoResumen")
    if (!periodo) return false;
    var fecha = moment(periodo, "MMMM'YY")
    var mes = fecha.month()
    var anyo = fecha.year()
    return Meteor.users.find({
      "profile.role": 6,
      "profile.prioridad": { $exists: true },
      "profile.desvinculado": {
        $not: true
      }
    }, { sort: { "profile.prioridad": 1 }}).map(function (o, i) {
      var reg = BIAsistencias.findOne({
        userId: o._id,
        month: mes,
        year: anyo
      });
      o.hhNormal = reg ? reg.hhNormal : 0;
      o.hh50 = reg ? reg.hhExt50 : 0;
      o.hh100 = reg ? reg.hhExt100 : 0;
      // La tabla muestra horas compensadas
      if (o.hhNormal < 0) {
        if (-1 * o.hhNormal > o.hh50) {
          o.hhNormal = o.hhNormal + o.hh50
          o.hh50 = 0
        } else {
          o.hh50 = o.hh50 + o.hhNormal
          o.hhNormal = 0
        }
      }
      // Si aún no son cubiertas, se cubren con HH al 100%
      if (o.hhNormal < 0) {
        if (-1 * o.hhNormal > o.hh100) {
          o.hhNormal = o.hhNormal + o.hh100
          o.hh100 = 0
        } else {
          o.hh100 = o.hh100 + o.hhNormal
          o.hhNormal = 0
        }
      }
      return o;
    });
  },
  periodo: function () {
    return Session.get("PeriodoResumen")
  },
  esGerente: function() {
    return Meteor.user() && Meteor.user().profile.role <= 2;
  },
  puedeImportar: function() {
    return Meteor.user() && Meteor.user().profile.role <= 3;
  }
});


// *****************************************
// Graficos de Reportabilidad


function loadGlobalChart() {
  Session.set('ChartParams', {
    title: 'HH Globales',
    subtitle: 'Historico Anual'
  });
  var margin = {
      top: 40,
      right: 72,
      bottom: 72,
      left: 40
    },
    width = $('.chart-wrapper').width() - margin.left - margin.right,
    height = 320 - margin.top - margin.bottom;

  var x = d3.time.scale().range([0, width]);
  var y = d3.scale.linear().range([height, 0]);

  var xAxis = d3.svg.axis().scale(x).orient("bottom").ticks(12).tickFormat(ES_LOCAL.timeFormat("%b"));
  var yAxis = d3.svg.axis().scale(y).orient("left").ticks(5);

  var line = d3.svg.line()
    .x(function (d) {
      return x(d.date);
    })
    .y(function (d) {
      return y(d.hhExt50);
    });

  var line2 = d3.svg.line()
    .x(function (d) {
      return x(d.date);
    })
    .y(function (d) {
      return y(d.hhExt100);
    });

  d3.selectAll("#chart-container > *").remove();

  var div = d3.select("#chart-container")
    .append("div") // declare the tooltip div
    .attr("class", "d3-tip") // apply the 'tooltip' class
    .style("opacity", 0);

  var svg = d3.select("#chart-container")
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform",
      "translate(" + margin.left + "," + margin.top + ")");

  // Get the data
  data = getDataGlobal();
  if (data.length == 0) return;

  // Scale the range of the data
  x.domain(d3.extent(data, function (d) {
    return d.date;
  }));
  y.domain([0, d3.max(data, function (d) {
    return Math.max(Math.round(d.hhExt50 > d.hhExt100 ? d.hhExt50 : d.hhExt100));
  })]);

  var focus = svg.append("g")
    .attr('class', 'circleInfo')
    .style("display", "none");

  focus.append("circle")
    .attr("class", "y0")
    .style("fill", "#E9D460")
    .style("stroke", "#E9D460")
    .attr("r", 6);

  focus.append("circle")
    .attr("class", "y1")
    .style("fill", "rgba(192, 57, 43,1.0)")
    .style("stroke", "rgba(192, 57, 43,1.0)")
    .attr("r", 6);

  svg.append("path")
    .attr("class", "line line1")
    .transition()
    .attr("d", line(data));

  svg.append("path") // Add the valueline2 path.
    .attr("class", "line line2")
    .style("stroke", "rgba(192, 57, 43,1.0)")
    .transition()
    .attr("d", line2(data));

  svg.append("g")
    .attr("class", "x axis")
    .attr("transform", "translate(0," + height + ")")
    .call(xAxis)
    .selectAll("text")
    .style("text-anchor", "end")
    .attr("dx", "-.8em")
    .attr("dy", ".15em")
    .attr("transform", function (d) {
      return "rotate(-65)"
    });

  svg.append("g")
    .attr("class", "y axis")
    .style("fill", "#34495e")
    .call(yAxis)
    .append("text")
    .attr("y", 6)
    .attr("dy", "-2em")
    .attr("dx", "2em")
    .style("text-anchor", "end")
    .text("HHExtras")

  svg.append("rect")
    .attr("width", width)
    .attr("height", height)
    .style("fill", "none")
    .style("pointer-events", "all")
    .on("mouseover", function () {
      focus.style("display", null);
    })
    .on("mouseout", function () {
      focus.style("display", "none");
      div.transition()
        .duration(500)
        .style("opacity", 0)
    })
    .on("mousemove", mousemove)
    .on("click", function () {
      var x0 = x.invert(d3.mouse(this)[0]),
        i = bisectDate(data, x0, 1),
        d0 = data[i - 1],
        d1 = data[i],
        d = x0 - d0.date > d1.date - x0 ? d1 : d0;
      loadTopHHExtBar(d.date);
    });


  var bisectDate = d3.bisector(function (d) {
    return d.date;
  }).left;

  function mousemove() {
    var div = d3.selectAll('.d3-tip');
    var x0 = x.invert(d3.mouse(this)[0]),
      i = bisectDate(data, x0, 1),
      d0 = data[i - 1],
      d1 = data[i],
      d = x0 - d0.date > d1.date - x0 ? d1 : d0;

    focus.select("circle.y0")
      .attr("transform",
        "translate(" + x(d.date) + "," +
        y(d.hhExt50) + ")");

    focus.select("circle.y1")
      .attr("transform",
        "translate(" + x(d.date) + "," +
        y(d.hhExt100) + ")");

    div.transition()
      .duration(500)
      .style("opacity", 0);
    div.transition()
      .duration(200)
      .style("opacity", .9)
      // Lógica de ubicar tooltip en las orillas
    var xini = x(d.date) - 40
    var yini = $('.titulo-asistencia').height() + $('#select-colaborador').height() + y(d.hhExt50) + 116
    if (i < data.length / 3) {
      div.attr('class', 'd3-tip izquierda')
      xini = xini + 115
    } else if (i > data.length * 2 / 3) {
      div.attr('class', 'd3-tip derecha')
      xini = xini - 64
    } else {
      div.attr('class', 'd3-tip arriba')
      xini = xini + 26
      yini = yini - 52
    }
    div.html(
        "<b>" + moment(d.date).format('MMM\'YY') +
        "</b><br/><span style='color:rgba(243, 156, 18,1.0)'>HH 50%: <b>" + Number(d.hhExt50) + " hrs</b></span>" +
        "<br/><span style='color:rgba(192, 57, 43,1.0)'>HH50%: <b>" + Number(d.hhExt100) + " hrs</b></span>")
      .style("left", xini + "px")
      .style("top", yini + "px")
  }
}

function loadColaboratorsChart(idUser) {
  var user = Meteor.users.findOne(idUser);
  Session.set('ChartParams', {
    title: 'HH para ' + user.profile.name,
    subtitle: 'Historico Anual'
  });
  var margin = {
      top: 40,
      right: 72,
      bottom: 72,
      left: 40
    },
    width = $('.chart-wrapper').width() - margin.left - margin.right,
    height = 320 - margin.top - margin.bottom;

  var x = d3.time.scale().range([0, width]);
  var y = d3.scale.linear().range([height, 0]);

  var xAxis = d3.svg.axis().scale(x).orient("bottom").ticks(12).tickFormat(ES_LOCAL.timeFormat("%b"));
  var yAxis = d3.svg.axis().scale(y).orient("left").ticks(5);

  var line = d3.svg.line()
    .x(function (d) {
      return x(d.date);
    })
    .y(function (d) {
      return y(d.hhExt50);
    });

  var line2 = d3.svg.line()
    .x(function (d) {
      return x(d.date);
    })
    .y(function (d) {
      return y(d.hhExt100);
    });

  d3.selectAll("#chart-container > *").remove();

  var div = d3.select("#chart-container")
    .append("div") // declare the tooltip div
    .attr("class", "d3-tip") // apply the 'tooltip' class
    .style("opacity", 0);

  var svg = d3.select("#chart-container")
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform",
      "translate(" + margin.left + "," + margin.top + ")");

  // Get the data
  data = getDataUser(user._id);
  if (data.length == 0) return;

  // Scale the range of the data
  x.domain(d3.extent(data, function (d) {
    return d.date;
  }));
  y.domain([0, d3.max(data, function (d) {
    return Math.max(Math.round(d.hhExt50 > d.hhExt100 ? d.hhExt50 : d.hhExt100));
  })]);

  var focus = svg.append("g")
    .attr('class', 'circleInfo')
    .style("display", "none");

  focus.append("circle")
    .attr("class", "y0")
    .style("fill", "#E9D460")
    .style("stroke", "#E9D460")
    .attr("r", 4);

  focus.append("circle")
    .attr("class", "y1")
    .style("fill", "rgba(192, 57, 43,1.0)")
    .style("stroke", "rgba(192, 57, 43,1.0)")
    .attr("r", 4);

  svg.append("path")
    .attr("class", "line line1")
    .transition()
    .attr("d", line(data));

  svg.append("path") // Add the valueline2 path.
    .attr("class", "line line2")
    .style("stroke", "rgba(192, 57, 43,1.0)")
    .transition()
    .attr("d", line2(data));

  svg.append("g")
    .attr("class", "x axis")
    .attr("transform", "translate(0," + height + ")")
    .call(xAxis)
    .selectAll("text")
    .style("text-anchor", "end")
    .attr("dx", "-.8em")
    .attr("dy", ".15em")
    .attr("transform", function (d) {
      return "rotate(-65)"
    });

  svg.append("g")
    .attr("class", "y axis")
    .style("fill", "#34495e")
    .call(yAxis)
    .append("text")
    .attr("y", 6)
    .attr("dy", "-2em")
    .attr("dx", "2em")
    .style("text-anchor", "end")
    .text("HHExtras")

  svg.append("rect")
    .attr("width", width)
    .attr("height", height)
    .style("fill", "none")
    .style("pointer-events", "all")
    .on("mouseover", function () {
      focus.style("display", null);
    })
    .on("mouseout", function () {
      focus.style("display", "none");
      div.transition()
        .duration(500)
        .style("opacity", 0)
    })
    .on("mousemove", mousemove)
    .on("click", function () {
      var x0 = x.invert(d3.mouse(this)[0]),
        i = bisectDate(data, x0, 1),
        d0 = data[i - 1],
        d1 = data[i],
        d = x0 - d0.date > d1.date - x0 ? d1 : d0;
      var bioId = Meteor.users.findOne(idUser).profile.bioId;
      Session.set('BiometryId', bioId);
      Session.set('AssistanceParams', (d.date.getMonth() + 1) + '/' + d.date.getFullYear());
      Router.go("/asistenciaDetalle");
    });


  var bisectDate = d3.bisector(function (d) {
    return d.date;
  }).left;

  function mousemove() {
    var div = d3.selectAll('.d3-tip');
    var x0 = x.invert(d3.mouse(this)[0]),
      i = bisectDate(data, x0, 1),
      d0 = data[i - 1],
      d1 = data[i],
      d = x0 - d0.date > d1.date - x0 ? d1 : d0;

    focus.select("circle.y0")
      .attr("transform",
        "translate(" + x(d.date) + "," +
        y(d.hhExt50) + ")");

    focus.select("circle.y1")
      .attr("transform",
        "translate(" + x(d.date) + "," +
        y(d.hhExt100) + ")");

    div.transition()
      .duration(500)
      .style("opacity", 0);
    div.transition()
      .duration(200)
      .style("opacity", .9)
      // Lógica de ubicar tooltip en las orillas
    var xini = x(d.date) - 40
    var yini = $('.titulo-asistencia').height() + y(d.hhExt50) + 116
    if (i < data.length / 3) {
      div.attr('class', 'd3-tip izquierda')
      xini = xini + 115
    } else if (i > data.length * 2 / 3) {
      div.attr('class', 'd3-tip derecha')
      xini = xini - 64
    } else {
      div.attr('class', 'd3-tip arriba')
      xini = xini + 26
      yini = yini - 52
    }
    div.html(
        "<b>" + moment(d.date).format('MMM\'YY') +
        "</b><br/><span style='color:#E9D460'>HH 50%: <b>" + Number(d.hhExt50) + " hrs</b></span>" +
        "<br/><span style='color:rgba(192, 57, 43,1.0)'>HH50%: <b>" + Number(d.hhExt100) + " hrs</b></span>")
      .style("left", xini + "px")
      .style("top", yini + "px")
  }
}

function loadTopHHExtBar(date) {
  Session.set('ChartParams', {
    title: 'Top 10 HH',
    subtitle: 'Mes de ' + moment(date).format('MMMM\'YY')
  });

  var margin = {
      top: 20,
      right: 48,
      bottom: 80,
      left: 36
    },
    width = $('.chart-wrapper').width() - margin.left - margin.right,
    height = 280 - margin.top - margin.bottom;

  var x = d3.scale.ordinal().rangeRoundBands([0, width], .1);
  var y = d3.scale.linear().range([height, 0]);

  var xAxis = d3.svg.axis()
    .scale(x)
    .orient("bottom")
    .tickFormat(function (d) {
      return d;
    });
  // create left yAxis
  var yAxis = d3.svg.axis().scale(y).ticks(4).orient("left");

  d3.selectAll("#chart-container > *").remove();

  var svg = d3.select('#chart-container').append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("class", "graph")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

  var data = getDataTopHHExt(date);
  console.log(JSON.stringify(data));

  x.domain(data.map(function (d) {
    return d.name;
  }));

  y.domain([0, d3.max(data, function (d) {
    return d.hhExt50 > d.hhExt100 ? d.hhExt50 : d.hhExt100;
  })]);

  svg.append("g")
    .attr("class", "x axis")
    .attr("transform", "translate(0," + height + ")")
    .call(xAxis)
    .selectAll("text")
    .style("text-anchor", "end")
    .attr("dx", "-.8em")
    .attr("dy", ".15em")
    .attr("transform", function (d) {
      return "rotate(-65)"
    });

  svg.append("g")
    .attr("class", "y axis axisLeft")
    .attr("transform", "translate(0,0)")
    .call(yAxis)
    .append("text")
    .attr("y", 6)
    .attr("dy", "-2em")
    .text("Horas Extras");

  var tooltip = d3.select('#chart-container').append("g").attr("class", "d3-tip arriba")
    .style("display", "none");

  var bars = svg.selectAll(".bar").data(data).enter();

  bars.append("rect")
    .attr("class", "bar1")
    .attr("x", function (d) {
      return x(d.name);
    })
    .attr("width", x.rangeBand() / 2)
    .attr("y", function (d) {
      return y(d.hhExt50);
    })
    .attr("height", function (d, i, j) {
      return height - y(d.hhExt50);
    })
    .on("mouseover", function () {
      tooltip.style("display", null);
    })
    .on("mouseout", function () {
      tooltip.style("display", "none");
    })
    .on("mousemove", mousemove)
    .on("click", clickbar);

  bars.append("rect")
    .attr("class", "bar2")
    .attr("x", function (d) {
      return x(d.name) + x.rangeBand() / 2;
    })
    .attr("width", x.rangeBand() / 2)
    .attr("y", function (d) {
      return y(d.hhExt100);
    })
    .attr("height", function (d, i, j) {
      return height - y(d.hhExt100);
    })
    .on("mouseover", function () {
      tooltip.style("display", null);
    })
    .on("mouseout", function () {
      tooltip.style("display", "none");
    })
    .on("mousemove", mousemove)
    .on("click", clickbar);

  function mousemove(d) {
    var xPosition = d3.mouse(this)[0];
    var yPosition = d3.mouse(this)[1];
    tooltip.style("left", (xPosition - 10) + "px")
      .style("top", (yPosition + 66) + "px");
    tooltip.html(
      d.name +
      "<br/><span style='color:#E9D460'>HH 50%: " + d.hhExt50 + " hrs</span>" +
      "<br/><span style='color:rgba(192, 57, 43,1.0)'>HH50%: " + d.hhExt100 + " hrs</span>");
  }

  function clickbar(d) {
    var bioId = Meteor.users.findOne({
      "profile.name": d.name
    }).profile.bioId;
    Session.set('BiometryId', bioId);
    Session.set('AssistanceParams', (date.getMonth() + 1) + '/' + date.getFullYear());
    Router.go("/asistenciaDetalle");
  }
}

// *****************************************
// GET-DATA

function getDataGlobal() {
  var data = [];

  var from = moment().subtract(11, 'months');
  var acum50 = {},
    acum100 = {};

  while (from < moment().endOf("month")) {
    var regs = BIAsistencias.find({
      year: from.get('year'),
      month: from.get('month')
    });

    var xvalue = new Date(from.get('year'), from.get('month'), 1).getTime();
    acum50[xvalue] = 0;
    acum100[xvalue] = 0;

    regs.forEach(function (reg) {
      acum50[xvalue] += reg.hhExt50;
      acum100[xvalue] += reg.hhExt100;
    });

    from.add(1, 'months')
  }

  for (var key in acum50) {
    if (acum50.hasOwnProperty(key)) {
      data.push({
        date: new Date(Number(key)),
        hhExt50: Number(acum50[key]),
        hhExt100: Number(acum100[key])
      });
    }
  }
  return data;
}

function getDataTopHHExt(date) {
  var data = [];

  var regs = BIAsistencias.find({
    month: date.getMonth(),
    year: date.getFullYear()
  }, {
    sort: {
      hhExt50: -1
    }
  });

  regs.forEach(function (reg) {
    if (Meteor.users.findOne(reg.userId)) {
      data.push({
        name: Meteor.users.findOne(reg.userId).profile.name,
        hhExt50: reg.hhExt50,
        hhExt100: reg.hhExt100
      });
    }
  });

  return data;
}

function getDataUser(idUser) {
  var data = [],
    from = moment().subtract(12, 'months'),
    acum50 = {},
    acum100 = {};

  while (from < moment().subtract(1, 'months')) {
    var regs = BIAsistencias.find({
      userId: idUser,
      year: from.get('year'),
      month: from.get('month')
    });

    var xvalue = new Date(from.get('year'), from.get('month'), 1).getTime();
    acum50[xvalue] = 0;
    acum100[xvalue] = 0;

    regs.forEach(function (reg) {
      acum50[xvalue] += reg.hhExt50;
      acum100[xvalue] += reg.hhExt100;
    });

    from.add(1, 'months')
  }

  for (var key in acum50) {
    if (acum50.hasOwnProperty(key)) {
      data.push({
        date: new Date(Number(key)),
        hhExt50: Number(acum50[key]),
        hhExt100: Number(acum100[key])
      });
    }
  }
  return data;
}