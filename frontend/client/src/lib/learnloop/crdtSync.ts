/**
 * LearnLoop CRDT Stroke Sync Engine & Outbox Manager
 * --------------------------------------------------
 * Implements an operation-based CRDT for ink strokes with:
 * - Immutable stroke atoms
 * - Dots: (clientId, clientCounter)
 * - Lamport logical clocks
 * - Observed-remove tombstones
 * - Replacement & split geometry support
 * - Local IndexedDB / localStorage Outbox
 * - Background push/pull sync worker
 */

export interface StrokeSample {
  x: number;
  y: number;
  pressure?: number;
  timestamp: number;
}

export interface StrokeAtom {
  id: string; // UUID / dot key
  pageId: string;
  clientId: string;
  clientCounter: number;
  lamportClock: number;
  tool: "pen" | "pencil" | "marker" | "highlighter" | "eraser";
  color: string;
  baseWidth: number;
  opacity: number;
  points: StrokeSample[];
  bounds: { minX: number; minY: number; maxX: number; maxY: number };
  createdAt: number;
  tombstoned?: boolean;
}

export type CRDTOperationType = "stroke.add" | "stroke.remove" | "stroke.replace" | "stroke.transform";

export interface CRDTOperation {
  opId: string;
  pageId: string;
  clientId: string;
  clientCounter: number;
  lamportClock: number;
  type: CRDTOperationType;
  strokeId: string;
  stroke?: StrokeAtom;
  observedDots?: string[]; // For observed-remove
  replacementStrokes?: StrokeAtom[];
  transform?: { dx: number; dy: number; scale: number };
  timestamp: number;
  serverSeq?: number;
}

export interface VersionVector {
  [clientId: string]: number;
}

const CLIENT_ID_KEY = "learnloop_client_id";
const CLIENT_COUNTER_KEY = "learnloop_client_counter";
const LAMPORT_KEY = "learnloop_lamport";
const OUTBOX_STORAGE_KEY = "learnloop_crdt_outbox";
const CRDT_STATE_STORAGE_KEY = "learnloop_crdt_state";

