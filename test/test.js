function test() {
    // const data = getData("./data.json");
    readTextFile("data.json");
    console.log("bbb");
    console.log('data: ', data);
    // const processedData = processData(data);
    // const groupedData = groupData(processedData, config.roundDuration);
    // createReports(groupedData, config.filter);
}

function getData(url) {
    var fs = require('fs');
    var files = fs.readdirSync('url');
    console.log('files: ', files);
}

async function fetchData(url) {
    var response = await fetch(url);
    return await response.json();    
}

function readTextFile(file)
{
    var rawFile = new XMLHttpRequest();
    rawFile.open("GET", file, false);
    rawFile.onreadystatechange = function ()
    {
        if(rawFile.readyState === 4)
        {
            if(rawFile.status === 200 || rawFile.status == 0)
            {
                var allText = rawFile.responseText;
                alert(allText);
            }
        }
    }
    rawFile.send(null);
}