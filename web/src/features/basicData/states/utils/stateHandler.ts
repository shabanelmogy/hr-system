import { signalRService } from "@/shared";

interface State {
  id: number;
  nameAr?: string;
  nameEn?: string;
  code?: string;
  countryId?: number;
}

interface StateUpdateData {
  count?: number;
  state: State;
  action: string;
  message?: string | null;
}

interface NotificationSystem {
  addNotification: (
    message: string,
    type: string,
    metadata?: {
      entityType: string;
      category: string;
      data: State;
      count?: number;
    }
  ) => void;
}

type ActionType = "created" | "updated" | "deleted";
type NotificationType = "success" | "info" | "warning";

class StateHandler {
  private notificationSystem: NotificationSystem | null;
  private readonly entityType: string;

  constructor() {
    this.notificationSystem = null;
    this.entityType = "state";
  }

  initialize(notificationSystem: NotificationSystem): void {
    this.notificationSystem = notificationSystem;
    this.setupSignalR();
  }

  private setupSignalR(): void {
    signalRService.off("ReceiveStateUpdate");

    signalRService.on("ReceiveStateUpdate", (data: StateUpdateData) => {
      console.log("Received state update:", data);
      this.handleUpdate(data);
    });
  }

  private handleUpdate(data: StateUpdateData): void {
    // Destructure all data from backend
    const { count, state, action, message: customMessage = null } = data;

    // Destructure entity fields
    const {
      id,
      nameAr = "",
      nameEn = "",
      code = "",
    } = state;

    const name = nameAr || nameEn || "Unknown";
    const message = customMessage || this.getMessage(name, action, count);
    const type = this.getType(action);

    if (this.notificationSystem) {
      this.notificationSystem.addNotification(message, type, {
        entityType: this.entityType,
        category: action,
        data: state,
        count,
      });
    }
  }

  private getMessage(name: string, action: string, count?: number): string {
    const countText = count ? ` (Total: ${count})` : "";
    const messages: Record<string, string> = {
      created: `New state "${name}" has been added${countText}`,
      updated: `State "${name}" has been updated${countText}`,
      deleted: `State "${name}" has been deleted${countText}`,
    };
    return messages[action] || `State "${name}" ${action}${countText}`;
  }

  private getType(action: string): NotificationType {
    const actionTypes: Record<string, NotificationType> = {
      created: "success",
      updated: "info",
      deleted: "warning"
    };
    return actionTypes[action] || "info";
  }

  destroy(): void {
    signalRService.off("ReceiveStateUpdate");
  }
}

export default new StateHandler();