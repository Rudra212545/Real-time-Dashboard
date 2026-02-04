import asyncio
import websockets
import json
import random

async def fake_cpp_engine():
    uri = "ws://localhost:8080"
    
    async with websockets.connect(uri) as websocket:
        print("[Fake C++ Engine] Connected to Bridge")
        
        # Wait for START command
        message = await websocket.recv()
        data = json.loads(message)
        print(f"[Fake C++ Engine] Received START: {json.dumps(data, indent=2)}")
        
        # Process jobs
        while True:
            message = await websocket.recv()
            data = json.loads(message)
            
            print("\n" + "="*60)
            print("[Fake C++ Engine] RECEIVED FROM BRIDGE:")
            print(json.dumps(data, indent=2))
            print("="*60 + "\n")
            
            job_id = data.get("job_id")
            job_type = data.get("jobType")
            
            if not job_id:
                print("[WARNING] No job_id in received data!")
                continue
            
            print(f"[Fake C++ Engine] Processing: {job_type} ({job_id})")
            
            # Send job_started
            await websocket.send(json.dumps({
                "type": "TELEMETRY",
                "event": "job_started",
                "job_id": job_id
            }))
            
            await asyncio.sleep(1)
            
            # Send progress
            await websocket.send(json.dumps({
                "type": "TELEMETRY",
                "event": "job_progress",
                "job_id": job_id,
                "progress": 50
            }))
            
            await asyncio.sleep(1)
            
            # Send completed
            await websocket.send(json.dumps({
                "type": "TELEMETRY",
                "event": "job_completed",
                "job_id": job_id,
                "result": {"success": True}
            }))
            
            # Send FPS heartbeat
            await websocket.send(json.dumps({
                "type": "TELEMETRY",
                "event": "tick_update",
                "data": {"fps": random.uniform(58, 62)}
            }))

if __name__ == '__main__':
    try:
        asyncio.run(fake_cpp_engine())
    except KeyboardInterrupt:
        print("\n[Fake C++ Engine] Stopped")
