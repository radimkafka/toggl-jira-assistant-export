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
    getWorkspaceId();
    return;
    const config = window.config;
    const data = window.data.base;
    const processedData = processData(data);
    const groupedData = groupData(processedData, config.roundDuration);
    const filteredData = filterData(groupedData, config.filter);
    const items = getAllItems(filteredData);
    const sums = sum(items).map(a => ({ projectName: a.projectName, durationStr: timeFormat(a.duration,true), originalDurationStr: timeFormat(a.originalDuration,true), duration: a.duration, originalDuration: a.originalDuration }));
    console.log('sums: ', sums);

    // const groupedByDate = groupByDate(items);
    // groupedByDate.map(a => ({ date: a.date, items: sum(a.items).map(a => ({ projectName: a.projectName, originalDurationStr: timeFormat(a.originalDuration, true), duration: a.duration, originalDuration: a.originalDuration })) }))
    //     .forEach(a => { console.log(a.date); console.log(a.items); })
}

function getAllItems(data) {
    return data.reduce((acc, curr) => acc.concat(curr.items), []);
}

function sum(items) {
    return items.reduce((acc, curr) => {
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