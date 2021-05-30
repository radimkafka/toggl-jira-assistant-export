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
];

const baseConfig = {
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
    // testRounding();
    testUpdateRecord();
    return;
    const config = window.config;
    const data = window.data.base;
    const processedData = processData(data);
    const groupedData = groupData(processedData);
    const filteredData = filterData(groupedData, config);
    filteredData.forEach(a => console.log(getReportContent(a.items)));

    const sums = sum(filteredData);

    // const groupedByDate = groupByDate(items);
    // groupedByDate.map(a => ({ date: a.date, items: sum(a.items).map(a => ({ projectName: a.projectName, originalDurationStr: timeFormat(a.originalDuration, true), duration: a.duration, originalDuration: a.originalDuration })) }))
    //     .forEach(a => { console.log(a.date); console.log(a.items); })
}

function testRounding() {
    const getSecondsFromMinuts = minutes => minutes * 60;
    const getSeconds = _ => Math.floor(Math.random() * 60);
    const test = duration => {
        var rounded = roundDuration(duration);
        console.log(timeFormat(duration, true), timeFormat(rounded, true));
    };

    for (let i = 0; i <= 10; i++) {
        test(getSecondsFromMinuts(i) + getSeconds());
    }
    for (let i = 40; i < 50; i++) {
        test(getSecondsFromMinuts(i) + getSeconds());
    }
    console.log("_______");
    test(getSecondsFromMinuts(2) + 28);
    test(getSecondsFromMinuts(2) + 29);
    test(getSecondsFromMinuts(2) + 30);
    test(getSecondsFromMinuts(2) + 31);
    test(getSecondsFromMinuts(2) + 32);
}

function testUpdateRecord() {

    const test = item => {
        const updated = updateProjectName(item);
        console.table([item,updated]);
    };


    var data = [
        {
            project: "ABC",
            comment: "123;very useful comment",          
        },
        {
            project: "ABC",
            comment: "231",
        },
        {
            project: "ABC-123",
            comment: "",
        },
        {
            project: "",
            comment: "commentABC",
        },

    ];
    data.forEach(a => {
        test(a);
    });

}



function createSummary(data) {
    const items = data.reduce((acc, curr) => acc.concat(curr.items), []);
    const sums = sum(items);
    const newLine = "\r\n";
    let text = "Project name;Rounded duration, original duration";
    sums.forEach(a => text += newLine + `${a.projectName};${a.durationStr};${a.originalDurationStr}`);
    const totalDur = sums.reduce((acc, curr) => acc + curr.originalDuration, 0);
    const totalRoundedDur = sums.reduce((acc, curr) => acc + curr.duration, 0);
    text += newLine + `Total;${timeFormat(totalRoundedDur, true)};${timeFormat(totalDur, true)}`;

    download("summary.csv", text);
}

function sum(items) {
    var summed = items.reduce((acc, curr) => acc.concat(curr.items), []);
    summed = items.reduce((acc, curr) => {
        const item = acc.find(a => a.projectName === curr.projectName)
        if (item) {
            item.duration = item.duration + curr.totalDuration;
            item.originalDuration = item.originalDuration + curr.originalDuration;
        }
        else {
            acc.push({ projectName: curr.projectName, duration: curr.totalDuration, originalDuration: curr.originalDuration });
        }
        return acc;
    }, []);

    return summed.map(a => ({ projectName: a.projectName, durationStr: timeFormat(a.duration, true), originalDurationStr: timeFormat(a.originalDuration, true), duration: a.duration, originalDuration: a.originalDuration }));
}


function groupByDate(data) {
    let month = [];
    data.forEach(a => {
        const item = month.find(i => i.date === a.date);
        if (item) {
            item.items.push(a);
        }
        else {
            month.push({ date: a.date, items: [a] });
        }
    });
    return month;
}