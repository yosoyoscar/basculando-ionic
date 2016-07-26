'use strict';

angular
	.module('basculando.charts',[])
	.factory('Charts', [ function() {

	function drawChart(dataArray, bmi) {
		if (dataArray != null && dataArray.length > 0 && document.getElementById('lineChart')){
			// Line Chart
		    var weightInfo = [['Date', 'Weight']];
		    for (var i=0 ; i < dataArray.length ; i++){
		      weightInfo.push([dataArray[i].date, dataArray[i].weight]);
		    }
		    var lineData = google.visualization.arrayToDataTable(weightInfo);
		    // var data = google.visualization.arrayToDataTable([['Date', 'Weight'],['2004',  1000],['2005',  1170],]);
		    var lineOptions = {
		      title: '',
		      curveType: 'function',
		      legend: { position: 'none' }
		    };

		    var lineChart = new google.visualization.LineChart(document.getElementById('lineChart'));
		    lineChart.draw(lineData, lineOptions);

		    // Gauge chart
		    var gaugeData = google.visualization.arrayToDataTable([
          		['Label', 'Value'],
          		['BMI', bmi]
        	]);
		    var gaugeOptions = {
	          yellowFrom:10, yellowTo: 18.5,
	          greenFrom:18.5 , greenTo:25,
	          redFrom: 25, redTo: 35,
	          min: 10,
	          max: 35
			};

        	var gaugeChart = new google.visualization.Gauge(document.getElementById('gaugeChart'));
        	gaugeChart.draw(gaugeData, gaugeOptions);
		}
	}

    return {
      drawChart: drawChart
    };
  }])