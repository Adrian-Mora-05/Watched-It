from selenium import webdriver
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.common.by import By
from selenium.webdriver.support import expected_conditions as EC
from deep_translator import GoogleTranslator
from bs4 import BeautifulSoup
import json
import re
import supabase
from dotenv import load_dotenv
import os

load_dotenv()

supabase = supabase.create_client(os.getenv("SUPABASE_URL"), os.getenv("SUPABASE_SERVICE_ROLE_KEY"))

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

def trim_to_limit(text, limit=4999): # deep translator has a limit of 5000 characters
    if not isinstance(text, str) or len(text) <= limit:
        return text
    
    # split into sentences
    sentences = re.split(r'(?<=[.!?])\s+', text)
    
    # remove sentences from the end until it fits
    while sentences and len(" ".join(sentences)) > limit:
        sentences.pop()
    
    return " ".join(sentences)

def clean_html(text):
    if isinstance(text, str):
        return BeautifulSoup(text, "html.parser").get_text()
    return text

def translate(text, target="es"): #translate to spanish
    if isinstance(text, str):
        return GoogleTranslator(source="auto", target=target).translate(text) 
    return text

def processReviews(href, driver, movie_index):
    try:
        reviews = []
        driver.get(href)
        wait = WebDriverWait(driver, 10)
        wait.until(lambda d: d.execute_script("return window.__NEXT_DATA__ !== undefined;"))
        next_data = driver.execute_script("return JSON.stringify(window.__NEXT_DATA__);")
        data = json.loads(next_data)
        page_props_main = data["props"]["pageProps"]["mainColumnData"]

        for e in page_props_main["featuredReviews"]["edges"]:
            if e["node"]["authorRating"] in [1, 2]:
                rating = 1
            elif e["node"]["authorRating"] in [3, 4]:
                rating = 2
            elif e["node"]["authorRating"] in [5, 6]:
                rating = 3
            elif e["node"]["authorRating"] in [7, 8]:
                rating = 4
            elif e["node"]["authorRating"] in [9, 10]:
                rating = 5
            elif e["node"]["authorRating"] is None:
                rating = 4

            text = translate(trim_to_limit(clean_html(e["node"]["text"]["originalText"]["plaidHtml"])), target="es")
            reviews.append({
                "movie_index": movie_index,
                "rating": rating,
                "text": text
            })

        return reviews
    except Exception as e:
        print(f"Error processing reviews for {href}: {e}")
        return []


def processMovies(href, driver):
    try:
        driver.get(href)
        wait = WebDriverWait(driver, 10)
        wait.until(lambda d: d.execute_script("return window.__NEXT_DATA__ !== undefined;"))
        next_data = driver.execute_script("return JSON.stringify(window.__NEXT_DATA__);")
        data = json.loads(next_data)
        page_props_main = data["props"]["pageProps"]["mainColumnData"]
        page_props_fold = data["props"]["pageProps"]["aboveTheFoldData"]

        movie_dict = {
            'titulo': getTitle(page_props_main),
            'anio': getYear(page_props_main),
            'pais': getCountry(page_props_main),
            'duracion': getLength(page_props_main),
            'genero': getGenre(page_props_fold),
            'restriccion_edad': getAgeRestriction(page_props_fold),
            'enlace_imagen': getImageLink(page_props_main),
            'sinopsis': getSynopsis(page_props_fold),
            'popularidad': getPopularity(page_props_fold)
        }

        return movie_dict
    except Exception as e:
        print(f"Error processing {href}: {e}")
        return None


def createMovieDataset():
    all_movies = []
    all_reviews = []

    driver = webdriver.Chrome()
    driver.get("https://www.imdb.com/chart/top/?ref_=hm_nv_menu")

    wait = WebDriverWait(driver, 10)
    wait.until(EC.presence_of_element_located((By.CSS_SELECTOR, "a.ipc-title-link-wrapper")))

    elementos = driver.find_elements(By.CSS_SELECTOR, "a.ipc-title-link-wrapper")
    hrefs = [el.get_attribute("href") for el in elementos]

    for index, href in enumerate(hrefs):
        try:

            movie = processMovies(href, driver)

            if movie is None:
                print(f"Skipping movie {index + 1}/{len(hrefs)} ({href}): returned None")
                continue

            reviews = processReviews(href, driver, index)

            all_movies.append(movie)
            all_reviews.extend(reviews)
            print(f"Processed movie {index + 1}/{len(hrefs)}: {movie['titulo']} with {len(reviews)} reviews.")

        except Exception as e:
            print(f"Skipping movie {index + 1}/{len(hrefs)} ({href}): {type(e).__name__}: {e}")
            continue

    driver.quit()

    return all_movies, all_reviews

def loadIntoDB(records):
    response = supabase.table("pelicula").select("id", count="exact").execute()

    if response.count >= 200:
        print("Database already has 200+ movies, skipping load.")
        return

    try:
        for i, movie in enumerate(records):
            try:
                supabase.table("pelicula").insert(movie).execute()
                print(f"Inserted {movie['titulo']}")

            except Exception as e:
                print(f"Error on movie {movie['titulo']}: {e}")

    except Exception as e:
        print(f"Error loading movies: {e}")