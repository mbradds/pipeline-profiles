const getData = (Url) => {
    var Httpreq = new XMLHttpRequest(); // a new request
    Httpreq.open("GET", Url, false);
    Httpreq.send(null);
    return Httpreq.responseText;
};


//gets the unique regions to populate the dropdown
const getUnique = (items, filterColumns) => {
    if (Array.isArray(filterColumns)) {
        var lookup = [];
        var result = {};

        for (f in filterColumns) {
            lookup.push({})
            result[filterColumns[f]] = []
        }

        for (var item, i = 0; item = items[i++];) {
            for (f in filterColumns) {
                var name = item[filterColumns[f]];
                if (!(name in lookup[f])) {
                    lookup[f][name] = 1;
                    result[filterColumns[f]].push(name);
                }
            }
        }
        return result

    } else {
        var lookup = {};
        var result = [];
        for (var item, i = 0; item = items[i++];) {
            var name = item[filterColumns];
            if (!(name in lookup)) {
                lookup[name] = 1;
                result.push(name);
            }
        }
        return result
    }
}

const applyId = (data,status) => {
    data =  data.map((v,i) => {
        v.id = v['Instrument Number']+'_'+v['Condition Number']
        return v
    })

    data = data.filter(row => row['Short Project Name'] !== 'SAM/COM')
    
    if (status !== 'All'){
        data = data.filter(row => row['Condition Status'] == status)
    }

    return data
}

const themeFilter = (row,t) => {
    return row['Theme(s)'] == t
}

const groupBy = (data,status,returnCounts=false) => {

    var companyCount = null
    var projectCount = null
    var loopCount = 0

    data = applyId(data,status)
    var companyResult = []
    var projectResult = []
    var themeResult = []
    const companies = getUnique(data,'Company')
    companyCount = companies.length

    companies.map((c,ic) => {

        const company = data.filter(row => row.Company == c)

        companyResult.push(
            {
                name: c, 
                y: company.length,
                drilldown: c
            })
        const projects = getUnique(company,'Short Project Name')
        projectCount = projectCount + projects.length
        const projectData = []
        projects.map((p,ip) => {

            const project = company.filter(row => row['Short Project Name'] == p)

            projectData.push({
                name: p,
                y: project.length,
                drilldown:p
            })

            const themes = getUnique(company,'Theme(s)')
            const themeData = []
            themes.map((t,it) => {
                const theme = project.filter(row => row['Theme(s)'] == t) //all rows should go through here. Use this for sumamry counts
                // const theme = project.filter(function(row){
                //     loopCount = loopCount +1
                //     return row['Theme(s)'] == t
                // })
                themeData.push({
                    name: t,
                    y: theme.length
                })
            })

            themeResult.push({
                name: p,
                id: p,
                data: themeData
            })

        })

        projectResult.push({
            name: c,
            id: c,
            data: projectData
        })

        
    })

    const sortResults = (result,level) => {
        if (level == 'Company') {
            result.sort(function (a, b) {
                return b.y - a.y;
            });
        } else if (level == 'Project' || level == 'Theme') {
            result.map((v,i)=> {
                v.data.sort(function (a, b) {
                    return b.y - a.y;
                });
            })
        }

        return result
    }

    companyResult = sortResults(companyResult,'Company')
    projectResult = sortResults(projectResult,'Project')
    themeResult = sortResults(themeResult,'Theme')

    if (returnCounts) {
        const counts = {'companies':companyCount,'projects':projectCount}
        return [companyResult,projectResult,themeResult,counts]
    } else {
        return [companyResult,projectResult,themeResult]
    }

}

const applySummary = (series,counts=false) => {

    const conditionStatus = getUnique(series,'Condition Status')

    statusCount = {}
    conditionStatus.map((v,i) => {
        currStatus = series.filter(row => row['Condition Status'] == v)
        statusCount[v] = currStatus.length
    })

    document.getElementById('open_conditions_number').innerText = statusCount['In Progress']
    document.getElementById('closed_conditions_number').innerText = statusCount['Closed']

    if (counts) {
        document.getElementById('companies_number').innerText = counts.companies
        document.getElementById('projects_number').innerText = counts.projects
    }

    return statusCount //TODO: this function doesnt need to return anything
}


