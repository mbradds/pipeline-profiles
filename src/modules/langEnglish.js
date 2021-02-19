export const englishDashboard = {
  conditions: {
    conditions: "conditions",
    noLocation: {
      title: "Some conditions are not tied to a geographic location.",
      summary: (companyName) => {
        return `No geographic location summary for ${companyName}:`;
      },
    },
    title: {
      noLocation: (companyName) => {
        return `${companyName} - no geographic location`;
      },
      location: (companyName, column) => {
        return `${companyName} - ${column} Conditions by Region`;
      },
    },
    table: {
      projectsTitle: (column) => {
        return `Projects with ${column} Conditions (click to open REGDOCS project folder):`;
      },
      themesTitle: (column) => {
        return `${column} Condition Themes (click to view theme definition):`;
      },
    },
    popUp: {
      econRegion: "Economic Region",
      summary: "Conditions Summary:",
      lastUpdated: "Last updated on:",
    },
    instructions: {
      header: "Map Instructions:",
      line1: "Click on a region to view conditions info",
      line2: "Click map area outside of regions to hide info",
      disclaimer:
        "Some conditions apply to multiple regions. Conditions may be double counted across regions, resulting in a higher number of conditions than the totals seen in the buttons above.",
    },
    tooltip: {
      text: "Click on region to view summary",
    },
  },
};
