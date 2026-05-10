import json
from selenium import webdriver
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.common.by import By
from selenium.webdriver.support import expected_conditions as EC
import pandas as pd

def getTitle(page_props):
    return page_props["originalTitleText"]["text"] #title in original language

def getYear(page_props):
    return page_props["releaseDate"]["year"]

def getCountry(page_props):
    return page_props["countriesDetails"]["countries"][0]["text"]

def getLength(page_props):
    seconds = page_props["runtime"]["seconds"]
    minutes= seconds // 60
    return minutes

def getGenre(page_props):
    return page_props["titleGenres"]["genres"][0]["genre"]["text"]

def getAgeRestriction(page_props):
    if page_props["certificate"]["rating"] in["AA", "A", "B"]: # ratings that indicate the movie is suitable for children
        return False
    else:
        return True

def getImageLink(page_props):
    return page_props["primaryImage"]["url"].split("/")[5] #get the image id from the url to not have long links in the db

def getSynopsis(page_props):
    return page_props["plot"]["plotText"]["plainText"]

def getPopularity(page_props):
    return page_props["ratingsSummary"]["voteCount"] #popularity is measured by the number of votes, not by the rating itself

def getReviews(page_props): #ToDo
    return

def processMovies(href, driver):
    try:
        driver.get(href)
        wait = WebDriverWait(driver, 10) #wait for the page to load
        wait.until(lambda d: d.execute_script("return window.__NEXT_DATA__ !== undefined;"))
        next_data = driver.execute_script("return JSON.stringify(window.__NEXT_DATA__);")
        data = json.loads(next_data)
        page_props_main = data["props"]["pageProps"]["mainColumnData"] #get the main column data which contains most of the information about the movie
        page_props_fold = data["props"]["pageProps"]["aboveTheFoldData"] #get the above the fold data 

        # create dictionary with movie data to be stored in df
        movie_dict = {'title': getTitle(page_props_main), 
                    'year': getYear(page_props_main), 
                    'country': getCountry(page_props_main), 
                    'length': getLength(page_props_main), 
                    'genre': getGenre(page_props_fold), 
                    'age_restriction': getAgeRestriction(page_props_fold), 
                    'image_url': getImageLink(page_props_main), 
                    'synopsis': getSynopsis(page_props_fold), 
                    'popularity': getPopularity(page_props_fold)}
        return movie_dict
    except Exception as e:
        print(f"Error processing {href}: {e}")



def createMovieDataset():
    all_movies = [] #list to store all movie data before creating the dataframe

    driver = webdriver.Chrome()
    driver.get("https://www.imdb.com/chart/top/?ref_=hm_nv_menu") #go to the top 250 movies page

    # Wait for __NEXT_DATA__ to exist and not be null
    wait = WebDriverWait(driver, 10)

    wait.until(EC.presence_of_element_located((By.CSS_SELECTOR, "a.ipc-title-link-wrapper")))

    elementos = driver.find_elements(By.CSS_SELECTOR, "a.ipc-title-link-wrapper")
    hrefs = [el.get_attribute("href") for el in elementos]

    for i, href in enumerate(hrefs, 1):
        print(f"Processing movie {i}/{len(hrefs)}: {href}")
        movie = processMovies(href, driver)
        if movie is not None:
            all_movies.append(movie)

        break

    final_df = pd.DataFrame(all_movies)

    final_df.to_csv("data/movies.csv", index=False, encoding="utf-8-sig") #use utf-8-sig encoding to avoid issues with special characters

    driver.quit()

    return final_df