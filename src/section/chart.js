import { partyColor } from "./utils.js";

const totalData = [['1996', [['國民黨', 5813699, 54.0], 
                             ['民進黨', 2274586, 21.13], 
                             ['其他', 2677834 , 24.88, [['連署(1)', 1074044, 9.98], 
                                                        ['連署(4)', 1603790, 14.9]]]]], 
                   ['2000', [['國民黨', 2925513, 23.1], 
                             ['民進黨', 4977697, 39.3], 
                             ['其他', 4761183 , 37.6, [['連署(1)', 4664972, 36.84], 
                                                       ['新黨', 16782, 0.13], 
                                                       ['連署(4)', 79429, 0.63]]]]], 
                  ['2004', [['國民黨', 6442452, 49.89], 
                            ['民進黨', 6471970, 50.11],
                            ['其他', 0, 0]]], 
                  ['2008', [['國民黨', 7659014, 58.44], 
                            ['民進黨', 5444949, 41.55],
                            ['其他', 0, 0]]], 
                  ['2012', [['國民黨', 6891139, 51.6], 
                            ['民進黨', 6093578, 45.63],
                            ['無黨籍', 369588, 2.76]]], 
                  ['2016', [['國民黨', 3813365, 31.04], 
                            ['民進黨', 6894744, 56.12],
                            ['親民黨', 1576861, 12.83]]], 
                  ['2020', [['國民黨', 5522119, 38.61], 
                            ['民進黨', 8170231, 57.13],
                            ['親民黨', 608590, 4.26]]],
                  ['2024', [['國民黨', 4671021, 33.49],
                            ['民進黨', 5586019, 40.05],
                            ['民眾黨', 3690466, 26.46]]]];

const yearList = totalData.map(d => d[0]);
const partyList = totalData[0][1].map(d => d[0]);

const margin = {top: 10, right: 0, bottom: 40, left: 60};
const width = 602 - margin.left - margin.right;
const height = 222 - margin.top - margin.bottom;

const gridColor = "#DEE2E6";
const fontSize = "12px";

export function drawBarChart(){
    const svg = d3.select("#bar-chart")
                  .append("svg")
                  .attr("width", 602)
                  .attr("height", 222)
                  .append("g")
                  .attr("transform", `translate(${margin.left}, ${margin.top})`);

    // X axis
    const xScale = d3.scaleBand()
                     .domain(yearList)
                     .range([0, width])
                     .paddingInner(.45)
                     .paddingOuter(.1);

    svg.append('g')
       .attr("transform", `translate(0, ${height})`)
       .call(d3.axisBottom(xScale).tickSize(0).tickPadding(10))
       .style("font-size", fontSize)
       .select(".domain").remove();
   
    // Y axis
    const format = d3.format(".0f");
    const customFormat = (d) => {
        if (d === 0) {
            return "0";
        } else {
            return `${format(d / 10000)} 萬`;
        }
    };

    const yScale = d3.scaleLinear()
                     .domain([0, 10000000])
                     .range([height, 0]);

    svg.append('g')
       .call(d3.axisLeft(yScale).ticks(5).tickSize(-width).tickPadding(12).tickFormat(customFormat))
       .call(g => {
            g.select(".domain").remove();
            g.selectAll("line").attr("stroke", gridColor);
       })
       .style("font-size", fontSize);

    // Grouped bar
    const xSubgroups = d3.scaleBand()
                         .domain(partyList)
                         .range([0, xScale.bandwidth()])
                         .padding([.15])


    // Create tooltip
    const tooltip = d3.select("#bar-chart")
                      .append("div")
                      .attr("class", "chart-info");

    const tooltipWidth = parseInt(tooltip.style("width"), 10);
    
    // Bar events
    const mouseover = function(_, d) {
        const year = d3.select(this.parentNode).attr("data-year");
        const formater =  d3.format(",");

        d3.select(this).style("opacity", .6);

        tooltip.style("display", "block")
               .html(`<h6>${year} 年得票數</h6>`)

        if(d[0] === "其他"){
            d[3].forEach((list) => {
                tooltip.append("div")
                        .html(`<div>
                                    <div class="dot" style="background: ${partyColor[list[0]]}"></div>
                                    <span class='font-2'>${list[0]}</span>
                                </div>
                                <span class="font-2">${formater(list[1])} 票</span>`)
            })
        } else {
            tooltip.append("div")
                   .html(`<div>
                            <div class="dot" style="background:${partyColor[d[0]]}"></div>
                            <span class="font-2">${d[0]}</span>
                          </div>
                          <span class="font-2">${formater(d[1])} 票</span>`)
        }
    }

    const mousemove = function(e) {
        tooltip.style("top", e.clientY - 90 + "px")
               .style("left", e.clientX + 20 + "px"); 
        
        if(parseInt(tooltip.style("right"), 10) < 0){
            tooltip.style("left", e.clientX - 20 - tooltipWidth + "px");
        }
    }

    const mouseleave = function() {
        tooltip.style("display", "none");
        d3.select(this).style("opacity", 1);
    }

    // Create bars
    svg.append("g")
        .selectAll("g")
        .data(totalData)
        .join("g")
        .attr("transform", d => "translate(" + xScale(d[0]) +", 0)")
        .attr("data-year", d => d[0])
        .selectAll("rect")
        .data(d => d[1])
        .join("rect")
        .attr("x", (_, i) => xSubgroups(partyList[i]))
        .attr("y", d => yScale(d[1]))
        .attr("width", xSubgroups.bandwidth())
        .attr("height", d => height - yScale(d[1]))
        .attr("fill", d => partyColor[d[0]])
        .on("mouseover", mouseover)
        .on("mousemove", mousemove)
        .on("mouseleave", mouseleave);
    
    // Create legend
    d3.selectAll(".party-votes .party-list")
    .selectAll()
    .data(["國民黨","民進黨","無黨籍","親民黨","民眾黨","其他"])
    .join("div")
    .attr("class", "dot")
    .style("background", d => partyColor[d])
    .each(function(d) {
        const s = document.createElement("small");
        s.innerHTML = d;
        this.parentNode.insertBefore(s, this.nextSibling);   
    });
}


