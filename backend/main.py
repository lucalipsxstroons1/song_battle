from fastapi import FastAPI, HTTPException, WebSocket, WebSocketDisconnect
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware
import battle
import uuid
import asyncio

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Für Testphase okay
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class Song(BaseModel):
    song: str

@app.post("/submit")
async def post_submit(song: Song):
    if battle.status == 1:
        raise HTTPException(status_code=403, detail="Game already started")
    
    # Prüfen auf doppelte Songs
    for entry in battle.submitted_songs:
        if entry.id.lower() == song.song.lower():
            raise HTTPException(
                status_code=403,
                detail="Song wurde bereits eingereicht. Bitte wähle einen anderen Song."
            )

    # UUID für Spieler erzeugen
    player_id = uuid.uuid4()

    # Song speichern
    battle.submitted_songs.append(battle.Cur_Song(song.song, player_id))
    battle.players.add(player_id)

    print(f"Spieler {player_id} hat Song {song.song} eingereicht")

    return { "player_id": player_id }

@app.get("/getcur")
async def get_cur():
    if len(battle.cur_songs) < 2:
        raise HTTPException(status_code=403, detail="No currents songs at the moment")

    return [ battle.cur_songs[0].id, battle.cur_songs[1].id ]

@app.get("/status")
async def get_status():
    return { "status": battle.status }

@app.get("/ready")
async def get_ready(id: str):
    if battle.status == 1:
        raise HTTPException(status_code=403, detail="Game already started")

    playerid = uuid.UUID(id)

    if not playerid in battle.players:
        raise HTTPException(status_code=403, detail="Not a valid player")
        
    battle.ready_players.add(playerid)

    # Spiel starten wenn alle Spieler bereit & eingereicht haben
    if (
        len(battle.ready_players) >= battle.REQUIRED_PLAYERS and 
        len(battle.ready_players) == len(battle.players)
    ):
        battle.start()
        return { "status": "start" }

    return {"status": "waiting" }

@app.post("/vote")
async def post_vote(song: Song, player_uuid: str):
    if battle.status == 0:
        raise HTTPException(status_code=403, detail="Game not started")

    playerid = uuid.UUID(player_uuid)

    if not playerid in battle.ready_players:
        raise HTTPException(status_code=403, detail="Not a valid player")

    if battle.check_player_voted(playerid):
        raise HTTPException(status_code=403, detail="Player already voted")

    return battle.vote(playerid, song.song)

@app.get("/votes")
async def get_votes():
    return { 
        battle.cur_songs[0].id: len(battle.cur_songs[0].votes),
        battle.cur_songs[1].id: len(battle.cur_songs[1].votes),
        }



clients: List[WebSocket] = []

# Timer-Variablen
TIMER_DURATION = 60  # Sekunden
timer_value = TIMER_DURATION
timer_running = False

async def timer_loop():
    global timer_value, timer_running
    timer_running = True
    while timer_value > 0:
        await asyncio.sleep(1)
        timer_value -= 1
        await broadcast_timer()
    timer_running = False

async def broadcast_timer():
    for client in clients:
        await client.send_json({"timer": timer_value})


@app.websocket("/ws/timer")
async def websocket_endpoint(websocket: WebSocket):
    await websocket.accept()
    clients.append(websocket)

    # Timer-Stand direkt senden
    await websocket.send_json({"timer": timer_value})

    try:
        while True:
            data = await websocket.receive_text()
            if data == "start" and not timer_running:
                asyncio.create_task(timer_loop())
    except WebSocketDisconnect:
        clients.remove(websocket)

