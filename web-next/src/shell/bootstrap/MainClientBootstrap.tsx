"use client";

import { useEffect } from "react";

export function MainClientBootstrap() {
  useEffect(() => {
    let destroyPullToRefresh: (() => void) | undefined;

    void import("pulltorefreshjs").then(({ default: PullToRefresh }) => {
      const pullToRefresh = PullToRefresh.init({
        mainElement: "body",
        onRefresh() {
          window.location.reload();
        },
      });

      destroyPullToRefresh = () => {
        PullToRefresh.destroyAll();
        pullToRefresh?.destroy?.();
      };
    });

    return () => {
      destroyPullToRefresh?.();
    };
  }, []);

  return null;
}
