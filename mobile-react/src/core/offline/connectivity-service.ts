import NetInfo, { NetInfoStateType, type NetInfoState } from '@react-native-community/netinfo';

export interface ConnectivitySnapshot {
  isConnected: boolean | null;
  isInternetReachable: boolean | null;
  isOnline: boolean;
  type: NetInfoState['type'];
}

type ConnectivityListener = (snapshot: ConnectivitySnapshot) => void;

const initialSnapshot: ConnectivitySnapshot = {
  isConnected: null,
  isInternetReachable: null,
  isOnline: true,
  type: NetInfoStateType.unknown,
};

export class ConnectivityService {
  private snapshot: ConnectivitySnapshot = initialSnapshot;
  private listeners = new Set<ConnectivityListener>();
  private unsubscribeNetInfo: (() => void) | null = null;

  getSnapshot = (): ConnectivitySnapshot => this.snapshot;

  subscribe = (listener: ConnectivityListener): (() => void) => {
    this.listeners.add(listener);
    this.start();
    listener(this.snapshot);
    return () => {
      this.listeners.delete(listener);
      if (this.listeners.size === 0) this.stop();
    };
  };

  async refresh(): Promise<ConnectivitySnapshot> {
    const state = await NetInfo.fetch();
    this.update(state);
    return this.snapshot;
  }

  private start(): void {
    if (this.unsubscribeNetInfo) return;
    this.unsubscribeNetInfo = NetInfo.addEventListener((state) => this.update(state));
    void this.refresh().catch(() => undefined);
  }

  private stop(): void {
    this.unsubscribeNetInfo?.();
    this.unsubscribeNetInfo = null;
  }

  private update(state: NetInfoState): void {
    const next: ConnectivitySnapshot = {
      isConnected: state.isConnected,
      isInternetReachable: state.isInternetReachable,
      isOnline: state.isConnected !== false && state.isInternetReachable !== false,
      type: state.type,
    };
    if (sameSnapshot(this.snapshot, next)) return;
    this.snapshot = next;
    this.listeners.forEach((listener) => listener(next));
  }
}

function sameSnapshot(left: ConnectivitySnapshot, right: ConnectivitySnapshot): boolean {
  return left.isConnected === right.isConnected
    && left.isInternetReachable === right.isInternetReachable
    && left.isOnline === right.isOnline
    && left.type === right.type;
}

export const connectivityService = new ConnectivityService();
