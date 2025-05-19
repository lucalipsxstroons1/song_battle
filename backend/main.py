from fastapi import FastAPI
from pydantic import BaseModel
from typing import Dict, Set
from fastapi.responses import JSONResponse
import uuid
import random

app = FastAPI()

# Spieler-ID → Song-ID
submitted_songs: Dict[str, str] = {}

# Spieler-ID (die sich als ready gemeldet haben)
ready_players: Set[str] = set()

# Anzahl benötigter Spieler
required_players = 4
songs = []
players = []

# ==== Datenmodelle ====

class Song(BaseModel):
    song: str

@app.post("/submit")
async def submit(song: Song):
    # UUID für Spieler erzeugen
    player_id = str(uuid.uuid4())

    # Song speichern
    submitted_songs[player_id] = song.song
    players.add(player_id)

    print(f"Spieler {player_id} hat Song {song.song} eingereicht")

    return {"player_id": player_id, "status": "submitted"}

class Ready(BaseModel):
    player_id: str

@app.get("/getcur")
async def getcur():
    return ["51GmZjHgR1sWkHWqpQzpEa", "3cLXgIlvugVKpWBmO5v9oy"]

@app.get("/status")
async def status():


@app.post("/ready")
async def ready(ready: Ready):
    ready_players.add(ready.player_id)

    # Spiel starten wenn alle Spieler bereit & eingereicht haben
    if len(ready_players) >= required_players and len(submitted_songs) >= required_players:
        return JSONResponse(
            content={
                "status": "start",
                "songs": list(submitted_songs.values())
            }
        )

    return {"status": "waiting", "ready": len(ready_players)}

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