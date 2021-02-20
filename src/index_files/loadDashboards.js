export async function loadAllCharts(arrayOfCharts) {
  Promise.allSettled(arrayOfCharts).then((value) => {
    console.timeEnd(`chart loading`);
  });
}