const url = 'https://raw.githubusercontent.com/mbradds/HighchartsData/master/conditions.json'
var githubData = JSON.parse(JSON.stringify(JSON.parse(getData(url))));
var companyResult,projectResult;
[companyResult,projectResult,themeResult,counts] = groupBy(githubData,status='All',returnCounts=true)
var stat = applySummary(githubData,counts)
console.log(companyResult,projectResult,themeResult)

//TODO: have a method that populates the initial chart descriptors, probably in groupBy and then
//have another method that gets called on drilldown that updates descriptors and title.
//TODO: look if the highhcarts data series can have object parameters for filtering.

const createGraph = (companyResult,projectResult,themeResult) => {

var chart = new Highcharts.chart('container', {

    chart: {
        height: 700,
        // width: 1000,
        type: 'bar', 
        zoomType: 'x', //allows the user to focus in on the x or y (x,y,xy)
        //borderColor: 'black',
        //borderWidth: 1,
        animation: true,
        events: {
            load: function () {
                this.credits.element.onclick = function () {
                    window.open(
                        'https://www.cer-rec.gc.ca/index-eng.html',
                        '_blank' // <- This is what makes it open in a new window.
                    );
                }
            },
            drilldown: function(e) {
                //console.log('drilldown',this.series[0].userOptions) //use this to calculate the summary measures that will populate the html
                //console.log(e)
            },
            drillup: function(e) {
                //console.log(e)
                //console.log(e.seriesOptions.data)
                //console.log('drillup',this.series[0])
            }
        }
    },

    title: {
        text: null
    },

    plotOptions: {
        series: {
            cropThreshold: 800, //solution to axis getting messed up on drillup: https://www.highcharts.com/forum/viewtopic.php?t=40702
            pointWidth: 20,
            events: {
                legendItemClick: function () {
                    return false; 
                }
            }
        }
    },

    credits: {
        //enabled:false //gets rid of the "Highcharts logo in the bottom right"
        text: 'Canada Energy Regulator',
        href: 'https://www.cer-rec.gc.ca/index-eng.html'
    },

    xAxis: {
        type: 'category',
        title: {
            text: null
        },
        // min: 0,
        // max: 5,
    },

    yAxis: {
        showEmpty: false,
        title: {
            text: 'Number of Conditions'
        }
    },

    series: [{
            name: 'Conditions by Company',
            colorByPoint: false,
            data: companyResult
        }],

    drilldown: {
        series: projectResult.concat(themeResult)
    }

})
return chart
}

var chart = createGraph(companyResult,projectResult,themeResult)

var select_status = document.getElementById('select_status');
// var currentStatus = select_status.options[select_status.selectedIndex].text;
// console.log(currentStatus)

select_status.addEventListener('change', (select_status) => {
    var status = select_status.target.value;
    var companyResult,projectResult;
    [companyResult,projectResult,themeResult] = groupBy(githubData,status=status)
    var stat = applySummary(githubData,counts)
    var chart = createGraph(companyResult,projectResult,themeResult)

    // chart.update({

    //     series: {
    //         data: companyResult
    //     },

    //     drilldown: {
    //         series: projectResult.concat(themeResult)
    //     }

    // },true);

    // chart.redraw()

    // var ddCurrent = chart.series[0].userOptions.id; //gets the current level of the drilldown
    // var ddSeries = chart.options.drilldown.series;
    // console.log(chart.series)
    // if (ddCurrent === undefined) {
    //     chart.series[0].setData(companyResult);
    // } else {
    //     for (var i = 0, ie = ddSeries.length; i < ie; ++i) {
    //         if (ddSeries[i].id === ddCurrent) {
    //             chart.series[0].setData(ddSeries[i].data);
    //         }
    //     }
    // }

    // how to update data after drilldown:
    // https://www.highcharts.com/forum/viewtopic.php?t=40389
    // http://jsfiddle.net/06oesrs1/
});