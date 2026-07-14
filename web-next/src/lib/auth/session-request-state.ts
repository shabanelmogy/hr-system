export class SessionRequestState {
  private generation = 0;
  private inFlight: Promise<void> | null = null;

  run(task: (generation: number) => Promise<void>): Promise<void> {
    if (this.inFlight) return this.inFlight;

    const requestGeneration = this.generation;
    const request = task(requestGeneration).finally(() => {
      if (this.inFlight === request) this.inFlight = null;
    });
    this.inFlight = request;
    return request;
  }

  invalidate() {
    this.generation += 1;
  }

  isCurrent(generation: number) {
    return generation === this.generation;
  }
}
