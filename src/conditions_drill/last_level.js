const getData = (Url) => {
  var Httpreq = new XMLHttpRequest(); // a new request
  Httpreq.open("GET", Url, false);
  Httpreq.send(null);
  return Httpreq.responseText;
};

const conditionsData = JSON.parse(
  getData("/src/conditions_drill/conditions.json")
);

const getUnique = (items, filterColumns) => {
  var lookup = {};
  var result = [];
  for (var item, i = 0; (item = items[i++]); ) {
    var name = item[filterColumns];
    if (!(name in lookup)) {
      lookup[name] = 1;
      result.push(name);
    }
  }
  return result;
};

const applyId = (data) => {
  data = data.map((v) => {
    v.id = v["Instrument Number"] + " - " + v["Condition Number"];
    return v;
  });
  data = data.filter((row) => row["Short Project Name"] !== "SAM/COM");
  return data;
};

const conditionsFilters = {
  "Project Status": "All",
  "Condition Status": "All",
  Company: "NOVA Gas Transmission Ltd.",
  "Short Project Name": "Construct North Montney",
  "Theme(s)": "Environmental Protection",
};

const sortResults = (result, level) => {
  if (level == "Company") {
    result.sort(function (a, b) {
      return b.y - a.y;
    });
  } else if (level == "Project" || level == "Theme") {
    result.map((v, i) => {
      v.data.sort(function (a, b) {
        return b.y - a.y;
      });
    });
  }

  return result;
};

const createLastSeries = (data, filters) => {
  for (const [key, value] of Object.entries(filters)) {
    if (value !== "All") {
      data = data.filter((row) => row[key] == value);
    }
  }
  data = applyId(data);
  var seriesName = data[0]["Short Project Name"] + " - " + data[0]["Theme(s)"];
  var categories = [];
  var seriesEffective = {
    name: "Condition Effective Date",
    pointWidth: 20,
    color: "#054169",
    data: [],
  };
  var seriesSunset = {
    name: "Condition Sunset Date",
    pointWidth: 20,
    color: "#FF821E",
    data: [],
  };
  data.map((row, rowNum) => {
    categories.push(row.id);
    if (row["Sunset Date"] != null) {
      seriesSunset.data.push({
        name: row.id,
        x: row["Sunset Date"],
        x2: row["Sunset Date"] + 86400000 * 5,
        y: rowNum,
        color: "#FF821E",
      });
    }

    seriesEffective.data.push({
      name: row.id,
      x: row["Effective Date"],
      x2: row["Effective Date"] + 86400000 * 5,
      y: rowNum,
      color: "#054169",
      onClickText:row["Condition"]
    });
  });

  if (seriesSunset.data.length > 0) {
    return [[seriesEffective].concat([seriesSunset]), categories];
  } else {
    return [[seriesEffective], categories];
  }
};

const [lastSeries, categories] = createLastSeries(
  conditionsData,
  conditionsFilters
);
var conditionTextContainer = document.getElementById("container_text")
const setConditionText = (onClickText) => {
    conditionTextContainer.innerText = onClickText
}


console.log(lastSeries);
console.log(categories);

const createLastChart = (series, categories) => {
  return new Highcharts.chart("container_last", {
    chart: {
      type: "xrange",
      zoomType: "y",
      animation: true,
      height: 700,
      width: 1000,
    },
    title: {
      text: "",
    },

    xAxis: {
      type: "datetime",
    },

    yAxis: {
      title: {
        text: "",
      },
      type: "category",
      categories: categories,
      reversed: true,
      labels: {
        events: {
          click: function () {
            console.log(this.value);
            console.log(this)
            //console.log(this.axis.pos,"y axis number")
            console.log(this.axis.series[0].data[this.pos]['onClickText'])
            setConditionText(this.axis.series[0].data[this.pos]['onClickText'])
          },
        },
      },
    },
    series: series,
  });
};

createLastChart(lastSeries, categories);
