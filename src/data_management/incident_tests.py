import unittest
from incidents import process_incidents


class TestNovaIncidents(unittest.TestCase):
    df, volume, meta, perKm = process_incidents(remote=False, companies=['NOVA Gas Transmission Ltd.'])

    def countIncidentType(self, iType, df):
        count = 0
        for t in df['Incident Types']:
            if iType in t:
                count = count + 1
        return count

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
        self.assertEqual(int(substance['Approximate Volume Released'].sum()), 38370485)
        self.assertEqual(int(status['Approximate Volume Released'].sum()), 26871755)
        self.assertEqual(int(year['Approximate Volume Released'].sum()), 20800000)

    def testTrends(self):
        year = self.volume[self.volume['Year'] == 2016].copy()
        self.assertEqual(len(year), 8)


if __name__ == "__main__":
    unittest.main()
