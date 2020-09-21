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

const groupBy = (data,column) => {
    result = {}
    grouped = data.reduce((result,current) => {
        result[current[column]] = result[current[column]] || [];
        result[current[column]].push(current);
        return result
    })

    //return grouped
    hcGroup = []
    for (const [key, value] of Object.entries(grouped)) {
        if (Array.isArray(value)){
            hcGroup.push(
                {'name':key,
                 'y': parseInt(grouped[key].length)}
            )
            //grouped.name = grouped[key]
            //grouped.y = grouped[key].length
            //delete grouped[key]
            //grouped[key] = grouped[key].length
        } else {
            delete grouped[key]
        }
      }
    
    hcGroup.sort(function (a, b) {
         return b.y - a.y;
       });
    
    return hcGroup
}

const applyId = (data) => {
    data =  data.map((v,i) => {
        v.id = v['Instrument Number']+'_'+v['Condition Number']
        return v
    })
    return data
}

const groupBy2 = (data) => {

    companyResult = []
    projectResult = []
    var uniqueCompanies = getUnique(data,'Company')
    uniqueCompanies.map((c,ic) => {
        const company = data.filter(row => row.Company == c)
        companyResult.push(
            {
                name: c, 
                y: company.length,
                drilldown: c
            })

        const project = getUnique(company,'Short Project Name')
        
        project.map((p,ip) => {
            const project = company.filter(row => row['Short Project Name'] == p)
            projectResult.push({
                name: c,
                id: c,
                data: [{
                    name: p,
                    y: project.length,
                    drilldown: p
                }]
            })

        })
        
    })
    // data.map((v,i) => {
    //     false
    // })

    return [companyResult,projectResult]

}


const url = 'https://raw.githubusercontent.com/mbradds/HighchartsData/master/conditions.json'
var githubData = JSON.parse(JSON.stringify(JSON.parse(getData(url))));
idData = applyId(githubData)

//data = groupBy(idData,column='Short Project Name')
//console.log(data)
var companyResult,projectResult;
[companyResult,projectResult] = groupBy2(idData)
console.log(companyResult.length,projectResult.length)


const chart = new Highcharts.chart('container', {

    chart: {
        height: 800,
        type: 'bar', //line,bar,scatter,area,areaspline
        zoomType: 'x', //allows the user to focus in on the x or y (x,y,xy)
        borderColor: 'black',
        borderWidth: 1,
        animation: true,
        events: {
            load: function () {
                this.credits.element.onclick = function () {
                    window.open(
                        'https://www.cer-rec.gc.ca/index-eng.html',
                        '_blank' // <- This is what makes it open in a new window.
                    );
                }
            }
        }
    },

    scrollbar: {
        enabled: true
    },

    credits: {
        //enabled:false //gets rid of the "Highcharts logo in the bottom right"
        text: 'Canada Energy Regulator',
        href: 'https://www.cer-rec.gc.ca/index-eng.html'
    },

    xAxis: {
        type: 'category'
    },

    // yAxis: {
    //     opposite: true
    // },

    plotOptions: {
        series: {
            stickyTracking: false,
            connectNulls: false,
            states: {
                inactive: {
                    opacity: 1
                },
                hover: {
                    enabled: false
                }
            }
        },
    },

    series: [
        {
            name: 'CER Companies',
            colorByPoint: false,
            data: [
                {
                    name: 'NOVA',
                    y: 1110,
                    drilldown:'NOVA'
                }
            ]
        }
    ],
    drilldown: {
        series: [
            {
                name:'NOVA',
                id:'NOVA',
                data: [{
                    name: 'Project 1',
                    y: 400,
                    drilldown: 'Project 1'
                },{
                    name: 'Project 2',
                    y: 800,
                    drilldown: 'Project 2'
                }]
            }, {
                id: 'Project 1',
                data: [{
                    name: 'Category 1',
                    y: 200
                },{
                    name: 'Category 2',
                    y: 400
                }]
            }
        ]
    }

})
