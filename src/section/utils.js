import voteData from "../data/election.json" assert { type: "json" };
import candData from "../data/candidates.json" assert { type: "json" };

let currentYear, currentCity, currentDist;

export const set = {
    year: function(year){
        currentYear = year;
    },
    city: function(city){
        currentCity = city;
    },
    dist: function(dist){
        currentDist = dist;
    }
}

export const get = {
    year: function(){
        return currentYear;
    },
    city: function(){
        return currentCity;
    },
    dist: function(){
        return currentDist;
    }
}

export const link = {
    toYear: function(year){
        document.getElementById("year").dataset.value = year;
    },
    toCity: function(city){
        document.getElementById("city").dataset.value = city;
    },
    toDist: function(dist){
        document.getElementById("dist").dataset.value = dist;
    }
}

export function maxParty(){
    let maxNum = 0;
    let max = "";

    return function(num, party){
        if(num > maxNum){
            max = party;
            maxNum = num;
        }
        
        return max;
    }
}

export const yearList = Object.keys(voteData);

export function getCityList(){
    return Object.keys(voteData[currentYear].縣市)
}

export function getDistList(){
    return Object.keys(voteData[currentYear].縣市[currentCity].鄉鎮市區)
}

export function getVoteData(){
    if(currentCity === "全國"){
        return voteData[currentYear];

    }else if((currentCity != "全國") && (currentDist === "全部區域")){
        return voteData[currentYear].縣市[currentCity];

    }else if(currentDist != "全部區域"){
        return voteData[currentYear].縣市[currentCity].鄉鎮市區[currentDist];
    }
}

export function getCandData(){
    return candData[currentYear];
}

export const partyColor = {
    "國民黨": "#8082FF",
    "民進黨": "#57D2A9",
    "無黨籍": "#CDCDCD",
    "親民黨": "#F4A76F",
    "新黨": "#F4D625",
    "其他": "#9D9D9D",
    "連署(1)": "#CDCDCD",
    "連署(4)": "#986769",
    "民眾黨": "#80CED4"
}