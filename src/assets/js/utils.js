/**
 * 医学学习指南 - 工具函数库
 * 包含通用的工具函数和辅助方法
 */

// 工具函数命名空间
const MLGUtils = {
    /**
     * DOM 操作工具
     */
    dom: {
        /**
         * 安全地获取DOM元素
         * @param {string} selector - CSS选择器
         * @param {HTMLElement} parent - 父元素，默认为document
         * @returns {HTMLElement|null} 找到的元素或null
         */
        getElement(selector, parent = document) {
            try {
                return parent.querySelector(selector);
            } catch (error) {
                console.error(`获取元素失败 ${selector}:`, error);
                return null;
            }
        },

        /**
         * 安全地获取多个DOM元素
         * @param {string} selector - CSS选择器
         * @param {HTMLElement} parent - 父元素，默认为document
         * @returns {NodeList} 找到的元素列表
         */
        getElements(selector, parent = document) {
            try {
                return parent.querySelectorAll(selector);
            } catch (error) {
                console.error(`获取元素列表失败 ${selector}:`, error);
                return [];
            }
        },

        /**
         * 创建带有属性的元素
         * @param {string} tag - 标签名
         * @param {Object} attributes - 属性对象
         * @param {string|HTMLElement} content - 内容
         * @returns {HTMLElement} 创建的元素
         */
        createElement(tag, attributes = {}, content = '') {
            const element = document.createElement(tag);
            
            // 设置属性
            Object.entries(attributes).forEach(([key, value]) => {
                if (key === 'className') {
                    element.className = value;
                } else if (key === 'dataset') {
                    Object.entries(value).forEach(([dataKey, dataValue]) => {
                        element.dataset[dataKey] = dataValue;
                    });
                } else if (key.startsWith('on') && typeof value === 'function') {
                    element.addEventListener(key.slice(2).toLowerCase(), value);
                } else {
                    element.setAttribute(key, value);
                }
            });

            // 设置内容
            if (typeof content === 'string') {
                element.innerHTML = content;
            } else if (content instanceof HTMLElement) {
                element.appendChild(content);
            }

            return element;
        },

        /**
         * 切换元素的可见性
         * @param {HTMLElement} element - 目标元素
         * @param {boolean} show - 是否显示
         */
        toggleVisibility(element, show) {
            if (!element) return;
            
            if (show) {
                element.style.display = '';
                element.setAttribute('aria-hidden', 'false');
            } else {
                element.style.display = 'none';
                element.setAttribute('aria-hidden', 'true');
            }
        },

        /**
         * 添加或移除CSS类
         * @param {HTMLElement} element - 目标元素
         * @param {string} className - CSS类名
         * @param {boolean} add - 是否添加
         */
        toggleClass(element, className, add) {
            if (!element) return;
            
            if (add) {
                element.classList.add(className);
            } else {
                element.classList.remove(className);
            }
        }
    },

    /**
     * 存储工具
     */
    storage: {
        /**
         * 安全地存储数据到localStorage
         * @param {string} key - 存储键名
         * @param {any} value - 存储值
         */
        setItem(key, value) {
            try {
                const serializedValue = JSON.stringify(value);
                localStorage.setItem(`mlg_${key}`, serializedValue);
            } catch (error) {
                console.error('存储数据失败:', error);
            }
        },

        /**
         * 安全地从localStorage读取数据
         * @param {string} key - 存储键名
         * @param {any} defaultValue - 默认值
         * @returns {any} 读取的值或默认值
         */
        getItem(key, defaultValue = null) {
            try {
                const item = localStorage.getItem(`mlg_${key}`);
                return item ? JSON.parse(item) : defaultValue;
            } catch (error) {
                console.error('读取数据失败:', error);
                return defaultValue;
            }
        },

        /**
         * 安全地从localStorage移除数据
         * @param {string} key - 存储键名
         */
        removeItem(key) {
            try {
                localStorage.removeItem(`mlg_${key}`);
            } catch (error) {
                console.error('移除数据失败:', error);
            }
        }
    },

    /**
     * 主题管理工具
     */
    theme: {
        /**
         * 初始化主题
         */
        init() {
            const savedTheme = this.storage.getItem('theme', 'light');
            this.applyTheme(savedTheme);
        },

        /**
         * 应用主题
         * @param {string} theme - 主题名称 ('light' 或 'dark')
         */
        applyTheme(theme) {
            const validThemes = ['light', 'dark'];
            const selectedTheme = validThemes.includes(theme) ? theme : 'light';
            
            document.documentElement.setAttribute('data-theme', selectedTheme);
            this.storage.setItem('theme', selectedTheme);
            
            // 发布主题变更事件
            this.dispatchEvent('themeChange', { theme: selectedTheme });
        },

        /**
         * 切换主题
         */
        toggle() {
            const currentTheme = document.documentElement.getAttribute('data-theme') || 'light';
            const newTheme = currentTheme === 'light' ? 'dark' : 'light';
            this.applyTheme(newTheme);
        },

        /**
         * 获取当前主题
         * @returns {string} 当前主题
         */
        getCurrentTheme() {
            return document.documentElement.getAttribute('data-theme') || 'light';
        }
    },

    /**
     * 事件管理工具
     */
    events: {
        _listeners: new Map(),

        /**
         * 添加事件监听
         * @param {string} event - 事件名称
         * @param {Function} callback - 回调函数
         */
        on(event, callback) {
            if (!this._listeners.has(event)) {
                this._listeners.set(event, new Set());
            }
            this._listeners.get(event).add(callback);
        },

        /**
         * 移除事件监听
         * @param {string} event - 事件名称
         * @param {Function} callback - 回调函数
         */
        off(event, callback) {
            if (this._listeners.has(event)) {
                this._listeners.get(event).delete(callback);
            }
        },

        /**
         * 触发事件
         * @param {string} event - 事件名称
         * @param {any} data - 事件数据
         */
        emit(event, data) {
            if (this._listeners.has(event)) {
                this._listeners.get(event).forEach(callback => {
                    try {
                        callback(data);
                    } catch (error) {
                        console.error(`事件处理错误 ${event}:`, error);
                    }
                });
            }
        }
    },

    /**
     * 网络请求工具
     */
    http: {
        /**
         * 发送GET请求
         * @param {string} url - 请求URL
         * @param {Object} options - 请求选项
         * @returns {Promise} Promise对象
         */
        async get(url, options = {}) {
            return this._request('GET', url, null, options);
        },

        /**
         * 发送POST请求
         * @param {string} url - 请求URL
         * @param {Object} data - 请求数据
         * @param {Object} options - 请求选项
         * @returns {Promise} Promise对象
         */
        async post(url, data, options = {}) {
            return this._request('POST', url, data, options);
        },

        /**
         * 通用请求方法
         * @param {string} method - HTTP方法
         * @param {string} url - 请求URL
         * @param {Object} data - 请求数据
         * @param {Object} options - 请求选项
         * @returns {Promise} Promise对象
         */
        async _request(method, url, data = null, options = {}) {
            const config = {
                method,
                headers: {
                    'Content-Type': 'application/json',
                    ...options.headers
                },
                ...options
            };

            if (data && (method === 'POST' || method === 'PUT')) {
                config.body = JSON.stringify(data);
            }

            try {
                const response = await fetch(url, config);
                
                if (!response.ok) {
                    throw new Error(`HTTP错误: ${response.status}`);
                }

                const contentType = response.headers.get('content-type');
                if (contentType && contentType.includes('application/json')) {
                    return await response.json();
                } else {
                    return await response.text();
                }
            } catch (error) {
                console.error('请求失败:', error);
                throw error;
            }
        }
    },

    /**
     * 性能监控工具
     */
    performance: {
        /**
         * 测量函数执行时间
         * @param {Function} fn - 要测量的函数
         * @param {string} name - 测量名称
         * @returns {any} 函数返回值
         */
        measure(fn, name = 'anonymous') {
            const startTime = performance.now();
            const result = fn();
            const endTime = performance.now();
            
            console.log(`⏱️ ${name} 执行时间: ${(endTime - startTime).toFixed(2)}ms`);
            return result;
        },

        /**
         * 异步测量函数执行时间
         * @param {Function} fn - 要测量的异步函数
         * @param {string} name - 测量名称
         * @returns {Promise} Promise对象
         */
        async measureAsync(fn, name = 'anonymous') {
            const startTime = performance.now();
            const result = await fn();
            const endTime = performance.now();
            
            console.log(`⏱️ ${name} 执行时间: ${(endTime - startTime).toFixed(2)}ms`);
            return result;
        }
    },

    /**
     * 表单验证工具
     */
    validation: {
        /**
         * 验证邮箱格式
         * @param {string} email - 邮箱地址
         * @returns {boolean} 是否有效
         */
        isEmail(email) {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            return emailRegex.test(email);
        },

        /**
         * 验证URL格式
         * @param {string} url - URL地址
         * @returns {boolean} 是否有效
         */
        isUrl(url) {
            try {
                new URL(url);
                return true;
            } catch {
                return false;
            }
        },

        /**
         * 验证是否为空
         * @param {string} value - 要验证的值
         * @returns {boolean} 是否为空
         */
        isEmpty(value) {
            return !value || value.trim().length === 0;
        }
    },

    /**
     * 工具初始化
     */
    init() {
        // 初始化主题
        this.theme.init();
        
        // 设置性能监控
        if (process.env.NODE_ENV === 'development') {
            this.performance.measure(() => {
                console.log('🔧 MLGUtils 初始化完成');
            }, 'MLGUtils初始化');
        }
    }
};

// 为theme工具添加事件分发方法
MLGUtils.theme.dispatchEvent = MLGUtils.events.emit.bind(MLGUtils.events);
MLGUtils.theme.storage = MLGUtils.storage;
MLGUtils.theme.dom = MLGUtils.dom;

// 初始化工具
document.addEventListener('DOMContentLoaded', () => {
    MLGUtils.init();
});

// 导出工具类
if (typeof module !== 'undefined' && module.exports) {
    module.exports = MLGUtils;
} else {
    window.MLGUtils = MLGUtils;
}