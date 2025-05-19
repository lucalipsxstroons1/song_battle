from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import Dict, Set
import uuid
import random

app = FastAPI()

# 1 = Runnging, 0 = Waiting
status = 0

# Spieler-ID → Song-ID
submitted_songs: Dict[uuid.UUID, str] = {}
cur_songs = []

# Spieler-ID (die sich als ready gemeldet haben)
ready_players: Set[uuid.UUID] = set()
players = []

# Anzahl benötigter Spieler
required_players = 2

class Cur_Song():
    def __init__(self, id):
        self.id = id

    votes: Set[uuid.UUID] = set()
    id: str

class Song(BaseModel):
    song: str

@app.post("/submit")
async def submit(song: Song):
    if status == 1:
        raise HTTPException(status_code=403, detail="Game already started")

    # UUID für Spieler erzeugen
    player_id = uuid.uuid4()

    # Song speichern
    submitted_songs[player_id] = song.song
    players.append(player_id)

    print(f"Spieler {player_id} hat Song {song.song} eingereicht")

    return { "player_id": player_id }

@app.get("/getcur")
async def getcur():
    return cur_songs

@app.get("/status")
async def status():
    return { "status": status }

@app.get("/ready")
async def ready(id: str):
    if status == 1:
        raise HTTPException(status_code=403, detail="Game already started")

    playerid = uuid.UUID(id)
    ready_players.add(playerid)

    # Spiel starten wenn alle Spieler bereit & eingereicht haben
    if len(ready_players) >= required_players and len(submitted_songs) >= required_players:
        start()
        return { "status": "start" }

    return {"status": "waiting" }

def start():
    assert status == 0

    status = 1
    random.shuffle(submitted_songs)
    cur_songs[Song(submitted_songs[0]), Song(submitted_songs[1])]

def vote(player: uuid.UUID, song: str):
    for cur_song in cur_songs:
        if cur_song.id == song:
            cur_song.votes.add(player)
            print(player, "voted for song:", cur_song.id)