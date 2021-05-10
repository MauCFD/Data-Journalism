// @TODO: YOUR CODE HERE!
function responsive() {
  let plotArea = d3.select("body").select("svg");
  
  if (!plotArea.empty()) {
    plotArea.remove();
  }
  
  let areaWidth = window.innerWidth * 0.8;
  let areaHeight = areaWidth * 0.7;

  let circleRadius = areaWidth * 0.01; 
  let textsize = parseInt(areaWidth * 0.01);
  let border = {
    top: 20,
    bottom: 100,
    right: 40,
    left: 80
  };
  
  let width = areaWidth - border.left - border.right;
  let height = areaHeight - border.top - border.bottom;
  
  let svg = d3
  .select("#scatter")
  .append("svg")
  .attr("width", areaWidth)
  .attr("height", areaHeight);
  
  let plotGroup = svg.append("g")
  .attr("transform", `translate(${border.left}, ${border.top})`);
  
  let xChoice = "poverty";
  let yChoice ="healthcare";

  function displayCircles(circleGroup, newxValues, newyValues, xChoice, yChoice) {
    circleGroup.transition().duration(1200)
    .attr("cx", d => newxValues(d[xChoice]))
    .attr("cy", d => newyValues(d[yChoice]));
  
    return circleGroup;
  }

  function displayText(textGroup, newxValues, newyValues, xChoice, yChoice) {
    
    textGroup.transition().duration(1200)
    .attr("x", d => newxValues(d[xChoice]))
    .attr("y", d => newyValues(d[yChoice]));
  
    return textGroup;
  }

  function xAxValues(USCBData, xChoice) {
    let xscaleLinear = d3.scaleLinear().domain([d3.min(USCBData, d => d[xChoice]) * 0.8,
    d3.max(USCBData, d => d[xChoice]) * 1.25]).range([0, width]);
    
    return xscaleLinear;
  }
  
  function yAxValues(USCBData, yChoice) {
    let yscaleLinear = d3.scaleLinear().domain([d3.min(USCBData, d => d[yChoice]) * 0.8,
    d3.max(USCBData, d => d[yChoice]) * 1.25]).range([height, 0]);
    
    return yscaleLinear;
  }
  
  function displayxAx(newxValues, xAx) {
    let bottomAx = d3.axisBottom(newxValues);
  
    xAx.transition().duration(1200).call(bottomAx);
    
    return xAx;
  }
  
  function displayyAx(newyValues, yAx) {
    let leftAx = d3.axisLeft(newyValues);
  
    yAx.transition().duration(1200).call(leftAx);
  
    return yAx;
  }

  function updateToolTip(xChoice, yChoice,circleGroup) {
    let toolTip = d3.tip().attr("class", "tooltip")
    .offset([80, -60]).html(function(d) {
      if (xChoice === "income"){
        return (`${d.state} (${d.abbr})<br>${xChoice} - ${d[xChoice]} USD<br>${yChoice} - ${d[yChoice]}%`);
      } else if (xChoice === "age") {
        return (`${d.state} (${d.abbr})<br>${xChoice} - ${d[xChoice]}<br>${yChoice} - ${d[yChoice]}%`);
      } else {
        return (`${d.state} (${d.abbr})<br>${xChoice} - ${d[xChoice]}%<br>${yChoice} - ${d[yChoice]}%`);
      }
    });
  
    circleGroup.call(toolTip);
  
    circleGroup.on("mouseover", function(d) {
      toolTip.show(d,this);
    }).on("mouseout", function(d, index) {
      toolTip.hide(d);
    });
    
    return circleGroup;
  }

  d3.csv("assets/data/data.csv").then(function(USCBData) {
    USCBData.forEach(function(data) {
      data.abbr = data.abbr;
      data.poverty = +data.poverty;
      data.age = +data.age;
      data.income = +data.income;
      data.healthcare = +data.healthcare;
      data.obesity = +data.obesity;
      data.smokes = +data.smokes;
    });
  
    let xscaleLinear = xAxValues(USCBData, xChoice);
    let yscaleLinear = yAxValues(USCBData, yChoice);
  
    let bottomAx = d3.axisBottom(xscaleLinear);
    let leftAx = d3.axisLeft(yscaleLinear);
  
    let xAx = plotGroup.append("g").classed("x-axis", true)
    .attr("transform", `translate(0, ${height})`).call(bottomAx);
  
    let yAx = plotGroup.append("g").classed("y-axis", true)
    .call(leftAx);
  
    let circleGroup = plotGroup.selectAll("circle")
    .data(USCBData).enter().append("circle")
    .attr("cx", d => xscaleLinear(d[xChoice]))
    .attr("cy", d => yscaleLinear(d[yChoice]))
    .attr("r", circleRadius).attr("fill", "skyblue");
  
    let textGroup = plotGroup.selectAll("text").exit()
    .data(USCBData).enter().append("text").text(d => d.abbr)
    .attr("x", d => xscaleLinear(d[xChoice]))
    .attr("y", d => yscaleLinear(d[yChoice]))
    .attr("font-size", textsize+"px")
    .attr("text-anchor", "middle")
    .attr("class","stateText");
    
    circleGroup = updateToolTip(xChoice, yChoice,circleGroup);
  
    let xLabels = plotGroup.append("g")
    .attr("transform", `translate(${width / 2}, ${height + 20})`);
  
    let povertyLabel = xLabels.append("text")
    .attr("x", 0).attr("y", 25)
    .attr("class","axis-text-x")
    .attr("value", "poverty")
    .classed("active", true)
    .text("Poverty");
    
    let ageLabel = xLabels.append("text")
    .attr("x", 0).attr("y", 45)
    .attr("class","axis-text-x")
    .attr("value", "age")
    .classed("inactive", true)
    .text("Age");
  
    let incomeLabel = xLabels.append("text")
    .attr("x", 0).attr("y", 65)
    .attr("class","axis-text-x")
    .attr("value", "income")
    .classed("inactive", true)
    .text("Income");
  
    let yLabels = plotGroup.append("g");
  
    let healthcareLabel = yLabels.append("text")
    .attr("transform", `translate(-40,${height / 2})rotate(-90)`)
    .attr("dy", "1em")
    .attr("class","axis-text-y")
    .classed("axis-text", true)
    .attr("value", "healthcare")
    .classed("active", true)
    .text("Healthcare");
    
    let obesityLabel = yLabels.append("text")
    .attr("transform", `translate(-80,${height / 2})rotate(-90)`)
    .attr("dy", "1em")
    .attr("class","axis-text-y")
    .attr("value", "obesity")
    .classed("inactive", true)
    .text("Obesity");
    
    let smokesLabel = yLabels.append("text")
    .attr("transform", `translate(-60,${height / 2})rotate(-90)`)
    .attr("dy", "1em")
    .attr("class","axis-text-y")
    .attr("value", "smokes")
    .classed("inactive", true)
    .text("Smokes");

    xLabels.selectAll(".axis-text-x").on("click", function() {
      let value = d3.select(this).attr("value");

      if (value !== xChoice) {
        xChoice = value;
        
        xscaleLinear = xAxValues(USCBData, xChoice);
        yscaleLinear = yAxValues(USCBData, yChoice);
        
        xAx = displayxAx(xscaleLinear, xAx);

        circleGroup = displayCircles(circleGroup, xscaleLinear, yscaleLinear, xChoice, yChoice);
        textGroup = displayText(textGroup, xscaleLinear, yscaleLinear, xChoice, yChoice);
        
        circleGroup = updateToolTip(xChoice, yChoice,circleGroup);
        
        if (xChoice === "age") {
          povertyLabel
          .classed("active", false)
          .classed("inactive", true);
          ageLabel
          .classed("active", true)
          .classed("inactive", false);
          incomeLabel
          .classed("active", false)
          .classed("inactive", true);
        } else if (xChoice === "poverty") {
          povertyLabel
          .classed("active", true)
          .classed("inactive", false);
          ageLabel
          .classed("active", false)
          .classed("inactive", true);
          incomeLabel
          .classed("active", false)
          .classed("inactive", true);
        } else {
          povertyLabel
          .classed("active", false)
          .classed("inactive", true);
          ageLabel
          .classed("active", false)
          .classed("inactive", true);
          incomeLabel
          .classed("active", true)
          .classed("inactive", false);
        }
      }
    });
  
    yLabels.selectAll(".axis-text-y").on("click", function() {
      let value = d3.select(this).attr("value");
      
      if (value !== yChoice) {
        yChoice = value;
     
        xscaleLinear = xAxValues(USCBData, xChoice);
        yscaleLinear = yAxValues(USCBData, yChoice);

        yAx = displayyAx(yscaleLinear, yAx);

        circleGroup = displayCircles(circleGroup, xscaleLinear,yscaleLinear,xChoice,yChoice);
        textGroup = displayText(textGroup, xscaleLinear,yscaleLinear,xChoice,yChoice);
     
        circleGroup = updateToolTip(xChoice, yChoice,circleGroup);
     
        if (yChoice === "healthcare") {
          healthcareLabel
          .classed("active", true)
          .classed("inactive", false);
          obesityLabel
          .classed("active", false)
          .classed("inactive", true);
          smokesLabel
          .classed("active", false)
          .classed("inactive", true);
        } else if (yChoice === "smokes") {
          healthcareLabel
          .classed("active", false)
          .classed("inactive", true);
          obesityLabel
          .classed("active", false)
          .classed("inactive", true);
          smokesLabel
          .classed("active", true)
          .classed("inactive", false);
        } else {
          healthcareLabel
          .classed("active", false)
          .classed("inactive", true);
          obesityLabel
          .classed("active", true)
          .classed("inactive", false);
          smokesLabel
          .classed("active", false)
          .classed("inactive", true);
        }
      }
    });
  });
}

responsive();

d3.select(window).on("resize", responsive);