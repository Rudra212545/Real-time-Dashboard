---
# **Real-Time Micro-Bridge + Multi-Agent Orchestrator Dashboard**

### **Sovereign-Core Security Prototype — Internship Technical Task (7-Day + 4-Day Combined)**

---

##   Table of Contents

* [Overview](#overview)
* [Task Breakdown (7-Day + 4-Day)](#task-breakdown)
* [Features](#features)
* [System Architecture](#system-architecture)
* [Setup & Installation](#setup--installation)
* [Environment Variables](#environment-variables)
* [How to Use the Dashboard](#how-to-use-the-dashboard)
* [Security Checklist](#security-checklist)
* [What I Learned](#what-i-learned)
* [HHG Reflection](#hhg-reflection)

---

## **Overview**

This repository contains the complete implementation of **both internship technical tasks**:

### **Task 1 — 7-Day Real-Time Micro-Bridge**

A full-stack prototype implementing:

* real-time presence
* action bus
* rule-based agents
* JWT security
* nonce replay protection
* Three.js cube preview
* small job queue
* unified dashboard

### **Task 2 — 4-Day Multi-Agent Orchestrator + Sovereign Sync Layer**

A more advanced extension featuring:

* multi-agent orchestrator
* agent FSMs and priority ordering
* per-agent security (HMAC/RSA, nonce rotation)
* heartbeat validation
* multi-user multi-agent isolation
* final real-time dashboard
* HHG reflection + documentation

These two tasks together simulate the architecture of TTG’s real-world interactive micro-bridge & sovereign-core pipeline.

---

## **Task Breakdown**

### 7-DAY TASK (Task 1)

| Day   | Focus                                         |
| ----- | --------------------------------------------- |
| Day 1 | Socket foundation + real-time engine          |
| Day 2 | Presence detection (active/idle/disconnected) |
| Day 3 | Action event bus                              |
| Day 4 | Rule-based agent layer                        |
| Day 5 | JWT + signatures + nonce replay protection    |
| Day 6 | Three.js preview + job queue                  |
| Day 7 | Final dashboard + HHG reflection              |

###  4-DAY TASK (Task 2)

(from the official test PDF)


| Day   | Focus                                                           |
| ----- | --------------------------------------------------------------- |
| Day 1 | Multi-agent orchestrator (Hint, Nav, Predict, Rule)             |
| Day 2 | Sovereign Sync Layer (per-agent signatures, nonces, heartbeats) |
| Day 3 | Multi-user + multi-agent isolation & collisions                 |
| Day 4 | Final Integration + Dashboard + HHG + Demo                      |

---

## **Features**

### **Real-Time Features**

* Multi-user presence (active / idle / disconnected)
* Action bus with real-time logs
* Agent reactions & collisions (spam click → HintAgent priority)
* 3D Cube (Three.js) that updates on job finish
* Real-time job queue (build simulation)

### **Multi-Agent System**

* HintAgent (spam-detection → trigger hint)
* NavAgent (idle → trigger nav prompt)
* PredictAgent (pattern-based heuristics)
* RuleAgent (backup heuristic)
* Orchestrator with priority ordering
* Agent FSM visualization (Idle → Triggered → Cooldown)

### **Sovereign Security**

* JWT with issuer + expiry
* HMAC signatures for actions
* Per-agent key registration
* Nonce rotation per agent
* Anti-replay table
* Secure heartbeats
* Dashboard-level security indicators:

  * Signature failures
  * Replay alerts
  * Nonces
  * Heartbeats

### **UI Panels**

* Presence Panel
* Actions Panel
* Agent Status Panel (FSM)
* Job Queue Panel
* JSON Config Panel
* 3D Cube Preview
* **User Preferences Panel** (compact mode, sound, dark/light)
* Security Panel

---

## **System Architecture**


<p align="center">
  <img src="./MD/architecture.png" width="720" />
</p>


For a detailed explanation of event flow, agent behavior, and security checkpoints,
see 
 - [`ARCHITECTURE.md`](./MD/ARCHITECTURE.md).


---

## Setup & Installation

Detailed setup and run instructions are documented in:

- [`RUN.md`](./RUN.md)

Follow the steps there to start the backend and frontend services.
---


## **How to Use the Dashboard**

### **1. Presence**

Move/stop moving the mouse → active / idle updates automatically
Disconnect tab → disconnected state

### **2. Actions Panel**

Press “inspect”, “interact”, “spam click”, etc.
Watch agent reactions update in real time.

### **3. Agent Panel (FSM)**

Shows:

* state (Idle / Triggered / Cooldown)
* last reason
* last message
* timestamp
* cooldown bar

### **4. Job Queue + Cube Preview**

Submit “generate_world” jobs →
Queue processes →
Cube updates color/size on completion.

### **5. Security Panel**

Shows:

* signature validation results
* per-agent nonce
* replay alerts
* heartbeat status

### **6. User Preferences**

Toggle:

* compact mode
* dark/light
* sound

Preferences persist via localStorage.

---

## **Security Checklist**

### **Core Security**

✔ JWT validation (issuer + expiry)
✔ HMAC signatures for actions
✔ Per-agent key registration
✔ Anti-replay nonce table
✔ Reject expired timestamps
✔ Heartbeat validation

### **Transport**

✔ WebSocket handshake auth
✔ Origin-restricted CORS

---

## **What I Learned**

* How to build a real-time system end-to-end (frontend + backend)
* Designing multi-agent orchestration with clear priorities
* Implementing JWT + HMAC + nonce security without breaking real-time flows
* Structuring state for multi-user + multi-agent isolation
* Three.js integration with real-time UI
* Building a professional dashboard with modular components
* Improving debugging discipline using structured logs

---

## **HHG Reflection**

### **Humility**

I underestimated how difficult it would be to combine real-time systems, multi-user state, and multi-agent logic while maintaining correctness. Even simple rules became complex when I had to guarantee no interference between agents, no broken sockets, and no inconsistent UI states.

### **Honesty**

I initially misunderstood how replay protection and signature validation should work in a live WebSocket environment. I thought just attaching a signature was enough, but handling nonce rotation, timestamp windows, and invalidation rules forced me to rethink and study digital signature flows properly.

### **Gratitude**

The mentor notes, embedded learning resources, and structured day-by-day tasks helped me immensely. They guided me whenever I was stuck — especially in areas like agent orchestration, microservice heartbeats, and event-driven architecture. These resources made the entire project achievable.

---


