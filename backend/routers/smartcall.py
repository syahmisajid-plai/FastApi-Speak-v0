from fastapi import APIRouter
from fastapi import WebSocket
from fastapi import WebSocketDisconnect

from collections import defaultdict

router = APIRouter()

rooms = defaultdict(list)


@router.websocket("/ws/{room_id}")
async def websocket_endpoint(
    websocket: WebSocket,
    room_id: str,
):
    await websocket.accept()

    print(f"USER JOIN ROOM: {room_id}")

    rooms[room_id].append(websocket)

    try:
        while True:
            data = await websocket.receive_text()

            print("SIGNAL:", data)

            for client in rooms[room_id]:
                if client != websocket:
                    await client.send_text(data)

    except WebSocketDisconnect:

        print(f"USER LEFT ROOM: {room_id}")

        rooms[room_id].remove(websocket)

        if len(rooms[room_id]) == 0:
            del rooms[room_id]