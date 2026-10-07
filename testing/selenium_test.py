"""
Sample Selenium WebDriver script for SocietyCMS
Prerequisites: pip install selenium
Ensure Vite dev server is running on http://localhost:5173
"""
import time
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC

def run_e2e_tests():
    options = webdriver.ChromeOptions()
    # options.add_argument("--headless")  # Uncomment for headless CI
    driver = webdriver.Chrome(options=options)
    driver.maximize_window()
    wait = WebDriverWait(driver, 10)

    try:
        print("[1] Opening Application at http://localhost:5173/login...")
        driver.get("http://localhost:5173/login")

        # 1. Wait for global readiness synchronization attribute
        wait.until(EC.presence_of_element_located((By.CSS_SELECTOR, "#app-root[data-app-ready='true']")))
        print("[1] Application synchronized (data-app-ready='true').")

        # 2. Perform Login as Resident
        print("[2] Entering Resident credentials (rohit@society.com)...")
        email_input = wait.until(EC.element_to_be_clickable((By.ID, "login-email")))
        email_input.clear()
        email_input.send_keys("rohit@society.com")

        pass_input = driver.find_element(By.ID, "login-password")
        pass_input.clear()
        pass_input.send_keys("password123")

        submit_btn = driver.find_element(By.ID, "login-submit-btn")
        submit_btn.click()

        # 3. Verify Redirection to /resident
        wait.until(EC.url_contains("/resident"))
        print("[3] Successfully navigated to /resident dashboard!")

        # 4. Check for presence of ticket cards
        tickets = wait.until(EC.presence_of_all_elements_located((By.CSS_SELECTOR, "[data-testid='ticket-card']")))
        print(f"[4] Found {len(tickets)} tickets on resident dashboard.")

        # 5. Check Token Number Badge and Status Badge
        token_badge = driver.find_element(By.CSS_SELECTOR, "[data-testid='token-number-badge']")
        status_badge = driver.find_element(By.CSS_SELECTOR, "[data-testid='status-badge']")
        print(f"[5] Validated Token Badge: {token_badge.text} | Status Badge: {status_badge.text}")

        print("\n--- ALL SELENIUM E2E CHECKS PASSED SUCCESSFULLY ---")

    except Exception as e:
        print(f"[ERROR] Selenium Test Failed: {e}")
        raise e
    finally:
        driver.quit()

if __name__ == "__main__":
    run_e2e_tests()
