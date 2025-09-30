/**
 * 简单的开发服务器
 * 用于本地开发和测试
 */

const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');

class DevServer {
    constructor(port = 3000, rootDir = './src') {
        this.port = port;
        this.rootDir = path.resolve(rootDir);
        this.mimeTypes = {
            '.html': 'text/html',
            '.css': 'text/css',
            '.js': 'application/javascript',
            '.json': 'application/json',
            '.png': 'image/png',
            '.jpg': 'image/jpeg',
            '.gif': 'image/gif',
            '.svg': 'image/svg+xml',
            '.ico': 'image/x-icon'
        };
    }

    /**
     * 获取文件的MIME类型
     */
    getMimeType(filePath) {
        const ext = path.extname(filePath).toLowerCase();
        return this.mimeTypes[ext] || 'application/octet-stream';
    }

    /**
     * 服务文件
     */
    serveFile(filePath, response) {
        const fullPath = path.join(this.rootDir, filePath);
        
        // 安全检查：确保文件在根目录内
        if (!fullPath.startsWith(this.rootDir)) {
            this.sendError(403, 'Forbidden', response);
            return;
        }

        fs.readFile(fullPath, (error, content) => {
            if (error) {
                if (error.code === 'ENOENT') {
                    this.sendError(404, 'File Not Found', response);
                } else {
                    this.sendError(500, 'Server Error', response);
                }
            } else {
                const mimeType = this.getMimeType(fullPath);
                response.writeHead(200, { 'Content-Type': mimeType });
                response.end(content, 'utf-8');
            }
        });
    }

    /**
     * 发送错误响应
     */
    sendError(statusCode, message, response) {
        response.writeHead(statusCode, { 'Content-Type': 'text/html' });
        response.end(`
            <!DOCTYPE html>
            <html>
            <head>
                <title>Error ${statusCode}</title>
                <style>
                    body { font-family: Arial, sans-serif; text-align: center; padding: 50px; }
                    h1 { color: #666; }
                </style>
            </head>
            <body>
                <h1>Error ${statusCode}</h1>
                <p>${message}</p>
                <p><a href="/pages/index.html">返回首页</a></p>
            </body>
            </html>
        `);
    }

    /**
     * 处理请求
     */
    handleRequest(request, response) {
        console.log(`${new Date().toISOString()} - ${request.method} ${request.url}`);

        // 解析URL
        const parsedUrl = url.parse(request.url, true);
        let pathname = parsedUrl.pathname;

        // 默认页面
        if (pathname === '/') {
            pathname = '/pages/index.html';
        }

        // 移除开头的斜杠
        const filePath = pathname.startsWith('/') ? pathname.substring(1) : pathname;

        this.serveFile(filePath, response);
    }

    /**
     * 启动服务器
     */
    start() {
        const server = http.createServer((req, res) => {
            this.handleRequest(req, res);
        });

        server.listen(this.port, () => {
            console.log('🚀 开发服务器已启动');
            console.log(`📁 服务目录: ${this.rootDir}`);
            console.log(`🌐 访问地址: http://localhost:${this.port}`);
            console.log('⏹️  按 Ctrl+C 停止服务器\n');
        });

        server.on('error', (error) => {
            if (error.code === 'EADDRINUSE') {
                console.error(`❌ 端口 ${this.port} 已被占用，请尝试其他端口`);
                process.exit(1);
            } else {
                console.error('❌ 服务器错误:', error);
            }
        });
    }
}

// 启动服务器
const server = new DevServer(3000, './src');
server.start();