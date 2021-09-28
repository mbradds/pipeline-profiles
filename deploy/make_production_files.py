'''
This module pulls the latest production pipeline profile pages from the cer website, deletes the
old content, and replaces it with new content from ../dist

TODO: 
    -add errors for when this is run without anything in dist
    -add errors for when there are new sections in dist and not in CER files
    -add the rest of the CER files in eng and fra
'''


import os
import ssl
import re
import requests
from bs4 import BeautifulSoup
ssl._create_default_https_context = ssl._create_unverified_context
script_dir = os.path.dirname(__file__)
WEBPACK_REGEX = "[0-9a-f]{20}"


def pretty(soup):
    soup = soup.prettify()
    soup = BeautifulSoup(soup, "html.parser")
    return soup


def get_new_content(link):

    new_html = {}
    if "facilities-we-regulate" in link:
        lang = "en"
    else:
        lang = "fr"

    if "natural-gas" in link or "gaz-naturel" in link:
        product = "natural-gas"
    else:
        product = "oil-and-liquids"

    matches = {"Aurora": ["aurora"],
               "EnbridgeBakken": ["enbridge-bakken"],
               "EnbridgeMainline": ["enbridge-mainline", "reseau-principal-denbridge"],
               "NormanWells": ["norman-wells"],
               "Express": ["express"],
               "Genesis": ["genesis"],
               "Keystone": ["keystone"],
               "Cochin": ["cochin"],
               "MilkRiver": ["milk-river"],
               "Montreal": ["montreal"],
               "SouthernLights": ["southern-lights"],
               "TransMountain": ["trans-mountain"],
               "TransNorthern": ["trans-northern", "trans-nord"],
               "Wascana": ["wascana"],
               "Westspur": ["westspur"],
               "Alliance": ["alliance"],
               "Brunswick": ["emera-brunswick", "gazoduc-brunswick-demera"],
               "Foothills": ["foothills"],
               "ManyIslands": ["many-islands"],
               "MNP": ["maritimes-northeast"],
               "NGTL": ["ngtl"],
               "TCPL": ["transcanadas-canadian-mainline", "reseau-principal-transcanada-pays"],
               "TQM": ["trans-quebec-maritimes", "gazoduc-trans-quebec-maritimes"],
               "Vector": ["vector"],
               "Westcoast": ["westcoast-bc-pipeline"]}

    found = False
    for key, value in matches.items():
        for theirs in value:
            if theirs in link:
                mine = key
                found = True
                break
        if found:
            break

    dist_path = os.path.join("..", "dist", lang, product, mine+"_"+lang+".html")
    page = open(dist_path)
    new_profile = BeautifulSoup(page.read(), "html.parser")
    new_head = []
    head = new_profile.find("head")
    for css in head.findAll("link"):
        if re.search(WEBPACK_REGEX, str(css)):
            new_head.append(str(css))
    for script in head.findAll("script"):
        new_head.append(str(script))

    new_scripts = BeautifulSoup("".join(new_head), "html.parser")
    new_scripts = pretty(new_scripts)
    new_html["scripts"] = new_scripts
    new_html["throughput"] = new_profile.find(id="traffic-section")
    new_html["apportionment"] = new_profile.find(id="apportionment-section")
    new_html["safetyAndEnv"] = {"navigation": new_profile.find(id="safety-env-navigation"),
                               "sections": new_profile.findAll(class_="profile-section")}
    return new_html


def replace_section(profile, new_html, h2_id, section_id, new_key):
    has_section = profile.find(id=h2_id)
    if has_section:
        old_section = profile.find(id=section_id)
        old_section.clear()
        if new_html[new_key]:
            old_section.insert_after(new_html[new_key])
            old_section.decompose()
        else:
            print("Error, old section cleared, but no new section")
    # else:
        # print("Warning. Old profile does not have this section: "+section_id)


