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
        return `Dashboard: ${companyName} - no geographic location`;
      },
      location: (companyName, column) => {
        return `Dashboard: ${companyName} - ${column} Conditions by Region`;
      },
    },
    table: {
      projectsTitle: (column) => {
        return `Projects with ${column} Conditions (click to open REGDOCS* project folder):`;
      },
      themesTitle: (column) => {
        return `${column} Condition Themes (click to view theme definition):`;
      },
      regdocsDefinition:
        "*REGDOCS is a regulatory database for activities and transactions conducted at the CER.",
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
  incidents: {
    definitions: {
      Status: {
        Closed:
          "The CER’s incident review has been completed and the file is closed.",
        Submitted:
          "The company has submitted all of the required information and the CER is reviewing the incident.",
        "Initially Submitted":
          " The company has notified the CER that an incident has occurred and provided preliminary information. An investigation is has been initiated.",
      },
      "What Happened": {
        "Defect and Deterioration":
          "Defects in manufacturing processes or materials, or deterioration as a result of damage or service life limitations, lack of inspection or maintenance",
        "Corrosion and Cracking":
          "External corrosion or cracking caused by damage to coating systems or failed coating systems; weld cracking as a result of stress or workmanship issues; or internal corrosion as a result of contaminates in products",
        "Equipment Failure":
          "A failure of the pipeline’s equipment components. Examples of equipment include valves, electrical power systems and control systems",
        "Incorrect Operation":
          "Typically, personnel fail to follow procedures or use equipment improperly",
        "External Interference":
          "External activities that cause damage to the pipeline or components. Examples include excavation damage and vandalism",
        "Natural Force Damage":
          "Damage caused by natural forces, such as earthquakes, landslides and wash-outs",
        "Other Causes":
          "All other causes or when an incident’s circumstances could not be determined",
        "To be determined": "The incident is under review",
      },
      "Why It Happened": {
        "Engineering and Planning":
          "Failures of assessment, planning or monitoring that may be related to inadequate specifications or design criteria, evaluation of change, or implementation of controls",
        Maintenance:
          "Inadequate preventive maintenance or repairs, and excessive wear and tear",
        "Inadequate Procurement":
          "Failures in the purchasing, handling, transport and storage of materials",
        "Tools and Equipment":
          "Tools and equipment that are inadequate for the task or used improperly",
        "Standards and Procedures":
          "Inadequate development, communication, maintenance or monitoring of standards and procedures",
        "Failure in communication":
          "Loss of communication with automatic devices, equipment or people",
        "Inadequate Supervision":
          "Lack of oversight of a contractor or employee during construction or maintenance activities",
        "Human Factors":
          "Individual conduct or capability, or physical and psychological factors",
        "Natural or Environmental Forces":
          "External natural or environmental conditions",
        "To be determined": "The incident is under review.",
      },
    },
    dashboard: {
      what: "What Happened",
      why: "Why It Happened",
      userPopUp:
        "Approximate location. You can drag this marker around to explore incident events in other locations.",
      locationError:
        "<h4>Cant access your location.</h4>Try enabling your browser's location services and refresh the page.",
      nearbyHeader: (numCircles, range) => {
        return `There are ${numCircles} incidents within ${range} km`;
      },
      gasRelease: "Estimated gas volume released:",
      liquidRelease: "Estimated liquid volume released:",
      otherRelease: "Estimated miscellaneous release:",
      exploreOther:
        "Want to explore other regions? You can click and drag the location marker and re-click the find incidents button.",
      noNearby: (eventType) => {
        return `<h4>No nearby ${eventType}</h4>Try increasing the search range, or drag your location marker to see nearby events at a different location.`;
      },
    },
  },
};
