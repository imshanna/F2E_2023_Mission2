import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7/+esm";
import taiwanGeo from "../data/topo_county.json" assert { type: "json" };
import { getVoteData, getCandData, partyColor, link, maxParty } from "./utils.js"

export function drawMap(){
    const voteData = getVoteData().縣市;
    const partyList = Object.keys(getCandData());
    const width = 500, 
          height = 854;

    const svg = d3.select("#map")
                .append("svg")
                .attr("width", "100%")
                .attr("height", "100%")
                .attr("viewBox",`0 0 ${width} ${height}`)

    const g = svg.append("g");
    const projection = d3.geoMercator().center([121, 24]).translate([260,330]).scale(13000);
    const pathCalc = d3.geoPath().projection(projection);
    const topoData = topojson.feature(taiwanGeo, taiwanGeo.objects.COUNTY_MOI_1090820);

    // Draw Taiwan
    const path = g.selectAll("path")
                  .data(topoData.features)
                  .join("path")
                  .attr("d", pathCalc)
                  .attr("class","city")
                  .on("click", clicked);
    
    // Add color
    path.each(function(d){
        const city = d.properties.COUNTYNAME;
        const data = voteData[city];
        const max = maxParty();

        partyList.forEach((party) => {
            max(data[party].total, party);
        });
        
        d3.select(this).attr("fill", partyColor[max()])
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
                   .scaleExtent([0.5, 8])   // scale limit (temp)
                   .translateExtent([[-200, -200], [width + 400, height + 400]])   // pan limit (temp)
                   .on("zoom", (e) => {
                        g.attr("transform", e.transform);
                        // console.log(e.transform.k); // get current scale
                   })

    svg.call(zoom);

    // City clicked event
    function clicked(e, d) {
        e.stopPropagation();

        const [[x0, y0], [x1, y1]] = pathCalc.bounds(d);
        const [x, y] = pathCalc.centroid(d);
        // const [x, y] = d3.pointer(e);

        svg.transition().duration(750).call(
            zoom.transform,
            d3.zoomIdentity.translate(width / 2, height / 2).scale(0.9*(width/(x1-x0))).translate(-x,-y)
        )

        link.toCity(d.properties.COUNTYNAME);
    }
}