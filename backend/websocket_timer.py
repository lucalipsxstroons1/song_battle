from fastapi import FastAPI, WebSocket, WebSocketDisconnect
import asyncio
from typing import List

app = FastAPI()
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
