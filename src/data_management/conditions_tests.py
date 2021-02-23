from conditions import process_conditions
import unittest


class NovaTotalConditions(unittest.TestCase):

    def testCompanyData(self):
        company_df, regions, mapMeta, meta = process_conditions(remote=False, companies=['NOVA Gas Transmission Ltd.'])
        in_Progress = company_df[company_df['Condition Status'] == "In Progress"].copy().reset_index(drop=True)
        closed = company_df[company_df['Condition Status'] == "Closed"].copy().reset_index(drop=True)
        self.assertEqual(len(company_df), 1569)
        self.assertEqual(len(in_Progress), 157)
        self.assertEqual(len(closed), 1412)

    def testMeta(self):
        company_df, regions, mapMeta, meta = process_conditions(remote=False, companies=['NOVA Gas Transmission Ltd.'])
        self.assertEqual(meta["summary"]["Closed"], 1367)
        self.assertEqual(meta["summary"]["In Progress"], 151)
        self.assertEqual(meta["summary"]["notOnMap"]["total"], 51)
        self.assertEqual(meta["summary"]["notOnMap"]["status"]["Closed"], 45)
        self.assertEqual(meta["summary"]["notOnMap"]["status"]["In Progress"], 6)
        total = meta["summary"]["Closed"] + meta["summary"]["In Progress"] + meta["summary"]["notOnMap"]["total"]
        self.assertEqual(total, 1569)

    def testMapMeta(self):
        company_df, regions, mapMeta, meta = process_conditions(remote=False, companies=['NOVA Gas Transmission Ltd.'])
        red_deer = mapMeta[mapMeta['id'] == "Red Deer"].copy().reset_index(drop=True)
        self.assertEqual(red_deer.loc[0, "In Progress"], 9)
        self.assertEqual(red_deer.loc[0, "Closed"], 35)


if __name__ == "__main__":
    unittest.main()
