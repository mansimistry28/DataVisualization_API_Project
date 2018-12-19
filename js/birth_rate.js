var width = Math.max(document.documentElement.clientWidth, window.innerWidth || 0),
    height = Math.max(document.documentElement.clientHeight, window.innerHeight || 0);

var svg = d3.select("body")
    .append("svg")
    .style("cursor", "move");

svg.attr("viewBox", "50 10 " + width + " " + height)
    .attr("preserveAspectRatio", "xMinYMin");

var zoom = d3.zoom()
    .on("zoom", function () {
        var transform = d3.zoomTransform(this);
        map.attr("transform", transform);
    });

svg.call(zoom);

var map = svg.append("g")
    .attr("class", "map");

d3.queue()
    .defer(d3.json, "data/map.json")
    .defer(d3.csv, "data/birthrate.csv")
    .await(function (error, world, data) {
        if (error) {
            console.error('you are getting some errors. ' + error);
        }
        else {
            drawMap(world, data);
        }
    });

function drawMap(world, data) {
    // geoMercator projection
    var projection = d3.geoMercator() 
        .scale(130)
        .translate([width / 2, height / 1.5]);

    // geoPath projection
    var path = d3.geoPath().projection(projection);

    //colors for population metrics with legends
    var fillScale = d3.scaleThreshold()
                      .domain([5, 10, 15, 20, 25, 30, 35, 40, 45, 50])
                      .range(["#ffffd9","#edf8b1","#c7e9b4","#7fcdbb","#41b6c4","#1d91c0","#225ea8","#253494","#081d58"]);

    var features = topojson.feature(world, world.objects.countries).features;
    var birthrateById = {};

    //legends for color
    var legendA = d3.legendColor().scale(fillScale);
		
		d3.select("svg")
			.append("g")
			.attr("transform","translate(200,20)")
			.call(legendA);
    
    
    data.forEach(function (d) {
        birthrateById[d.country] = {
            total: d.total,
            pos: d.Pos
          
        }
    });
    features.forEach(function (d) {
        d.details = birthrateById[d.properties.name] ? birthrateById[d.properties.name] : {};
    });

    map.append("g")
        .selectAll("path")
        .data(features)
        .enter().append("path")
        .attr("name", function (d) {
            return d.properties.name;
        })
        .attr("id", function (d) {
            return d.id;
        })
        .attr("d", path)
        .style("fill", function (d) {
            return d.details && d.details.total ? fillScale(d.details.total) : undefined;
        })
        .on('mouseover', function (d) {
            d3.select(this)
                .style("stroke", "black")
                .style("stroke-width", 1)
                .style("cursor", "pointer");

            d3.select('#pos').text(d.details.pos);
            d3.select('#country').text(d.properties.name);
            d3.select('#total').text(d.details.total);
            
            d3.select('#tooltip')
              .style('left', (d3.event.pageX + 20) + 'px')
              .style('top', (d3.event.pageY - 80) + 'px')
              .style('display', 'block')
              .style('opacity', 0.8)
            
            
            d3.select('.details')
                .style('visibility', "visible")
        
        
            d3.select(".total")
                .text(d.details && d.details.total && "total" + d.details.total|| "Not Available");

          
        })
        .on('mouseout', function (d) {
            d3.select(this)
                .style("stroke", null)
                .style("stroke-width", 0.25);
            d3.select('#tip')
                .style('display', 'none');
            d3.select('.details')
                .style('visibility', "hidden");
             
        });
    
}