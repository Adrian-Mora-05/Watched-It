from selenium import webdriver
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.common.by import By
from selenium.webdriver.support import expected_conditions as EC
from deep_translator import GoogleTranslator
from bs4 import BeautifulSoup
from datetime import datetime, timezone
import random
import json
import re
import supabase
from dotenv import load_dotenv
import os
import time

load_dotenv()

supabase = supabase.create_client(os.getenv("SUPABASE_URL"), os.getenv("SUPABASE_SERVICE_ROLE_KEY"))

def random_date():
    start = datetime(2025, 1, 1, tzinfo=timezone.utc)
    end = datetime.now(timezone.utc)
    random_timestamp = random.uniform(start.timestamp(), end.timestamp())
    return datetime.fromtimestamp(random_timestamp, tz=time.timezone.utc).isoformat()

def getTitle(page_props):
    return page_props["originalTitleText"]["text"] 

def getYearStart(page_props):
    return page_props["releaseDate"]["year"]

def getYearEnd(page_props):
    return page_props["releaseYear"]["endYear"]

def getCountry(page_props):
    return page_props["countriesDetails"]["countries"][0]["text"]

def getSeasons(page_props):
    return len(page_props["episodes"]["seasons"])

def getGenre(page_props):
    return page_props["titleGenres"]["genres"][0]["genre"]["text"]

def getAgeRestriction(page_props):
    rating = page_props["certificate"]["rating"]
    child_friendly = ["TV-Y", "TV-Y7", "TV-G", "TV-PG", "G", "PG", "TV-Y7-FV", "TV-14"]
    return rating not in child_friendly

def getImageLink(page_props):
    return page_props["primaryImage"]["url"].split("/")[5] 

def getSynopsis(page_props):
    return page_props["plot"]["plotText"]["plainText"]

def getPopularity(page_props):
    return page_props["ratingsSummary"]["voteCount"] 

def trim_to_limit(text, limit=1000): 
    if not isinstance(text, str) or len(text) <= limit:
        return text
    sentences = re.split(r'(?<=[.!?])\s+', text)
    
    while sentences and len(" ".join(sentences)) > limit:
        sentences.pop()
    
    return " ".join(sentences)

def clean_html(text):
    if isinstance(text, str):
        return BeautifulSoup(text, "html.parser").get_text()
    return text

def translate(text, target="es"): 
    if isinstance(text, str):
        return GoogleTranslator(source="auto", target=target).translate(text) 
    return text

def processReviews(href, driver, show_index):
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
                "show_index": show_index,
                "rating": rating,
                "text": text
            })

        return reviews
    except Exception as e:
        print(f"Error processing reviews for {href}: {e}")
        return []

def processShows(href, driver):
    try:
        driver.get(href)
        wait = WebDriverWait(driver, 10)
        wait.until(lambda d: d.execute_script("return window.__NEXT_DATA__ !== undefined;"))
        next_data = driver.execute_script("return JSON.stringify(window.__NEXT_DATA__);")
        data = json.loads(next_data)
        page_props_main = data["props"]["pageProps"]["mainColumnData"]
        page_props_fold = data["props"]["pageProps"]["aboveTheFoldData"]

        show_dict = {
            'titulo': getTitle(page_props_main),
            'anio_inicio': getYearStart(page_props_main),
            'anio_fin': getYearEnd(page_props_fold),
            'pais': getCountry(page_props_main),
            'cant_temporadas': getSeasons(page_props_main),
            'genero': getGenre(page_props_fold),
            'restriccion_edad': getAgeRestriction(page_props_fold),
            'enlace_imagen': getImageLink(page_props_main),
            'sinopsis': getSynopsis(page_props_fold),
            'popularidad': getPopularity(page_props_fold)
        }

        return show_dict
    except Exception as e:
        print(f"Error processing {href}: {e}")
        return None

def createShowDataset():
    all_shows = []
    all_reviews = []

    driver = webdriver.Chrome()
    driver.get("https://www.imdb.com/chart/toptv/?ref_=tt_nv_menu")

    wait = WebDriverWait(driver, 10)
    wait.until(EC.presence_of_element_located((By.CSS_SELECTOR, "a.ipc-title-link-wrapper")))

    elementos = driver.find_elements(By.CSS_SELECTOR, "a.ipc-title-link-wrapper")
    hrefs = [el.get_attribute("href") for el in elementos]

    for index, href in enumerate(hrefs):
        try:
            show = processShows(href, driver)

            if show is None:
                print(f"Skipping movie {index + 1}/{len(hrefs)} ({href}): returned None")
                continue

            reviews = processReviews(href, driver, index)

            all_shows.append(show)
            all_reviews.extend(reviews)
            print(f"Processed show {index + 1}/{len(hrefs)}: {show['titulo']} with {len(reviews)} reviews.")

        except Exception as e:
            print(f"Skipping show {index + 1}/{len(hrefs)} ({href}): {type(e).__name__}: {e}")
            continue

    driver.quit()

    return all_shows, all_reviews

def loadShowsIntoDB(records):
    try:
        for show in records:
            try:
                existing = supabase.table("serie").select("id").ilike("titulo", show["titulo"]).execute()
                if existing.data:
                    print(f"Ya existe: {show['titulo']}, saltando...")
                    continue
                supabase.table("serie").insert(show).execute()
                print(f"Insertado: {show['titulo']}")
            except Exception as e:
                print(f"Error en {show['titulo']}: {e}")
    except Exception as e:
        print(f"Error loading shows: {e}")


def loadReviewsIntoDB(records, uuids):
    response = supabase.table("calificacion_x_serie").select("id", count="exact").execute()
    if response.count >= 300:
        print("Database already has 300+ reviews, skipping load.")
        return

    if not records:
        print("No reviews to insert.")
        return
    if not uuids:
        print("No UUIDs available, cannot insert reviews.")
        return

    movies_response = supabase.table("serie").select("id").order("id").execute()
    db_ids = [row["id"] for row in movies_response.data]

    for i, review in enumerate(records):
        try:
            db_id = db_ids[i // 5]  # reviews 0-4 → movie 0, reviews 5-9 → movie 1, etc.
            assigned_uuid = uuids[i % len(uuids)]

            rating_response = (
                supabase.table("calificacion_x_serie")
                .insert({
                    "id_serie": db_id,
                    "calificacion": review["rating"],
                    "id_usuario": assigned_uuid,
                    "fecha_creado": random_date()  # random timestamptz between Jan 1 2025 and today
                })
                .execute()
            )

            inserted = rating_response.data
            if not inserted:
                print(f"Failed to insert rating for movie DB id {db_id}, skipping comment.")
                continue

            rating_id = inserted[0]["id"]

            supabase.table("comentario_x_serie").insert({
                "cant_me_gusta": 0,
                "id_calificacion_x_serie": rating_id,
                "contenido": review["text"]
            }).execute()

            print(f"Inserted review {i} for movie DB id {db_id} by user {assigned_uuid}")

        except Exception as e:
            print(f"Error on review for movie index {review['movie_index']}: {e}")