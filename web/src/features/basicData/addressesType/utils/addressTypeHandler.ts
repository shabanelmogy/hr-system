import { signalRService } from "@/shared";

interface AddressTypeModel {
  id: number;
  nameAr?: string;
  nameEn?: string;
  isActive?: boolean;
}

interface AddressTypeUpdateData {
  count?: number;
  addressType: AddressTypeModel;
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
      data: AddressTypeModel;
      count?: number;
    }
  ) => void;
}

// Action types
type NotificationType = "success" | "info" | "warning";

class AddressTypeHandler {
  private notificationSystem: NotificationSystem | null;
  private readonly entityType: string;

  constructor() {
    this.notificationSystem = null;
    this.entityType = "addressType";
  }

  initialize(notificationSystem: NotificationSystem): void {
    this.notificationSystem = notificationSystem;
    this.setupSignalR();
  }

  private setupSignalR(): void {
    signalRService.off("ReceiveAddressTypeUpdate");

    signalRService.on("ReceiveAddressTypeUpdate", (data: AddressTypeUpdateData) => {
      console.log("Received address type update:", data);
      this.handleUpdate(data);
    });
  }

  private handleUpdate(data: AddressTypeUpdateData): void {
    const { count, addressType, action, message: customMessage = null } = data;
    const { nameAr = "", nameEn = "" } = addressType;
    const name = nameAr || nameEn || "Unknown";

    const message = customMessage || this.getMessage(name, action, count);
    const type = this.getType(action);

    if (this.notificationSystem) {
      this.notificationSystem.addNotification(message, type, {
        entityType: this.entityType,
        category: action,
        data: addressType,
        count,
      });
    }
  }

  private getMessage(name: string, action: string, count?: number): string {
    const countText = count ? ` (Total: ${count})` : "";
    const messages: Record<string, string> = {
      created: `New address type "${name}" has been added${countText}`,
      updated: `Address type "${name}" has been updated${countText}`,
      deleted: `Address type "${name}" has been deleted${countText}`,
    };
    return messages[action] || `Address type "${name}" ${action}${countText}`;
  }

  private getType(action: string): NotificationType {
    const actionTypes: Record<string, NotificationType> = {
      created: "success",
      updated: "info",
      deleted: "warning",
    };
    return actionTypes[action] || "info";
  }

  destroy(): void {
    signalRService.off("ReceiveAddressTypeUpdate");
  }
}

export default new AddressTypeHandler();
