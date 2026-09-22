export const IDLE_MS = 30_000;

// Monotonic timestamps, independent of browser APIs so boundary cases are testable.
export class ActiveDwell {
  private checkpoint: number;
  private lastActivity: number;
  private visible = false;
  private focused = false;
  private inSection = false;
  private accumulated = 0;

  constructor(now: number, lastActivity = now) { this.checkpoint = now; this.lastActivity = lastActivity; }

  advance(now: number) {
    if (this.visible && this.focused && this.inSection) {
      this.accumulated += Math.max(0, Math.min(now, this.lastActivity + IDLE_MS) - this.checkpoint);
    }
    this.checkpoint = now;
  }

  state(now: number, visible: boolean, focused: boolean, inSection: boolean) {
    this.advance(now);
    this.visible = visible;
    this.focused = focused;
    this.inSection = inSection;
  }

  activity(now: number) { this.advance(now); this.lastActivity = now; }
  total(now: number) { this.advance(now); return this.accumulated; }
  meaningfulTotal(now: number) { const total = this.total(now); return total >= 1000 ? total : 0; }
}
