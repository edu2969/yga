
Grafico = function(selector) {
  this.selector = selector;

  this.initLinearChart = function() {
    console.log("POr qaui paso");
    var margin = {
        top: 140,
        right: 60,
        bottom: 180,
        left: 40
      },
      width = $(this.selector).width() - margin.left - margin.right,
      height = $(this.selector).height() - margin.top - margin.bottom;

    var x = d3.time.scale().range([0, width]);
    var y = d3.scale.linear().range([height, 0]);

    // Obtiene la data
    var data = getVentas();

    var mascara = 'ddd DD';

    var xAxis = d3.svg.axis().scale(x)
    .orient("bottom")
    .tickFormat(function(d){
        return moment(d).format(mascara);
    })
    .ticks(5);

    var yAxis = d3.svg.axis().scale(y).tickFormat(function (d) {
      return d >= 1000 ? Math.floor(d / 1000) + 'k' : d
    }).ticks(5).orient("left");

    var line = d3.svg.line()
      .defined(function (d) {
        return !isNaN(d.vendido);
      })
      .interpolate("cubic")
      .x(function (d) {
        return x(d.fecha);
      })
      .y(function (d) {
        return y(d.vendido);
      });

    d3.selectAll(this.selector + " > *").remove();
    var svg = d3.select("#grafico-ventas")
      .append("svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
      .attr("style", "witdh: " + width + margin.left + margin.right
        + "px; height: " + height + margin.top + margin.bottom + "px;")
      .append("g")
      .attr("transform",
        "translate(" + margin.left + "," + margin.top + ")");

    var div = d3.select(this.selector)
      .append("div") // declare the tooltip div
      .attr("class", "d3-tip") // apply the 'tooltip' class
      .style("opacity", 0);

    // Si no hay datos
    if(data.length <= 1) {
      svg.append("text")
        .attr("text-align", "center")
        .attr("font-size", "24px")
        .text("No hay suficientes lecturas aún");
      return;
    }
    //console.log(JSON.stringify(data));

    // Scale the range of the data
    x.domain(d3.extent(data, function (d) {
      return d.fecha;
    }));
    y.domain([0, d3.max(data, function (d) {
      return Math.max(Math.floor(d.vendido));
    })]);

    svg.append("path")
      .attr("class", "line")
      .transition()
      .attr("d", line(data));

    svg.append("g")
      .attr("class", "x axis")
      .style("fill", "white")
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
      .style("fill", "white")
      .call(yAxis)
      .append("text")
      .attr("y", 6)
      .attr("dy", "-1em")
      .attr("dx", "3em")
      .style("text-anchor", "end")
      .style("font-size", "30px")
      .text("Ventas");

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
        div.style("opacity", 0)
      })
      .on("mousemove", mousemove)
      /*.on("click", function () {
        var x0 = x.invert(d3.mouse(this)[0]),
          i = bisectDate(data, x0, 1),
          d0 = data[i - 1],
          d1 = data[i],
          d = x0 - d0.date > d1.date - x0 ? d1 : d0;
        alert("1:" + JSON.stringify(d));
      });*/

    svg.selectAll(".dot")
        .data(data)
      .enter().append("circle") // Uses the enter().append() method
        .attr("class", "dot") // Assign a class for styling
        .attr("cx", function(d) { return x(d.fecha) })
        .attr("cy", function(d) { return y(d.vendido) })
        .attr("r", 8);

    var focus = svg.append("g")
      .attr('class', 'circleInfo')
      .style("display", "none");

    focus.append("circle")
      .attr("class", "y")
      .style("fill", "yellow")
      .style("stroke", "yellow")
      .attr("r", 8);

    var bisectDate = d3.bisector(function (d) {
      return d.fecha;
    }).left;

    function mousemove() {
      var div = d3.selectAll('.d3-tip');
      var x0 = x.invert(d3.mouse(this)[0]);
      var i = bisectDate(data, x0, 1);
      if(!data[i]) return;
      var d0 = data[i - 1],
        d1 = data[i],
        d = x0 - d0.fecha > d1.fecha - x0 ? d1 : d0;

      focus.select("circle.y")
        .attr("transform",
          "translate(" + x(d.fecha) + "," +
          y(d.vendido) + ")");

      div.transition()
        .duration(500)
        .style("opacity", 0);
      div.transition()
        .duration(200)
        .style("opacity", .9)

      // Lógica de ubicar tooltip en las orillas
      var xini = x(d.fecha) - 20;
      var yini = y(d.vendido) + 114;
      if( i < data.length / 3 ) {
        div.attr('class', 'd3-tip izquierda')
        xini = xini + 105
      } else if( i > data.length * 2 / 3 ) {
        div.attr('class', 'd3-tip derecha');
        xini = xini - 48;
      } else {
        div.attr('class', 'd3-tip arriba')
        xini = xini + 26;
        yini = yini - 52;
      }
      div.html(
          moment(d.fecha).format('ddd DD/MMM')
        + "<br/><span style='color:red'>Total: <b>"
        + Number(d.vendido)
        + "</span>"
      )
        .style("left", xini + "px")
        .style("top", yini + "px");
    }
  }

  function getVentas(intervalo) {
    var regs = [
      {
        fecha: new Date("2018-09-01"),
        vendido: 57900
      }, {
        fecha: new Date("2018-09-02"),
        vendido: 87700
      }, {
        fecha: new Date("2018-09-03"),
        vendido: 157420
      }, {
        fecha: new Date("2018-09-04"),
        vendido: 87200
      }, {
        fecha: new Date("2018-09-05"),
        vendido: 125790
      }
    ];

    console.log(regs);
    return regs;
  }

}
