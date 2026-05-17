import json
from selenium import webdriver
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.common.by import By
from selenium.webdriver.support import expected_conditions as EC

driver = webdriver.Chrome()
driver.get("https://www.imdb.com/chart/top/?ref_=hm_nv_menu")

# Esperar hasta que __NEXT_DATA__ exista y no sea null
wait = WebDriverWait(driver, 10)

wait.until(EC.presence_of_element_located((By.CSS_SELECTOR, "a.ipc-title-link-wrapper")))

elementos = driver.find_elements(By.CSS_SELECTOR, "a.ipc-title-link-wrapper")
hrefs = [el.get_attribute("href") for el in elementos]
for i, href in enumerate(hrefs, 1):
    print(f"{i}. {href}")
    driver.get(href)
    wait = WebDriverWait(driver, 10)



    wait.until(lambda d: d.execute_script("return window.__NEXT_DATA__ !== undefined;"))

    # Ahora sí extraerlo
    next_data = driver.execute_script("return JSON.stringify(window.__NEXT_DATA__);")
    data = json.loads(next_data)
    page_props = data["props"]["pageProps"]["mainColumnData"]
    print(json.dumps(page_props, indent=2))

driver.quit()