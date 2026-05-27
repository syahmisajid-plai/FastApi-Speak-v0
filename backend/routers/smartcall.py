from fastapi import APIRouter, WebSocket, WebSocketDisconnect
from collections import defaultdict
import json

router = APIRouter()

# ================= ROOMS =================
rooms = defaultdict(list)


# ================= CLEANUP ROOM =================
async def cleanup_room(room_id: str, ended_by: str = "Unknown"):

    if room_id not in rooms:
        return

    # notify all peers
    for client in rooms[room_id]:
        try:
            await client["ws"].send_json({
                "type": "call-ended",
                "by": ended_by
            })
        except:
            pass

    # remove room
    rooms[room_id].clear()
    del rooms[room_id]

    print(f"ROOM DELETED: {room_id}")


# ================= WEBSOCKET =================
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

                await cleanup_room(
                    room_id,
                    ended_by=username
                )
                break

            # ================= BROADCAST (ALL EVENTS) =================
            for client in rooms[room_id]:

                if client["ws"] == websocket:
                    continue

                try:
                    await client["ws"].send_json({
                        "from": username,
                        **data
                    })
                except:
                    pass

    except WebSocketDisconnect:

        print(f"{username} DISCONNECTED")

        await cleanup_room(
            room_id,
            ended_by=username
        )