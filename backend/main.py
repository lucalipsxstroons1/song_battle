from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import Dict, Set
from fastapi.middleware.cors import CORSMiddleware
import uuid
import random

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Für Testphase okay
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 1 = Runnging, 0 = Waiting
status = 0

submitted_songs = []
cur_songs = []

# Spieler-ID (die sich als ready gemeldet haben)
ready_players: Set[uuid.UUID] = set()
players = []

# Anzahl benötigter Spieler
required_players = 2

class Cur_Song():
    def __init__(self, id, submitter):
        self.submitter = submitter
        self.id = id

    votes: Set[uuid.UUID] = set()
    id: str
    submitter: uuid.UUID

class Song(BaseModel):
    song: str

@app.post("/submit")
async def post_submit(song: Song):
    if status == 1:
        raise HTTPException(status_code=403, detail="Game already started")

    # UUID für Spieler erzeugen
    player_id = uuid.uuid4()

    # Song speichern
    submitted_songs.append(Cur_Song(song.song, player_id))
    players.append(player_id)

    print(f"Spieler {player_id} hat Song {song.song} eingereicht")

    return { "player_id": player_id }

@app.get("/getcur")
async def get_cur():
    if len(cur_songs) < 2:
        raise HTTPException(status_code=403, detail="No currents songs at the moment")

    return [ cur_songs[0].id, cur_songs[1].id ]

@app.get("/status")
async def get_status():
    return { "status": status }

@app.get("/ready")
async def get_ready(id: str):
    if status == 1:
        raise HTTPException(status_code=403, detail="Game already started")

    playerid = uuid.UUID(id)

    if not playerid in players:
        raise HTTPException(status_code=403, detail="Not a valid player")
        
    ready_players.add(playerid)

    # Spiel starten wenn alle Spieler bereit & eingereicht haben
    if len(ready_players) >= required_players and len(ready_players) == len(players):
        start()
        return { "status": "start" }

    return {"status": "waiting" }

@app.post("/vote")
async def post_vote(song: Song, player_uuid: str):
    if status == 0:
        raise HTTPException(status_code=403, detail="Game not started")

    playerid = uuid.UUID(player_uuid)

    if not playerid in ready_players:
        raise HTTPException(status_code=403, detail="Not a valid player")

    return vote(playerid, song.song)

@app.get("/votes")
async def get_votes():
    return { 
        cur_songs[0].id: len(cur_songs[0].votes),
        cur_songs[1].id: len(cur_songs[1].votes),
        }

def start():
    global status
    global cur_songs
    assert status == 0

    status = 1
    random.shuffle(submitted_songs)
    cur_songs = [submitted_songs[0], submitted_songs[1]]

def vote(player: uuid.UUID, song: str):
    print(song)

    for cur_song in cur_songs:
        print(cur_song.id)
        if cur_song.id == song:
            cur_song.votes.add(player)
            print(player, "voted for song:", cur_song.id)

            for cur_song in cur_songs:
                print(len(cur_song.votes))

            return len(cur_song.votes)
