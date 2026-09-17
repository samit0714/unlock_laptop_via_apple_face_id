import time
import requests
import pyautogui

Backend_Url = "https://unlock-laptop-via-apple-face-id.onrender.com/status"
Reset_url = "https://unlock-laptop-via-apple-face-id.onrender.com/reset"
Windows_PIN = "0714"

print("🕵️‍♂️ System Locked. Waiting for Face ID signal from iPhone...")

while True:
    try:
        response = requests.get(Backend_Url)
        data = response.json()

        if data.get("status") == "UNLOCK":
            print("✅ Face ID Verified! Unlocking PC...")

            pyautogui.press('shift')
            time.sleep(1)

            pyautogui.write(Windows_PIN)
            pyautogui.press('enter')

            requests.post(Reset_url)
            print("🔒 State reset to locked. Listening again...")

    except Exception as e:
        pass
    time.sleep(2)

        