export function drawLineChart(){
    const svg = d3.select("#line-chart")
                  .append("svg")
                  .attr("width", 602)
                  .attr("height", 222)
                  .append("g")
                  .attr("transform", `translate(${margin.left}, ${margin.top})`);

    // Create tooltip
    const tooltip = d3.select("#line-chart")
                      .append("div")
                      .attr("class", "chart-info")

    const tooltipWidth = parseInt(tooltip.style("width"), 10);

    // Line events
    const mouseover = function(_, d) {
        tooltip.style("display", "block")
               .html(`<h6>${d[0]} 年得票數</h6>`)

        d[1].forEach((list) => {
            if((list[0] === "其他" && (list[2] != 0))){
                list[3].forEach((list) => {
                    tooltip.append("div")
                            .html(`<div>
                                        <div class="dot" style="background: ${partyColor[list[0]]}"></div>
                                        <span class='font-2'>${list[0]}</span>
                                    </div>
                                    <span class="font-2">${list[2]} %</span>`)
                })
            } else {
                tooltip.append("div")
                    .html(`<div>
                                <div class="dot" style="background: ${partyColor[list[0]]}"></div>
                                <span class='font-2'>${list[0]}</span>
                            </div>
                            <span class="font-2">${list[2]} %</span>`)
            }
        })

        dot.attr("opacity", 1)
           .attr("transform",`translate(${xScale.bandwidth() / 2}, 0)`)
           .attr("cx", xScale(d[0]))
           .attr("cy", (_, i) => yScale(d[1][i][2]));
    }

    const mousemove = function(e) {
        tooltip.style("top", e.clientY - 140 + "px")
               .style("left", e.clientX + 10 + "px");

        if(parseInt(tooltip.style("right"), 10) < 0){
            tooltip.style("left", e.clientX - 10 - tooltipWidth + "px");
        }
    }

    const mouseleave = function() {
        tooltip.style("display", "none");
        dot.attr("opacity", 0);
    }
    
    // X axis
    const xScale = d3.scaleBand()
                     .domain(yearList)
                     .range([0, width]);

    svg.append('g')
       .attr("transform", `translate(0, ${height})`)
       .call(d3.axisBottom(xScale).tickSize(-height).tickPadding(10))
       .style("font-size", fontSize)
       .call(g => {
            g.select(".domain").remove();
            g.selectAll("line")
             .attr("stroke", "transparent")
             .attr("stroke-width", xScale.bandwidth()) // hover range
             .data(totalData)
             .on("mouseover", mouseover)
             .on("mousemove", mousemove)
             .on("mouseleave", mouseleave);
       });
       
   
    // Y axis
    const format = d3.format(".0f");
    const customFormat = (d) => {
        return `${format(d)}%`;
    };

    const yScale = d3.scaleLinear()
                     .domain([0, 60])
                     .range([height, 0]);

    svg.append('g')
       .call(d3.axisLeft(yScale).ticks(6).tickSize(-width).tickPadding(12).tickFormat(customFormat))
       .style("font-size", fontSize)
       .call(g => {
            g.select(".domain").remove();
            g.selectAll("line").attr("stroke", gridColor)
                               .style("pointer-events","none");
       });
    
    // Create line
    svg.selectAll()
       .data(partyList)
       .join("path")
       .attr("fill", "none")
       .style("pointer-events","none")
       .attr("stroke", d => partyColor[d])
       .attr("stroke-width", 2)
       .attr("transform", `translate(${xScale.bandwidth() / 2}, 0)`)
       .attr("d", (_, i) => {
            let line = d3.line().x(d => xScale(d[0])).y(d => yScale(d[1][i][2]));
            return line(totalData);
        });
        
    const dot = svg.selectAll()
                   .data(partyList)
                   .join("circle")
                   .attr("r", 4)
                   .attr("fill", d => partyColor[d])
                   .style("pointer-events", "none")
                   .attr("opacity", 0);
    
    // Create legend
    d3.selectAll(".party-votes-pct .party-list")
      .selectAll()
      .data(partyList)
      .join("div")
      .attr("class", "dot")
      .style("background", d => partyColor[d])
      .each(function (d) {
          let s = document.createElement("small");
          s.innerHTML = d;
          this.parentNode.insertBefore(s, this.nextSibling);   
      });
}

export function drawDonutChart(data){
    const width = 124, height = 124;
    const radius = Math.min(width, height) / 2;

    d3.select("#donut-chart svg").remove();

    const svg = d3.select("#donut-chart")
                    .append("svg")
                    .attr("width", width)
                    .attr("height", height)
                    .append("g")
                    .attr("transform", `translate(${width / 2},${height / 2})`);

    const color = d3.scaleOrdinal()
                    .range(["#E2E8F0", "#D4009B"]);

    const pieCalc = d3.pie().value(d => d);

    svg.selectAll()
        .data(pieCalc(data))
        .join('path')
        .attr('d', d3.arc().innerRadius(50) .outerRadius(radius))
        .attr('fill', d => color(d));
    
    d3.select("#donut-voter-pct")
        .html(`${data[1]}%`)
}
