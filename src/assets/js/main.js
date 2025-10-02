/**
 * 医学学习指南 - 主应用逻辑
 * 初始化应用和协调各模块
 * 作者: Medical Learning Guide Team
 * 版本: 1.0.0
 */

(function(global) {
    'use strict';
    
    console.log('🔧 开始加载 MedicalLearningGuide...');
    
    class MedicalLearningGuide {
        constructor() {
            this.initialized = false;
            this.currentUser = null;
            this.dataManager = null; // 新增：数据管理器引用
            this.currentPage = null; // 新增：当前页面状态
        }

        /**
         * 初始化应用
         */
        async init() {
            if (this.initialized) {
                return;
            }

            try {
                console.log('🚀 开始初始化医学学习指南应用...');

                // 显示加载指示器
                this._showLoadingIndicator();

                // 等待DOM完全加载
                if (document.readyState === 'loading') {
                    await new Promise(resolve => {
                        document.addEventListener('DOMContentLoaded', resolve);
                    });
                }

                // 检查必要依赖
                if (typeof window.MLGUtils === 'undefined') {
                    throw new Error('MLGUtils 未加载，请检查 utils.js 文件');
                }

                if (typeof window.MLGConfig === 'undefined') {
                    throw new Error('MLGConfig 未加载，请检查 config.js 文件');
                }

                // 新增：初始化数据管理器
                this._initDataManager();

                // 初始化模块
                await this._initModules();

                // 绑定全局事件
                this._bindGlobalEvents();

                // 新增：预加载核心数据
                await this._preloadData();

                // 隐藏加载指示器
                this._hideLoadingIndicator();

                this.initialized = true;

                console.log('✅ 医学学习指南应用初始化完成');

            } catch (error) {
                console.error('❌ 应用初始化失败:', error);
                this._showFatalError(error);
            }
        }

        /**
         * 新增：初始化数据管理器
         */
        _initDataManager() {
            if (typeof window.dataManager === 'undefined') {
                throw new Error('dataManager 未加载，请检查 data-manager.js 文件');
            }
            this.dataManager = window.dataManager;
            console.log('✅ 数据管理器初始化完成');
        }

        /**
         * 新增：预加载核心数据
         */
        async _preloadData() {
            console.log('📥 开始预加载核心数据...');
            
            try {
                await this.dataManager.preloadCoreData();
                
                // 发布数据加载完成事件
                if (window.MLGUtils && window.MLGUtils.events) {
                    window.MLGUtils.events.emit('dataReady', {
                        resources: this.dataManager.resources.size,
                        learningPaths: this.dataManager.learningPaths.size
                    });
                }
                
                console.log('✅ 核心数据预加载完成');
                
            } catch (error) {
                console.error('❌ 数据预加载失败:', error);
                // 非致命错误，继续应用初始化
            }
        }

        /**
         * 初始化各个模块
         */
        async _initModules() {
            console.log('⚙️ 初始化应用模块...');

            // 初始化工具类
            if (window.MLGUtils) {
                try {
                    const utilsSuccess = window.MLGUtils.init();
                    if (utilsSuccess) {
                        console.log('✅ MLGUtils 初始化成功');
                    } else {
                        console.warn('⚠️ MLGUtils 初始化返回失败状态');
                    }
                } catch (error) {
                    console.warn('⚠️ MLGUtils 初始化有警告:', error.message);
                }
            } else {
                throw new Error('MLGUtils 未定义');
            }

            // 初始化配置
            if (window.MLGConfig) {
                try {
                    const configSuccess = window.MLGConfig.init();
                    if (configSuccess) {
                        console.log('✅ MLGConfig 初始化成功');
                    } else {
                        console.warn('⚠️ MLGConfig 初始化返回失败状态');
                    }
                } catch (error) {
                    console.warn('⚠️ MLGConfig 初始化有警告:', error.message);
                }
            } else {
                throw new Error('MLGConfig 未定义');
            }

            // 初始化主题系统
            this._initTheme();

            // 初始化移动端菜单
            this._initMobileMenu();

            console.log('✅ 所有模块初始化完成');
        }

        /**
         * 绑定全局事件
         */
        _bindGlobalEvents() {
            // 主题切换事件
            if (window.MLGUtils && window.MLGUtils.events) {
                window.MLGUtils.events.on('themeChange', (data) => {
                    this._onThemeChange(data.theme);
                });

                // 路由变更事件
                window.MLGUtils.events.on('routeChange', (data) => {
                    this._onRouteChange(data);
                });

                // 新增：数据就绪事件
                window.MLGUtils.events.on('dataReady', (data) => {
                    this._onDataReady(data);
                });
            }

            // 窗口调整大小事件
            window.addEventListener('resize', this._debounce(() => {
                this._onWindowResize();
            }, 250));
        }

        /**
         * 新增：数据就绪回调
         */
        _onDataReady(data) {
            console.log(`📊 核心数据加载完成: ${data.resources}个资源, ${data.learningPaths}个学习路径`);
            
            // 更新首页统计信息
            this._updateHomepageStats();
            
            // 如果当前在资源页面，刷新显示
            if (this.currentPage === 'resources') {
                this._refreshResourcesDisplay();
            }
        }

        /**
         * 新增：更新首页统计信息
         */
        _updateHomepageStats() {
            const statsElement = document.getElementById('homepage-stats');
            if (statsElement && this.dataManager) {
                const resourceCount = this.dataManager.resources.size;
                const pathCount = this.dataManager.learningPaths.size;
                
                statsElement.innerHTML = `
                    <div class="stat-item">
                        <div class="stat-number">${resourceCount}+</div>
                        <div class="stat-label">精选学习资源</div>
                    </div>
                    <div class="stat-item">
                        <div class="stat-number">${pathCount}</div>
                        <div class="stat-label">个性化学习路径</div>
                    </div>
                    <div class="stat-item">
                        <div class="stat-number">2</div>
                        <div class="stat-label">支持语言</div>
                    </div>
                `;
            }
        }

        /**
         * 新增：刷新资源显示
         */
        _refreshResourcesDisplay() {
            // 这里会在后续步骤中实现具体的资源渲染逻辑
            console.log('🔄 刷新资源显示 - 功能待实现');
        }

        /**
         * 初始化主题系统
         */
        _initTheme() {
            // 应用保存的主题
            const savedTheme = window.MLGUtils.storage.getItem('theme', 'light');
            window.MLGUtils.theme.applyTheme(savedTheme);

            // 绑定主题切换按钮
            const themeToggle = document.querySelector('.theme-toggle');
            if (themeToggle) {
                themeToggle.addEventListener('click', () => {
                    window.MLGUtils.theme.toggle();
                });
            }

            // 更新主题按钮图标
            this._updateThemeToggleIcon(savedTheme);
        }

        /**
         * 更新主题切换按钮图标
         */
        _updateThemeToggleIcon(theme) {
            const themeIcon = document.querySelector('.theme-icon');
            if (themeIcon) {
                themeIcon.textContent = theme === 'dark' ? '☀️' : '🌙';
            }
        }

        /**
         * 初始化移动端菜单
         */
        _initMobileMenu() {
            const menuToggle = document.querySelector('.mobile-menu-toggle');
            const mainNav = document.querySelector('.main-nav');

            if (menuToggle && mainNav) {
                menuToggle.addEventListener('click', () => {
                    const isExpanded = menuToggle.getAttribute('aria-expanded') === 'true';
                    menuToggle.setAttribute('aria-expanded', !isExpanded);
                    menuToggle.classList.toggle('active', !isExpanded);
                    mainNav.classList.toggle('active', !isExpanded);
                });
            }
        }

        /**
         * 主题变更回调
         */
        _onThemeChange(theme) {
            this._updateThemeToggleIcon(theme);
            
            // 保存主题偏好
            window.MLGUtils.storage.setItem('theme', theme);

            console.log(`🎨 主题已切换为: ${theme}`);
        }

        /**
         * 路由变更回调
         */
        _onRouteChange(data) {
            // 更新当前页面状态
            this.currentPage = data.to;

            // 滚动到顶部
            window.scrollTo({ top: 0, behavior: 'smooth' });

            console.log(`🧭 导航到: ${data.to}`);
        }

        /**
         * 窗口调整大小回调
         */
        _onWindowResize() {
            // 在移动端，当窗口调整大小超过移动端断点时，关闭移动菜单
            if (window.innerWidth > 768) {
                const mobileMenu = document.querySelector('.main-nav');
                const menuToggle = document.querySelector('.mobile-menu-toggle');
                
                if (mobileMenu && menuToggle) {
                    mobileMenu.classList.remove('active');
                    menuToggle.classList.remove('active');
                    menuToggle.setAttribute('aria-expanded', 'false');
                }
            }
        }

        /**
         * 显示加载指示器
         */
        _showLoadingIndicator() {
            const indicator = document.getElementById('loading-indicator');
            if (indicator) {
                indicator.classList.remove('hidden');
            }
        }

        /**
         * 隐藏加载指示器
         */
        _hideLoadingIndicator() {
            const indicator = document.getElementById('loading-indicator');
            if (indicator) {
                indicator.classList.add('hidden');
            }
        }

        /**
         * 显示致命错误
         */
        _showFatalError(error) {
            const appContainer = document.getElementById('main-content') || document.body;
            appContainer.innerHTML = `
                <div class="fatal-error">
                    <h1>应用加载失败</h1>
                    <p>抱歉，应用初始化过程中出现了严重错误。</p>
                    <p class="error-details">${error.message}</p>
                    <button class="btn btn-primary" onclick="window.location.reload()">
                        重新加载
                    </button>
                </div>
            `;
            
            // 隐藏加载指示器
            this._hideLoadingIndicator();
        }

        /**
         * 防抖函数
         */
        _debounce(func, wait) {
            let timeout;
            return function executedFunction(...args) {
                const later = () => {
                    clearTimeout(timeout);
                    func(...args);
                };
                clearTimeout(timeout);
                timeout = setTimeout(later, wait);
            };
        }
    }

    // 创建应用实例
    const app = new MedicalLearningGuide();

    // 暴露到全局作用域
    global.app = app;

    // 初始化应用
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            app.init();
        });
    } else {
        app.init();
    }
    
    console.log('✅ MedicalLearningGuide 加载完成');
    
})(window);