from fastapi import APIRouter
from fastapi import WebSocket
from fastapi import WebSocketDisconnect

from fastapi import Query

from collections import defaultdict

router = APIRouter()

# ================= ROOMS =================
rooms = defaultdict(list)


@router.websocket("/ws/{room_id}")
async def websocket_endpoint(
    websocket: WebSocket,
    room_id: str,
    username: str = "Guest"
):
    await websocket.accept()

    print(f"{username} JOIN ROOM: {room_id}")

    rooms[room_id].append({
        "ws": websocket,
        "username": username
    })

    try:
        while True:
            data = await websocket.receive_text()

            payload = {
                "from": username,
                "message": data
            }

            for client in rooms[room_id]:
                if client["ws"] != websocket:
                    await client["ws"].send_json(payload)

    except WebSocketDisconnect:

        print(f"{username} LEFT ROOM: {room_id}")

        rooms[room_id] = [
            c for c in rooms[room_id]
            if c["ws"] != websocket
        ]

        if len(rooms[room_id]) == 0:
            del rooms[room_id]
            print(f"ROOM DELETED: {room_id}")