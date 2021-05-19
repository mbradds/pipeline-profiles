# Pipeline Profiles

[![Prettier Code Formatting](https://img.shields.io/badge/code_style-prettier-brightgreen.svg)](https://prettier.io)

- **Live version:** https://pipeline-profiles.herokuapp.com/

##### Table of Contents

- [Introduction](#introduction)
- [Repository structure](#repository-structure)
- [Software prerequisites](#software-prerequisites)
- [Quick start for contributing](#quick-start-for-contributing)
- [Quick start for updating data](#quick-start-for-updating-data)
  - [Dataset 1: Incidents](#dataset-1:-incidents)
  - [Dataset 2: Conditions](#dataset-2:-conditions)
  - [Dataset 3: Traffic](dataset-3:-Traffic)
  - [Dataset 4: Apportionment](dataset-4:-apportionment)
- [Adding a new profile section](#adding-a-new-profile-section)
- [Tests](#tests)
  - [Python unit tests (back end)](<#python-unit-tests-(back-end)>)
  - [AVA unit tests (front end)](<#ava-unit-tests-(front-end)>)
- [Dependencies](#dependencies)
- [TODO list](#todo-list)

## Introduction

New interactive content under development for the CER's [pipeline profiles](https://www.cer-rec.gc.ca/en/data-analysis/facilities-we-regulate/pipeline-profiles/index.html) web page.

This project uses three primary technologies to create web based interactive dashboards and dynamic text specific to 25 of the largest pipelines regulated by the CER. The content is developed for both English and French. Here is a summary of the major front end frameworks used:

- **Highcharts**: Used to create basic interactive charts and maps.
- **Leaflet**: Used for more advanced mapping features.
- **Web Expreience Toolkit**: GoC web framework for creating a common look and feel. Used to add filters, buttons, and structure to bind the above two technologies into usable dashboards. Also used to style dynamic data embedded text.

Sections being added:

- **Safety & Environment**
  1. Conditions Compliance (Released, March 31, 2021)
  2. Reported Incidents (Released, March 31, 2021)
  3. Operations & Maintenance Activities (TBD, under development)
  4. Contaminated Sites/Remediation (TBD, under development)
  5. Unauthorized Activities (TBD, under development)
- **Traffic (Pipeline Throughput & Capacity)** (May 18, 2021, under development)
- **Oil Pipeline Apportionment** (May 18, 2021, under development)
- **Pipeline Tolls** (TBD)
- **Pipeline/Corporate Financial info** (TBD)

## Repository structure

```
pipeline_profiles
│   README.md (you are here!)
│   server.js (express js server configuration for heroku)
|   requirements.txt (conda python 3 environment used in ./src/data_management)
│   webpack.config.js (functionality for creating clean ../dist folder in english and french)
|   index.html (main navigation page for profiles. Has entry links for all sub profiles in /dist)
|   .babelrc (babel config with corejs 3 polyfills)
|   ...
|
└───test
|   |   test.js (AVA units tests for front end code, npm run test-frontend)
|
└───src
│   │   profile.hbs (conditional handlebars template for a new profile)
│   │   profileManager.js (manual logic for adding sections to a profile)
|   |   main.css (custom css for all dashboards. Appears in ../dist via CopyWebpackPlugin)
|   |   components/ (handlebars partials for each profile section)
|   |   ...
│   │
│   └───data_management
│   |   │   conditions.py (creates conditions data for front end)
│   |   │   incidents.py (creates incidents data for front end)
|   |   |   traffic.py (created throughput & capacity for front end)
|   |   |   tests.py (python unit tests npm run test-backend)
|   |   |   util.py (shared python code module)
|   |   |   queries/ (contains queries used to get data from CER sql servers)
|   |   |   npm_scripts/ (all the "data" automation scripts available in package.json)
|   |   |   raw_data/ (pre-prepared data used by python when not pulling from remote locations)
│   |   │   ...
|   |
|   └───index_files (entry points for all profile webpages)
|   |
|   └───conditions (conditions compliance code & data)
|   |
|   └───incidents (incidents dashboard code & data)
|   |
|   └───new sections (new dashboards/sections will be added!)
|   |
|   └───traffic (Pipeline throughput and capacity)
|   |
|   └───modules (shared dashboard code & utility functions)
│
└───dist (tries to match dweb7 folder structure)
    │   en/ english js bundles & html for each profile (to be placed on web server)
    │   fr/ french js bundles & html for each profile (to be placed on web server)
```

## Software prerequisites

1. npm (v 7.11.1+)
2. node (v 14.16.1+)
3. [Anaconda](https://www.anaconda.com/products/individual) (for contributing and running the "back end" code in `src/data_management`)
4. Git (for contributing)
5. Git windows client (for contributors using windows. The git client terminal can be used to run unix shell scripts)

## Quick start for contributing

1. clone repo

```bash
cd Documents
git clone https://github.com/mbradds/pipeline-profiles.git
```

2. install dependencies

First time install:

```bash
npm ci
```

Or update dependencies

```bash
npm install
```

3. create branch

```bash
git checkout -b profile_improvement
```

4. switch to development mode in `webpack.config.js` for faster compile time

```diff
+mode: "development",
-mode: "production",
```

5. start webpack dev server

```bash
npm run dev
```

6. distribution bundles are not tracked. Before publishing:

```diff
-mode: "development",
+mode: "production",
```

then:

```bash
npm run build
```

This will overwrite everything in `/dist`. The js bundles in `/dist` can be placed on the web server.

## Quick start for updating data

### Are you using windows?

The npm scripts used for data and map automation expect a unix shell, and wont work on windows. If using windows, run all the scripts mentioned in this section inside the git bash client for windows.

### Are you connecting to CER databases?

Several datasets are pulled directly from CER internal databases. A single python file `src/data_management/connection.py` handles the sqlalchemy connection parameters and strings. This file is left untracked because it has the db strings hard coded. A template file `src/data_management/connection.example.py` file is included with the connection strings left blank. Before running or contributing to the python code, you will need to open this file, add the connection strings, and save the file here: `src/data_management/connection.py` to ensure that connection info remains untracked.

### Have you set up the pipeline-profiles conda environment?

It is highly recommended that you first create the conda python environment described in [requirements.txt](requirements.txt). The npm scripts for data updates expect a conda python environment called pipeline-profiles.

Update datasets:

```bash
npm run update-traffic-data
npm run update-incidents-data
npm run update-conditions-data
```

Note: depending on several factors, including the current state of the python scripts called with the above command, this may not actually update the data you want. Take a look at the sub sections below for update instructions specific to the dataset.

### Dataset 1: Incidents

Incident data is updated every calendar quarter. When new data becomes available, it can be pulled directly from the CER website and build into seperate json datasets for each profile with npm run data, after the steps described below.

#### Option 1 (recommended): Pull incident data directly from CER website

1. Open the [incidents.py](./src/data_management/incidents.py) file.

2. Update the english and french links found in the first few lines of the <i>process_incidents</i> function as follows, with whatever the most recent quaterly links (english and french) can be found on the [CER incident data page](https://www.cer-rec.gc.ca/en/safety-environment/industry-performance/interactive-pipeline/incident-data.html):

```diff
if remote:
    if lang == 'en':
-        link = "https://www.cer-rec.gc.ca/en/safety-environment/industry-performance/interactive-pipeline/map/2020-12-31-incident-data.csv"
+        link = "https://www.cer-rec.gc.ca/en/safety-environment/industry-performance/interactive-pipeline/map/YYYY-MM-DD-incident-data.csv"
    else:
-        link = "https://www.cer-rec.gc.ca/fr/securite-environnement/rendement-lindustrie/carte-interactive-pipelines/carte/2020-12-31-donnees-incidents.csv"
+        link = "https://www.cer-rec.gc.ca/fr/securite-environnement/rendement-lindustrie/carte-interactive-pipelines/carte/YYY-MM-DD-donnees-incidents.csv"
```

3. Make sure that the python script is configured to point to these remote files, as opposed to the raw data files in `src/data_mangagement/raw_data`.

```diff
if __name__ == '__main__':
    print('starting incidents...')
-    process_incidents(remote=False, lang='en')
-    process_incidents(remote=False, lang='fr')
+    process_incidents(remote=True, lang='en')
+    process_incidents(remote=True, lang='fr')
    print('completed incidents!')
```

4. `npm run update-incidents-data && npm run build`

#### Option 2: Use local CSV's in your possession for update

Alternatively, if the remote data fetch doesnt work, or you have the incident data before its uploaded onto the web, then the new incident data csv files can be placed into the `src/data_mangagement/raw_data` folder, overwriting the <i>incidents_en.csv</i> and <i>incidents_fr.csv</i> that are already there.

1. Open the [incidents.py](./src/data_management/incidents.py) file.

2. Make sure that the python script is configured to pull data from `src/data_mangagement/raw_data`

```diff
if __name__ == '__main__':
    print('starting incidents...')
+    process_incidents(remote=False, lang='en')
+    process_incidents(remote=False, lang='fr')
-    process_incidents(remote=True, lang='en')
-    process_incidents(remote=True, lang='fr')
    print('completed incidents!')
```

3. `npm run update-incidents-data && npm run build`

### Dataset 2: Conditions

Condition data is updated every day on open gov through the CER's incident data viz ETL.

#### Option 1 (recommended): Pull conditions data directly from Open Government website

1. Open the [conditions.py](./src/data_management/conditions) file.

2. Unlike incidents, the conditions dataset is available through a permanent link. You shouldnt need to update the links, unless Open Gov infrastructure changes!

3. Make sure that the python script is configured to point to the remote open gov files, as opposed to the raw data files in `src/data_mangagement/raw_data`.

```diff
if __name__ == "__main__":
    print('starting conditions...')
-    process_conditions(remote=False, lang='en')
-    process_conditions(remote=False, lang='fr')
+    process_conditions(remote=True, lang='en')
+    process_conditions(remote=True, lang='fr')
    print('completed conditions!')
```

4. `npm run update-conditions-data && npm run build`

#### Option 2: Use local CSV's in your possession for update

Alternatively, if the remote data fetch doesnt work, then the new conditions data csv files can be placed into `src/data_mangagement/raw_data`, overwriting the <i>conditions_en.csv</i> and <i>conditions_fr.csv</i> that are already there.

1. Open the [conditions.py](./src/data_management/conditions.py) file.

2. Make sure that the python script is configured to pull data from `src/data_mangagement/raw_data`

```diff
if __name__ == "__main__":
    print('starting conditions...')
+    process_conditions(remote=False, lang='en')
+    process_conditions(remote=False, lang='fr')
-    process_conditions(remote=True, lang='en')
-    process_conditions(remote=True, lang='fr')4. `npm run update-conditions-data && npm run build`
```

3. `npm run update-conditions-data && npm run build`

### Dataset 3: Traffic

- Instructions coming soon!

### Dataset 4: Apportionment

- Instructions coming soon!

## Adding a new profile section

Adding a new section typically involves two major parts: The back end data (python), and the front end (JavaScript). Starting with the raw data, here is the typical pattern:

raw data (sql or web) -> python -> json -> es6 import -> JavaScript/css -> handlebars template -> translation -> release

### Python data prep

1. Create a new python file in `src/data_management`. Prepate a reliable connection to the dataset, either a remote datafile or internal sql. The profiles are segmented by pipeline, so the data prep will involve splitting the dataset by the pipeline/company column, and creating one dataset for each company. Output files in json format to `../new_section/company_data/company_name.json`.

2. Start to pay attention to file size of the outputs. Try to keep the average dataset around 15-20kb.

### Front end data viz/section

Start with just one profile (ngtl)

1. Create a new folder: `src/new_section` and add a js file like so: `src/new_section/newSectionDashboard.js`.
2. In this file, create a really simple "hello world" kind of function to accept the data:

```javascript
export function mainNewSection(data) {
  console.log(data);
}
```

3. Add the new data to the data entry point in `src/index_files/en/ngtl/data.js`:

```javascript
import newSectionData from "../../../new_section/company_data/NOVAGasTransmissionLtd.json";
import { loadAllCharts } from "../../loadDashboards_en";

const data = {
  newSectionData,
};

loadAllCharts(data);
```

4. Add the es6 export from step 2 to the code entry point in `src/index_files/loadDashboards_en.js`:

```javascript
import { mainNewSection } from "../new_section/newSectionDashboard";

export async function loadAllCharts(data, plains = false) {
  const arrayOfCharts = [
    mainNewSection(data.newSectionData),
    otherCharts(data.other),
  ];
}
```

5. Start the project with `npm run dev` to open the webpack dev server on port 8000. Make sure that the data appears in the console, and you will be good to start developing the JavaScript.

6. Pretty soon after step 5 you will need to set up the html and css infrastructure. CSS can be added to `src/main.css`. There is only one css file for the entire project. I might split this css file soon, but for now just keep all the css for each section roughly together.

### Aside: Why handlebars

Conditional handlebars templates are used to control which sections get loaded for each profile. This is one of the most complicated parts of the repo, but its powerful for a project like this. The logic in the remaining steps acts very similiar to a content management system. Here is why we are doing it this way:

- Without handlebars, and just using one html file, each profile would have all sections. So ngtl would have apportionment specific html. This apportionment html could be hid immediately, but this is a bit rough, and could cause layout thrashing. With handlebars, only the html that is needed for that profile gets loaded.
- We cant use react (web team cant handle that) but handlebars also solves the html problem. Html sucks to write over and over, and for 50 webpages, the html only needs to be written once thanks to handlebars + html webpack plugin.
- Handlebars compiles to pure html files server side (thanks to webpack). This makes it easy for our web team.
- The conditionals in handlebars mean that we dont need seperate templates, or html files in english and french. This is huge, especially when going back and optimizing pages for mobile.

7. Create a new handlebars template here: `src/components/new_section.hbs`. For now, ignore the templates, and just write html with english text/paragraphs.

8. Add this new template to the profile manager here: `src/components/profileManager.js`. It doesnt matter what you call the section, but remember it for the handlebars conditional later. It seems obvious that this file should be automatically generated based on which profiles have data for a given section, but i would prefer to leave this step manual. It adds an extra layer of protection agains sections getting rendered by mistake, and its easy to updata/maintain.

```javascript
const profileSections = {
  ngtl: {
    sections: {
      traffic: { map: true, noMap: false },
      apportion: false,
      safety: true,
      new_section: true, // when set to true, handlebars will inject the section html
    },
  },
};
```

9. Add the new handlbars template to the main handlebars file here: `src/profile.hbs`. Once this is done, then `npm run build` and `npm run dev` should load your html.

```handlebars
{{#if htmlWebpackPlugin.options.page.sections.new_section}}
  <!-- Start New Section -->
    {{> components/new_section text=htmlWebpackPlugin.options.page.text}}
  <!-- End New Section -->
{{/if}}

```

10. Before running `npm run build` and `npm run dev`, you should remove "fr" from the `webpack.json.config` to avoid errors. Once you have added french to the data and code entrypoints (step 3 and step 4) then the js+html can compile in both `dist/en` and `dist/fr`

```diff
const profileWebpackConfig = (function () {
-  const language = ["en", "fr"];
+  const language = ["en"];
})();
```

11. Once you are done the new section, add all the JavaScript string to `src/modules/langEnglish.js` and `src/modules/langFrench.js` and all the html text/paragraphs to `src/components/htmlText.js`. Follow the same logic for importing/templating found in other completed sections.

12. Write python unit tests: `src/data_management/tests.py` and JavaScript unit tests: `test/test.js`
13. Create PR. I'll review all the code.

## Tests

### Python unit tests (back end)

The greatest risk for errors, such as incorrect values appearing in the front end, are likely to happen as a result of errors in the "back end" python code (npm run data). These python scripts compute large amounts of summary statistics, totals, metadata (number of incidents, most common, types, etc) from datasets that have inherent errors. This is made more risky by the fact that there are english and french datasets, and these datasets may have unrelated problems. Here is a list of embedded data errors I have noticed so far:

1. Trailing whitespace in text columns. This is a problem when filtering/grouping, because "NGTL" will be seperated from "NGTL ". This error is mainly mitigated by running `.strip()` on important text based columns.
2. Duplicate or incorrect company names. For example "Enbridge Pipelines Ltd." and "Enbridge Pipelines Inc". Notice the difference? This is mainly corrected by exploring all company names at the beginning of development and running something like this:

```python
df['Company'] = df['Company'].replace({"Enbridge Pipelines Inc": "Enbridge Pipelines Inc."})
```

There are several python unit tests written for the various python data outputs and utility functions. These are found here `src/data_management/tests.py`

The python unit tests can be run through an npm script:

```bash
npm run test-backend
```

This code is difficult to test, because the code is run on data that updates every day, or every quarter. To simplify this, i have added static test data seperate from "production" data. The test data is located here: `src/data_management/raw_data/test_data`. npm run test will test the python code on static data, where things like the correct totals, counts and other numbers that appear later on the front end are known.

The unit tests check a bunch of summary statistics and data validation metrics specific the the ngtl profile. It will also test to see if the english numbers/data are the same in french.

### AVA unit tests (front end)

Test coverage is pretty low right now. Mainly focussing on major r-usable functionality in `src/modules/util.js` and major calcualtions done on the front end like the five year average. I would like to move more general/pure functions to `src/modules/util.js` so that they can be tested easier.

```bash
npm run test-frontend
```

## Dependencies

- [highcharts](https://www.npmjs.com/package/highcharts)
- [leaflet](https://www.npmjs.com/package/leaflet)
- [@babel/runtime](https://babeljs.io/docs/en/babel-runtime) Helps reduce bundle size by a few KB.
- [compression](https://www.npmjs.com/package/compression) Used only for heroku website.
- [datestone](https://www.npmjs.com/package/datestone) Save network size (over 50%) when dealing with time series data.
- [express](https://www.npmjs.com/package/express) Used only for heroku website.
- [haversine](https://www.npmjs.com/package/haversine) For finding distance between user and Incidents.
- [mapshaper](https://www.npmjs.com/package/mapshaper) Simplifies the maps used in the Conditions map. Reduces Canada base map file size by >99.9%!

### Dev Dependencies

- [@babel/core](https://babeljs.io/docs/en/babel-core)
- [@babel/plugin-proposal-class-properties](https://babeljs.io/docs/en/babel-plugin-proposal-class-properties)
- [@babel/plugin-transform-runtime](https://babeljs.io/docs/en/babel-plugin-transform-runtime)
- [@babel/preset-env](https://babeljs.io/docs/en/babel-preset-env)
- [babel-loader](https://www.npmjs.com/package/babel-loader/v/8.0.0-beta.1)
- [clean-webpack-plugin](https://www.npmjs.com/package/clean-webpack-plugin)
- [copy-webpack-plugin](https://webpack.js.org/plugins/copy-webpack-plugin/)
- [core-js](https://www.npmjs.com/package/core-js)
- [eslint](https://eslint.org/)
- [eslint-config-prettier](https://github.com/prettier/eslint-config-prettier)
- [eslint-config-airbnb-base](https://github.com/airbnb/javascript) Those folks know JS!
- [eslint-plugin-import](https://www.npmjs.com/package/eslint-plugin-import)
- [handlebars](https://handlebarsjs.com/)
- [handlebars-loader](https://www.npmjs.com/package/handlebars-loader)
- [html-webpack-plugin](https://webpack.js.org/plugins/html-webpack-plugin/)
- [webpack](https://webpack.js.org/)
- [webpack-bundle-analyzer](https://www.npmjs.com/package/webpack-bundle-analyzer)
- [webpack-cli](https://www.npmjs.com/package/webpack-cli)
- [webpack-dev-server](https://webpack.js.org/configuration/dev-server/)
- [webpack-node-externals](https://www.npmjs.com/package/webpack-node-externals)

Note: the html-webpack-plugin and handlebars-loader is instrumental for this project. Older versions of this repo only had two templates, one for english and one for french. As the project grew, I needed a tempalte engine. A good example of this need is the apportionment section. There are only around 5 oil pipeline profiles with apportionment data (there could be more in the future though!) so i dont want to include the apportionment html in 20 profiles that dont need it, and then hide/show divs conditionally after the dom is ready. This probably causes layout thrashing. With handlebars, i can conditionally render components/sections based on the logic in `src/profileManager.js`. Even better, with handlebars-loader, one html is compiled for each profile (web team can only handle html) and html-webpack-plugin still injects all the scripts.

This was the old way before handlebars:
Each pipeline profile webpage is essentially the same, but with different data. The two templates `src/profile_en.html` and `src/profile_fr.html` contain all the text and web resources (css, scripts tags) and the plugin injects the appropriate script tags for the profile. Changes made to these templates will appear on all 25 profile pages in english and french.

## TODO list

- Rewrite everything in TypeScript
- Datasets can be further optimized to reduce file size. One example would be to have one json key, value for conditions total like so: `{numConditions: [In Progress (int), Closed (int)]}` instead of `{In Progress: int, Closed: int}`. Update: alot of this optimization has been done, but can be ramped up if needed.
- Include documentation and instructions for getting regdocs links from the internal cer database.
- Include documentation on updating traffic and apportionment sections.
- Make sure that the narrative indicates that most commonly released substance is by event frequency, not volume.
- Add an option in incidents and conditions py for direct connection to cer infrastructure.
- Add missing (non consecutive) date/data handling for traffic and apportionment (in python)
- The dynamic text modude `src/modules/dynamicText.js` is kind of split between english and french methods. Where possible, all these methods should be consolidated to take a language parameter. This might not always be possible because of the sentence structure between english and french.
- The data prep pattern used in the traffic section is pretty effective. Having id's for all the key points and trade types cuts down on data size a bit, makes on the fly translation safer, and allows for shared data between english and french. Try to re-create this pattern for the rest of the sections.
- Company names as file names inside each "company_data" folder is probably going to lead to problems. Try to implement the same id structure in `webpack.config.js` for each corporate entity across the entire project.
- The radio button functionality has changed for incidents. Try to get rid of the "click" methods, or only apply click if not checked. There might be some data processing going down behind the scenes that isnt needed when switching from map to trends. Take a look at crude-runs units radio.
- Apply the colors pattern in `src/modules/colors.js` to the entire project. All colors should be defined here for eng and fra, and then applied to the series id's.
- Standardize the number and date format methods. There are methods for this in `src/modules/langEngish.js` but there are still instances of Highcharts.numberFormat scattered in the code.
- Try to get wet4 tabs working for safety & environment navigation vs buttons. Tabs are more obvious.

### Completed TODO's

- Create distribution bundle for highcharts + leaflet
- Upgrade highcharts from 8.2.2 to 9.1.0
- Fully remove Jquery dependency
- Add better functionality for leaflet bubble size change on zoom: https://leafletjs.com/examples/zoom-levels/
- Add in the html style changes requested by the web team (eg, replace all bold tags with strong)
