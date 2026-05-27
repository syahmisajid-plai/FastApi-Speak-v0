from fastapi import APIRouter, WebSocket, WebSocketDisconnect
from collections import defaultdict
import json

router = APIRouter()

# ================= ROOMS =================
rooms = defaultdict(list)


async def cleanup_room(room_id: str):

    if room_id in rooms:

        # kasih tahu semua peer call selesai
        for client in rooms[room_id]:

            try:
                await client["ws"].send_json({
                    "type": "call-ended"
                })

            except:
                pass

        # hapus room
        del rooms[room_id]

        print(f"ROOM DELETED: {room_id}")


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

            # ================= RECEIVE =================
            raw_data = await websocket.receive_text()

            try:
                data = json.loads(raw_data)

            except Exception:
                print("INVALID JSON:", raw_data)
                continue

            print(f"RECEIVED FROM {username}: {data}")

            # ================= END CALL =================
            if data.get("type") == "end-call":

                print(f"{username} ENDED CALL")

                await cleanup_room(room_id)

                break

            # ================= PAYLOAD =================
            payload = {
                "from": username,
                **data
            }

            # ================= BROADCAST =================
            for client in rooms[room_id]:

                if client["ws"] != websocket:

                    await client["ws"].send_json(payload)

    except WebSocketDisconnect:

        print(f"{username} DISCONNECTED")

        # kalau ada user keluar -> akhiri seluruh call
        await cleanup_room(room_id)