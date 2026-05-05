from selenium import webdriver

driver = webdriver.Chrome()
driver.get("https://www.google.com")
print("Título:", driver.title)
driver.quit()