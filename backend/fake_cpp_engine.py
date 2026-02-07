import asyncio
import websockets
import json
import random

game_running = False
score = 0
lives = 3
duration = 0
fps = 60
websocket = None

async def send_telemetry():
    global websocket, game_running, score, lives, duration, fps
    while game_running:
        await asyncio.sleep(0.1)
        duration += 0.1
        score += 10 / 10
        fps = random.randint(55, 60)
        
        if random.random() < 0.1:
            score += 50
            print(f"💎 +50")
        
        if random.random() < 0.05 and lives > 0:
            lives -= 1
            print(f"💔 Lives: {lives}")
            if lives == 0:
                await end_game('player_death')
                return
        
        await websocket.send(json.dumps({
            "type": "GAME_TELEMETRY",
            "data": {
                "fps": fps,
                "score": int(score),
                "game_over": False,
                "lives": lives,
                "duration": round(duration, 1)
            }
        }))
        
        if int(duration) % 1 == 0 and duration % 1 < 0.15:
            print(f"⏱️  {duration:.1f}s | Score: {int(score)} | FPS: {fps}")
        
        if duration >= 30:
            await end_game('time_up')
            return

async def end_game(reason):
    global websocket, game_running, score, duration
    print(f"\n🏁 GAME OVER - {reason}")
    print(f"Final Score: {int(score)}\n")
    
    game_running = False
    
    await websocket.send(json.dumps({
        "type": "GAME_TELEMETRY",
        "data": {
            "fps": fps,
            "score": int(score),
            "game_over": True,
            "lives": lives,
            "duration": round(duration, 1)
        }
    }))
    
    await websocket.send(json.dumps({
        "type": "GAME_EVENT",
        "event": "game_ended",
        "data": {
            "reason": reason,
            "final_score": int(score),
            "duration": round(duration, 1)
        }
    }))

async def fake_cpp_engine():
    global websocket, game_running, score, lives, duration
    uri = "ws://localhost:8080"
    
    async with websockets.connect(uri) as ws:
        websocket = ws
        print("✅ Connected to Bridge")
        
        # Wait for START command
        message = await websocket.recv()
        data = json.loads(message)
        print(f"[Engine] Received: {data.get('command')}")
        
        # Process jobs
        while True:
            message = await websocket.recv()
            data = json.loads(message)
            
            job_id = data.get("jobId")
            job_type = data.get("jobType")
            
            print(f"📦 Job: {job_type}")
            
            # Send job_started for all jobs
            await websocket.send(json.dumps({
                "type": "TELEMETRY",
                "event": "job_started",
                "jobId": job_id
            }))
            
            await asyncio.sleep(0.5)
            
            # Send job_completed for all jobs
            await websocket.send(json.dumps({
                "type": "TELEMETRY",
                "event": "job_completed",
                "jobId": job_id,
                "result": {"success": True}
            }))
            
            if job_type == 'START_LOOP':
                await asyncio.sleep(2)
                print('🎮 GAME STARTED\n')
                
                game_running = True
                score = 0
                lives = data['payload']['params']['end_condition']['value']
                duration = 0
                
                await websocket.send(json.dumps({
                    "type": "GAME_EVENT",
                    "event": "game_started",
                    "data": {"game_mode": data['payload']['game_mode']}
                }))
                
                # Start telemetry loop
                asyncio.create_task(send_telemetry())

if __name__ == '__main__':
    print('🎮 Fake C++ Engine Starting...')
    try:
        asyncio.run(fake_cpp_engine())
    except KeyboardInterrupt:
        print('\n🛑 Shutting down...')
