//%a - abbreviated weekday name.
var formatDate = d3.time.format("%a"),
    formatDay = function(d) {
        return formatDate(new Date(2007, 0, d));
    };
//defines the measureas of the canvas and the eye
var width = 960,
    height = 500,
    outerRadius = height / 2 - 10,
    innerRadius = 120;
//the time scale is mapped to a circle 
var angle = d3.time.scale().range([0, 2 * Math.PI]);
//the radius is mapped to the limits of the inner radius and outer radius
var radius = d3.scale.linear().range([innerRadius, outerRadius]);
//creates a scale for the values 
var scaleDown = d3.scale.linear().range([0, (outerRadius-innerRadius)/3]);

//the color pallettes 
var z = d3.scale.category10();
//construct a new default stacked layout
//This layout sets the y0 attribute for each value in a series
var stack = d3.layout.stack()
//.offset -> specifies the overall baseline algorythm (zero/wiggle)
                     .offset("zero")
//.values  - get or set the values accessor function per series                     
                     .values(function(d) {
                        return d.values; 
                        })
//Specifies how to access the x-coordinate of each value's position
                     .x(function(d) {
                        return d.time;
                        })
                     .y(function(d) {
                        return d.value;
                        });
//.nest groups array elements hierarchically
var nest = d3.nest().key(function(d) {
    return d.key;
});
//create a new radial line generator
var line = d3.svg.line.radial()
//sets the interpolation mode to cardinal-closed = closed Cardinal spline, as in a loop.
                    .interpolate("cardinal-closed")
//sets the angle-accessor to the specified function
                    .angle(function(d) {
                        return angle(d.time);
                        })
//sets the radius-accessor to the specified function
                    .radius(function(d) {
//y0 is the base of the y value of each of the stacked areas
                        return radius(d.y0 + d.y);
                        });
//creates a new area generator
var area = d3.svg.area.radial().interpolate("cardinal-closed")
                                .angle(function(d) {
                                    return angle(d.time);
                                    })
                                .innerRadius(function(d) {
                                    return radius(d.y0);
                                    })
                                .outerRadius(function(d) {
                                    return radius(d.y0 + d.y);
                                    });
//creates the svg canvas
var svg = d3.select("body")
            .append("svg")
            .attr("width", width)
            .attr("height", height)
            .append("g")
            .attr("transform", "translate(" + width / 2 + "," + height / 2 + ")");
//gets the data
d3.csv("data/data.csv", type, function(error, data) {
    //creates layers with the stack layout function and the nest function
    //nest.entries - evaluate the nest operator, returning an array of key values tuples
    var layers = stack(nest.entries(data));
    //define the domains of the scale ranges defined earlier for angle and radius
    // Extend the domain slightly to match the range of [0, 2Ï€].
   
    angle.domain([0, d3.max(data, function(d) {
        return d.time + 1;
    })]);

    var maxData = d3.max(data, function(d) {
        return d.y;
    });
    console.log("maxData: " + JSON.stringify(maxData));
    //goes from 0 to the maximum of the data 
    radius.domain([0, d3.max(data, function(d) {
        return d.y0 + d.y;
    })]);

    scaleDown.domain([0, maxData]);
    //plots the data onto layers
    svg.selectAll(".layer")
        .data(layers)
        .enter()
        .append("path")
        .attr("class", "layer")
        .attr("d", function(d) {
            return area(d.values);
            })
        .style("fill", function(d, i) {
            return z(i);
            });
    //draws the axis
    svg.selectAll(".axis")
        .data(d3.range(angle.domain()[1]))
        .enter()
        .append("g")
        .attr("class", "axis")
        //rotates the text to follow the axis
        .attr("transform", function(d) {
            return "rotate(" + angle(d) * 180 / Math.PI + ")";
            })
        .call(d3.svg.axis().scale(radius.copy().range([-innerRadius, -outerRadius])).orient("left"))
        .append("text")
        .attr("y", -innerRadius + 6)
        .attr("dy", ".71em")
        .attr("text-anchor", "middle")
        .text(function(d) {
            return formatDay(d);
            });
});

function type(d) {
    d.time = +d.time;
    d.value = +d.value;
    return d;
}