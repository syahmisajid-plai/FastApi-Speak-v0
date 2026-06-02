from fastapi import APIRouter, WebSocket, WebSocketDisconnect
from collections import defaultdict
import json
import asyncio


router = APIRouter()

# ================= ROOMS =================
# rooms = defaultdict(list)
rooms = {}

# ================= ROOMS LOCK=================
room_lock = asyncio.Lock()

# ================= ROOM STATES =================
# room_states = defaultdict(dict)
room_states = {}

# ================= ROOM Exists =================
def room_exists(room_id: str):
    return room_id in rooms


# ================= BROADCAST ROOM INFO =================
async def broadcast_room_state(room_id: str):

    clients = rooms.get(room_id, [])

    users = [
        {
            "username": client["username"]
        }
        for client in clients
    ]

    status = "waiting"

    if len(clients) >= 2:
        status = "ready"

    payload = {
        "type": "room-state",
        "status": status,
        "users": users,
        "usersCount": len(clients),
        "canStartCall": len(clients) >= 2
    }

    for client in clients:
        try:
            await client["ws"].send_json(payload)
        except:
            pass


# ================= CLEANUP ROOM =================
async def cleanup_room(room_id: str):

    if room_id not in rooms:
        return

    # hapus room kalau kosong
    if len(rooms[room_id]) == 0:

        rooms.pop(room_id, None)
        room_states.pop(room_id, None)

        print(f"ROOM DELETED: {room_id}")


# ================= WEBSOCKET =================
@router.websocket("/ws/{room_id}")
async def websocket_endpoint(
    websocket: WebSocket,
    room_id: str,
    username: str = "Guest"
):
    # ❌ ROOM HARUS VALID DULU
    if room_id not in rooms:
        await websocket.accept()
        await websocket.send_json({
            "type": "room-error",
            "message": "Room tidak ditemukan"
        })
        await websocket.close()
        return

    await websocket.accept()

    print(f"{username} JOIN ROOM: {room_id}")

    # 🔥 FIX 5 — LIMIT ROOM CAPACITY (DITARUH DI SINI)
    async with room_lock:
        if len(rooms[room_id]) >= 2:
            await websocket.send_json({
                "type": "room-full"
            })
            await websocket.close()
            return

    # ================= ADD CLIENT =================
    rooms[room_id].append({
        "ws": websocket,
        "username": username
    })

    # broadcast room update
    await broadcast_room_state(room_id)

    try:

        # ================= SYNC EXISTING STATES =================
        if room_states.get(room_id):

            await websocket.send_json({
                "type": "sync-state",
                "states": room_states[room_id]
            })

        while True:

            raw_data = await websocket.receive_text()

            try:
                data = json.loads(raw_data)
            except Exception:
                print("INVALID JSON:", raw_data)
                continue

            print(f"RECEIVED FROM {username}: {data}")

            event_type = data.get("type")

            # ================= START CALL =================
            if event_type == "start-call":

                payload = {
                    "type": "start-call",
                    "from": username
                }

                for client in rooms[room_id]:
                    try:
                        await client["ws"].send_json(payload)
                    except:
                        pass

                continue

            # ================= END CALL =================
            if event_type == "end-call":

                payload = {
                    "type": "call-ended",
                    "by": username
                }

                for client in rooms[room_id]:
                    try:
                        await client["ws"].send_json(payload)
                    except:
                        pass

                continue

            # ================= PEER STATE =================
            if event_type == "peer-state":

                state = data.get("state", {})

                room_states[room_id][username] = state

                payload = {
                    "type": "peer-state",
                    "from": username,
                    "state": state
                }

                for client in rooms[room_id]:

                    if client["ws"] == websocket:
                        continue

                    try:
                        await client["ws"].send_json(payload)
                    except:
                        pass

                continue

            # ================= NORMAL SIGNALING =================
            payload = {
                "from": username,
                **data
            }

            for client in rooms[room_id]:

                if client["ws"] == websocket:
                    continue

                try:
                    await client["ws"].send_json(payload)
                except:
                    pass

    except WebSocketDisconnect:

        print(f"{username} DISCONNECTED")

        # remove user from room
        rooms[room_id] = [
            client
            for client in rooms[room_id]
            if client["ws"] != websocket
        ]

        # remove saved state
        if username in room_states[room_id]:
            del room_states[room_id][username]

        # broadcast updated room state
        await broadcast_room_state(room_id)

        # cleanup kalau kosong
        await cleanup_room(room_id)

@router.post("/room/create")
async def create_room():
    import random, string

    room_id = ''.join(random.choices(string.ascii_lowercase + string.digits, k=6))

    rooms[room_id] = []
    room_states[room_id] = {}

    return {
        "roomId": room_id
    }