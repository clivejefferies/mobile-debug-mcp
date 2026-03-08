export interface DeviceInfo {
  platform: string;
  id: string;
}

export interface StartAppResponse {
  device: DeviceInfo;
  appStarted: boolean;
  launchTimeMs: number;
}

export interface GetLogsResponse {
  device: DeviceInfo;
  logs: string[];
  logCount: number;
}

export interface GetCrashResponse {
  device: DeviceInfo;
  crashes: string[];
}

export interface CaptureAndroidScreenResponse {
  device: DeviceInfo;
  screenshot: string; // base64 encoded string
  resolution: {
    width: number;
    height: number;
  };
}

export interface CaptureIOSScreenshotResponse {
  device: DeviceInfo;
  screenshot: string; // base64 encoded string
  resolution: {
    width: number;
    height: number;
  };
}
