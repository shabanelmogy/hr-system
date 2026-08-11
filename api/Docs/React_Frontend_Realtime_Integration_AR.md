# ربط React بالتحديثات اللحظية

هذا المستند يوضح عقد الربط الأساسي فقط. طريقة إدارة state أو cache أو واجهة
المستخدم متروكة لمشروع React.

## 1. المكتبة المطلوبة

```bash
npm install @microsoft/signalr
```

## 2. الحصول على Realtime Token

بعد تسجيل الدخول، اطلب توكن مخصصاً للاتصال اللحظي باستخدام Access Token الحالي:

```http
GET {API_BASE_URL}/api/v1/auth/realtimeToken
Authorization: Bearer {ACCESS_TOKEN}
```

الاستجابة:

```json
{
  "token": "REALTIME_TOKEN"
}
```

## 3. الاتصال بالـ Hub

```text
{API_BASE_URL}/hubs/company
```

مرر `REALTIME_TOKEN` من خلال `accessTokenFactory`، وفعّل إعادة الاتصال التلقائي.

### مثال Service بسيط

```ts
import * as signalR from "@microsoft/signalr";

const API_BASE_URL = import.meta.env.VITE_API_URL;

export type RealtimeEntityChanged = {
  eventId: string;
  occurredAtUtc: string;
  resource: string;
  action: string;
  entityId: string | null;
};

class SignalRService {
  private readonly connection: signalR.HubConnection;

  constructor(private readonly getAccessToken: () => string | null) {
    this.connection = new signalR.HubConnectionBuilder()
      .withUrl(`${API_BASE_URL}/hubs/company`, {
        accessTokenFactory: () => this.getRealtimeToken(),
      })
      .withAutomaticReconnect([0, 2000, 5000, 10000, 30000])
      .build();
  }

  async start(): Promise<void> {
    if (this.connection.state === signalR.HubConnectionState.Disconnected) {
      await this.connection.start();
    }
  }

  async stop(): Promise<void> {
    await this.connection.stop();
  }

  onEntityChanged(handler: (event: RealtimeEntityChanged) => void): () => void {
    this.connection.on("ReceiveEntityChanged", handler);
    return () => this.connection.off("ReceiveEntityChanged", handler);
  }

  onNotification(handler: (notification: unknown) => void): () => void {
    this.connection.on("ReceiveNotification", handler);
    return () => this.connection.off("ReceiveNotification", handler);
  }

  private async getRealtimeToken(): Promise<string> {
    const accessToken = this.getAccessToken();
    if (!accessToken) throw new Error("Access token is missing");

    const response = await fetch(
      `${API_BASE_URL}/api/v1/auth/realtimeToken`,
      { headers: { Authorization: `Bearer ${accessToken}` } },
    );

    if (!response.ok) {
      throw new Error(`Realtime token request failed: ${response.status}`);
    }

    const data = (await response.json()) as { token: string };
    return data.token;
  }
}

export const signalRService = new SignalRService(
  () => localStorage.getItem("accessToken"), // استبدلها بمصدر التوكن في المشروع
);
```

أنشئ نسخة واحدة فقط من الـ service على مستوى التطبيق. ابدأ الاتصال بعد نجاح تسجيل
الدخول، وأوقفه عند تسجيل الخروج. استخدم دوال إلغاء الاشتراك التي ترجع من
`onEntityChanged` و`onNotification` عند إزالة المكون.

## 4. حدث تحديث البيانات

استمع إلى:

```text
ReceiveEntityChanged
```

شكل الحدث:

```ts
type RealtimeEntityChanged = {
  eventId: string;
  occurredAtUtc: string;
  resource: string;
  action: string;
  entityId: string | null;
};
```

مثال:

```json
{
  "eventId": "c934b81a-d62e-4f5f-9276-b54f33352012",
  "occurredAtUtc": "2026-08-09T12:00:00Z",
  "resource": "countries",
  "action": "Update",
  "entityId": "7"
}
```

عند استقبال الحدث، أعد تحميل البيانات المتعلقة بـ `resource`. الحدث إشارة لتحديث
البيانات فقط، وليس بديلاً عن استدعاء الـ API.

## 5. حدث الإشعارات

لاستقبال إشعارات المستخدم، استمع بشكل منفصل إلى:

```text
ReceiveNotification
```

## 6. الموارد الحالية

```text
countries
states
districts
address-types
addresses
users
appointments
```

الموارد الجديدة تتبع صيغة الجمع `kebab-case`.

## 7. قواعد أساسية

- امنع معالجة الحدث أكثر من مرة باستخدام `eventId`.
- بعد إعادة الاتصال، أعد تحميل البيانات المفتوحة لأن الأحداث لا يتم replay لها.
- لا تعتمد على بيانات SignalR كبديل عن البيانات المصرح بها من الـ API.
- لا ترسل `TenantId` أو `CompanyId` أو permissions إلى الـ Hub؛ السيرفر يستخرجها من التوكن.
- لا تعرض toast عند `ReceiveEntityChanged`. يمكن عرض toast عند `ReceiveNotification`.
- يجب إضافة رابط مشروع React إلى CORS في الـ API.
