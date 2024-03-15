import { feature } from "../../node_modules/topojson-client/src/index.js"
import taiwanGeo from "../data/topo_county.json" assert { type: "json" };
import { getVoteData, getCandData, partyColor, link, maxParty } from "./utils.js"

export function drawMap(){
    const voteData = getVoteData().縣市;
    const partyList = Object.keys(getCandData());
    const width = 500, 
          height = 854;

    d3.select("#map svg").remove();

    const svg = d3.select("#map")
                .append("svg")
                .attr("width", "100%")
                .attr("height", "100%")
                .attr("viewBox",`0 0 ${width} ${height}`)

    const g = svg.append("g");
    const projection = d3.geoMercator().center([121, 24]).translate([266,330]).scale(13000);
    const pathCalc = d3.geoPath().projection(projection);
    const topoData = feature(taiwanGeo, taiwanGeo.objects.COUNTY_MOI_1090820);

    // Draw Taiwan
    const path = g.selectAll("path")
                  .data(topoData.features)
                  .join("path")
                  .attr("d", pathCalc)
                  .attr("class", "city")
                  .on("click", clicked);
    
    // Add color
    path.each(function(d){
        const city = d.properties.COUNTYNAME;
        const data = voteData[city];
        const max = maxParty();

        if(!data){
            d3.select(this).attr("fill", "#FFF") // 過去有的縣市和現在不一樣
        }else{
            partyList.forEach((party) => {
                max(data[party].total, party);
            });
            
            d3.select(this).attr("fill", partyColor[max()])
        }
    })
    
    // Add city name
    g.selectAll()
     .data(topoData.features)
     .join("text")
     .attr("transform", d => `translate(${pathCalc.centroid(d)})`)
     .attr("class", "city-name")
     .text(d => d.properties.COUNTYNAME);

    // Add zomm & pan
    const zoom = d3.zoom()
                   .scaleExtent([1, 8])
                   .translateExtent([[0, 0], [width, height]])
                   .on("zoom", (e) => {
                        g.attr("transform", e.transform)
                         .style("font-size", `min(16px, ${24 / e.transform.k}px)`);
                   })

    svg.call(zoom);

    // City clicked event
    function clicked(e, d) {
        e.stopPropagation();

        const [[x0, y0], [x1, y1]] = pathCalc.bounds(d);
        const [x, y] = pathCalc.centroid(d);

        svg.transition().duration(750).call(
            zoom.transform,
            d3.zoomIdentity.translate(width / 2, height / 2).scale(0.9*(width/(x1-x0))).translate(-x,-y)
        )

        const cityOnclick = document.querySelector(".onclick");
        cityOnclick && cityOnclick.classList.remove("onclick");
        this.classList.add("onclick");
        
        link.toCity(d.properties.COUNTYNAME);
    }

    // Fixed field - legend
    d3.select("#map .party-list")
      .html("")
      .selectAll()
      .data(partyList)
      .join("div")
      .attr("class", "dot")
      .style("background", d => partyColor[d])
      .each(function(d) {
          const s = document.createElement("small");
          s.innerHTML = d;
          this.parentNode.insertBefore(s, this.nextSibling);   
      });

    // Fixed field - island
    const islandList = document.querySelectorAll(".island object");

    islandList.forEach((island) => {
        const city = island.dataset.city;
        const svgDoc = island.getSVGDocument();
        const data = voteData[city];
        const max = maxParty();

        partyList.forEach((party) => {
            max(data[party].total, party);
        });

        svgDoc.querySelectorAll("svg path").forEach((path) => {
            path.setAttribute("fill", partyColor[max()]);
        });

        svgDoc.querySelector("svg").addEventListener("click", (e) => {
            link.toCity(city);
        })
    })
}