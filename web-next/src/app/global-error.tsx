"use client";

type GlobalErrorProps = {
  error: Error & { digest?: string };
  retry: () => void;
};

export default function GlobalError({ error, retry }: GlobalErrorProps) {
  return (
    <html lang="en" dir="auto">
      <head>
        <title>Application Error | ERP System</title>
      </head>
      <body
        style={{
          margin: 0,
          minHeight: "100vh",
          display: "grid",
          placeItems: "center",
          background: "#f7f8fb",
          color: "#172033",
          fontFamily: "Arial, Helvetica, sans-serif",
        }}
      >
        <main
          role="alert"
          style={{
            width: "min(92vw, 560px)",
            padding: 32,
            borderRadius: 16,
            background: "#ffffff",
            boxShadow: "0 18px 60px rgba(23, 32, 51, 0.12)",
            textAlign: "center",
          }}
        >
          <h1 style={{ margin: 0, fontSize: 28 }}>Unexpected application error</h1>
          <p style={{ margin: "12px 0 0", lineHeight: 1.7, color: "#5f6b7c" }}>
            The application could not complete this request. You can retry safely.
          </p>
          {error.digest ? (
            <p style={{ margin: "12px 0 0", fontSize: 13, color: "#7c8798" }}>
              Reference: {error.digest}
            </p>
          ) : null}
          <button
            type="button"
            onClick={retry}
            style={{
              marginTop: 24,
              border: 0,
              borderRadius: 10,
              padding: "11px 20px",
              background: "#1976d2",
              color: "#ffffff",
              font: "inherit",
              fontWeight: 700,
              cursor: "pointer",
            }}
          >
            Try again
          </button>
        </main>
      </body>
    </html>
  );
}
