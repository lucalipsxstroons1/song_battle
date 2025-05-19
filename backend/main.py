from fastapi import FastAPI
from pydantic import BaseModel

app = FastAPI()

class Song(BaseModel):
    song: str

@app.get("/getcur")
async def getcur():
    return ["51GmZjHgR1sWkHWqpQzpEa", "3cLXgIlvugVKpWBmO5v9oy"]



@app.get("/ready")
async def ready(id: str):
    print(id)

@app.post("/submit")
async def submit(song: Song):
    print(song.song)
    return "someid"