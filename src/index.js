import { yearList, getCityList, getDistList, set } from "./section/utils.js"
import { loadPage, loadCandList } from "./section/main.js"
import { drawBarChart, drawLineChart } from "./section/chart.js"
import { drawMap } from "./section/map.js"

const yearOptions = document.querySelector(".year-select .options");
const cityOptions = document.querySelector(".city-select .options");
const distOptions = document.querySelector(".dist-select .options");

const yearSelected = document.getElementById("year");
const citySelected = document.getElementById("city");
const distSelected = document.getElementById("dist");

function addOptions(list, target){
    list.forEach((item) => {
        const li = document.createElement("li");
        li.setAttribute("data-value", item);
        li.innerHTML = item;
        target.appendChild(li);
    })
}

addOptions(yearList, yearOptions);

let isNewYear = false;

const observerYear = new MutationObserver((mutationsList, observer) => {
    mutationsList.forEach((mutation) => {
        if (mutation.type === 'attributes' && mutation.attributeName === 'data-value') {
            const currentYear = mutation.target.getAttribute('data-value');
            yearSelected.innerHTML = currentYear;
            set.year(currentYear);

            const cityList = getCityList();
            cityList.unshift("全國")
            citySelected.dataset.value = cityList[0];

            cityOptions.innerHTML = "";
            addOptions(cityList, cityOptions);

            loadCandList();

            isNewYear = true;
        }
    });
});

const observerCity = new MutationObserver((mutationsList, observer) => {
    mutationsList.forEach((mutation) => {
        if (mutation.type === 'attributes' && mutation.attributeName === 'data-value') {
            const currentCity = mutation.target.getAttribute('data-value');
            citySelected.innerHTML = currentCity;
            set.city(currentCity);

            const distList = (currentCity === "全國") ? [] : getDistList();
            distList.unshift("全部區域")
            distSelected.dataset.value = distList[0];

            distOptions.innerHTML = "";
            addOptions(distList, distOptions);
        }
    });
});

const observerDist = new MutationObserver((mutationsList, observer) => {
    mutationsList.forEach((mutation) => {
        if (mutation.type === 'attributes' && mutation.attributeName === 'data-value') {
            const currentDist = mutation.target.getAttribute('data-value');
            distSelected.innerHTML = currentDist;
            set.dist(currentDist);
            
            loadPage();

            if(isNewYear){
                drawMap();
                isNewYear = false;
            }
        }
    });
});

const config = { attributes: true, childList: false, subtree: false };

observerYear.observe(yearSelected, config);
observerCity.observe(citySelected, config);
observerDist.observe(distSelected, config);

// Dropdown Menu

const select = document.querySelectorAll(".select");

select.forEach((selectItem) => {
    const selected =  selectItem.querySelector(".selected");
    const optionList = selectItem.querySelector(".options");

    selectItem.addEventListener("click", (e) => {
        e.stopPropagation(); // prevent bubbling to document event listener

        const selectActive = document.querySelector(".active");
        if(selectActive && selectActive !== selectItem) {  // only one selectItem can be displayed at a time
            selectActive.classList.remove("active");
        }

        selectItem.classList.toggle("active");
    })

    optionList.addEventListener("click", (e) => {
        if(e.target.tagName.toLowerCase() === "li"){
            selected.dataset.value = e.target.dataset.value;
        }
    })
})

document.addEventListener("click", () => {
    const selectActive = document.querySelector(".active");
    selectActive && selectActive.classList.remove("active");
})

// Init value
yearSelected.dataset.value = "2024";

drawBarChart();
drawLineChart();
