"use client";

import ExternalToolFrame from "../ExternalToolFrame";

const HangfireDashboard = () => {
  return (
    <ExternalToolFrame
      path="/hangfire"
      title="Hangfire dashboard"
      height="calc(100vh - 115px)"
    />
  );
};

export default HangfireDashboard;
