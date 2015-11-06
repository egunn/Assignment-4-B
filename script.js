console.log("Assignment 4-B");

var margin = {t:50,r:100,b:50,l:50};
var width = document.getElementById('plot').clientWidth - margin.r - margin.l,
    height = document.getElementById('plot').clientHeight - margin.t - margin.b;

var canvas = d3.select('.canvas');
var plot = canvas
    .append('svg')
    .attr('width',width+margin.r+margin.l)
    .attr('height',height + margin.t + margin.b)
    .append('g')
    .attr('class','canvas')
    .attr('transform','translate('+margin.l+','+margin.t+')');


//Scales
var scaleX = d3.scale.linear().domain([1960,2015]).range([0,width]),
    scaleY = d3.scale.linear().domain([0,11000000]).range([height,0]);

//Axis
var axisX = d3.svg.axis()
    .orient('bottom')
    .scale(scaleX)
    .tickFormat( d3.format('d') ); //https://github.com/mbostock/d3/wiki/Formatting
var axisY = d3.svg.axis()
    .orient('right')
    .tickSize(width)
    .scale(scaleY);

//Start importing data
d3.csv('/data/fao_combined_world_1963_2013.csv', parse, dataLoaded); //load fao data (replaced world bank file)

function parse(d){

    //console.log("data array " + d); //contains 102 objects with many rows each

    //return only the information relevant to this exercise;
    return { item: d.ItemName, //note that names are capitalized to match array handles - not in standard camel case!
             year: d.Year,
             value: d.Value
    }



}

function dataLoaded(error, rows){

    //when data is done loading, pass it to the draw function (do plotting in draw to allow recurring mouse functions -
    //dataLoaded only runs once
    draw(rows);

}

function draw(rows) {

    var nestedData = d3.nest()
        .key(function(d) {return d.item})//grab the data by the item name (coffee,tea) from the big array + return as a nested object
        .entries(rows);  //big array of elements

    console.log(nestedData); //output to console to check - 2 51-item arrays, one with key = Tea, one Coffee. Objects retain properties above.

    var lineGenerator = d3.svg.line()
        .x(function(d){return scaleX(d.year)})
        .y(function(d){return scaleY(d.value)})
        .interpolate('basis');

    var timeSeries = plot.selectAll('coffee-data-line tea-data-line') //yields a selection of 0 <path> elements
        .data(nestedData) //joins to an array of two objects
        .enter()
        .append('path') //creates two new <path> elements as the enter set
        .attr('class', function(d){

            if(d.key=='Coffee, green'){
                return 'coffee-data-line'
            }
            else if (d.key=='Tea'){
                return 'tea-data-line'
            }

        }) //each element will have class of either "coffee-data-line" or "tea-data-line"

        .attr('d', function(d){
            console.log(d);
            return lineGenerator(d.values)
        });

    //Draw axes
    plot.append('g').attr('class','axis axis-x')
        .attr('transform','translate(0,'+height+')')
        .call(axisX);
    plot.append('g').attr('class','axis axis-y')
        .call(axisY);

    //draw data points for both curves, to use as objects for mouseenter
    var teaDots = plot.selectAll('.tea-data-point')
        .data(nestedData[0].values);
    var teaDotsEnter = teaDots.enter()
        .append('circle')
        .attr('class','data-point tea-data-point')
        .attr('cx', function(d){return scaleX(d.year);})
        .attr('cy', function(d){return scaleY(d.value);})
        .attr('r',10)
        .call(attachTooltip);

    var coffeeDots = plot.selectAll('.coffee-data-point')
        .data(nestedData[1].values);
    var coffeeDotsEnter = coffeeDots.enter()
        .append('circle')
        .attr('class','data-point coffee-data-point')
        .attr('cx', function(d){return scaleX(d.year);})
        .attr('cy', function(d){return scaleY(d.value);})
        .attr('r',10)
        .call(attachTooltip);

    //var tooltip = d3.select('.custom-tooltip');

}


function attachTooltip(selection){
    selection
        .on('mouseenter',function(d){
            var tooltip = d3.select('.custom-tooltip');
            tooltip
                .transition()
                .style('opacity',1);
                //tried making separate classes to set tooltip box color to match lines; something broke.
                /*.attr('class', function(){
                    if(d.key=='Coffee, green'){
                        return 'coffee-tooltip'
                    }
                    else if (d.key=='Tea'){
                        return 'tea-tooltip'
                    }
                });
                */


        })
        .on('mousemove',function(d){
            var xy = d3.mouse(canvas.node());
            //console.log(xy);

            var tooltip = d3.select('.custom-tooltip');

            tooltip
                .style('left',xy[0]+50+'px')
                .style('top',(xy[1]+50)+'px')
                .html(d.value);

        })
        .on('mouseleave',function(){
            var tooltip = d3.select('.custom-tooltip')
                .transition()
                .style('opacity',0);
        })
}