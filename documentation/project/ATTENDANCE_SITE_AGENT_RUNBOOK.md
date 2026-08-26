# Attendance Site Agent runbook

## Purpose

Attendance devices stay on the customer LAN. The HR API must never initiate a
connection to that LAN. Instead, the Windows Site Agent reaches the hosted API
over outbound HTTPS, receives a queued operation, contacts the assigned local
device, and submits a sanitized result.

## One-time deployment prerequisites

1. Deploy the HR API with HTTPS and set `AttendanceAgent:PublicBaseUrl` to its
   externally reachable HTTPS origin. Set `AttendanceAgent:PollIntervalSeconds`
   only if the default of 15 seconds is unsuitable.
2. Apply the application migrations, including
   `20260826122802_AddAttendanceAgentExecutionLeases`.
3. Publish the API first, then stage the static download package into that
   publish folder:

   ```powershell
   dotnet publish .\HrManagementSystem.Api\HrManagementSystem.Api.csproj -c Release -o .\artifacts\api-publish
   .\scripts\Build-AttendanceAgentDownload.ps1 `
     -PublishedAgentPath G:\test\ZK-READER\connector\publish\win-x86 `
     -ApiPublishPath .\artifacts\api-publish
   ```

   The generated ZIP is a deployment artifact, not source code. It is copied
   into the API publish output only after the build, avoiding a Static Web
   Assets lock during ordinary IDE builds. It is self-contained x86 and does
   not require a separate .NET Runtime on the customer machine.

## HR administrator flow

1. Open **Attendance devices** and select **Site agent**.
2. Enter a meaningful location name and create the enrollment.
3. Immediately download `agent-config.json` and the **Windows Agent** package.
   The enrollment token is shown
   only at this point and must not be stored in chat, email, or source control.
4. On the customer network, extract the package and put `agent-config.json`
   beside `Install-HrAttendanceAgent.cmd`. Double-click the CMD file and
   approve Windows UAC. It starts the PowerShell installer with the selected
   configuration automatically; dragging a config JSON onto the CMD file is
   also supported. The installer stores the configuration under ProgramData
   with a restricted ACL and registers `HrAttendanceAgent` under LocalService.
5. Return to HR and wait until the assigned agent shows **Agent service ready**.
6. Create or edit the attendance device, select that Site Agent, and save its
   connection credentials. The device host and port refer to the customer LAN.
7. Choose **Test connection**. HR queues the test; the Site Agent claims it and
   the result is recorded in the pull-runs history. Then use **Pull users** or
   **Pull attendance** in the same way.

## Operational constraints

- Agent requests require HTTPS and the `X-Attendance-Agent-Id` and
  `X-Attendance-Agent-Token` headers. The hosted API does not require a VPN or
  inbound firewall rule to reach the customer device.
- Only the Agent receives the decrypted device communication key, over its
  authenticated HTTPS request. Fingerprint templates are never uploaded.
- A five-minute server lease and idempotent result handling prevent duplicate
  imports when the Agent retries after a network interruption.
- The legacy server-side connector remains only for deliberately unassigned
  legacy devices. All hosted/customer-LAN devices must be assigned to a Site
  Agent.
