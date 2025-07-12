export interface PrinterAttributes {
  Name?: string;
  MachineName?: string;
  BrandName?: string;
  ProtocolVersion?: string;
  FirmwareVersion?: string;
  XYZsize?: string;
  MainboardIP?: string;
  MainboardMAC?: string;
  MainboardID?: string;
  SDCPStatus?: number;
  MaximumCloudSDCPSercicesAllowed?: number;
  NumberOfCloudSDCPServicesConnected?: number;
  NumberOfVideoStreamConnected?: number;
  MaximumVideoStreamAllowed?: number;
  NetworkStatus?: string;
  UsbDiskStatus?: number;
  Capabilities?: string[];
  SupportFileType?: string[];
  DevicesStatus?: {
    SgStatus?: number;
    ZMotorStatus?: number;
    XMotorStatus?: number;
    YMotorStatus?: number;
  };
  CameraStatus?: number;
  RemainingMemory?: number;
  TLPNoCapPos?: number;
  TLPStartCapPos?: number;
  TLPInterLayers?: number;
}

export interface PrinterStatus {
  CurrentStatus?: number[];
  TimeLapseStatus?: number;
  PlatFormType?: number;
  TempOfHotbed?: number;
  TempOfNozzle?: number;
  TempOfBox?: number;
  TempTargetHotbed?: number;
  TempTargetNozzle?: number;
  TempTargetBox?: number;
  CurrenCoord?: string;
  CurrentFanSpeed?: {
    ModelFan?: number;
    AuxiliaryFan?: number;
    BoxFan?: number;
  };
  ZOffset?: number;
  LightStatus?: {
    SecondLight?: number;
    RgbLight?: number[];
  };
  PrintInfo?: {
    Status?: number;
    CurrentLayer?: number;
    TotalLayer?: number;
    CurrentTicks?: number;
    TotalTicks?: number;
    Filename?: string;
    TaskId?: string;
    PrintSpeedPct?: number;
    Progress?: number;
  };
}

type WSMessage = {
  Id: string;
  Data: {
    Cmd: number;
    Data?: Record<string, unknown>;
    RequestID: string;
    MainboardID: string;
    TimeStamp: number;
    From: number;
  };
};

interface WSResponseMessage {
  MainboardID: string;
  Attributes?: PrinterAttributes;
  Status?: PrinterStatus;
}

export class ElegooWSClient {
  private socket: WebSocket | null = null;
  private readonly url: string;
  private mainboardId = '';
  private pingInterval: NodeJS.Timeout | null = null;
  private readonly reconnectInterval = 3000;
  private readonly onMessageHandlers: Array<(msg: WSResponseMessage) => void> =
    [];

  constructor(url: string) {
    this.url = url;
  }

  connect() {
    this.socket = new WebSocket(this.url);

    this.socket.onopen = () => {
      console.log('[WS] Connected');
      this.sendStartUpMessages();
    };

    this.socket.onmessage = e => {
      try {
        const data = JSON.parse(e.data);
        if (data.Data?.MainboardID) {
          this.mainboardId = data.Data?.MainboardID;
        }
        this.onMessageHandlers.forEach(handler => handler(data));
      } catch (err) {
        console.error('[WS] Failed to parse message:', err, e.data);
      }
    };

    this.socket.onclose = () => {
      console.warn('[WS] Disconnected. Reconnecting...');
      this.stopPinging();
      setTimeout(() => this.connect(), this.reconnectInterval);
    };

    this.socket.onerror = err => {
      console.error('[WS] Error:', err);
    };
  }

  onMessage(handler: (msg: WSResponseMessage) => void) {
    this.onMessageHandlers.push(handler);
  }

  sendCmd(cmd: number, data: Record<string, unknown> = {}) {
    if (!this.socket || this.socket.readyState !== WebSocket.OPEN) {
      console.warn('[WS] Cannot send command, socket not open');
      return;
    }
    const message: WSMessage = {
      Id: '',
      Data: {
        Cmd: cmd,
        Data: data,
        RequestID: '0',
        MainboardID: this.mainboardId,
        TimeStamp: Date.now(),
        From: 1,
      },
    };
    this.socket.send(JSON.stringify(message));
  }

  startPinging() {
    if (this.pingInterval) return;
    this.pingInterval = setInterval(() => {
      this.getStatus();
    }, 30000);
  }

  stopPinging() {
    if (this.pingInterval) {
      clearInterval(this.pingInterval);
      this.pingInterval = null;
    }
  }

  close() {
    this.stopPinging();
    if (this.socket) {
      this.socket.close();
      this.socket = null;
    }
  }

  // High-level helpers
  private sendStartUpMessages() {
    this.getStatus();
    this.getPrinterInfo();
    this.startPinging();
    this.sendCmd(134); // No idea what this does but the official app sends it
  }

  getStatus() {
    this.sendCmd(0);
  }

  getPrinterInfo() {
    this.sendCmd(1);
  }

  listFiles(dir = '/local') {
    this.sendCmd(258, { Url: dir });
  }

  pausePrint() {
    this.sendCmd(129);
  }

  resumePrint() {
    this.sendCmd(131);
  }

  cancelPrint() {
    this.sendCmd(130);
  }
}
