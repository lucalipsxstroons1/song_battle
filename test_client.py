import asyncio
import websockets

async def test():
    async with websockets.connect("ws://localhost:8000/ws/timer") as websocket:
        await websocket.send("start")
        while True:
            msg = await websocket.recv()
            print("Timer:", msg)

asyncio.run(test())
