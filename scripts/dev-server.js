/**
 * 医学学习指南 - 开发服务器 (修复版)
 * 专门修复静态资源路径映射问题
 * 版本: 3.0.0 - 修复/assets/路径映射
 */

const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');

// 服务器配置
const SERVER_CONFIG = {
    port: 3000,
    host: 'localhost',
    // 静态文件目录映射 - 修复关键配置
    staticMappings: {
        '/assets/': 'src/assets',    // 关键修复：将/assets/映射到src/assets
        '/data/': 'public/data',     // 数据文件映射
        '/': 'src/pages'             // 根目录映射到页面
    },
    // MIME类型映射
    mimeTypes: {
        '.html': 'text/html; charset=utf-8',
        '.css': 'text/css; charset=utf-8',
        '.js': 'text/javascript; charset=utf-8',
        '.json': 'application/json; charset=utf-8',
        '.png': 'image/png',
        '.jpg': 'image/jpeg',
        '.jpeg': 'image/jpeg',
        '.gif': 'image/gif',
        '.svg': 'image/svg+xml',
        '.ico': 'image/x-icon',
        '.txt': 'text/plain; charset=utf-8',
        '.md': 'text/markdown; charset=utf-8'
    }
};

class DevelopmentServer {
    constructor(config) {
        this.config = config;
        this.server = null;
        this.projectRoot = process.cwd();
        
        console.log('🚀 开发服务器初始化 (修复版)...');
        console.log(`📁 项目根目录: ${this.projectRoot}`);
        console.log('📍 路径映射配置:');
        Object.entries(this.config.staticMappings).forEach(([urlPath, filePath]) => {
            console.log(`   ${urlPath} → ${filePath}`);
        });
    }

    /**
     * 启动开发服务器
     */
    start() {
        this.server = http.createServer((req, res) => {
            this.handleRequest(req, res);
        });

        this.server.on('error', (error) => {
            console.error('💥 服务器错误:', error);
            if (error.code === 'EADDRINUSE') {
                console.log(`⚠️ 端口 ${this.config.port} 被占用，尝试端口 ${this.config.port + 1}`);
                this.config.port += 1;
                this.start();
            }
        });

        this.server.listen(this.config.port, this.config.host, () => {
            console.log('\n🌈 医学学习指南开发服务器已启动 (修复版)');
            console.log(`📍 本地访问: http://${this.config.host}:${this.config.port}`);
            console.log(`📍 网络访问: http://localhost:${this.config.port}`);
            console.log('🎯 重要提示:');
            console.log('   ✅ CSS文件通过: /assets/css/文件名.css 访问');
            console.log('   ✅ JS文件通过: /assets/js/文件名.js 访问');
            console.log('   ✅ 数据文件通过: /data/目录/文件名.json 访问');
            console.log('⏳ 服务器运行中... (按 Ctrl+C 停止)\n');
        });

        // 优雅关闭处理
        process.on('SIGINT', () => {
            console.log('\n🛑 正在停止开发服务器...');
            this.stop();
        });

        return this;
    }

    /**
     * 停止开发服务器
     */
    stop() {
        if (this.server) {
            this.server.close(() => {
                console.log('✅ 开发服务器已停止');
                process.exit(0);
            });
        }
    }

    /**
     * 处理HTTP请求 - 修复路径映射逻辑
     */
    handleRequest(req, res) {
        try {
            const parsedUrl = url.parse(req.url, true);
            const pathname = decodeURIComponent(parsedUrl.pathname);
            
            // 记录请求日志
            this.logRequest(req);

            // 设置CORS头，支持跨域访问
            this.setCORSHeaders(res);

            // 处理预检请求
            if (req.method === 'OPTIONS') {
                res.writeHead(200);
                res.end();
                return;
            }

            // 只支持GET请求
            if (req.method !== 'GET') {
                this.serve405(res);
                return;
            }

            // 默认页面重定向
            if (pathname === '/' || pathname === '/index.html') {
                this.serveFile(res, path.join('src/pages', 'index.html'));
                return;
            }

            // 查找并服务静态文件 - 使用新的映射逻辑
            this.serveStaticFileWithMapping(res, pathname);
            
        } catch (error) {
            console.error('💥 处理请求时发生错误:', error);
            this.serve500(res, error);
        }
    }

    /**
     * 设置CORS头
     */
    setCORSHeaders(res) {
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
        res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    }

    /**
     * 记录请求日志
     */
    logRequest(req) {
        const timestamp = new Date().toLocaleTimeString();
        const method = req.method.padEnd(7);
        console.log(`[${timestamp}] ${method} ${req.url}`);
    }

