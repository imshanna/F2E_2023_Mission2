import { get, getVoteData, getCandData, partyColor, link, maxParty } from "./utils.js"
import { drawDonutChart } from "./chart.js"

function addProportionBar(partyList){
    const temp = document.createElement("div");

    partyList.forEach((party) => {
        const div = document.createElement("div");
        div.setAttribute("data-party", party);
        div.style.background = partyColor[party];
        temp.appendChild(div);
    })

    return temp.innerHTML;
}

function loadAreaVotes(areaData, islink){
    const candData = getCandData();
    const tbody = document.querySelector("#area-list tbody");
    const thead = document.querySelector("#area-list thead");
    const proportionBar = addProportionBar(Object.keys(candData)); 
    const currentCity = get.city(),
          currentDist = get.dist();

    let lastWidth = window.innerWidth;
    let linkTo;

    if(currentCity === "全國"){
        document.querySelector(".area-votes h5").innerHTML = "各縣市投票總覽";
        linkTo = link.toCity;
        
    }else if((currentCity != "全國") && (currentDist === "全部區域")){
        document.querySelector(".area-votes h5").innerHTML = "各鄉鎮市區投票總覽";
        linkTo = link.toDist;

    }else if(currentDist != "全部區域"){
        document.querySelector(".area-votes h5").innerHTML = "各村里投票總覽";
    }

    function tableS() {
        tbody.innerHTML = "";
        thead.innerHTML = `
            <tr>
                <th style="min-width: 66px;">地區</th>
                <th style="width: 75%;"></th>
                <th></th>
            </tr>
        `

        Object.keys(areaData).forEach((area) => {
            const data = areaData[area];
            const tr = document.createElement("tr");
            tr.setAttribute("data-area", area);
    
            tr.innerHTML = `
                <td><h6>${area}</h6></td>
                <td>
                    <div class="td-elected">
                        <span class="font-2">當選人</span>
                        <div class="table-number"></div>
                        <span></span>
                    </div>
                    <div class="proportion-bar">${proportionBar}</div>
                </td>
                <td class="td-arrow"></td>
            `
            const max = maxParty();
    
            tr.querySelectorAll(".proportion-bar div").forEach((div) => {
                const party = div.dataset.party;
                div.style.width = `${data[party].rate}%`;
    
                max(data[party].total, party);
            })
            
            tr.querySelector(".td-elected").style.marginBottom = "8px";
            tr.querySelector(".td-elected .table-number").innerHTML = candData[max()].number;
            tr.querySelector(".td-elected .table-number").style.background = partyColor[max()];
            tr.querySelector(".td-elected span:last-child").innerHTML = candData[max()].name;
            
            tbody.appendChild(tr);
        })
    }

    function tableL() {
        tbody.innerHTML = "";
        thead.innerHTML = `
            <tr>
                <th>地區</th>
                <th style="width:25%">得票率</th>
                <th>當選人</th>
                <th>投票數</th>
                <th>投票率</th>
                <th></th>
            </tr>
        `
        Object.keys(areaData).forEach((area) => {
            const data = areaData[area];
            const tr = document.createElement("tr");
            tr.setAttribute("data-area", area);
    
            tr.innerHTML = `
                <td><h6>${area}</h6></td>
                <td>
                    <div class="proportion-bar">${proportionBar}</div>
                </td>
                <td class="td-elected">
                    <div class="table-number"></div>
                    <span></span>
                </td>
                <td>${data.total.toLocaleString()}</td>
                <td>${data.rate}%</td>
                <td class="td-arrow"></td>
            `
            const max = maxParty();
    
            tr.querySelectorAll(".proportion-bar div").forEach((div) => {
                const party = div.dataset.party;
                div.style.width = `${data[party].rate}%`;
    
                max(data[party].total, party);
            })
    
            tr.querySelector(".td-elected .table-number").innerHTML = candData[max()].number;
            tr.querySelector(".td-elected .table-number").style.background = partyColor[max()];
            tr.querySelector(".td-elected span").innerHTML = candData[max()].name;
            
            tbody.appendChild(tr);
        })
    }

    if(window.innerWidth > 576){
        tableL();
    }else{
        tableS();
    }

    window.addEventListener("resize", () => {
        if(lastWidth <= 576 && window.innerWidth > 576){
            tableL();
        }else if(lastWidth > 576 && window.innerWidth <= 576){
            tableS();
        }

        lastWidth = window.innerWidth; 
    })

    if(islink){
        tbody.style.cursor = "pointer";
        tbody.querySelectorAll("tr").forEach((tr) => {
            tr.addEventListener("click", (e) => {
                linkTo(e.currentTarget.dataset.area);
            })
        })
    }else{
        tbody.style.cursor = "auto";
        tbody.querySelectorAll(".td-arrow").forEach((td) => {
            td.classList.remove("td-arrow");
        })
    }
}

export function loadCandList(){
    const candData = getCandData();
    const candList = document.querySelector(".pres-votes .cand-list");
    const proportionBar = document.querySelector(".pres-votes .proportion-bar");
    
    candList.innerHTML = "";
    proportionBar.innerHTML = "";

    Object.keys(candData).forEach((party) => {
        const div = document.createElement("div");
        div.classList.add("cand");
        div.setAttribute("data-party", party);

        div.innerHTML = `<div class="cand-number" style="background: ${partyColor[party]};">${candData[party].number}</div>
                         <div class="cand-info">
                             <small>${party}</small>
                             <p class="font-1">${candData[party].name}</p>
                             <h6></h6>
                             <span class="font-2">票</span>
                         </div>`;

        candList.appendChild(div);
    })

    proportionBar.innerHTML = addProportionBar(Object.keys(candData));
}

export function loadPage(){
    let voteData = getVoteData();
    const currentCity = get.city(),
          currentDist = get.dist();

    if(currentCity === "全國"){
        document.querySelector("main h3").innerHTML = "全臺縣市總統得票";
        loadAreaVotes(voteData.縣市, true);
        voteData = voteData.全國;

    }else if((currentCity != "全國") && (currentDist === "全部區域")){
        document.querySelector("main h3").innerHTML = `${currentCity}總統得票`;
        loadAreaVotes(voteData.鄉鎮市區, true);

    }else if(currentDist != "全部區域"){
        document.querySelector("main h3").innerHTML = `${currentCity}${currentDist}總統得票`;
        loadAreaVotes(voteData.村里, false);
    }

    const rate = voteData.rate;

    document.getElementById("total").innerHTML = voteData.total.toLocaleString();
    document.getElementById("rate").innerHTML = `${rate}%`;
    document.getElementById("valid").innerHTML = voteData.valid.toLocaleString();
    document.getElementById("invalid").innerHTML = voteData.invalid.toLocaleString();
    
    drawDonutChart([100 - rate, rate]);

    const candList = document.querySelector(".pres-votes .cand-list");
    const max = maxParty();

    candList.querySelectorAll(".cand").forEach((cand) => {
        const party = cand.dataset.party;
        cand.querySelector("h6").innerHTML = voteData[party].total.toLocaleString();

        max(voteData[party].total, party);
    })

    const candElected = candList.querySelector(".elected");
    candElected && candElected.classList.remove("elected");
    candList.querySelector(`.cand[data-party="${max()}"] p`).classList.add("elected");

    const proportionBar = document.querySelectorAll(".pres-votes .proportion-bar div");

    proportionBar.forEach((div) => {
        div.innerHTML = "";
        const party = div.dataset.party;
        const small = document.createElement("small");
        small.innerHTML = `${voteData[party].rate}%`;
        div.style.width = `${voteData[party].rate}%`;
        div.appendChild(small);
    })
}