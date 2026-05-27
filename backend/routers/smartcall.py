from fastapi import APIRouter, WebSocket, WebSocketDisconnect
from collections import defaultdict
import json

router = APIRouter()

# ================= ROOMS =================
rooms = defaultdict(list)

# ================= ROOM STATE =================
room_states = defaultdict(dict)

# ================= ROOM META =================
room_meta = defaultdict(lambda: {
    "status": "waiting",   # waiting | ready | starting | in-call
})


# ================= CLEANUP =================
async def cleanup_room(room_id: str, ended_by: str = "Unknown"):

    if room_id not in rooms:
        return

    for client in rooms[room_id]:
        try:
            await client["ws"].send_json({
                "type": "call-ended",
                "by": ended_by
            })
        except:
            pass

    rooms[room_id].clear()
    room_states.pop(room_id, None)
    room_meta.pop(room_id, None)

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

    # ================= ASSIGN ROLE =================
    role = "creator" if len(rooms[room_id]) == 0 else "guest"

    rooms[room_id].append({
        "ws": websocket,
        "username": username,
        "role": role
    })

    print(f"ROLE: {username} = {role}")
    print(f"TOTAL USERS: {len(rooms[room_id])}")

    # ================= ROOM READY CHECK =================
    if len(rooms[room_id]) == 2:
        room_meta[room_id]["status"] = "ready"

        for client in rooms[room_id]:
            try:
                await client["ws"].send_json({
                    "type": "room-ready",
                    "status": "ready"
                })
            except:
                pass

    try:

        # ================= SYNC STATE =================
        if room_states.get(room_id):
            await websocket.send_json({
                "type": "sync-state",
                "states": room_states[room_id]
            })

        while True:

            raw_data = await websocket.receive_text()

            try:
                data = json.loads(raw_data)
            except:
                print("INVALID JSON:", raw_data)
                continue

            event_type = data.get("type")

            print("📩 EVENT:", event_type)
            print("👥 USERS:", [c["username"] for c in rooms[room_id]])
            print("📦 META:", room_meta[room_id])

            # ================= START CALL (ONLY CREATOR) =================
            if event_type == "start-call":

                caller = next(
                    (c for c in rooms[room_id] if c["ws"] == websocket),
                    None
                )

                if not caller or caller["role"] != "creator":
                    print("❌ NOT ALLOWED TO START CALL")
                    continue

                room_meta[room_id]["status"] = "starting"

                print(f"🚀 START CALL BY {username}")

                for client in rooms[room_id]:
                    try:
                        await client["ws"].send_json({
                            "type": "start-call",
                            "by": username
                        })
                    except:
                        pass

                room_meta[room_id]["status"] = "in-call"
                continue

            # ================= END CALL =================
            if event_type == "end-call":

                print(f"{username} ENDED CALL")

                await cleanup_room(room_id, ended_by=username)
                break

            # ================= PEER STATE =================
            if event_type == "peer-state":

                state = data.get("state", {})

                print("🔥 RAW PEER STATE:", state)

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

            # ================= WEBRTC SIGNALING =================
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