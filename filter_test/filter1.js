const getData = (Url) => {
    var Httpreq = new XMLHttpRequest(); // a new request
    Httpreq.open("GET", Url, false);
    Httpreq.send(null);
    return Httpreq.responseText;
};


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

const dataSummary = (data) => {

    companyTest = {}
    data.map((row,i) => {

        // if (companyTest.hasOwnProperty(row['Company'])){
        //     companyTest[row['Company']] = companyTest[row['Company']]+1
        // } else {
        //     companyTest[row['Company']] = 1
        // }
        if (companyTest.hasOwnProperty(row['Company'])){
            companyTest[row['Company']] = companyTest[row['Company']]
        } else {
            companyTest[row['Company']] = {}
        }
        
    })

    return companyTest

}


const url = 'https://raw.githubusercontent.com/mbradds/HighchartsData/master/conditions.json'
var githubData = JSON.parse(JSON.stringify(JSON.parse(getData(url))));

var data = applyId(githubData,status='All')

var summary = dataSummary(data)
console.log(summary)
console.log(summary.hasOwnProperty('SCL Pipeline Inc.'))



