from fastapi import APIRouter, WebSocket, WebSocketDisconnect
from collections import defaultdict
import json

router = APIRouter()

# ================= ROOMS =================
rooms = defaultdict(list)

# ================= ROOM STATE (IMPORTANT) =================
# menyimpan status tiap user: mute / translate / dll
room_states = defaultdict(dict)


# ================= CLEANUP ROOM =================
async def cleanup_room(room_id: str, ended_by: str = "Unknown"):

    if room_id not in rooms:
        return

    # notify semua peer
    for client in rooms[room_id]:
        try:
            await client["ws"].send_json({
                "type": "call-ended",
                "by": ended_by
            })
        except:
            pass

    # clear state + room
    rooms[room_id].clear()
    del rooms[room_id]
    room_states.pop(room_id, None)

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

    # add client
    rooms[room_id].append({
        "ws": websocket,
        "username": username
    })

    try:

        # ================= SYNC STATE WHEN JOIN =================
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

            # ================= END CALL =================
            if event_type == "end-call":

                print(f"{username} ENDED CALL")

                await cleanup_room(room_id, ended_by=username)
                break

            # ================= PEER STATE (MUTE / TRANSLATE / ETC) =================
            if event_type == "peer-state":

                # 🔥 DEBUG INI TARUH DI SINI
                print("🔥 RAW DATA:", data)
                print("🔥 STATE RECEIVED:", data.get("state"))

                state = data.get("state", {})

                # simpan state user
                room_states[room_id][username] = state

                payload = {
                    "type": "peer-state",
                    "from": username,
                    "state": state
                }

                print("📡 BROADCAST PEER STATE:", payload)

                # broadcast ke peer lain
                for client in rooms[room_id]:
                    if client["ws"] == websocket:
                        continue

                    try:
                        await client["ws"].send_json(payload)
                    except:
                        pass

                continue

            # ================= NORMAL BROADCAST (OFFER / ANSWER / ICE / CHAT) =================
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

        await cleanup_room(room_id, ended_by=username)