from bs4 import BeautifulSoup
import requests
import os
import ssl
import re
ssl._create_default_https_context = ssl._create_unverified_context
script_dir = os.path.dirname(__file__)
webpackRegex = "[0-9a-f]{20}"


def newContent(link):
    
    newHtml = {}
    if "facilities-we-regulate" in link:
        lang = "en"
    else:
        lang = "fr"

    if "natural-gas" in link:
        product = "natural-gas"
    else:
        product = "oil-and-liquids"

    matches = {"NGTL": ["ngtl"]}

    for key, value in matches.items():
        for theirs in value:
            if theirs in link:
                mine = key

    distPath = os.path.join("..", "dist", lang, product, mine+"_"+lang+".html")
    page = open(distPath)
    profile = BeautifulSoup(page.read(), "html.parser")
    newHead = []
    head = profile.find("head")
    for css in head.findAll("link"):
        if re.search(webpackRegex, str(css)):
            newHead.append(str(css))
    for script in head.findAll("script"):
        newHead.append(str(script))
    
    newScripts = BeautifulSoup("".join(newHead), "html.parser")
    newHtml["scripts"] = newScripts
    return newHtml


def updateCERFiles():
    links = ["https://www.cer-rec.gc.ca/en/data-analysis/facilities-we-regulate/pipeline-profiles/natural-gas/pipeline-profiles-ngtl.html"]
    for link in links:
        folder = link.split("/")
        file = folder[-1]
        folder = "/".join(folder[-4:-1])
        fullPath = os.path.join(script_dir, "latest", folder)
        output = os.path.join(script_dir, "web-ready", folder)
        for f in [fullPath, output]:
            if not os.path.isdir(f):
                os.makedirs(f)
        pathWithFile = os.path.join(fullPath, file)
        if os.path.isfile(pathWithFile):
            print("file already saved")
            page = open(pathWithFile)
            profile = BeautifulSoup(page.read(), "html.parser")
        else:
            print("getting file")
            page = requests.get(link, verify=False)
            profile = BeautifulSoup(page.content, "html.parser")
            profile = profile.prettify()
            with open(os.path.join(fullPath, file), "w") as file:
                file.write(str(profile))

        # get all the new content from ./dist
        newHtml = newContent(link)

        # delete and replace script + css tags
        head = profile.find("head")
        for script in head.findAll("script"):
            if re.search("self.webpack", str(script)):
                script.decompose()
            if re.search(webpackRegex, str(script)):
                script.decompose()
        for css in head.findAll("link"):
            if re.search(webpackRegex, str(css)):
                css.decompose()

        # newScripts = BeautifulSoup('<span class="new-scripts-here"></span>', "html.parser")
        tag = head.find("meta", {"name": "dcterms.subject"})
        tag.insert_after(newHtml["scripts"])

        # save output
        profile = profile.prettify()
        with open(os.path.join(output, file), "w") as file:
            file.write(str(profile))

    return profile


if __name__ == "__main__":
    profile = updateCERFiles()
