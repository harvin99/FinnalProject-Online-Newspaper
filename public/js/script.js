function showCategories() {
  var categories = document.getElementById("categories");
  categories.classList.toggle("show");
}

var tabButtons = document.querySelectorAll(
  ".tabContainer .buttonContainer .tab__item"
);
var tabPanel = document.querySelectorAll(".tabContainer .tabPanel");
function showPanel(panelIndex) {
  tabButtons.forEach(function (node) {
    node.style.backgroundColor = "#dddddd";
    node.style.color = "black";
  });

  tabButtons[panelIndex].style.backgroundColor = "#f0a500";
  tabButtons[panelIndex].style.color = "white";

  tabPanel.forEach(function (node) {
    node.style.display = "none";
  });
  tabPanel[panelIndex].style.display = "block";
}
function loadModal() {
  tabButtons[1].style.backgroundColor = "#dddddd";
  tabButtons[1].style.color = "black";
  tabPanel[1].style.display = "none";

  tabButtons[0].style.backgroundColor = "#f0a500";
  tabButtons[0].style.color = "white";
  tabPanel[0].style.display = "block";
}
function setQuery(e, key, value, { deleteItems = [], url } = {}) {
  e.preventDefault();
  let urlObj = new URL(url || window.location.href);
  value ? urlObj.searchParams.set(key, value) : urlObj.searchParams.delete(key);
  deleteItems.map((item) => urlObj.searchParams.delete(item));
  window.location.href = urlObj.href;
}

$(function () {
  $(".clickable-row").click(function () {
    window.location = $(this).data("href");
  });
});
