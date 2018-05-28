/* populate a dropdown select element with list of sample names */
    //reference to dropdown select element
    let selDataset = document.getElementById("selDataset");
    let url = "/names";

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

/* default sample */
var defaultSamp = "BB_940"

//////////////////////////
/* initial loading page */
//////////////////////////
function init(sample) {
    //get data from sample route 
    Plotly.d3.json(`/samples/${sample}`, function(error, sampleData) {
        if (error) return console.log(error);
        //console.log(sampleData);

        //slice to grab top 10 values from keys
        var sampleValues = sampleData[0]["sample_values"].slice(0, 10);
        var otuIds = sampleData[0]["otu_ids"].slice(0, 10);

        //get values for bubble chart x- and y-axis 
        var xAxis = sampleData[0]["otu_ids"]
        var yAxis = sampleData[0]["sample_values"]
    
    //get data from otu route
    Plotly.d3.json("/otu", function(error, otuData) {
        if (error) return console.log(error);
        //console.log(otuData);
        
        //loop through otuData and append otuIds to list
        var otuLabel = []
        for (var i = 0; i < otuIds.length; i++) {
            otuLabel.push(otuData[otuIds[i]])
        }
        ///////////////
        /* PIE CHART */
        ///////////////       
        //set up data for pie chart
        var pieData = [{
            values: sampleValues,
            labels: otuIds,
            hovertext: otuLabel,
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
        Plotly.newPlot("pie", pieData, pieLayout);

        //////////////////
        /* BUBBLE CHART */
        //////////////////
        //set up data for bubble chart 
        var bubbleData = [{
            x: xAxis,
            y: yAxis,
            hovertext: otuLabel,
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
        Plotly.newPlot("bubble", bubbleData, bubbleLayout);
    });
});
    ////////////////////
    /* METADATA PANEL */
    ////////////////////
    //get data from metadata route
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
//////////////////////////////////
/* update pie and bubble charts */
//////////////////////////////////
function updatePie(newsampleValues, newotuIds, newSample) {
    let pie = document.getElementById("pie");
    Plotly.restyle(pie, "values", [newsampleValues]);
    Plotly.restyle(pie, "labels" [newotuIds]);
};

function updateBubble(newX, newY, newSample) {
    let bubble = document.getElementById("bubble");
    Plotly.restyle(bubble, "x", [newX]);
    Plotly.restyle(bubble, "y", [newY]);
};

/////////////////////////////
/* option changed function */
/////////////////////////////
function optionChanged(newSample) {
    var sampleUrl = `/samples/${newSample}`
    var metadataUrl = `/metadata/${newSample}`
    
    //update pie and bubble charts//
    //get new data from sample route//
    Plotly.d3.json(sampleUrl, function(error, newData) {
        if (error) return console.log(error);
        console.log(newData);

        //slice to grab top 10 values from keys
        var newsampleValues = newData[0]["sample_values"].slice(0, 10);
        var newotuIds = newData[0]["otu_ids"].slice(0, 10);

        //get values for bubble chart x- and y-axis 
        var newX = newData[0]["otu_ids"]
        var newY = newData[0]["sample_values"]

        updatePie(newsampleValues, newotuIds, newSample);
        updateBubble(newX, newY, newSample);
    
    //update metadata//
    Plotly.d3.json(metadataUrl, function(error, metaData) {
        if (error) return console.log(error);
        console.log(metaData);
    
        //get list of keys from metaData
        var sampleKeys = Object.keys(metaData);
        var sampleMetadata = document.getElementById("sampleMetadata");

        //clear current data
        sampleMetadata.innerHTML = null;
    
        //loop through sampleKeys to get key, value pairs, create div and append 
        for (var i = 0; i < sampleKeys; i++) {
            var keyValue = document.createElement("p");               
            keyValue.innerHTML = sampleKeys[i] + ": " + metaData[sampleKeys[i]];
            sampleMetadata.appendChild(keyValue);
        };
    });
   });
};
init(defaultSamp);

