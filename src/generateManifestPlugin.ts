import OSS from "ali-oss";
import type { ManifestPluginOptions } from "./types";
import { logMsg } from "./utils";
import dayjs from "dayjs";
import chalk from "chalk";

const generateManifestPlugin = async (options: ManifestPluginOptions) => {
  const {
    version,
    uploadUrl,
    downloadUrl,
    region,
    accessKeyId,
    accessKeySecret,
    bucket,
  } = options;

  const manifest = {
    version,
    timestamp: dayjs().format("YYYY-MM-DD HH:mm:ss"),
    downloadUrl: `${downloadUrl}/dist.zip`,
    files: [],
    ignoreRouterPath: options.ignoreRouterPath || []
  };

  try {
    const client = new OSS({
      region,
      accessKeyId,
      accessKeySecret,
      bucket,
    });

    // 从 uploadUrl 中提取 OSS 路径
    const ossPath = uploadUrl.replace(/^https?:\/\/[^\/]+/, "");

    const msg = [
      `🚀🚀🚀 `,
      `${chalk.green("upload manifest.json to OSS")} →`,
      "",
      `Remote address: ${chalk.blue.underline(uploadUrl)}manifest.json`,
      "",
      `Write the content：`,
      "",
      `${JSON.stringify(manifest)}`,
    ].join("\n");
    logMsg(msg);

    // 上传到 OSS
    await client.put(
      ossPath + "manifest.json",
      Buffer.from(JSON.stringify(manifest, null, 2)),
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    logMsg(
      `${chalk.green("✅ Manifest uploaded successfully to OSS")}`,
      "green"
    );
  } catch (error) {
    // 上传失败时输出错误信息
    logMsg(`${chalk.red("❌ Failed to upload manifest to OSS")}`, "red");
  }
};

export default generateManifestPlugin;
