from fastapi import FastAPI
from pydantic import BaseModel
from typing import Dict, Set, Optional
from fastapi.responses import JSONResponse
import uuid

submitted_songs: Dict[str, str] = {}
ready_players: Set[str] = set()
required_players = 4
songs = []
players = []

app = FastAPI()

class Song(BaseModel):
    song: str

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

    # Prüfen ob Spiel starten kann
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