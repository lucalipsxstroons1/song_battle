from fastapi import FastAPI
from pydantic import BaseModel
import uuid

songs = []
players = []

app = FastAPI()

class Song(BaseModel):
    song: str

@app.get("/getcur")
async def getcur():
    return ["51GmZjHgR1sWkHWqpQzpEa", "3cLXgIlvugVKpWBmO5v9oy"]

@app.get("/status")
async def status():


@app.get("/ready")
async def ready(id: str):
    print(id)

@app.post("/submit")
async def submit(song: Song):
    # Adds song
    songs.append(song.song)
    print(song.song, "added")

    # Adds Player
    playeruuid = uuid.uuid4()
    players.append((uuid, False))
    print("Player added, uuid:", uuid)

    return str(playeruuid)