//%a - abbreviated weekday name.
var formatDate = d3.time.format("%g"),
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
var nest = d3.nest()
    .key(function(d) {  return d.key;});
    // .key(function(d){ return d.time; });
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
d3.csv("data/data_day.csv", type, function(error, data) {

    // function getDataSubset(data){
        
    //     var result = [];
    //     var el = vv = kv = 0 ;
    //     for(i=0; i<data.length; i++){
    //         if(data[i].key == "el" && el <10) 
    //             {
    //                 result.push(data[i]);
    //                 el++;
    //             }
    //         else if(data[i].key == "kv" && kv <10)
    //             {
    //                 result.push(data[i]);
    //                 kv++;
    //             }
    //         else if(data[i].key == "vv" && vv <10)
    //             {
    //                 result.push(data[i]);
    //                 vv++;
    //             }
    //     }
    //     return result;

    // }
    // var dataSubset = getDataSubset(data);
    // console.log("dataSubset: " + JSON.stringify(dataSubset));
    // console.log("length" + dataSubset.length);
    
    //creates layers with the stack layout function and the nest function
    //nest.entries - evaluate the nest operator, returning an array of key values tuples
   
    var layers = stack(nest.entries(data));
    var dataSubset = layers.filter(function(d){return (d.time>1 && d.time <10)});
    console.log("layers" + JSON.stringify(layers));
    console.log("layers length" + layers.length);
    console.log("layers[i]: " + JSON.stringify(layers[1].values))
    //console.log("data: " + JSON.stringify(data))
    //define the domains of the scale ranges defined earlier for angle and radius
    // Extend the domain slightly to match the range of [0, 2Ï€].
    angle.domain([0, d3.max(data, function(d) {
        // console.log("dtime: "+d.time)
        return d.time + 1;
    })]);


        for(i=0; i<=2;i++){
           //goes from 0 to the maximum of the data 
           var min =  d3.min(layers[i].values, function(d) {  return d.y ; });
           var max = d3.max(layers[i].values, function(d) {   return d.y0 + d.y;  });
           console.log('min: ' + min);
           console.log('max: ' + max);
           radius.domain([min, max]);
        }

    // scaleDown.domain([0, maxData]);
    //plots the data onto layers
    svg.selectAll(".layer")
        .data(layers)  
        .enter()
        .append("path")
        // .filter(function(d, i)
        // { 
        //     console.log("i'm here: " + this);
        //     return (this.i.time>=0 && this.i.time<=10)
        //     var result = [];
        //     for(j=0;j<=d.values.length;j++){
        //         console.log("i'm in the loop: " + JSON.stringify(d["values"][j]));
        //         return (d["values"][j]["time"]>=0 && d["values"][j]["time"]<=10)
        //     }
        // })
        //returns placeholders for missing elements
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