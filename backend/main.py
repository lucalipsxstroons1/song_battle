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

    for entry in battle.submitted_songs:
        if entry.id.lower() == song.song.lower():
            raise HTTPException(
                status_code=403,
                detail="Song wurde bereits eingereicht. Bitte wähle einen anderen Song."
            )

    return {"player_id": battle.submit(song.song)}

@app.get("/getcur")
async def get_cur():
    if len(battle.cur_songs) < 2:
        raise HTTPException(status_code=403, detail="No current songs available")
    return [battle.cur_songs[0].id, battle.cur_songs[1].id]

@app.get("/status")
async def get_status():
    return {"status": battle.status}

@app.get("/ready")
async def get_ready(id: str):
    if battle.status == 1:
        raise HTTPException(status_code=403, detail="Game already started")

    playerid = uuid.UUID(id)
    if playerid not in battle.players:
        raise HTTPException(status_code=403, detail="Not a valid player")

    return {"status": "start" if battle.ready(playerid) else "waiting"}

@app.post("/vote")
async def post_vote(song: Song, player_uuid: str):
    if battle.status == 0:
        raise HTTPException(status_code=403, detail="Game not started")

    playerid = uuid.UUID(player_uuid)
    if playerid not in battle.ready_players:
        raise HTTPException(status_code=403, detail="Not a valid player")

    if battle.check_player_voted(playerid):
        raise HTTPException(status_code=403, detail="Player already voted")

    return battle.vote(playerid, song.song)

@app.get("/votes")
async def get_votes():
    if len(battle.cur_songs) < 2:
        raise HTTPException(status_code=403, detail="Votes currently not running")

    return {
        "votes": {
            battle.cur_songs[0].id: len(battle.cur_songs[0].votes),
            battle.cur_songs[1].id: len(battle.cur_songs[1].votes),
        },
        "total": len(battle.ready_players)
    }

@app.get("/winner")
async def get_winner():
    if battle.status != 2:
        raise HTTPException(status_code=403, detail="Game not ended")
    return battle.winner.id

# 🧩 WebSocket-Clientliste
clients: list[WebSocket] = []

# ⏱ Timer-Variablen
TIMER_DURATION = 60
timer_value = TIMER_DURATION
timer_running = False

# ⏱ Timer-Loop: zählt runter & broadcastet an alle
async def timer_loop():
    global timer_value, timer_running
    timer_running = True

    while timer_value > 0:
        await asyncio.sleep(1)
        timer_value -= 1
        await broadcast_timer()

    await broadcast_timer()
    timer_running = False

# 📡 An alle verbundenen Clients senden
async def broadcast_timer():
    disconnected = []
    for client in clients:
        try:
            votes = sum([len(cur_song.votes) for cur_song in battle.cur_songs])
            total_players = len(battle.ready_players)
            await client.send_json({ "timer": timer_value, "votes": votes, "total_players": total_players })
        except:
            disconnected.append(client)

    for client in disconnected:
        clients.remove(client)

# 🌐 WebSocket-Endpunkt für Timer
@app.websocket("/ws/timer")
async def websocket_endpoint(websocket: WebSocket):
    global timer_value, timer_running

    await websocket.accept()
    clients.append(websocket)
    print("🔌 WebSocket verbunden")

    await websocket.send_json({"timer": timer_value})

    try:
        while True:
            data = await websocket.receive_text()
            print("📥 WebSocket-Eingang:", data)

            if data == "start":
                if not timer_running:
                    print("⏱ Neue Runde – Timer auf 60s")
                    timer_value = TIMER_DURATION
                    asyncio.create_task(timer_loop())
                else:
                    print("⏳ Timer läuft bereits – Ignoriere erneuten Start")


    except WebSocketDisconnect:
        print("❌ WebSocket getrennt")
        if websocket in clients:
            clients.remove(websocket)
