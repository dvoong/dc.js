var fluctuationChart = dc.barChart('#fluctuation-chart');
var closingChart = dc.barChart("#closing-chart");
// var moveChart = dc.lineChart('#monthly-move-chart');
// var volumeChart = dc.barChart('#monthly-volume-chart');
var compositeChart = dc.compositeChart("#composite-chart1");
var stackedChart = dc.barChart("#stacked-chart");

d3.csv('ndx.csv', function(data){
    console.log(data);
    
    var dateFormat = d3.time.format('%m/%d/%Y');
    var numberFormat = d3.format('.2f');

    data.forEach(function (d) {
	d.dd = dateFormat.parse(d.date);
	d.month = d3.time.month(d.dd); // pre-calculate month for better performance
	d.close = +d.close; // coerce to number
	d.open = +d.open;
    });

    var ndx = crossfilter(data);
    var all = ndx.groupAll();

    var yearlyDimension = ndx.dimension(function (d) {
	return d3.time.year(d.dd).getFullYear();
    });

    var x = yearlyDimension.group().reduce(
	function(p, v){
	    ++p.count;
	    p.total += v.open;
	    return p;
	},
	function(p, v){
	    --p.count;
	    p.total -= v.open;
	    return p;
	},
	function(){
	    return {count: 0, total: 0};
	}
    );
    
    var y = yearlyDimension.group().reduce(
	function(p, v){
	    ++p.count;
	    p.total += v.close;
	    return p;
	},
	function(p, v){
	    --p.count;
	    p.total -= v.close;
	    return p
	},
	function(){
	    return {count: 0, total: 0};
	}
    )
    
    fluctuationChart
	.width(420)
	.height(180)
	.margins({top: 10, right: 50, bottom: 30, left: 40})
	.dimension(yearlyDimension)
	.group(x)
	.valueAccessor(function(p){
	    var avg = p.value.count > 0 ? p.value.total / p.value.count : 0;
	    return avg;
	})
	.elasticY(true)
	.centerBar(true)
	.gap(1)
	.round(dc.round.floor)
    	.alwaysUseRounding(true)
	.x(d3.scale.linear().domain([1985, 2013]))
    	.renderHorizontalGridLines(true)
	.render();

    closingChart
	.width(420)
	.height(180)
	.margins({top: 10, right: 50, bottom: 30, left: 40})
	.dimension(yearlyDimension)
	.group(y)
	.valueAccessor(function(p){
	    var avg = p.value.count > 0 ? p.value.total / p.value.count : 0;
	    return avg;
	})
	.x(d3.scale.linear().domain([1985, 2013]))
	.elasticY(true)
	.centerBar(true)
	.gap(1)
	.round(dc.round.floor)
	.alwaysUseRounding(true)
	.renderHorizontalGridLines(true)
	.render();

    compositeChart
	.width(768)
	.height(480)
	.x(d3.scale.linear().domain([1985, 2013]))
	.yAxisLabel("The Y Axis")
	.legend(dc.legend().x(80).y(20).itemHeight(13).gap(5))
	.renderHorizontalGridLines(true)
	.compose([
	    dc.barChart(compositeChart)
		.dimension(yearlyDimension)
		.colors('red')
		.group(x, "Top Line")
		.valueAccessor(function(p){
		    return p.value.count > 0 ? p.value.total / p.value.count : 0;
		}),
	    dc.barChart(compositeChart)
		.dimension(yearlyDimension)
		.colors('blue')
		.group(y, "Bottom Line")
		.valueAccessor(function(p){
		    return p.value.count > 0 ? p.value.total / p.value.count : 0;
		})
	]).render();

    stackedChart
	.width(768)
	.height(480)
	.dimension(yearlyDimension)
	.group(x)
	.valueAccessor(function(p){
	    return p.value.count > 0 ? p.value.total / p.value.count : 0;
	})
	.x(d3.scale.linear().domain([1985, 2013]))
	.stack(y, function(p){return p.value.count > 0 ? p.value.total / p.value.count : 0;})
	.render();
    
    // dc.renderAll();
    
    // Dimension by month
    // var moveMonths = ndx.dimension(function (d) {
    // 	return d.month;
    // });

    // var indexAvgByMonthGroup = moveMonths.group().reduce(
    //     function (p, v) {
    //         ++p.days;
    //         p.total += (v.open + v.close) / 2;
    //         p.avg = Math.round(p.total / p.days);
    //         return p;
    //     },
    //     function (p, v) {
    //         --p.days;
    //         p.total -= (v.open + v.close) / 2;
    //         p.avg = p.days ? Math.round(p.total / p.days) : 0;
    //         return p;
    //     },
    //     function () {
    //         return {days: 0, total: 0, avg: 0};
    //     }
    // );

    // var monthlyMoveGroup = moveMonths.group().reduceSum(function (d) {
    //     return Math.abs(d.close - d.open);
    // });

    // moveChart /* dc.lineChart('#monthly-move-chart', 'chartGroup') */
    // 	.renderArea(true)
    // 	.width(990)
    // 	.height(200)
    // 	.transitionDuration(1000)
    // 	.margins({top: 30, right: 50, bottom: 25, left: 40})
    // 	.dimension(moveMonths)
    // 	.mouseZoomable(true)
    // // Specify a "range chart" to link its brush extent with the zoom of the current "focus chart".
    // 	.rangeChart(volumeChart)
    // 	.x(d3.time.scale().domain([new Date(1985, 0, 1), new Date(2012, 11, 31)]))
    // 	.round(d3.time.month.round)
    // 	.xUnits(d3.time.months)
    // 	.elasticY(true)
    // 	.renderHorizontalGridLines(true)
    // //##### Legend

    // // Position the legend relative to the chart origin and specify items' height and separation.
    // 	.legend(dc.legend().x(800).y(10).itemHeight(13).gap(5))
    // 	.brushOn(false)
    // // Add the base layer of the stack with group. The second parameter specifies a series name for use in the
    // // legend.
    // // The `.valueAccessor` will be used for the base layer
    // 	.group(indexAvgByMonthGroup, 'Monthly Index Average')
    // 	.valueAccessor(function (d) {
    // 	    return d.value.avg;
    // 	})
    // // Stack additional layers with `.stack`. The first paramenter is a new group.
    // // The second parameter is the series name. The third is a value accessor.
    // 	.stack(monthlyMoveGroup, 'Monthly Index Move', function (d) {
    // 	    return d.value;
    // 	})
    // // Title can be called by any stack layer.
    // 	.title(function (d) {
    // 	    var value = d.value.avg ? d.value.avg : d.value;
    // 	    if (isNaN(value)) {
    // 		value = 0;
    // 	    }
    // 	    return dateFormat(d.key) + '\n' + numberFormat(value);
    // 	});
    
});
/* var compositeChart1 = dc.compositeChart("#composite-chart1");
   var compositeChart2 = dc.compositeChart("#composite-chart2"); */