    /**
     * 服务静态文件 - 使用路径映射 (修复版)
     */
    serveStaticFileWithMapping(res, requestPath) {
        console.log(`🔍 查找文件: ${requestPath}`);
        
        // 安全检查：防止路径遍历攻击
        if (requestPath.includes('../') || requestPath.includes('..\\')) {
            console.log('🚫 安全警告: 检测到路径遍历攻击');
            this.serve403(res);
            return;
        }

        // 应用路径映射规则
        for (const [urlPrefix, filePrefix] of Object.entries(this.config.staticMappings)) {
            if (requestPath.startsWith(urlPrefix)) {
                // 计算实际文件路径
                const relativePath = requestPath.substring(urlPrefix.length);
                const fullPath = path.join(this.projectRoot, filePrefix, relativePath);
                
                console.log(`  映射: ${requestPath} → ${fullPath}`);
                
                if (fs.existsSync(fullPath)) {
                    const stats = fs.statSync(fullPath);
                    if (stats.isFile()) {
                        this.serveFile(res, fullPath);
                        return;
                    } else if (stats.isDirectory()) {
                        // 如果是目录，尝试提供index.html
                        const indexFile = path.join(fullPath, 'index.html');
                        if (fs.existsSync(indexFile)) {
                            this.serveFile(res, indexFile);
                            return;
                        }
                    }
                }
                
                // 如果映射路径找不到文件，继续尝试其他方式
                break;
            }
        }

        // 备用方案：直接在所有可能的位置查找
        this.serveStaticFileFallback(res, requestPath);
    }

    /**
     * 备用静态文件服务 (保持向后兼容)
     */
    serveStaticFileFallback(res, requestPath) {
        console.log(`  尝试备用查找...`);
        
        // 移除开头的斜杠
        const cleanPath = requestPath.startsWith('/') ? requestPath.substring(1) : requestPath;
        
        // 在常见目录中查找
        const searchPaths = [
            'src/assets',
            'public',
            'src/pages', 
            'scripts',
            'docs',
            'config'
        ];

        for (const basePath of searchPaths) {
            const fullPath = path.join(this.projectRoot, basePath, cleanPath);
            console.log(`  尝试: ${fullPath}`);
            
            if (fs.existsSync(fullPath)) {
                const stats = fs.statSync(fullPath);
                if (stats.isFile()) {
                    this.serveFile(res, fullPath);
                    return;
                }
            }
        }

        // 如果文件不存在，返回404
        this.serve404(res, requestPath);
    }

    /**
     * 服务具体文件
     */
    serveFile(res, filePath) {
        try {
            // 确保文件路径是绝对路径
            const absolutePath = path.isAbsolute(filePath) ? filePath : path.join(this.projectRoot, filePath);
            
            const ext = path.extname(absolutePath).toLowerCase();
            const mimeType = this.config.mimeTypes[ext] || 'application/octet-stream';

            // 检查文件是否存在
            if (!fs.existsSync(absolutePath)) {
                throw new Error(`文件不存在: ${absolutePath}`);
            }

            // 读取文件内容
            const data = fs.readFileSync(absolutePath);
            
            // 特殊处理JSON文件：验证格式
            if (ext === '.json') {
                try {
                    JSON.parse(data.toString());
                    console.log(`✅ JSON格式验证通过: ${absolutePath}`);
                } catch (jsonError) {
                    console.error(`❌ JSON格式错误: ${absolutePath}`, jsonError);
                    this.serve500(res, new Error(`JSON文件格式错误: ${jsonError.message}`));
                    return;
                }
            }

            // 设置响应头
            res.writeHead(200, {
                'Content-Type': mimeType,
                'Cache-Control': 'no-cache, no-store, must-revalidate',
                'Pragma': 'no-cache',
                'Expires': '0',
                'Content-Length': data.length
            });

            res.end(data);
            console.log(`✅ 服务文件: ${absolutePath}`);
            
        } catch (error) {
            console.error(`❌ 文件服务错误: ${filePath}`, error);
            this.serve500(res, error);
        }
    }

    /**
     * 服务403禁止访问错误
     */
    serve403(res) {
        res.writeHead(403, { 'Content-Type': 'text/html; charset=utf-8' });
        res.end(`
            <!DOCTYPE html>
            <html>
            <head><title>403 - 禁止访问</title></head>
            <body>
                <h1>403 - 禁止访问</h1>
                <p>您没有权限访问此资源。</p>
            </body>
            </html>
        `);
    }

    /**
     * 服务405方法不允许错误
     */
    serve405(res) {
        res.writeHead(405, { 'Content-Type': 'text/html; charset=utf-8' });
        res.end(`
            <!DOCTYPE html>
            <html>
            <head><title>405 - 方法不允许</title></head>
            <body>
                <h1>405 - 方法不允许</h1>
                <p>此资源不支持该HTTP方法。</p>
            </body>
            </html>
        `);
    }