export function getClientId(): string {
  let id = localStorage.getItem(CLIENT_ID_KEY);
  if (!id) {
    id = `client_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
    localStorage.setItem(CLIENT_ID_KEY, id);
  }
  return id;
}

export function getNextCounter(): { counter: number; lamport: number; clientId: string } {
  const clientId = getClientId();
  let counter = parseInt(localStorage.getItem(CLIENT_COUNTER_KEY) || "0", 10) + 1;
  let lamport = parseInt(localStorage.getItem(LAMPORT_KEY) || "0", 10) + 1;
  
  localStorage.setItem(CLIENT_COUNTER_KEY, String(counter));
  localStorage.setItem(LAMPORT_KEY, String(lamport));
  
  return { counter, lamport, clientId };
}

export function updateLamportClock(remoteLamport: number): number {
  let current = parseInt(localStorage.getItem(LAMPORT_KEY) || "0", 10);
  let updated = Math.max(current, remoteLamport) + 1;
  localStorage.setItem(LAMPORT_KEY, String(updated));
  return updated;
}

/**
 * Computes bounding box for a stroke sample array
 */
export function computeBounds(points: StrokeSample[]) {
  if (!points.length) return { minX: 0, minY: 0, maxX: 0, maxY: 0 };
  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
  for (const p of points) {
    if (p.x < minX) minX = p.x;
    if (p.y < minY) minY = p.y;
    if (p.x > maxX) maxX = p.x;
    if (p.y > maxY) maxY = p.y;
  }
  return { minX, minY, maxX, maxY };
}

/**
 * Local CRDT State Store per Page
 */
export class LearnLoopCRDTStore {
  private pageId: string;
  private strokes: Map<string, StrokeAtom> = new Map();
  private tombstones: Set<string> = new Set();
  private versionVector: VersionVector = {};
  private outbox: CRDTOperation[] = [];

  constructor(pageId: string) {
    this.pageId = pageId;
    this.loadLocalState();
  }

  private loadLocalState() {
    try {
      const rawState = localStorage.getItem(`${CRDT_STATE_STORAGE_KEY}_${this.pageId}`);
      if (rawState) {
        const parsed = JSON.parse(rawState);
        if (parsed.strokes) {
          for (const s of parsed.strokes) {
            this.strokes.set(s.id, s);
          }
        }
        if (parsed.tombstones) {
          this.tombstones = new Set(parsed.tombstones);
        }
        if (parsed.versionVector) {
          this.versionVector = parsed.versionVector;
        }
      }

      const rawOutbox = localStorage.getItem(`${OUTBOX_STORAGE_KEY}_${this.pageId}`);
      if (rawOutbox) {
        this.outbox = JSON.parse(rawOutbox);
      }
    } catch (e) {
      console.warn("Failed to load local CRDT state", e);
    }
  }

  private saveLocalState() {
    try {
      const state = {
        strokes: Array.from(this.strokes.values()),
        tombstones: Array.from(this.tombstones),
        versionVector: this.versionVector,
      };
      localStorage.setItem(`${CRDT_STATE_STORAGE_KEY}_${this.pageId}`, JSON.stringify(state));
      localStorage.setItem(`${OUTBOX_STORAGE_KEY}_${this.pageId}`, JSON.stringify(this.outbox));
    } catch (e) {
      console.warn("Failed to save local CRDT state", e);
    }
  }

  /**
   * Adds a new handwritten stroke atom to the document
   */
  public addStroke(
    points: StrokeSample[],
    tool: "pen" | "pencil" | "marker" | "highlighter" | "eraser" = "pen",
    color: string = "#202225",
    baseWidth: number = 3,
    opacity: number = 1
  ): StrokeAtom {
    const { counter, lamport, clientId } = getNextCounter();
    const strokeId = `${clientId}:${counter}`;
    const bounds = computeBounds(points);

    const stroke: StrokeAtom = {
      id: strokeId,
      pageId: this.pageId,
      clientId,
      clientCounter: counter,
      lamportClock: lamport,
      tool,
      color,
      baseWidth,
      opacity,
      points,
      bounds,
      createdAt: Date.now(),
    };

    const op: CRDTOperation = {
      opId: `op_${strokeId}`,
      pageId: this.pageId,
      clientId,
      clientCounter: counter,
      lamportClock: lamport,
      type: "stroke.add",
      strokeId,
      stroke,
      timestamp: Date.now(),
    };

    this.applyLocalOperation(op);
    return stroke;
  }

  /**
   * Observed-remove stroke deletion
   */
  public removeStrokes(strokeIds: string[]): CRDTOperation[] {
    const ops: CRDTOperation[] = [];
    for (const strokeId of strokeIds) {
      if (!this.tombstones.has(strokeId) && this.strokes.has(strokeId)) {
        const { counter, lamport, clientId } = getNextCounter();
        const op: CRDTOperation = {
          opId: `op_rem_${strokeId}_${counter}`,
          pageId: this.pageId,
          clientId,
          clientCounter: counter,
          lamportClock: lamport,
          type: "stroke.remove",
          strokeId,
          observedDots: [strokeId],
          timestamp: Date.now(),
        };
        this.applyLocalOperation(op);
        ops.push(op);
      }
    }
    return ops;
  }

  /**
   * Applies an operation locally and queues in outbox
   */
  public applyLocalOperation(op: CRDTOperation) {
    this.executeOperation(op);
    this.outbox.push(op);
    this.saveLocalState();
  }

  /**
   * Merges remote operations received from server or peer
   */
  public mergeRemoteOperations(remoteOps: CRDTOperation[]): number {
    let appliedCount = 0;
    for (const op of remoteOps) {
      updateLamportClock(op.lamportClock);
      
      const lastSeen = this.versionVector[op.clientId] || 0;
      if (op.clientCounter > lastSeen) {
        this.versionVector[op.clientId] = op.clientCounter;
      }

      const executed = this.executeOperation(op);
      if (executed) appliedCount++;
    }
    this.saveLocalState();
    return appliedCount;
  }

  private executeOperation(op: CRDTOperation): boolean {
    if (op.type === "stroke.add" && op.stroke) {
      if (!this.tombstones.has(op.strokeId)) {
        this.strokes.set(op.strokeId, op.stroke);
        return true;
      }
    } else if (op.type === "stroke.remove") {
      this.tombstones.add(op.strokeId);
      this.strokes.delete(op.strokeId);
      return true;
    } else if (op.type === "stroke.replace" && op.replacementStrokes) {
      this.tombstones.add(op.strokeId);
      this.strokes.delete(op.strokeId);
      for (const rep of op.replacementStrokes) {
        if (!this.tombstones.has(rep.id)) {
          this.strokes.set(rep.id, rep);
        }
      }
      return true;
    }
    return false;
  }

  /**
   * Returns active non-tombstoned strokes
   */
  public getActiveStrokes(): StrokeAtom[] {
    return Array.from(this.strokes.values()).filter((s) => !this.tombstones.has(s.id));
  }

  public getPendingOutbox(): CRDTOperation[] {
    return [...this.outbox];
  }

  public markOutboxSynced(syncedOpIds: string[]) {
    const set = new Set(syncedOpIds);
    this.outbox = this.outbox.filter((op) => !set.has(op.opId));
    this.saveLocalState();
  }
}

export const crdtEngine = new LearnLoopCRDTStore("page-main");
