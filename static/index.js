//create initial function
function init() {
    //get reference to drop down select
    var selDataset = document.getElementById("selDataset");
    var url = "/names";

    Plotly.d3.json(url, function(error, sampleName) {
        if (error) return console.warn(error);
        //console.log(sampleName); 

        // create option element, append samples to select tag
        for (var i = 0; i < sampleName.length; i++) {
            var currentOption = document.createElement("option");
            currentOption.innerHTML = sampleName[i];
            currentOption.value = sampleName[i];
            selDataset.appendChild(currentOption);
        };
    });
    //use BB_940 as default data
    createMetadata("BB_940");
    createGauge("BB_940");
    createCharts("BB_940");
};

/ /////////////////////////////
/* option changed function */
/////////////////////////////
function optionChanged(sample) {
    createMetadata(sample);
    createGauge(sample);
    updateCharts(sample);
};

////////////////////
/* METADATA PANEL */
////////////////////
function createMetadata(sample) {
    Plotly.d3.json(`/metadata/${sample}`, function(error, metaData) {
        if (error) return console.log(error);
        console.log(metaData);

        //get list of keys from metaData 
        var sampleKeys = Object.keys(metaData);
        var sampleMetadata = document.getElementById("sampleMetadata");

        //clear current data
        sampleMetadata.innerHTML = null;

        //loop through sampleKeys to get key, value pairs, create div and append 
        for (var i = 0; i < sampleKeys.length; i++) {
            var keyValue = document.createElement("p");
            keyValue.innerHTML = sampleKeys[i] + ": " + metaData[sampleKeys[i]];
            sampleMetadata.appendChild(keyValue);
        };
    });    
};

function createCharts(sample) {
    //get data from sample route 
    Plotly.d3.json(`/samples/${sample}`, function(error, sampleData) {
        if (error) return console.log(error);
        //console.log(sampleData);
        
        for (var i = 0; i < sampleData.length; i++) {
        //slice to grab top 10 values from keys
        var sampleValues = sampleData[0]["sample_values"].slice(0, 10);
        var otuIds = sampleData[0]["otu_ids"].slice(0, 10);

        //get values for bubble chart x- and y-axis 
        var xAxis = sampleData[0]["otu_ids"]
        var yAxis = sampleData[0]["sample_values"]
    
        };

        ///////////////
        /* PIE CHART */
        ///////////////
        //get reference to pie chart
        var PIE = document.getElementById("pie");
               
        //set up data for pie chart
        var pieData = [{
            values: sampleValues,
            labels: otuIds,
            //hovertext: otuLabels.slice(0, 10),
            type: "pie"
        }];
        //set up layout for pie chart
        var pieLayout = {
            width: 450,
            height: 450,
            margin: {
                l: 20,
                r: 20,
                b: 20,
                t: 20
            }
        };
        //plot pie chart 
        Plotly.newPlot(PIE, pieData, pieLayout);

        //////////////////
        /* BUBBLE CHART */
        //////////////////
        //set up data for bubble chart 
        var bubbleData = [{
            x: xAxis,
            y: yAxis,
            //hovertext: otuLabel,
            mode: "markers",
            marker: {
                size: sampleData[0]["sample_values"],
                color: sampleData[0]["otu_ids"],
                colorscale: "Earth"
            },
            type: "scatter"
        }];

        //set up layout for bubble chart
        var bubbleLayout = {
            xaxis: {title: "OTU IDs"},
            showlegend: false,
            height: 600,
            width: 1200
        };
        
        //plot bubble chart
        Plotly.plot("bubble", bubbleData, bubbleLayout);
    });
};

//////////////////////////////////
/* update pie and bubble charts */
//////////////////////////////////
function updateCharts(sample) {
    //get data from sample route 
    Plotly.d3.json(`/samples/${sample}`, function(error, sampleData) {
        if (error) return console.log(error);
        //console.log(sampleData);
        
        for (var i = 0; i < sampleData.length; i++) {
            //slice to grab top 10 values from keys
            values = sampleData[0]["sample_values"].slice(0, 10);
            labels = sampleData[0]["otu_ids"].slice(0, 10);

            //get values for bubble chart x- and y-axis 
            var newX = sampleData[0]["otu_ids"]
            var newY = sampleData[0]["sample_values"]
        };

        //get references to pie and bubble charts
        var PIE = document.getElementById("pie");
        var BUBBLE = document.getElementById('bubble');

        //update pie and bubble charts
        Plotly.restyle(pie, "values", [values]);
        Plotly.restyle(pie, "labels" [labels]);

        Plotly.restyle(bubble, "x", [newX]);
        Plotly.restyle(bubble, "y", [newY]);
    });
};

//////////////////////////
/* WASH FREQUENCY GAUGE */
//////////////////////////
function createGauge(sample) {
    Plotly.d3.json(`/wfreq/${sample}`, function(error, wfreq) {
        if (error) return console.warn(error);

        // Enter the washing frequency between 0 and 180
        var level = wfreq*20;

        // Trig to calc meter point
        var degrees = 180 - level,
            radius = .5;
        var radians = degrees * Math.PI / 180;
        var x = radius * Math.cos(radians);
        var y = radius * Math.sin(radians);

        // Path: may have to change to create a better triangle
        var mainPath = 'M -.0 -0.05 L .0 0.05 L ',
            pathX = String(x),
            space = ' ',
            pathY = String(y),
            pathEnd = ' Z';
        var path = mainPath.concat(pathX,space,pathY,pathEnd);

        var data = [{ type: 'scatter',
            x: [0], y:[0],
            marker: {size: 12, color:'850000'},
            showlegend: false,
            name: 'Freq',
            text: level,
            hoverinfo: 'text+name'},
        { values: [50/9, 50/9, 50/9, 50/9, 50/9, 50/9, 50/9, 50/9, 50/9, 50],
        rotation: 90,
        text: ['8-9', '7-8', '6-7', '5-6', '4-5', '3-4', '2-3', '1-2', '0-1', ''],
        textinfo: 'text',
        textposition:'inside',
        marker: {
            colors:[
                'rgba(0, 105, 11, .5)', 'rgba(10, 120, 22, .5)',
                'rgba(14, 127, 0, .5)', 'rgba(110, 154, 22, .5)',
                'rgba(170, 202, 42, .5)', 'rgba(202, 209, 95, .5)',
                'rgba(210, 206, 145, .5)', 'rgba(232, 226, 202, .5)',
                'rgba(240, 230, 215, .5)', 'rgba(255, 255, 255, 0)']},
        labels: ['8-9', '7-8', '6-7', '5-6', '4-5', '3-4', '2-3', '1-2', '0-1', ''],
        hoverinfo: 'label',
        hole: .5,
        type: 'pie',
        showlegend: false
        }];

        var layout = {
        shapes:[{
            type: 'path',
            path: path,
            fillcolor: '850000',
            line: {
                color: '850000'
            }
            }],

        title: '<b>Belly Button Washing Frequency</b> <br> Scrubs per Week',
        height: 500,
        width: 500,
        xaxis: {zeroline:false, showticklabels:false,
                    showgrid: false, range: [-1, 1]},
        yaxis: {zeroline:false, showticklabels:false,
                    showgrid: false, range: [-1, 1]}
        };
        
        //get reference to gauge
        var GAUGE = document.getElementById('gauge');
        
        //plot gauge
        Plotly.newPlot(GAUGE, data, layout);
    });
};

init();
