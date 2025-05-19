from fastapi import FastAPI
from pydantic import BaseModel
from typing import Dict, Set
from fastapi.responses import JSONResponse
import uuid

app = FastAPI()

# Spieler-ID → Song-ID
submitted_songs: Dict[str, str] = {}

# Spieler-ID (die sich als ready gemeldet haben)
ready_players: Set[str] = set()

# Anzahl benötigter Spieler
required_players = 4

# Registrierte Spieler (optional)
players: Set[str] = set()

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

@app.get("/status")
async def status():
    return {
        "submitted_songs": submitted_songs,
        "ready_players": list(ready_players),
        "num_ready": len(ready_players),
        "num_submitted": len(submitted_songs),
        "required_players": required_players,
        "game_ready": len(ready_players) >= required_players and len(submitted_songs) >= required_players
    }

@app.get("/reset")
async def reset():
    submitted_songs.clear()
    ready_players.clear()
    players.clear()
    return {"status": "reset"}
