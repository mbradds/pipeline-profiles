import unittest
from incidents import process_incidents
from conditions import process_conditions
from util import most_common
import pandas as pd


class TestUtil(unittest.TestCase):
    testData = {'row_1': [5, 3, 2, 1, 0, 0, 0, 1], 'row_2': ['e', 'a', 'b', 'c', 'd', 'e', 'e', 'c']}
    df = pd.DataFrame.from_dict(testData, orient='columns')

    def testMostCommonText1(self):
        meta = {}
        meta = most_common(self.df, meta, "row_2", "testTop1", top=1)
        self.assertEqual(meta["testTop1"], "e")

    def testMostCommonNumber1(self):
        meta = {}
        meta = most_common(self.df, meta, "row_1", "testTop1", top=1)
        self.assertEqual(meta["testTop1"], "0")

    def testMostCommonText2(self):
        meta = {}
        meta = most_common(self.df, meta, "row_2", "testTop2", top=2)
        self.assertEqual(meta["testTop2"], {'e': 3, 'c': 2})


class TestNovaIncidents(unittest.TestCase):
    df, volume, meta = process_incidents(remote=False, companies=['NOVA Gas Transmission Ltd.'], test=True, lang='en')
    dfFR, volumeFR, metaFR = process_incidents(remote=False, companies=['NOVA Gas Transmission Ltd.'], test=True, lang='fr')

    def countIncidentType(self, iType, df):
        count = 0
        for t in df['Incident Types']:
            if iType in t:
                count = count + 1
        return count

    def testEngEqualToFra(self):
        self.assertEqual(len(self.df), len(self.dfFR))
        self.assertEqual(self.countIncidentType("Adverse Environmental Effects", self.df),
                         self.countIncidentType("Effets environnementaux négatifs", self.dfFR))

        self.assertEqual(self.meta["seriousEvents"]["Adverse Environmental Effects"],
                         self.metaFR["seriousEvents"]["Adverse Environmental Effects"])
        self.assertEqual(self.meta["seriousEvents"]["Serious Injury (CER or TSB)"],
                         self.metaFR["seriousEvents"]["Serious Injury (CER or TSB)"])
        self.assertEqual(self.meta["seriousEvents"]["Fatality"],
                         self.metaFR["seriousEvents"]["Fatality"])

    def testTotal(self):
        self.assertEqual(len(self.df), 330)  # total incidents for NGTL
        self.assertEqual(len(self.volume), 89)  # total release incidents

    def testIncidentTypes(self):
        # test on full NGTL data
        self.assertEqual(self.countIncidentType("Adverse Environmental Effects", self.df), 7)
        self.assertEqual(self.countIncidentType("Serious Injury (CER or TSB)", self.df), 12)
        self.assertEqual(self.countIncidentType("Fatality", self.df), 1)
        # test on calcualted sumamry metadata
        self.assertEqual(self.meta["seriousEvents"]["Adverse Environmental Effects"], 7)
        self.assertEqual(self.meta["seriousEvents"]["Serious Injury (CER or TSB)"], 12)
        self.assertEqual(self.meta["seriousEvents"]["Fatality"], 1)

    def testVariableCounts(self):
        substance = self.volume[self.volume['Substance'] == "Natural Gas - Sweet"].copy()
        status = self.volume[self.volume['Status'] == "Closed"].copy()
        year = self.volume[self.volume['Year'] == 2013].copy()
        self.assertEqual(len(substance), 83)
        self.assertEqual(len(status), 82)
        self.assertEqual(len(year), 2)
        trueSubstanceRelease = 38370485
        self.assertTrue(trueSubstanceRelease-1 <= int(substance['vol'].sum()) <= trueSubstanceRelease+1)
        trueStatusRelease = 26871755
        self.assertTrue(trueStatusRelease-1 <= int(status['vol'].sum()) <= trueStatusRelease)
        trueYearRelease = 20800000
        self.assertTrue(trueYearRelease-1 <= int(year['vol'].sum()) <= trueYearRelease+1)

    def testTrends(self):
        year = self.volume[self.volume['Year'] == 2016].copy()
        self.assertEqual(len(year), 8)


class NovaTotalConditions(unittest.TestCase):
    company_df, regions, mapMeta, meta = process_conditions(remote=False, companies=['NOVA Gas Transmission Ltd.'], test=True, lang='en')

    def testCompanyData(self):
        in_Progress = self.company_df[self.company_df['Condition Status'] == "In Progress"].copy().reset_index(drop=True)
        closed = self.company_df[self.company_df['Condition Status'] == "Closed"].copy().reset_index(drop=True)
        self.assertEqual(len(self.company_df), 1569)
        self.assertEqual(len(in_Progress), 157)
        self.assertEqual(len(closed), 1412)

    def testMeta(self):
        self.assertEqual(self.meta["summary"]["Closed"], 1367)
        self.assertEqual(self.meta["summary"]["In Progress"], 151)
        self.assertEqual(self.meta["summary"]["notOnMap"]["total"], 51)
        self.assertEqual(self.meta["summary"]["notOnMap"]["status"]["Closed"], 45)
        self.assertEqual(self.meta["summary"]["notOnMap"]["status"]["In Progress"], 6)
        total = self.meta["summary"]["Closed"] + self.meta["summary"]["In Progress"] + self.meta["summary"]["notOnMap"]["total"]
        self.assertEqual(total, 1569)

    def testMapMeta(self):
        red_deer = self.mapMeta[self.mapMeta['id'] == "Red Deer"].copy().reset_index(drop=True)
        self.assertEqual(red_deer.loc[0, "In Progress"], 9)
        self.assertEqual(red_deer.loc[0, "Closed"], 35)


if __name__ == "__main__":
    unittest.main()
