import type { ManifestPluginOptions } from "./types";
import path from "path";
import { glob } from "glob";
import OSS from "ali-oss";
import { normalizePath } from "vite";
import { logMsg } from "./utils";
import pLimit from "p-limit";
import fs from "fs";
import archiver from "archiver";

const aliOssPlugin = async (options: ManifestPluginOptions, buildConfig: any, basePath: string) => {
    const { region, accessKeyId, accessKeySecret, bucket } = options;
    const outDirPath = normalizePath(path.resolve(normalizePath(buildConfig.outDir)));
    const zipFilePath = path.resolve(outDirPath, 'dist.zip'); // 压缩文件路径

    const client = new OSS({
        region,
        accessKeyId,
        accessKeySecret,
        bucket,
        timeout: 120000, // 增加超时时间到 120 秒
    });

    // 创建压缩文件流
    const output = fs.createWriteStream(zipFilePath);
    const archive = archiver('zip', {
        zlib: { level: 7 }, // 压缩等级
    });
    // 将输出流与文件流连接
    archive.pipe(output);
    // 添加 dist 目录到压缩文件
    archive.directory(outDirPath, false);

    // 完成压缩
    await new Promise<void>((resolve, reject) => {
        archive.finalize();

        // 监听压缩完成事件
        archive.on('end', () => resolve());
        archive.on('error', (err: any) => reject(err));
    });
    logMsg(` 🚀 Compress dist to dist.zip`, "green");

    // 上传文件到 OSS
    try {
        await uploadToOss(zipFilePath, options.downloadUrl, client);
        logMsg(` ✅ ZIP file uploaded to OSS successfully: ${options.downloadUrl}/dist.zip`, "green");
    } catch (err) {
        console.error(`❌ Error uploading ZIP file to OSS:`, err);
    }

    const files = glob.sync(outDirPath + "/**/*", {
        // strict: true,
        nodir: true,
        dot: true,
        ignore: "",
    });

    logMsg(
        ` 🚀🚀🚀 Ali OSS upload start`,
        "green"
    );

    const startTime = new Date().getTime();
    if (options.basePath) {
        basePath = options.basePath;
    }

    basePath = (basePath || "").replace(/\/$/, "");
    basePath = basePath.replace(".", "");

    const limit = pLimit(5);

    const uploadFile = async (fileFullPath: string) => {
        const filePath = fileFullPath.split(outDirPath)[1];
        const ossFilePath = path.posix.join(basePath, filePath).replace(/\\/g, "/");
        const completePath = `${options.region}: ${options.bucket}: ${ossFilePath}`;
        const output = `${buildConfig.outDir + filePath} => ${completePath}`;

        try {
            // First check if the file exists
            await client.head(ossFilePath);
            console.log(`✅ File exists: ${output}`);
        } catch (err: any) {
            if (err.code === "NoSuchKey") {
                // Retry upload if error occurs
                try {
                    await client.put(ossFilePath, fileFullPath, {
                        headers: Object.assign({}, {}, {
                            "x-oss-forbid-overwrite": true,
                        }),
                    });
                    console.log(`🎉 Upload complete: ${output}`);
                } catch (uploadErr) {
                    console.error(`❌ Upload error for ${ossFilePath}:`, uploadErr);
                    throw uploadErr;
                }
            } else {
                console.error(`❌ Head check error for ${ossFilePath}:`, err);
                throw err;
            }
        }
    };


    const promises = files.map((fileFullPath) =>
        limit(() => uploadFile(fileFullPath))
    );

    await Promise.all(promises);

    const duration = (new Date().getTime() - startTime) / 1000;
    logMsg(
        ` ✅ Ali OSS upload success！, Time-consuming: ${duration.toFixed(2)}s`,
        "green"
    );
};

// 上传 ZIP 文件到 OSS
async function uploadToOss(zipFilePath: string, downloadUrl: string, client: OSS) {
    // 确保 downloadUrl 不以 / 结尾
    const baseUrl = downloadUrl.replace(/\/$/, '');
    // 构建完整的 OSS 路径
    const ossFilePath = `${baseUrl}/`;
    try {
        // 使用分片上传
        await client.multipartUpload(ossFilePath, zipFilePath, {
            parallel: 4, // 并发上传分片数
            partSize: 1024 * 1024, // 分片大小 1MB
            progress: (p: number) => {
                const percent = Math.floor(p * 100);
                console.log(`📤 Uploading: ${percent}%`);
            }
        });

    } catch (err) {
        console.error('Error uploading to OSS:', err);
        throw err;
    }
}



export default aliOssPlugin;