    /**
     * 服务404错误页面
     */
    serve404(res, filePath) {
        res.writeHead(404, { 'Content-Type': 'text/html; charset=utf-8' });
        
        const html = `
            <!DOCTYPE html>
            <html lang="zh-CN">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>404 - 页面未找到</title>
                <style>
                    body { 
                        font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; 
                        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                        margin: 0; padding: 0; min-height: 100vh;
                        display: flex; align-items: center; justify-content: center;
                        color: white;
                    }
                    .error-container { 
                        text-align: center; 
                        background: rgba(255,255,255,0.1); 
                        padding: 40px; 
                        border-radius: 15px;
                        backdrop-filter: blur(10px);
                        box-shadow: 0 8px 32px rgba(0,0,0,0.1);
                    }
                    h1 { font-size: 4rem; margin: 0; }
                    h2 { font-size: 1.5rem; margin: 10px 0 20px; opacity: 0.9; }
                    .file-path { 
                        background: rgba(255,255,255,0.2); 
                        padding: 10px; 
                        border-radius: 5px; 
                        margin: 20px 0;
                        font-family: monospace;
                    }
                    .btn { 
                        display: inline-block; 
                        padding: 12px 24px; 
                        background: white; 
                        color: #667eea; 
                        text-decoration: none; 
                        border-radius: 25px; 
                        font-weight: bold;
                        margin: 5px;
                        transition: transform 0.2s;
                    }
                    .btn:hover { transform: translateY(-2px); }
                </style>
            </head>
            <body>
                <div class="error-container">
                    <h1>🔍 404</h1>
                    <h2>页面未找到</h2>
                    <div class="file-path">请求的文件: ${filePath}</div>
                    <p>请检查文件路径是否正确，或确认文件是否存在。</p>
                    <div>
                        <a href="/" class="btn">🏠 返回首页</a>
                        <a href="/debug" class="btn">🐛 调试信息</a>
                    </div>
                </div>
            </body>
            </html>
        `;
        
        res.end(html);
        console.log(`❌ 404 - 文件未找到: ${filePath}`);
    }

    /**
     * 服务500错误页面
     */
    serve500(res, error) {
        res.writeHead(500, { 'Content-Type': 'text/html; charset=utf-8' });
        
        const html = `
            <!DOCTYPE html>
            <html lang="zh-CN">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>500 - 服务器错误</title>
                <style>
                    body { 
                        font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; 
                        background: linear-gradient(135deg, #ff6b6b 0%, #ee5a24 100%);
                        margin: 0; padding: 0; min-height: 100vh;
                        display: flex; align-items: center; justify-content: center;
                        color: white;
                    }
                    .error-container { 
                        text-align: center; 
                        background: rgba(255,255,255,0.1); 
                        padding: 40px; 
                        border-radius: 15px;
                        backdrop-filter: blur(10px);
                        box-shadow: 0 8px 32px rgba(0,0,0,0.1);
                        max-width: 600px;
                    }
                    h1 { font-size: 4rem; margin: 0; }
                    h2 { font-size: 1.5rem; margin: 10px 0 20px; opacity: 0.9; }
                    .error-details { 
                        background: rgba(255,255,255,0.2); 
                        padding: 15px; 
                        border-radius: 5px; 
                        margin: 20px 0;
                        font-family: monospace;
                        text-align: left;
                        font-size: 0.9rem;
                        max-height: 200px;
                        overflow-y: auto;
                        word-break: break-all;
                    }
                    .btn { 
                        display: inline-block; 
                        padding: 12px 24px; 
                        background: white; 
                        color: #ff6b6b; 
                        text-decoration: none; 
                        border-radius: 25px; 
                        font-weight: bold;
                        margin: 5px;
                        transition: transform 0.2s;
                    }
                    .btn:hover { transform: translateY(-2px); }
                </style>
            </head>
            <body>
                <div class="error-container">
                    <h1>🚨 500</h1>
                    <h2>服务器内部错误</h2>
                    <div class="error-details">${error.message}</div>
                    <p>抱歉，服务器在处理您的请求时出现了错误。</p>
                    <div>
                        <a href="/" class="btn">🏠 返回首页</a>
                        <button onclick="window.location.reload()" class="btn">🔄 重新加载</button>
                    </div>
                </div>
            </body>
            </html>
        `;
        
        res.end(html);
        console.error(`❌ 500 - 服务器错误:`, error);
    }
}

// 创建并启动服务器
const server = new DevelopmentServer(SERVER_CONFIG);

// 处理未捕获的异常
process.on('uncaughtException', (error) => {
    console.error('💥 未捕获的异常:', error);
    process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
    console.error('💥 未处理的Promise拒绝:', reason);
});

// 启动服务器
try {
    server.start();
} catch (error) {
    console.error('💥 服务器启动失败:', error);
    process.exit(1);
}

// 导出服务器实例（用于测试）
module.exports = server;