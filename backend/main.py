from fastapi import FastAPI
from pydantic import BaseModel
import uuid
import random

# Spotify song ids
songs = []

# Tuble (uuid, ready)
players = []

cur_pair: tuple

app = FastAPI()

class Song(BaseModel):
    song: str

@app.get("/getcur")
async def getcur():
    return ["51GmZjHgR1sWkHWqpQzpEa", "3cLXgIlvugVKpWBmO5v9oy"]

@app.get("/status")
async def status():
    return ""

@app.get("/ready")
async def ready(id: str):
    print(id)

@app.post("/submit")
async def submit(song: Song):
    # Adds song
    songs.append(song.song)
    print(song.song, "added")

    # Generates and adds Player
    playeruuid = uuid.uuid4()
    players.append((uuid, False))
    print("Player added, uuid:", uuid)

    return str(playeruuid)

def start():
    random.shuffle(songs)

    cur_pair(songs[0], songs[0 + 1])