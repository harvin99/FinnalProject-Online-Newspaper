var tabFilter = document.querySelectorAll('.tabFilter .buttonFilter .tab__item');
var tabFilter__Panel = document.querySelectorAll('.tabFilter .tabFilter__Panel');
tabFilter[0].style.backgroundColor = '#f0a500';
tabFilter[0].style.color = "white";
tabFilter__Panel[0].style.display = "block";
function showFilter__Panel(Filter__panelIndex){
    tabFilter.forEach(function(node){
        node.style.backgroundColor = "#dddddd";
        node.style.color = "black";
    });

    tabFilter[Filter__panelIndex].style.backgroundColor = '#f0a500';
    tabFilter[Filter__panelIndex].style.color = "white";

    tabFilter__Panel.forEach(function(node){
        node.style.display = "none";
    })
    tabFilter__Panel[Filter__panelIndex].style.display = "block";
}