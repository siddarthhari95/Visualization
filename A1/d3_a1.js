
/* ASSIGN DEFAULT BIN COUNT TO 5 */
var binsCount = parseInt(d3.select("#binSize").property("value"));

/* CREATE A DEFAULT SVG WHICH WILL BE OVERRIDEN INSIDE BARGRAPH() AND PIECHART() FUNCTIONS */
var svg = d3.select("svg"),
      margin = 200,
      width = svg.attr("width") - margin,
      height = svg.attr("height") - margin;
g = svg.append("g").attr("transform", "translate(" + 10 + "," + 20 + ")");

/* TOOLTIP SHOWS THE TEXT OF THE HOVERED WINDOW (BAR/PIE) */
var tooltip = d3.select("body").append("div").attr("class", "tooltip");

/* CREATE X AND Y AXES BY SCALELINEAR*/
var x = d3.scaleLinear().rangeRound([0, width]);
var y = d3.scaleLinear();

/* BEGIN CSV READ */
pi = false;
d3.csv("College.csv", function (data) {
  data = data.slice(0, 500)
  var attrs = d3.values(data)[0]
  
  /* CREATE PIE CHART */
  function piechart(column)
  {
    /* CREATE DATA FOR PIE CHART USING THE COLUMN SELECTED FROM THE DROP DOWN */
    map = data.map(function(d,i){ return (+d[column]); })
    
    /* CREATE X AXIS DOMAIN */
    x.domain([d3.min(map),d3.max(map)]);
    
    /* CREATE BINS USING HISTOGRAMBAR-GRAPH OF D3 WHICH USED BINS COUNT FROM SLIDER */ 
    var bins = d3.histogram()
        .domain(x.domain())
        .thresholds(binsCount)(map);

    /* CREATE Y AXIS DOMAIN AND RANGE USING BINS FROM ABOVE */
    y.domain([0, d3.max(bins, function(d) { return d.length; })])
        .range([height, 0]);

    var color = d3.scaleOrdinal(d3.schemeCategory20c);

    /* GIVE THE SPECIFICATIONS FOR PIECHART SVG */
    var svg = d3.select("body").append("svg").attr("id", "piechart")
            .attr("width", 1200).attr("height", 600),
            width = svg.attr("width"),
            height = svg.attr("height"),
            radius = 200;
    
    /* PROVIDE HE COLOR FOR SVG AND TRANSLATE TO FIT IN THE CENTER OF THE SCREEN */
    svg.append("rect")
        .attr("width", "100%")
        .attr("height", "100%")
        .attr("fill", "#E0FFFF")
        .attr("transform","translate(240,20)");
    svg.append("text")
        .attr("transform", "translate(300,0)")
        .attr("x", 10)
        .attr("y", 50)
        .attr("font-size", "24px")
        .text("U.S. News and World Report's College Data");
    var g = svg.append("g")
    .attr("transform", "translate(" + width/2 + "," + height/2 + ")");
    
    /* CREATE THE PIE CHART USING PIE() FUNCTION OF D3 */
    pie = d3.pie()
            .value(function(d){
                return d.length;
            });
    /* CREATE AN ARC VARIABLE USING INNER AND OUTER RADIUS */
    cir = d3.arc().outerRadius(radius).innerRadius(0);
    /* CREATE AN ARC VARIABLE USING INNER AND OUTER RADIUS FOR HIGHLIGHT OF THE SELECTED ARC*/
    cir2 = d3.arc().outerRadius(radius+20).innerRadius(0);

    /* CREATE ARCS USING THE BINS,cir FROM ABOVE */
    /* HIGHLIGHT THE ARCS AND DISPLAY THE VALUE USING cir2 ARC LABEL */
    arc = g.selectAll(".arc").data(pie(bins)).enter().append("g")
            .append("path").attr("d", cir).attr("transform", "translate(120, -10)")
            .attr("fill", function(d, i){ return color(i)})
            .on("mouseover", function(d){
            d3.select(this).transition()
              .duration(400)
              .attr("d", cir2);
            tooltip
              .style("left", d3.event.pageX - 50 + "px")
              .style("top", d3.event.pageY - 70 + "px")
              .style("display", "inline-block")
              .html(d.data.length);
            })
            .on("mouseout", function(d, i){
              tooltip.style("display", "none");
              d3.select(this).transition()
              .duration(400)
              .attr("d", cir);
            });
  }
  /* END OF PIE CHART IMPLEMENTATION */

  /* BAR CHART IMPLEMENTATION */
  function bargraph(column){
    /* COLUMN ARGUMENT COMES FROM THE DROP DOWN SELECTION */

    /* CREATE AN SVG IN BODY TAG OF HTML AND ASSIGN WIDTH AND HEIGHT OF THE SAME */
    svg = d3.select("body").append("svg").attr("id", "bargraph")
            .attr("width", 1200).attr("height", 500)
            .attr("x", 200)
    /* THIS SNIPPET GIVES COLOR TO THE ABOVE CREATED SVG */
    svg.append("rect")
        .attr("width", "100%")
        .attr("height", "100%")
        .attr("fill", "#E0FFFF")
        .attr("transform","translate(270,20)");
    svg.append("text")
        .attr("transform", "translate(300,0)")
        .attr("x", 10)
        .attr("y", 50)
        .attr("font-size", "24px")
        .text("U.S. News and World Report's College Data");
    var g = svg.append("g").attr("transform", "translate(" + 160 + "," + 20 + ")");
    
    /* CREATE THE DATA THAT NEEDS TO BE BINNED WITHIN A RANGE */
    map = data.map(function(d,i){ return (+d[column]); })
    /* CREATE THE X AXIS DOMAIN */
    x.domain([d3.min(map),d3.max(map)]);

    /* CREATE BINS USING HISTOGRAM/BAR-GRAPH OF D3 WHICH USED BINS COUNT FROM SLIDER */ 
    var bins = d3.histogram()
        .domain(x.domain())
        .thresholds(binsCount)(map);
    
    /* CREATE THE X AXIS DOMAIN AND RANGE*/
    y.domain([0, d3.max(bins, function(d) { return d.length; })])
        .range([height, 0]);

    /* SCALE THE X AND Y AXIS TO FIT INTO THE SVG */
    g.append("g")
    .attr("class", "axis axis--x")
    .call(d3.axisBottom().scale(x))
    .attr("transform", "translate(160," + 400 + ")");
    g.append("g")
        .call(d3.axisLeft().scale(y))
        .attr("transform", "translate(160," + 100+ ")");
    
    /* CREATE THE BAR GRAPH WITH ABOVE BINS */
    var bar = g.selectAll(".bar")
              .data(bins)
              .enter().append("g")
              .attr("class", "bar")
              .attr("transform", function(d) {
                return "translate(" + x(d.x0) + "," + y(d.length) + ")"; 
              });
    /* TRANSLATE THE BAR GRAPH TO FIT WITHIN THE AXES/SVG AND PROVIDE MOUSEOVER AND MOUSEOUT FEATURES */ 
    bar.append("rect")
        .attr("width", function(d) { return (x(d.x1) - x(d.x0) - 5)})
        .attr("height", function(d) { return height - y(d.length); })
        .attr("transform", "translate(161, 100)")
        .on("mouseover", onMouseOver)
        .on("mouseout", onMouseOut)
        .transition()
        .ease(d3.easeLinear)
        .duration(200)
        .delay(function(d, i){ return i*50; });
    bar.transition().duration(300)
      .attr("y", function(d, i){ return y(d.length); })
      .attr("height",function(d, i){ return height - y(d.length); })
    bar.exit().remove();
  };
  /* END OF BAR CHART IMPLEMENTATION */

  /* CHANGE FROM BAR TO PIE FUNCTIONALITY */
  var change = d3.select("#button").on("click", changeChart);
  var selectfrom = d3.select("#drop")
                      .insert("select", "svg")
                      .on("change", updategraph);
  var attributes = Object.keys(attrs);

  /* DEFAULT VALUE OF THE DROP DOWN */
  var optionName = "Enroll";
  selectfrom.selectAll("drop")
            .data(attributes)
            .enter()
            .append("option")
            .attr("value", function(d){ return d; })
            .property("selected", function(d){ return d===optionName; })
            .text(function(d){ return d; })

  /* GET THE VALUE FROM SLIDER AND POPULATE THE NUMBER OF BIN */
  d3.select("#binSize").on("input", getBins);
  function getBins()
  {
    var sliderInput = d3.select(this).property("value");
    binsCount = parseInt(sliderInput);
    console.log(binsCount);
    updategraph();
  }

  /* DEFAULT CALL TO CREATE THE FIRST GRAPH */
  updategraph()

  /* UPDATEGRAPH FUNCTION CHANGES THE GRAPH BASED ON PIE OR BIN CHANGE */
  function updategraph()
  {
    // console.log(binsCount);
    d3.select("#piechart").remove();
    d3.select("#bargraph").remove();
    col = d3.select('select').property('value');

    if(pi === true)
    {
      piechart(col);
    }
    else
    {
      bargraph(col);
    }
  }

  /* THIS FUNCTION GETS CALLED WHEN CHANGE CHART BUTTON IS CLICKED */
  function changeChart()
  {
    /* CHANGES THE BOOLEAN VALUE OF PIE WHETHER TO SHOW OR NOT. BASICALLY A TOGGLE WHEN THE BUTTON GETS CLICKED*/
    if(pi === true)
    {
      pi = false;
    }
    else
    {
      pi = true;
    }
    /* THEN CALL UPDATEGRAPH */
    updategraph();
  }
});
/* END CSV READ */

