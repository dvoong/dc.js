console.log("hello all");

var livingThings = crossfilter([
    // Fact data.
    {name: "Rusty", type: "human", legs: 2 },
    {name: "Alex", type: "human", legs: 2},
    {name: "Lassie", type: "dog", legs: 4},
    {name: "Spot", type: "dog", legs: 4},
    {name: "Polly", type: "bird", legs: 2},
    {name: "Fiona", type: "plant", legs: 0}
]);

console.log("livingThings");
console.log(livingThings);

// How many living things are in my house?
var n = livingThings.groupAll().reduceCount().value();
console.log("There are " + n + " living things in my house."); // 6

// How many total legs are in my house?
var legs = livingThings.groupAll().reduceSum(function(fact) {return fact.legs;}).value();
console.log("There are " + legs + " legs in my house.") // 14

// Filtering

// Filter for dogs
var typeDimension = livingThings.dimension(function(d) {return d.type;});
typeDimension.filter("dog");

var n = livingThings.groupAll().reduceCount().value();
console.log("There are " + n + " dogs in my house."); // 2

var legs = livingThings.groupAll().reduceSum(function(d){return d.legs;}).value();
console.log("There are " + legs + " dog legs in my house."); // 8

// Clear the filter
typeDimension.filterAll();

// console.log(typeDimension.top(4));
// console.log(typeDimension.top(1)[0]);

// Grouping

// How many living things of each type are in my house?
var countMeasure = typeDimension.group().reduceCount();
var a = countMeasure.top(4);
for(var i in a){
    console.log("There are " + a[i].value + " " + a[i].key + "(s) in my house.");
}

// How many legs of each type are in my house?
var legMeasure = typeDimension.group().reduceSum(function(fact) {return fact.legs;});
var a = legMeasure.top(4);
for(var i in a){
    console.log("There are " + a[i].value + " " + a[i].key + " legs in my house.");
}

// Gotchas

// Filter for dogs
typeDimension.filter("dog");

// How many living things of each type are in my house?
// You'd expect this to return 0 for anything other than dogs,
// but it doesn't becuase the following statement ignores any
// filter applied to typeDimension:
var countMeasure = typeDimension.group().reduceCount();
var a = countMeasure.top(4);
for(var i in a){
    console.log("There are " + a[i].value + " " + a[i].key + "(s) in my house.");
}

// Workaround

// Filter for dogs.
var typeFilterDimension = livingThings.dimension(function(fact) {return fact.type;});
typeFilterDimension.filter("dog");

// Now this returns what you would expect
console.log("huh");
var countMeasure = typeDimension.group().reduceCount();
var a = countMeasure.top(4);
for(var i in a){
    console.log("There are " + a[i].value + " " + a[i].key + "(s) in my house.");
}

console.log(livingThings.size());


