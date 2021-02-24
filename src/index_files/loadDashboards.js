import justWhy from "ie-gang";
let warningParams = {
  message:
    "We noticed you are using Internet Explorer. Please consider using a different browser for a better experience on this page.",
  type: "alert",
  title: "Old Browser Warning",
  applyIE: false,
};
justWhy.ieWarn(warningParams);

export async function loadAllCharts(arrayOfCharts) {
  return Promise.allSettled(arrayOfCharts);
}