/* BELOW FUNCTION IMPLEMENTS THE MOUSE_OVER LOGIC FOR BAR GRAPH */
function onMouseOver(d, i) {
      rect = d3.select(this).attr('class', 'hover'); 
      rect.transition()
        .duration(400)
        .attr("width", x(d.x1) - x(d.x0))
        .attr("height", function(d) { return height - y(d.length) + 10; })
        .attr("transform", "translate(161,90)");

      g.append("g").append("text")
      .attr('class', 'val')
      .attr('x', function() {
          console.log((i+1)*(x(d.x1) - x(d.x0) ) - 250);
          return (i+1)*(x(d.x1) - x(d.x0) ) + 50;
      })
      .attr('y', function() { 
        console.log(y(d.length) + 10);
        return y(d.length) + 105; 
      });
      tooltip
        .style("left", d3.event.pageX - 50 + "px")
        .style("top", d3.event.pageY - 70 + "px")
        .style("display", "inline-block")
        .html(d.length);
    }

/* BELOW FUNCTION IMPLEMENTS THE MOUSE_OOUT LOGIC FOR BAR GRAPH */
function onMouseOut(d, n){
  tooltip.style("display", "none");
  d3.select(this).attr('class', 'bar');
  d3.select(this).transition().duration(400)
  /* RETAIN THE ORIGINAL VALUES ON MOUSE OUT*/
  .attr('width', x(d.x1) - x(d.x0) -5)
  .attr("height", function(){ return height - y(d.length); })
  .attr("transform", "translate(161, 100)");
  d3.selectAll('.val').remove()
}