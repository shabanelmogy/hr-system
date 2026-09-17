declare module "pulltorefreshjs" {
  type PullToRefreshOptions = {
    mainElement?: string;
    triggerElement?: string;
    refreshTimeout?: number;
    onRefresh?: () => void | Promise<void>;
    shouldPullToRefresh?: () => boolean;
  };

  type PullToRefreshInstance = {
    destroy?: () => void;
  };

  const PullToRefresh: {
    init(options: PullToRefreshOptions): PullToRefreshInstance;
    destroyAll(): void;
  };

  export default PullToRefresh;
}
