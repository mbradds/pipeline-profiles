import os
from io import BytesIO
from urllib.request import urlopen
from zipfile import ZipFile
import geopandas as gpd
from util import set_cwd_to_script
set_cwd_to_script()


def getMap(zipLink, folder):
    print("getting "+zipLink.split("/")[0] + " ...")

    savePath = os.path.join(os.getcwd(), "raw_data", folder)
    if not os.path.exists(savePath):
        os.makedirs(savePath)
    with urlopen(zipLink) as zipresp:
        with ZipFile(BytesIO(zipresp.read())) as zfile:
            zfile.extractall(savePath)

    print("downloaded and unzipped "+zipLink.split("/")[0])


def checkCRS():
    baseMap = gpd.read_file(os.path.join(os.getcwd(), "raw_data", "base_map", "lpr_000b16a_e.shp"))
    baseMap = baseMap.set_geometry('geometry')
    print("base map CRS: ")
    print(baseMap.crs)

    regions = gpd.read_file(os.path.join(os.getcwd(), "raw_data", "economic_regions", "ler_000b16a_e.shp"))
    regions = regions.set_geometry('geometry')
    print("base map CRS: ")
    print(regions.crs)

    if (baseMap.crs == regions.crs):
        print("same crs")


if __name__ == "__main__":
    getMap("http://www12.statcan.gc.ca/census-recensement/2011/geo/bound-limit/files-fichiers/2016/lpr_000b16a_e.zip", "base_map")
    getMap("http://www12.statcan.gc.ca/census-recensement/2011/geo/bound-limit/files-fichiers/2016/ler_000b16a_e.zip", "economic_regions")
    checkCRS()