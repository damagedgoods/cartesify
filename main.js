var w = 700;
var h = 700;
var margin = 50;

var selectedViz = 0;

var svgContainer = d3.select(".container").append("svg")
    .attr("id", "svg_main")
    .attr("width", w)
    .attr("height", h);

var axisGroup = svgContainer.append("g")
    .attr("id", "axisGroup")
    .attr("opacity","1");

var spiderGroup = svgContainer.append("g")
    .attr("id", "spiderGroup")
    .attr("opacity","1")
    .attr("visibility","hidden");

var selectedIdea;
var props;                                      

var var_x;
var var_y;
var var_r;
var var_c;

var xScale = d3.scale.linear()
    .domain([0, 10])
    .range([0, w-2*margin]);

var yScale = d3.scale.linear()
    .domain([0, 10])
    .range([h-2*margin,0]);

var rScale = d3.scale.linear()
    .domain([0, 10])
    .range([5, 25]);

var cScale = d3.scale.linear()
    .domain([0, 10])
    .range(["#F8E71C", "#D83107"]);        

var xAxis = d3.svg.axis()
    .scale(xScale)
    .ticks(5);

var yAxis = d3.svg.axis()
    .scale(yScale)
    .orient("left")
    .ticks(5);

var tooltip = d3.select("body")
    .append("div")
    .attr("class", "tooltip")
    .text("a simple tooltip");            

var num_ejes;
var theta;
var r_spider = 300;

function toggleControles() {
    $('#controles').toggle('slide', {
        direction: 'right'
    }, 400);                
}

function highlightItem(i) {
    unhighlight();
    if (selectedViz == 0) {
        highlightCircle(i);
    } else {
        highlightPolygon(i);
    }    
}

function highlightCircle(i) {    

    var circles = d3.selectAll("circle.ideas");
    var c = d3.select(circles[0][i]);
    if (c.classed("invisible")) {
        return;
    } 

    var d = ideas[i];

    svgContainer.style('cursor','hand');

    var circle_x = c.attr("cx");
    var circle_y = c.attr("cy");    

    // Coloco el tooltip, por si highlighteo desde el menú
    var svg_position = $("svg").position();   
    var tooltip_x = (svg_position.left+parseInt(circle_x)+10);
    var tooltip_y = (svg_position.top+parseInt(circle_y)-10);
    tooltip.style("top",tooltip_y+"px").style("left",tooltip_x+"px");
    tooltip.text(d.name);

    // Muevo los markers
    d3.select("#x_marker_group")            
        .attr("visibility", "visible")
        .attr("transform", "translate("+circle_x+", "+(h-margin+12)+")");

    d3.select("#x_marker")
        .attr("r", 0)
        .transition()
        .duration(100)
        .attr("r", 10);

    d3.select("#x_marker_label")
        .text(d[var_x]);

    d3.select("#y_marker_group")   
        .attr("visibility", "visible")         
        .attr("transform", "translate("+(margin-10)+" , "+circle_y+")");

    d3.select("#y_marker")
        .attr("r", 0)
        .transition()
        .duration(100)
        .attr("r", 10);

    d3.select("#y_marker_label")
        .text(d[var_y]);

    d3.select("#x_marker_line")
        .attr("visibility", "visible")
        .attr("x", circle_x)
        .attr("y", circle_y)
        .attr("width", 1)
        .attr("height", ((h-margin)-circle_y));

    d3.select("#y_marker_line")
        .attr("visibility", "visible")
        .attr("x", margin)
        .attr("y", circle_y)
        .attr("width", (circle_x-margin))
        .attr("height", 1);
        

    tooltip.style("visibility", "visible");

}

function highlightPolygon(i) {    

    var polygon = d3.select("polygon#polygon_"+i);
    if (polygon.classed("invisible")) {
        return;
    } 

    polygon.style("stroke-width", 1)
        .style("stroke-opacity", 1);   

    var data = polygon.data()[0];     

    for (var i = 0; i<num_ejes; i++) {
        var r_var = r_spider*data[props[i]]/10;
        var x = w/2-r_var*Math.sin(theta*i);
        var y = h/2-r_var*Math.cos(theta*i);
        d3.select("#axis_value_circle_"+i)
            .attr("cx", x)
            .attr("cy", y)
            .attr("visibility", "visible")

        d3.select("#axis_value_"+i)
            .attr("x", x-3)
            .attr("y", y+5)
            .attr("visibility", "visible")
            .text(data[props[i]]);        
    }
}

