declare module "pulltorefreshjs" {
  type PullToRefreshOptions = {
    mainElement?: string;
    onRefresh?: () => void;
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
