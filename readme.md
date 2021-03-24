# Pipeline Profiles

- **Live version:** https://pipeline-profiles.herokuapp.com/

New interactive content under development for the CER's [pipeline profiles](https://www.cer-rec.gc.ca/en/data-analysis/facilities-we-regulate/pipeline-profiles/index.html) web page.

This project uses three primary technologies to create web based interactive dashboards and dynamic text specific to 25 of the largest pipelines regulated by the CER. The content is developed for both English and French. Here is a summary of the major front end frameworks used:

- **Highcharts**: Used to create basic interactive charts and maps.
- **Leaflet**: Used for more advanced mapping features.
- **Web Expreience Toolkit**: GoC web framework for creating a common look and feel. Used to add filters, buttons, and structure to bind the above two technologies into usable dashboards. Also used to style dynamic data embedded text.

Sections being added:

- **Safety & Environment**
  1. Conditions Compliance (March 25, 2021)
  2. Reported Incidents (March 25, 2021)
  3. Operations & Maintenance Activities (TBD, under development)
  4. Contaminated Sites/Remediation (TBD, under development)
  5. Unauthorized Activities (TBD, under development)
- **Traffic (Pipeline Throughput & Capacity)** (April/May 2021, under development)
- **Pipeline Tolls** (TBD)

## Repository Information

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
└───src
│   │   profile_en.html (webpack template for english content)
│   │   profile_fr.html (only make html changes in these templates)
|   |   main.css (custom css for all dashboards. Appears in ../dist via CopyWebpackPlugin)
|   |   ...
│   │
│   └───data_management
│   |   │   conditions.py (creates conditions data for front end)
│   |   │   incidents.py (creates incidents data for front end)
|   |   |   prepare_data.sh (npm run data to update all data)
|   |   |   tests.py & test_data.sh (npm run test)
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
|   └───modules (shared dashboard code & utility functions)
│
└───dist
    │   en/ english js bundles & html for each profile (to be placed on web server)
    │   fr/ french js bundles & html for each profile (to be placed on web server)
```

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

6. distribution bundles are currently tracked. Before committing:

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

It is highly recommended that you first create the conda python environment described in [requirements.txt](requirements.txt). The npm script below expects a conda python environment called pipeline-profiles.

Re-run all data:

```bash
npm run data
```

Note: depending on several factors, including the current state of the python scripts called with the above command, this may not actually update the data you want. Take a look at the sub sections below for update instructions specific to the dataset.

**Warning:** npm run data will update all datasets. If you want to only update one dataset, either run python scripts seperately, or update the [prepare_data.sh](./src/data_management/prepare_data.sh) file like so.

```diff
#!/bin/bash
eval "$(conda shell.bash hook)"
conda activate pipeline-profiles
cd src/data_management
-python conditions.py
python incidents.py
```

<i>After the change above, npm run data will only update incidents.</i>

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
-    process_conditions(remote=True, lang='fr')
    print('completed conditions!')
```

## Dependencies

- [@babel/runtime](https://babeljs.io/docs/en/babel-runtime) Helps reduce bundle size by a few KB.
- [compression](https://www.npmjs.com/package/compression) Used only for heroku website.
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
- [html-webpack-plugin](https://webpack.js.org/plugins/html-webpack-plugin/)
- [webpack](https://webpack.js.org/)
- [webpack-bundle-analyzer](https://www.npmjs.com/package/webpack-bundle-analyzer)
- [webpack-cli](https://www.npmjs.com/package/webpack-cli)
- [webpack-dev-server](https://webpack.js.org/configuration/dev-server/)
- [webpack-node-externals](https://www.npmjs.com/package/webpack-node-externals)

Note: the html-webpack-plugin is instrumental for this project. Each pipeline profile webpage is essentially the same, but with different data. The two templates `src/profile_en.html` and `src/profile_fr.html` contain all the text and web resources (css, scripts tags) and the plugin injects the appropriate script tags for the profile. Changes made to these templates will appear on all 25 profile pages in english and french.

## Tests

The greatest risk for errors, such as incorrect values appearing in the front end, are likely to happen as a result of errors in the "back end" python code (npm run data). These python scripts compute large amounts of summary statistics, totals, metadata (number of incidents, most common, types, etc) from datasets that have inherent errors. This is made more risky by the fact that there are english and french datasets, and these datasets may have unrelated problems. Here is a list of embedded data errors I have noticed so far:

1. Trailing whitespace in text columns. This is a problem when filtering/grouping, because "NGTL" will be seperated from "NGTL ". This error is mainly mitigated by running `.strip()` on important text based columns.
2. Duplicate or incorrect company names. For example "Enbridge Pipelines Ltd." and "Enbridge Pipelines Inc". Notice the difference? This is mainly corrected by exploring all company names at the beginning of development and running something like this:

```python
df['Company'] = df['Company'].replace({"Enbridge Pipelines Inc": "Enbridge Pipelines Inc."})
```

There are several python unit tests written for the various python data outputs and utility functions. These are found here `src/data_management/tests.py`

The python unit tests can be run through an npm script:

```bash
npm run test
```

This code is difficult to test, because the code is run on data that updates every day, or every quarter. To simplify this, i have added static test data seperate from "production" data. The test data is located here: `src/data_management/raw_data/test_data`. npm run test will test the python code on static data, where things like the correct totals, counts and other numbers that appear later on the front end are known.

The unit tests check a bunch of summary statistics and data validation metrics specific the the ngtl profile. It will also test to see if the english numbers/data are the same in french.

## ToDo list

- Create a distribution bundle for Highcharts+Leaflet. Highcharts doesnt make tree shaking easy, but its possible to create a [custom distribution](https://www.highcharts.com/docs/getting-started/how-to-create-custom-highcharts-files) with only the files needed.
- As new profile sections are added, the json data will start to increase bundle sizes above 250 kb. The data should be split into a seperate webpack bundle. This will also help with caching, because the data can be updated, and the rest of the code can remain cached.
- Try to remove Jquery dependencies. Jquery is already included on all CER pages, but there are usually multiple versions defined, and it will probably be removed at some point.
- Datasets can be further optimized to reduce file size. One example would be to have one json key, value for conditions total like so: `{numConditions: [In Progress (int), Closed (int)]}` instead of `{In Progress: int, Closed: int}`
- Include documentation and instructions for getting regdocs links from the internal cer database.
- Incident trends should have "spaces" between non-consecutive years.