function unhighlight() {
    d3.select("circle.highlightCircle")                
        .transition()
        .duration(200)            
        .attr("r",0);
    d3.select('.axis_value')
        .attr("visibility", "hidden");
    d3.selectAll("polygon")                
        .style("stroke-width", 0.2)
        .style("stroke-opacity", 0.5);        
    svgContainer.style('cursor','auto');
    d3.select("#x_marker_group")
        .attr("visibility", "hidden");
    d3.select("#y_marker_group")
        .attr("visibility", "hidden");
    d3.select("#x_marker_line")
        .attr("visibility", "hidden")
    d3.select("#y_marker_line")
        .attr("visibility", "hidden")
    tooltip.style("visibility", "hidden");

    for (var i = 0; i<num_ejes; i++) {
        d3.select("#axis_value_"+i)
            .attr("visibility", "hidden");
        d3.select("#axis_value_circle_"+i)
            .attr("visibility", "hidden");           
    }

}

function selectItem(i) {

    if ($("#list_item_idea_"+(i+1)).hasClass("invisible")) {
        return;
    }

    unhighlight();    
    showItemDetail();
    selectedIdea = i;    
    if (selectedViz == 0) {
        selectCircle(i);
    } else {
        selectPolygon(i);
    }
    loadData(i);
    showData();
}

function selectPolygon(i) {
    d3.selectAll("polygon")
    .classed("selected", false)
    .style("stroke-width", 0.2)
    .style("stroke-opacity", 0.5);                
    var polygons = d3.selectAll("polygon");
    d3.select(polygons[0][i]).classed("selected", true);
}

function selectCircle(i) {
    var circles = d3.selectAll("circle.ideas");
    var c = d3.select(circles[0][i]);        
    d3.select("circle.selectedCircle")
        .attr("r",0)
        .attr("cx", c.attr("cx"))
        .attr("cy", c.attr("cy"))
        .transition()
        .duration(200)
        .attr("r",c.attr("r")*2);        
}

function unselect() {
    selectedIdea = undefined;    
    d3.select("circle.selectedCircle")                
        .transition()
        .duration(200)            
        .attr("r",0);
    d3.selectAll("polygon")                
        .classed("selected", false);
}

function showData() {
    $('#data').show('slide', {
        direction: 'left'
    }, 400);                
}

function hideData() {
    $('#data').hide('slide', {
        direction: 'left'
    }, 400);                
}

function loadData(i) {

    if (i != undefined) {
        $('#item_detail h2 span').text(ideas[i].name);    
        $('#item_detail div#description p').text(ideas[i].description);    
        for (var j = 0; j<props.length; j++){
            $('#item_detail #'+props[j]+' .value').text(ideas[i][props[j]]);
        };
    } else {
    }
}

