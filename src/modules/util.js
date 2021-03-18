export const cerPalette = {
  "Night Sky": "#054169",
  Sun: "#FFBE4B",
  Ocean: "#5FBEE6",
  Forest: "#559B37",
  Flame: "#FF821E",
  Aubergine: "#871455",
  "Dim Grey": "#8c8c96",
  "Cool Grey": "#42464B",
  hcBlue: "#7cb5ec",
  hcGreen: "#90ed7d",
  hcPink: "#f15c80",
  hcRed: "#f45b5b",
  hcAqua: "#2b908f",
  hcPurple: "#8085e9",
  hcLightBlue: "#91e8e1",
};

export const conversions = {
  "m3 to bbl": 6.2898,
  "bbl to m3": 1 / 6.2898,
  "m3 to cf": 35.3,
};

export const sortJson = (obj, colName = "value") => {
  return obj.slice().sort((a, b) => b[colName] - a[colName]);
};

export function visibility(divList, status) {
  divList.map((div) => {
    var x = document.getElementById(div);
    if (status == "hide") {
      if (x.style.display !== "none") {
        x.style.display = "none";
      }
    } else if (status == "show") {
      if (x.style.display !== "block") {
        x.style.display = "block";
      }
    }
  });
}
