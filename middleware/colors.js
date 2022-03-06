
const colors = [
    "A3BCFB",
    "7AE6BE",
    "DAACFE",
    "FE877C",
    "FAD65B",
    "FDB777",
    "45D4D9",
    "DFDFDF",
    "5383EB",
    "50B648",
    "DB2127"
]

const getRandomColorId = () => {
    const numberOfColors = colors.length;

    return Math.floor(Math.random() * numberOfColors);
}

const getColorById = (id) => {
    return colors[id];
}

module.exports.getRandomColorId = getRandomColorId;
module.exports.getColorById = getColorById;