const stringSimilarity = require("string-similarity");


const similarity= stringSimilarity.compareTwoStrings("DYEN - Gotta let you go".toLocaleLowerCase(), "DYEN - Gotta Let You Go".toLocaleLowerCase());

console.log("similarity",similarity);