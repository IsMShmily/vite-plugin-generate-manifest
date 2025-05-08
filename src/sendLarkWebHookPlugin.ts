import dayjs from "dayjs";
import { logMsg } from "./utils";
import type { ManifestPluginOptions } from "./types";
import fetch from "node-fetch";

const sendLarkWebHookPlugin = async (options: ManifestPluginOptions) => {
  sendLarkMsg(options);
};

const sendLarkMsg = async (
  options: ManifestPluginOptions
) => {
  // 时区+ 8小时
  const buildTime = dayjs().add(8, 'hours').format("YYYY-MM-DD HH:mm:ss")
  try {
    const res = await fetch(options.larkWebhook, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        msg_type: "interactive",
        card: {
          elements: [
            {
              tag: "div",
              text: {
                content: `💼 项目：${options.larkKeyWord}\n🚀 环境：${options.uploadUrl.includes("dev")
                  ? "DEV"
                  : options.uploadUrl.includes("uat")
                    ? "UAT"
                    : "PROD"
                  }\n📋 版本：${options.version}\n📦 离线包地址：${options.downloadUrl}/dist.zip\n⏰ 构建时间：${buildTime}`,
                tag: "lark_md",
              },
            },
          ],
          header: {
            template: "yellow",
            title: {
              content: `构建通知：`,
              tag: "plain_text",
            },
          },
        },
      }),
    });

    if (!res.ok) {
      throw new Error(`HTTP error! status: ${res.status}`);
    }

    const data = await res.json();
    logMsg(`✅ [Lark] send notice success:${JSON.stringify(data)}`, "green");
  } catch (error) {
    logMsg(`⚠️ [Lark] send notice failed:${JSON.stringify(error)}`, "red");
  }
};

export default sendLarkWebHookPlugin;
