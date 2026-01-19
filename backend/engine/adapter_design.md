# Engine Adapter Design

## Overview
The Engine Adapter Layer is responsible for converting structured AI intent
into engine-ready ECS (Entity Component System) JSON that can be consumed
by a custom OpenGL game engine.

This layer is rendering-agnostic and engine-focused.

---

## Responsibilities
- Generate engine-compatible data structures
- Produce world, scene, entity, material, and quest definitions
- Ensure adapter output strictly matches engine_schema.json

---

## Non-Responsibilities
- Rendering (Three.js or OpenGL)
- Job execution or scheduling
- Networking or WebSocket communication
- Security, authentication, or telemetry
- Agent logic or decision making

---

## Adapter Output Contract
All adapter output MUST conform to the following rules:
- Output is pure JSON data
- No free-form or narrative content
- No frontend or UI objects
- No runtime state or side effects

---

## Data Flow
AI / Agents  
→ Engine Adapter  
→ Engine Schema–Compliant JSON  
→ Job Queue (future)  
→ OpenGL Engine Runtime

Three.js is permitted only as a visualization consumer of adapter output.

---

## Failure Policy
- Adapter does not auto-correct invalid data
- Validation is handled in a later pipeline stage
- Adapter output is deterministic and predictable

---

## Design Principle
Structure over behavior.
Correctness over creativity.
Engine truth over UI convenience.
