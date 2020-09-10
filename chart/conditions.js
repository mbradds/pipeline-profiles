const getData = (Url) => {
    var Httpreq = new XMLHttpRequest(); // a new request
    Httpreq.open("GET", Url, false);
    Httpreq.send(null);
    return Httpreq.responseText;
};

const dynamicDropDown = (id, optionsArray) => {

    function addOption(id, text, select) {
        select.options[select.options.length] = new Option(text);
    }

    const select = document.getElementById(id);
    select.options.length = 0;

    optionsArray.map((v, i) => {
        addOption(id, optionsArray[i], select);
    })

}

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
                 'y':grouped[key].length}
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

const createSeries = (gCompany) => {

    var series = {}
    series['data'] = gCompany
    series['name'] = 'conditions by company'
    series['colorByPoint'] = false

    return series
}

const fillDrop = (column,dropName,value,data) => {
    const drop = getUnique(data, filterColumns = column)
    dynamicDropDown(dropName, drop.sort())
    document.getElementById(dropName).value = value;
}


const url = 'https://raw.githubusercontent.com/mbradds/HighchartsData/master/conditions.json'
var githubData = JSON.parse(JSON.stringify(JSON.parse(getData(url))));
idData = applyId(githubData)
console.log(idData)
gCompany = groupBy(idData,column='Company')
series = createSeries(gCompany)
console.log(gCompany)
console.log(series)
//colors= ['#054169', '#FFBE4B', '#5FBEE6', '#559B37', '#FF821E', '#871455', '#8c8c96', '#42464B']
//fillDrop(column='Type',dropName='select_metric',value='Assets',data=githubData)


const chart = new Highcharts.chart('container', {

    chart: {
        type: 'column', //line,bar,scatter,area,areaspline
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

    plotOptions: {
        series: {
            pointWidth: 30,
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
        }
    },

    series: [series]

})
