# Pipeline Profiles

- **Live version:** https://pipeline-profiles.herokuapp.com/

New interactive content under development for the CER's [pipeline profiles](https://www.cer-rec.gc.ca/en/data-analysis/facilities-we-regulate/pipeline-profiles/index.html) web page.

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
    │   en/
    │   fr/
```

## Quick start for contributing

1. clone repo

```bash
cd Documents
git clone https://github.com/mbradds/pipeline-profiles.git
```

2. install dependencies

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
