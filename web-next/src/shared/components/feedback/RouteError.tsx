"use client";

import { Alert, Box, Button } from "@mui/material";

interface RouteErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function RouteError({ error, reset }: RouteErrorProps) {
  return (
    <Box sx={{ mx: "auto", maxWidth: 720, p: 3 }}>
      <Alert
        severity="error"
        action={
          <Button color="inherit" onClick={reset} size="small">
            Try again
          </Button>
        }
      >
        {error.message || "This page could not be loaded."}
      </Alert>
    </Box>
  );
}
