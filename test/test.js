const testData = [
    {
        "description": "52;Test123",
        "start": "2021-05-03T07:00:55+02:00",
        "dur": 23 * 60 * 1000,
        "project": "Test",
    },
    {
        "description": "52;Test123",
        "start": "2021-05-04T07:00:55+02:00",
        "dur": 20 * 60 * 1000,
        "project": "Test",
    },
    {
        "description": "52;Test123",
        "start": "2021-05-04T07:00:55+02:00",
        "dur": 120 * 60 * 1000,
        "project": "Blabla",
    },
    {
        "description": "53;Test123",
        "start": "2021-05-04T07:00:55+02:00",
        "dur": 120 * 60 * 1000,
        "project": "Blabla",
    }
]

const config = {
    "workspaceId": 3522757,
    "roundDuration": false,
    "filter": [
        {
            "filename": "elx",
            "restAs": "AAAA-11",
            "includedProjects": [
                "Test"
            ]
        }
    ]
}


function test() {
    // const data = getData("./data.json");

    const data = testData;
    const processedData = processData(data);
    const groupedData = groupData(processedData, config.roundDuration);
    const filteredData = filterData(groupedData, config.filter);
    filteredData.forEach(a => {
        console.log(a.name);
        console.log(a.items);

    });
}

async function fetchData(url) {
    var response = await fetch(url);
    return await response.json();
}

function readTextFile(file) {
    var rawFile = new XMLHttpRequest();
    rawFile.open("GET", file, false);
    rawFile.onreadystatechange = function () {
        if (rawFile.readyState === 4) {
            if (rawFile.status === 200 || rawFile.status == 0) {
                var allText = rawFile.responseText;
                alert(allText);
            }
        }
    }
    rawFile.send(null);
}