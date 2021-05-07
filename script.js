(function () {
    var elements = document.getElementsByClassName('DetailedReportContent__table');
    if (elements.length > 0) {
        const table = elements[0];
        const body = table.children[1];
        const items = body.children;        
        const records = [];
        var project = "";
        var comment = "";
        var duration = "";        
        var date = "";
        for (let index = 0; index < items.length; index++) {
            const element = items[index];
            project = element.getElementsByClassName("css-1q07lv6-NameContainer e1t0hi2n9")[0]?.children[0]?.textContent;
            comment = element.getElementsByClassName("ebdwukj8 css-14l5gqu-TimeEntryDescription-DescriptionInput e10vqxue0")[0]?.textContent;            
            duration = element.getElementsByClassName("css-1xlwrd0-Highlighted e1ujoigz0")[0].textContent;
            date = element.getElementsByClassName("DateTimeInput__startDate")[0].textContent;
            records.push({ project, comment, duration, date });
        }

        return records;
    }
    return [];
})();