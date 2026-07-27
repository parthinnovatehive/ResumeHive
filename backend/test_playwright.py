import threading
from playwright.sync_api import sync_playwright

def f():
    try:
        p = sync_playwright().start()
        b = p.chromium.launch(args=["--no-sandbox", "--disable-gpu", "--disable-dev-shm-usage"])
        b.close()
        p.stop()
        print("Success in thread")
    except Exception as e:
        print(f"Error in thread: {type(e).__name__} - {e}")

t = threading.Thread(target=f)
t.start()
t.join()