function load() {

    props = Object.keys(ideas[0]);
    props = props.slice(3,props.length);
    console.log(props);

    // Hallo el número de ejes
    num_ejes = props.length;
    theta = 2*Math.PI/num_ejes;

    // Cargo combos de configuración de c
    var select_x = document.getElementById('selec_eje_x');
    var select_y = document.getElementById('selec_eje_y');            
    var select_r = document.getElementById('selec_r');
    var select_c = document.getElementById('selec_c');
    var select_num_ejes = document.getElementById('selec_num_ejes');

    for (var i = 0; i<props.length; i++){                
        select_x.appendChild(createOpt(props[i]));
        select_y.appendChild(createOpt(props[i]));                
        select_r.appendChild(createOpt(props[i]));
        select_c.appendChild(createOpt(props[i]));

        var opt = document.createElement('option');
        opt.value = i+1;
        opt.innerHTML = i+1;
        select_num_ejes.appendChild(opt);

        $('#item_detail').append('<div id="'+props[i]+'" class="prop"><span class="label">'+props[i]+'</span><span class="value"></span></div>');
    }

    select_x.selectedIndex = "0";
    select_y.selectedIndex = "1";            
    select_r.selectedIndex = "2";
    select_c.selectedIndex = "3";

    function createOpt(value) {
        var opt = document.createElement('option');
        opt.value = props[i];
        opt.innerHTML = props[i];            
        return opt;
    }

    // Cargo lista de items
    for (var i=0; i<ideas.length; i++) {
        $('#item_list ul').append('<li><a class="list_item" id="list_item_'+ideas[i].id+'" href="javascript:selectItem('+i+')">'+ideas[i].name+'</a><div class="onoffswitch"><input type="checkbox" name="onoffswitch" class="onoffswitch-checkbox" id="myonoffswitch_'+i+'" checked><label class="onoffswitch-label" for="myonoffswitch_'+i+'" onclick="javascript:toggleItemVisibility('+i+')" ></label></div></li>');
    }

    var_x = props[0];
    var_y = props[1]
    var_r = props[2];
    var_c = props[3];

    var xAxisGroup = axisGroup.append("g")
        .attr("class", "axis")
        .attr("transform", "translate("+margin+"," + (h - margin) + ")")
        .call(xAxis);                

    var yAxisGroup = axisGroup.append("g")
        .attr("class", "axis")
        .attr("transform", "translate("+margin+","+margin+")")
        .call(yAxis);          

    axisGroup.append("text")
        .attr("id","x_axis_label")
        .attr("class", "axis_label")
        .attr("x", (w-100)+"px")
        .attr("y", (h-10)+"px")
        .text(var_x);

    axisGroup.append("text")
        .attr("id","y_axis_label")
        .attr("class", "axis_label")
        .attr("x", (70)+"px")
        .attr("y", (60)+"px")
        .text(var_y);

    axisGroup.append("circle")
        .attr("class","selectedCircle")
        .attr("cx", 0)
        .attr("cy", 0)
        .attr("r",0);

    axisGroup.append("circle")
        .attr("class","highlightCircle")
        .attr("cx", 0)
        .attr("cy", 0)
        .attr("r",0);

    axisGroup.append("rect")
        .attr("id", "y_marker_line")
        .attr("x", 0)
        .attr("y", 0)
        .attr("width", 0)
        .attr("height", 0);

    axisGroup.append("rect")
        .attr("id", "x_marker_line")
        .attr("x", 0)
        .attr("y", 0)
        .attr("width", 0)
        .attr("height", 0);

    axisGroup.selectAll("circle.ideas")
        .data(ideas)
        .enter().append("circle")
        .attr("class", "ideas")
        .attr("cx", function(d, i) { return xScale(d[var_x])+margin; })
        .attr("cy", function(d, i) { return margin + yScale(d[var_y]); })
        .attr("r", function(d) { return rScale(d[var_r])})
        .style("fill", function(d) { return cScale(d[var_c])})
        .on("mouseover", function(d, i){
            highlightCircle(i);
        })
        .on("mousemove", function(){
            return tooltip.style("top",(d3.event.pageY-10)+"px").style("left",(d3.event.pageX+10)+"px");})
        .on("mouseout", function(){
            unhighlight();
        })
        .on("click", function(d,i) {
            if (i == selectedIdea) {
                unselect();
                hideData();
            } else {                
                selectItem(i);
            }
            return;
        });

    // Radar chart

    // Pinto los ejes    
    var spiderAxis = spiderGroup.append("g")
        .attr("class", "axis");
    for (var i = 0; i<num_ejes; i++) {
        spiderAxis.append("line")            
            .attr("x1", w/2)
            .attr("y1", h/2)
            .attr("x2", w/2-r_spider*Math.sin(theta*i))
            .attr("y2", h/2-r_spider*Math.cos(theta*i));

        spiderGroup.append("text")
            .attr("id","#"+i+"_axis_label")
            .attr("class", "axis_label")
            .attr("x", w/2-(r_spider+20)*Math.sin(theta*i))
            .attr("y", h/2-(r_spider+20)*Math.cos(theta*i))
            .text(props[i])
            .each(function(d) {
                d3.select(this).attr("transform", "translate(-" +this.getComputedTextLength()/2+ ",0)");
            });
            
    }

    spiderGroup.selectAll(".area")
        .data(ideas)
        .enter()
        .append("polygon")
        .attr("id", function(d,i) {return "polygon_"+i})
        .attr("class", "")
        .attr("points",function(d) {
            var str="";
            for (var i = 0; i<num_ejes; i++) {
                var r_var = r_spider*d[props[i]]/10;
                var x = w/2-r_var*Math.sin(theta*i);
                var y = h/2-r_var*Math.cos(theta*i);
                str=str+x+","+y+" ";
            }            
            return str;
            })
        .on("mouseover", function(d,i) {
            svgContainer.style('cursor','hand');
            highlightPolygon(i);
            return;
        })
        .on("mouseout", function(d,i) {
            unhighlight()
            return;
        })
        .on("click", function(d,i) {
            if (i == selectedIdea) {
                unselect();
                hideData();
            } else {
                selectItem(i);
                return;
            }
        });

    for (var i = 0; i<num_ejes; i++) {
        spiderGroup.append("circle")
            .attr("id","axis_value_circle_"+i)
            .attr("class", "axis_value_circle")
            .attr("cx", w/2-(r_spider+20)*Math.sin(theta*i))
            .attr("cy", h/2-(r_spider+20)*Math.cos(theta*i))
            .attr("r", 12)
            .attr("visibility", "hidden");

        spiderGroup.append("text")
            .attr("id","axis_value_"+i)
            .attr("class", "axis_value")
            .attr("x", w/2-(r_spider+20)*Math.sin(theta*i)-6)
            .attr("y", h/2-(r_spider+20)*Math.cos(theta*i)+5)
            .attr("visibility", "hidden")
            .text("");                    
    }

    $("#item_list ul li").on("mouseover", function() {        
        highlightItem($(this).index());
    })
    $("#item_list ul").on("mouseout", function() {        
        unhighlight();
    })

    var x_marker_group = axisGroup
        .append("g")
        .attr("id", "x_marker_group")

    x_marker_group.append("circle")
        .attr("id", "x_marker")
        .attr("r", "0")
        .attr("cx", "0")
        .attr("cy", "0");

    x_marker_group.append("text")
        .attr("id", "x_marker_label")
        .attr("x", "-3")
        .attr("y", "5")
        .text("");

    var y_marker_group = axisGroup
        .append("g")
        .attr("id", "y_marker_group")

    y_marker_group.append("circle")
        .attr("id", "y_marker")
        .attr("r", "0")
        .attr("cx", "0")
        .attr("cy", "0");

    y_marker_group.append("text")
        .attr("id", "y_marker_label")
        .attr("x", "-3")
        .attr("y", "5")
        .text("");

}

