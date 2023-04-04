const enData = "english.json";
const npData = "nepali.json";

const toggleButton = document.getElementById("language-toggle");
let isNepali = false;

toggleButton.addEventListener("click", () => {
  isNepali = !isNepali;
  fetchData();
});

function fetchData() {
  const dataFile = isNepali ? npData : enData;
  fetch(dataFile)
    .then((response) => response.json())
    .then((data) => processData(data));
}

function processData(data) {
  const treeData = [];

  for (const [provinceName, districts] of Object.entries(data)) {
    const provinceNode = {
      text: isNepali ? provinceName : provinceName.replace(/\d+/g, ""),
      children: [],
    };

    for (const [districtName, municipalities] of Object.entries(districts)) {
      const districtNode = {
        text: isNepali ? districtName : districtName.replace(/\d+/g, ""),
        children: [],
      };

      for (const [municipalityName, wards] of Object.entries(municipalities)) {
        const municipalityNode = {
          text: isNepali
            ? municipalityName
            : municipalityName.replace(/\d+/g, ""),
          children: [],
        };

        for (const ward of wards) {
          const wardNode = { text: ward };
          municipalityNode.children.push(wardNode);
        }

        districtNode.children.push(municipalityNode);
      }

      provinceNode.children.push(districtNode);
    }

    treeData.push(provinceNode);
  }

  $("#jstree").jstree("destroy");
  $("#jstree").jstree({
    core: {
      data: treeData,
    },
  });
}

// Load data from "english.json" file on initial page load
fetchData();
