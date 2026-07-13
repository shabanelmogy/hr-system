/* eslint-disable no-unreachable */
function BuggyComponent() {
  throw new Error("Oops! This is a test error.");
  return <p>This won't render.</p>;
}

export default BuggyComponent;