function change_x() {
    var_x = document.getElementById("selec_eje_x").value;            
    redrawAxis();
}

function change_y() {
    var_y = document.getElementById("selec_eje_y").value;            
    redrawAxis();
}

function change_r() {
    var_r = document.getElementById("selec_r").value;            
    redrawAxis();
}

function change_c() {
    var_c = document.getElementById("selec_c").value;            
    redrawAxis();
}

function change_num_ejes() {    
    num_ejes = document.getElementById("selec_num_ejes").value;
    console.log("Ejes: "+num_ejes);
    redrawSpider();
}

function redrawAxis() {
    axisGroup.selectAll("circle.ideas")
        .data(ideas)
        .transition()
        .duration(500)
        .attr("cx", function(d, i) { return xScale(d[var_x])+margin; })
        .attr("cy", function(d, i) { return margin + yScale(d[var_y]); })
        .attr("r", function(d) { return rScale(d[var_r])})
        .style("fill", function(d) { return cScale(d[var_c])});

    if (selectedIdea != undefined) {
        axisGroup.selectAll("circle.selectedCircle")
            .transition()
            .duration(500)
            .attr("cx", xScale(ideas[selectedIdea][var_x])+margin)
            .attr("cy", margin + yScale(ideas[selectedIdea][var_y]))
            .attr("r", rScale(ideas[selectedIdea][var_r])*2);
    }

    axisGroup.select("#x_axis_label")
        .text(var_x);

    axisGroup.select("#y_axis_label")
        .text(var_y);
}

function redrawSpider() {

}

function selectAxis() {
    selectedViz = 0;
    $(".axisSelector").toggleClass("selected");
    $(".spiderSelector").toggleClass("selected");
    $("#axis_controles").show();
    $("#spider_controles").hide();
    console.log("Seleccionando axis");
    svgContainer.selectAll("#axisGroup")
        .transition()
        .duration(500)
        .attr("visibility","visible");
    svgContainer.selectAll("#spiderGroup")
        .transition()
        .duration(500)
        .attr("visibility","hidden");

    if (selectedIdea != undefined) {
        selectItem(selectedIdea);
    }
}

function selectSpider() {
    selectedViz = 1;
    $(".axisSelector").toggleClass("selected");
    $(".spiderSelector").toggleClass("selected");
    $("#axis_controles").hide();
    $("#spider_controles").show();    
    console.log("Seleccionando spider");
    svgContainer.selectAll("#axisGroup")
        .transition()
        .duration(500)
        .attr("visibility","hidden");
    svgContainer.selectAll("#spiderGroup")
        .transition()
        .duration(500)
        .attr("visibility","visible");        
    if (selectedIdea != undefined) {
        selectPolygon(selectedIdea);
    }        
}

function showItemList() {
    $("#item_list").animate({left: "0"}, 300);
    $("#item_detail").animate({left: "230px"}, 300);  
    unselect();
}

function showItemDetail() {
    $("#item_list").animate({left: "-230px"}, 300);
    $("#item_detail").animate({left: "0px"}, 300);
}

function toggleItemVisibility(i) {
    unhighlight();
    var circles = d3.selectAll("circle.ideas");
    var c = d3.select(circles[0][i]);
    c.classed("invisible", !c.classed("invisible"));            
    var p = d3.select("polygon#polygon_"+i);
    p.classed("invisible", !p.classed("invisible"));    
    $("#list_item_idea_"+(i+1)).toggleClass("invisible");


}

function download() {
    var e = document.createElement('script'); 
    if (window.location.protocol === 'https:') { 
        e.setAttribute('src', 'https://rawgit.com/NYTimes/svg-crowbar/gh-pages/svg-crowbar.js'); 
    } else { 
        e.setAttribute('src', 'http://nytimes.github.com/svg-crowbar/svg-crowbar.js'); 
    } 
    e.setAttribute('class', 'svg-crowbar'); 
    document.body.appendChild(e); 
 
};
