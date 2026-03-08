#!/usr/bin/env node
import { Server } from "@modelcontextprotocol/sdk/server/index.js"
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js"
import {
  ListToolsRequestSchema,
  CallToolRequestSchema
} from "@modelcontextprotocol/sdk/types.js"

import {
  StartAppResponse,
  GetLogsResponse,
  GetCrashResponse,
  CaptureAndroidScreenResponse,
  CaptureIOSScreenshotResponse,
  DeviceInfo
} from "./types.js"

import { startAndroidApp, getAndroidLogs, getAndroidCrash, captureAndroidScreen } from "./android.js"
import { startIOSApp, getIOSLogs, getIOSCrash, captureIOSScreenshot } from "./ios.js"

const server = new Server(
  {
    name: "mobile-debug-mcp",
    version: "0.1.0"
  },
  {
    capabilities: {
      tools: {}
    }
  }
)

function wrapResponse<T>(data: T) {
  return {
    content: [{
      type: "application/json",
      data
    }]
  }
}

server.setRequestHandler(ListToolsRequestSchema, async () => ({
  tools: [
    {
      name: "start_app",
      description: "Launch a mobile app on Android or iOS simulator",
      inputSchema: {
        type: "object",
        properties: {
          platform: {
            type: "string",
            enum: ["android", "ios"]
          },
          id: {
            type: "string",
            description: "Android package name or iOS bundle id"
          }
        },
        required: ["platform", "id"]
      }
    },
    {
      name: "get_logs",
      description: "Get recent logs from Android or iOS simulator (crashes can be derived from logs)",
      inputSchema: {
        type: "object",
        properties: {
          platform: {
            type: "string",
            enum: ["android", "ios"]
          },
          id: {
            type: "string",
            description: "Android package name or iOS bundle id"
          },
          lines: {
            type: "number",
            description: "Number of log lines (android only)"
          }
        },
        required: ["platform", "id"]
      }
    },
    {
      name: "capture_android_screen",
      description: "Capture a screenshot from an Android device",
      inputSchema: {
        type: "object",
        properties: {
          id: {
            type: "string",
            description: "Android device id or package name"
          }
        },
        required: ["id"]
      }
    },
    {
      name: "capture_ios_screenshot",
      description: "Capture a screenshot from an iOS simulator",
      inputSchema: {
        type: "object",
        properties: {
          id: {
            type: "string",
            description: "iOS bundle id or simulator id"
          }
        },
        required: ["id"]
      }
    }
  ]
}))

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params

  try {
    if (name === "start_app") {
      const { platform, id } = args as {
        platform: "android" | "ios"
        id: string
      }

      let appStarted: boolean
      let launchTimeMs: number
      const deviceInfo: DeviceInfo = { platform, id }

      if (platform === "android") {
        const result = await startAndroidApp(id)
        appStarted = result.appStarted
        launchTimeMs = result.launchTimeMs
      } else {
        const result = await startIOSApp(id)
        appStarted = result.appStarted
        launchTimeMs = result.launchTimeMs
      }

      const response: StartAppResponse = {
        device: deviceInfo,
        appStarted,
        launchTimeMs
      }

      return wrapResponse(response)
    }

    if (name === "get_logs") {
      const { platform, id, lines } = args as {
        platform: "android" | "ios"
        id: string
        lines?: number
      }

      let logs: string[]
      const deviceInfo: DeviceInfo = { platform, id }

      if (platform === "android") {
        const response = await getAndroidLogs(id, lines ?? 200)
        logs = response.logs
      } else {
        const response = await getIOSLogs()
        logs = response.logs
      }

      // Filter crash lines (e.g. lines containing 'FATAL EXCEPTION') for internal or AI use
      const crashLines = logs.filter(line => line.includes('FATAL EXCEPTION'))

      // Return full logs as MCP-compliant content
      return {
        content: [
          {
            type: 'text',
            text: logs.join('\n')
          }
        ]
      }
    }

    if (name === "capture_android_screen") {
      const { id } = args as { id: string }

      const { screenshot, resolution } = await captureAndroidScreen(id)
      const deviceInfo: DeviceInfo = { platform: "android", id }

      const response: CaptureAndroidScreenResponse = {
        device: deviceInfo,
        screenshot,
        resolution
      }

      return {
        content: [
          {
            type: 'image',
            data: screenshot,
            mimeType: 'image/png'
          }
        ]
      }
    }

    if (name === "capture_ios_screenshot") {
      const { id } = args as { id: string }

      const { screenshot, resolution } = await captureIOSScreenshot()
      const deviceInfo: DeviceInfo = { platform: "ios", id }

      const response: CaptureIOSScreenshotResponse = {
        device: deviceInfo,
        screenshot,
        resolution
      }

      return {
        content: [
          {
            type: 'image',
            data: screenshot,
            mimeType: 'image/png'
          }
        ]
      }
    }
  } catch (error) {
    return {
      content: [{ type: "text", text: `Error executing tool ${name}: ${error instanceof Error ? error.message : String(error)}` }]
    }
  }

  throw new Error(`Unknown tool: ${name}`)
})

const transport = new StdioServerTransport()

async function main() {
  await server.connect(transport)
}

main().catch((error) => {
  console.error("Server failed to start:", error)
})