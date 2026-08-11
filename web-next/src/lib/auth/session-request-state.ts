export class SessionRequestState {
  private generation = 0;
  private inFlight: { generation: number; request: Promise<void> } | null = null;

  run(task: (generation: number) => Promise<void>): Promise<void> {
    const requestGeneration = this.generation;
    if (this.inFlight?.generation === requestGeneration) {
      return this.inFlight.request;
    }

    const request = task(requestGeneration).finally(() => {
      if (this.inFlight?.request === request) this.inFlight = null;
    });
    this.inFlight = { generation: requestGeneration, request };
    return request;
  }

  invalidate() {
    this.generation += 1;
  }

  isCurrent(generation: number) {
    return generation === this.generation;
  }
}
