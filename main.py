from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import time

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"]
)

auth_state ={
    "unlock_granted": False,
    "timestamp": 0
}
@app.post("/api/trigger-unlock")
def trigger_unlock():
    auth_state["unlock_granted"] = True
    auth_state["timestamp"] = time.time()
    return {"status": "success", "message": "Laptop unlock authorized for 30 seconds."}

@app.get("/api/check-status")
def check_status():
    current_time = time.time()

    if auth_state["unlock_granted"] and (current_time-auth_state["timestamp"] <=30):
        auth_state["unlock_granted"] = False
        return {"unlock: True"}
    return {"unlock": False}