def replace_safety_env(profile, new_html):
    nav = profile.find(id="safety-env-navigation")
    nav.clear()
    nav.insert_after(new_html["safetyAndEnv"]["navigation"])
    nav.decompose()

    sections = profile.findAll(class_="profile-section")
    for old_section in sections:
        old_section.decompose()
    new_sections = []
    for new_section in new_html["safetyAndEnv"]["sections"]:
        new_sections.append(str(new_section))

    nav = profile.find(id="safety-env-navigation")
    nav.insert_after(BeautifulSoup("".join(new_sections), "html.parser"))


def update_cer_files():
    links = ["https://www.cer-rec.gc.ca/en/data-analysis/facilities-we-regulate/pipeline-profiles/oil-and-liquids/pipeline-profiles-aurora-pipeline.html",
             "https://www.cer-rec.gc.ca/en/data-analysis/facilities-we-regulate/pipeline-profiles/oil-and-liquids/pipeline-profiles-enbridge-bakken.html",
             "https://www.cer-rec.gc.ca/en/data-analysis/facilities-we-regulate/pipeline-profiles/oil-and-liquids/pipeline-profiles-enbridge-mainline.html",
             "https://www.cer-rec.gc.ca/en/data-analysis/facilities-we-regulate/pipeline-profiles/oil-and-liquids/pipeline-profiles-enbridge-norman-wells.html",
             "https://www.cer-rec.gc.ca/en/data-analysis/facilities-we-regulate/pipeline-profiles/oil-and-liquids/pipeline-profiles-express-pipeline.html",
             "https://www.cer-rec.gc.ca/en/data-analysis/facilities-we-regulate/pipeline-profiles/oil-and-liquids/pipeline-profiles-genesis-pipeline-canada-ltd.html",
             "https://www.cer-rec.gc.ca/en/data-analysis/facilities-we-regulate/pipeline-profiles/oil-and-liquids/pipeline-profiles-keystone-pipeline.html",
             "https://www.cer-rec.gc.ca/en/data-analysis/facilities-we-regulate/pipeline-profiles/oil-and-liquids/pipeline-profiles-kinder-morgan-cochin.html",
             "https://www.cer-rec.gc.ca/en/data-analysis/facilities-we-regulate/pipeline-profiles/oil-and-liquids/pipeline-profiles-milk-river.html",
             "https://www.cer-rec.gc.ca/en/data-analysis/facilities-we-regulate/pipeline-profiles/oil-and-liquids/pipeline-profiles-montreal.html",
             "https://www.cer-rec.gc.ca/en/data-analysis/facilities-we-regulate/pipeline-profiles/oil-and-liquids/pipeline-profiles-southern-lights.html",
             "https://www.cer-rec.gc.ca/en/data-analysis/facilities-we-regulate/pipeline-profiles/oil-and-liquids/pipeline-profiles-trans-mountain.html",
             "https://www.cer-rec.gc.ca/en/data-analysis/facilities-we-regulate/pipeline-profiles/oil-and-liquids/pipeline-profiles-trans-northern.html",
             "https://www.cer-rec.gc.ca/en/data-analysis/facilities-we-regulate/pipeline-profiles/oil-and-liquids/pipeline-profiles-wascana.html",
             "https://www.cer-rec.gc.ca/en/data-analysis/facilities-we-regulate/pipeline-profiles/oil-and-liquids/pipeline-profiles-westspur.html",
             "https://www.cer-rec.gc.ca/en/data-analysis/facilities-we-regulate/pipeline-profiles/natural-gas/pipeline-profiles-alliance.html",
             "https://www.cer-rec.gc.ca/en/data-analysis/facilities-we-regulate/pipeline-profiles/natural-gas/pipeline-profiles-emera-brunswick.html",
             "https://www.cer-rec.gc.ca/en/data-analysis/facilities-we-regulate/pipeline-profiles/natural-gas/pipeline-profiles-foothills.html",
             "https://www.cer-rec.gc.ca/en/data-analysis/facilities-we-regulate/pipeline-profiles/natural-gas/pipeline-profiles-many-islands.html",
             "https://www.cer-rec.gc.ca/en/data-analysis/facilities-we-regulate/pipeline-profiles/natural-gas/pipeline-profiles-maritimes-northeast.html",
             "https://www.cer-rec.gc.ca/en/data-analysis/facilities-we-regulate/pipeline-profiles/natural-gas/pipeline-profiles-ngtl.html",
             "https://www.cer-rec.gc.ca/en/data-analysis/facilities-we-regulate/pipeline-profiles/natural-gas/transcanadas-canadian-mainline.html",
             "https://www.cer-rec.gc.ca/en/data-analysis/facilities-we-regulate/pipeline-profiles/natural-gas/pipeline-profiles-trans-quebec-maritimes.html",
             "https://www.cer-rec.gc.ca/en/data-analysis/facilities-we-regulate/pipeline-profiles/natural-gas/pipeline-profiles-vector.html",
             "https://www.cer-rec.gc.ca/en/data-analysis/facilities-we-regulate/pipeline-profiles/natural-gas/pipeline-profiles-westcoast-bc-pipeline.html",
             "https://www.cer-rec.gc.ca/fr/donnees-analyse/installations-reglementees-par-la-regie/profils-pipeliniers/petrole-et-produits-petroliers/profils-pipeliniers-pipeline-aurora.html",
             "https://www.cer-rec.gc.ca/fr/donnees-analyse/installations-reglementees-par-la-regie/profils-pipeliniers/petrole-et-produits-petroliers/profils-pipeliniers-cochin-kinder-morgan.html",
             "https://www.cer-rec.gc.ca/fr/donnees-analyse/installations-reglementees-par-la-regie/profils-pipeliniers/petrole-et-produits-petroliers/profils-pipeliniers-enbridge-bakken.html",
             "https://www.cer-rec.gc.ca/fr/donnees-analyse/installations-reglementees-par-la-regie/profils-pipeliniers/petrole-et-produits-petroliers/profils-pipeliniers-express.html",
             "https://www.cer-rec.gc.ca/fr/donnees-analyse/installations-reglementees-par-la-regie/profils-pipeliniers/petrole-et-produits-petroliers/profils-pipeliniers-genesis-pipeline-canada-ltd.html",
             "https://www.cer-rec.gc.ca/fr/donnees-analyse/installations-reglementees-par-la-regie/profils-pipeliniers/petrole-et-produits-petroliers/profils-pipeliniers-pipeline-keystone.html",
             "https://www.cer-rec.gc.ca/fr/donnees-analyse/installations-reglementees-par-la-regie/profils-pipeliniers/petrole-et-produits-petroliers/profils-pipeliniers-milk-river.html",
             "https://www.cer-rec.gc.ca/fr/donnees-analyse/installations-reglementees-par-la-regie/profils-pipeliniers/petrole-et-produits-petroliers/profils-pipeliniers-montreal.html",
             "https://www.cer-rec.gc.ca/fr/donnees-analyse/installations-reglementees-par-la-regie/profils-pipeliniers/petrole-et-produits-petroliers/profils-pipeliniers-norman-wells-denbridge.html",
             "https://www.cer-rec.gc.ca/fr/donnees-analyse/installations-reglementees-par-la-regie/profils-pipeliniers/petrole-et-produits-petroliers/profils-pipeliniers-reseau-principal-denbridge.html",
             "https://www.cer-rec.gc.ca/fr/donnees-analyse/installations-reglementees-par-la-regie/profils-pipeliniers/petrole-et-produits-petroliers/profils-pipeliniers-southern-lights.html",
             "https://www.cer-rec.gc.ca/fr/donnees-analyse/installations-reglementees-par-la-regie/profils-pipeliniers/petrole-et-produits-petroliers/profils-pipeliniers-trans-mountain.html",
             "https://www.cer-rec.gc.ca/fr/donnees-analyse/installations-reglementees-par-la-regie/profils-pipeliniers/petrole-et-produits-petroliers/profils-pipeliniers-trans-nord.html",
             "https://www.cer-rec.gc.ca/fr/donnees-analyse/installations-reglementees-par-la-regie/profils-pipeliniers/petrole-et-produits-petroliers/profils-pipeliniers-wascana.html",
             "https://www.cer-rec.gc.ca/fr/donnees-analyse/installations-reglementees-par-la-regie/profils-pipeliniers/petrole-et-produits-petroliers/profils-pipeliniers-westspur.html",
             "https://www.cer-rec.gc.ca/fr/donnees-analyse/installations-reglementees-par-la-regie/profils-pipeliniers/gaz-naturel/profils-pipeliniers-alliance.html",
             "https://www.cer-rec.gc.ca/fr/donnees-analyse/installations-reglementees-par-la-regie/profils-pipeliniers/gaz-naturel/profils-pipeliniers-foothills.html",
             "https://www.cer-rec.gc.ca/fr/donnees-analyse/installations-reglementees-par-la-regie/profils-pipeliniers/gaz-naturel/profils-pipeliniers-gazoduc-brunswick-demera.html",
             "https://www.cer-rec.gc.ca/fr/donnees-analyse/installations-reglementees-par-la-regie/profils-pipeliniers/gaz-naturel/profils-pipeliniers-gazoduc-trans-quebec-maritimes.html",
             "https://www.cer-rec.gc.ca/fr/donnees-analyse/installations-reglementees-par-la-regie/profils-pipeliniers/gaz-naturel/profils-pipeliniers-many-islands.html",
             "https://www.cer-rec.gc.ca/fr/donnees-analyse/installations-reglementees-par-la-regie/profils-pipeliniers/gaz-naturel/profils-pipeliniers-maritimes-northeast.html",
             "https://www.cer-rec.gc.ca/fr/donnees-analyse/installations-reglementees-par-la-regie/profils-pipeliniers/gaz-naturel/profils-pipeliniers-ngtl.html",
             "https://www.cer-rec.gc.ca/fr/donnees-analyse/installations-reglementees-par-la-regie/profils-pipeliniers/gaz-naturel/profils-pipeliniers-reseau-principal-transcanada-pays.html",
             "https://www.cer-rec.gc.ca/fr/donnees-analyse/installations-reglementees-par-la-regie/profils-pipeliniers/gaz-naturel/profils-pipeliniers-vector.html",
             "https://www.cer-rec.gc.ca/fr/donnees-analyse/installations-reglementees-par-la-regie/profils-pipeliniers/gaz-naturel/profils-pipeliniers-westcoast-bc-pipeline.html"]

    for link in links:
        folder = link.split("/")
        file_name = folder[-1]
        folder = "/".join(link.split("/")[-4:-1])
        full_path = os.path.join(script_dir, "latest", folder)
        output = os.path.join(script_dir, "web-ready", folder)
        for f in [full_path, output]:
            if not os.path.isdir(f):
                os.makedirs(f)
        path_with_file = os.path.join(full_path, file_name)
        if os.path.isfile(path_with_file):
            print("file already saved: "+file_name)
            page = open(path_with_file)
            profile = BeautifulSoup(page.read(), "html.parser")
        else:
            print("getting file")
            page = requests.get(link, verify=False)
            profile = BeautifulSoup(page.content, "html.parser")
            # profile = profile.prettify()
            with open(os.path.join(full_path, file_name), "w") as file:
                file.write(str(profile))

        # get all the new content from ./dist
        new_html = get_new_content(link)

        # delete and replace old script + css tags
        head = profile.find("head")
        for script in head.findAll("script"):
            if re.search("self.webpack", str(script)):
                script.decompose()
            if re.search(WEBPACK_REGEX, str(script)):
                script.decompose()
        for css in head.findAll("link"):
            if re.search(WEBPACK_REGEX, str(css)):
                css.decompose()

        tag = head.find("meta", {"name": "dcterms.subject"})
        tag.insert_after(new_html["scripts"])

        # delete and replace old throughput
        replace_section(profile, new_html, "throughput", "traffic-section", "throughput")
        replace_section(profile, new_html, "apportionment", "apportionment-section", "apportionment")
        replace_safety_env(profile, new_html)

        # save output
        # profile = profile.prettify()
        with open(os.path.join(output, file_name), "w") as file:
            file.write(str(profile))


if __name__ == "__main__":
    update_cer_files()
