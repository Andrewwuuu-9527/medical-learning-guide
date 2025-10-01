/**
 * 医学学习指南 - 路由管理器
 * 处理页面导航和视图切换
 */

(function(global) {
    'use strict';
    
    console.log('🔧 开始加载 Router...');
    
    class Router {
        constructor() {
            this.routes = {};
            this.currentRoute = null;
            this.currentPage = null;
            
            console.log('🚀 路由系统初始化开始...');
            
            // 延迟初始化，确保DOM已加载
            if (document.readyState === 'loading') {
                document.addEventListener('DOMContentLoaded', () => {
                    this._init();
                });
            } else {
                setTimeout(() => this._init(), 0);
            }
            
            // 绑定事件
            this._bindEvents();
        }

        /**
         * 绑定路由相关事件
         */
        _bindEvents() {
            // 使用事件委托，避免在DOM加载完成前绑定事件
            document.addEventListener('click', (event) => {
                const link = event.target.closest('a[data-page]');
                if (link) {
                    event.preventDefault();
                    const pageId = link.getAttribute('data-page');
                    console.log('🔗 导航点击:', pageId);
                    this.navigate(pageId);
                }
            });

            // 监听浏览器前进后退
            window.addEventListener('popstate', (event) => {
                console.log('🔙 浏览器导航事件');
                this._handlePopState(event);
            });

            // 绑定首页按钮
            document.addEventListener('click', (event) => {
                if (event.target.matches('[data-action="start-learning"], [data-action="explore-paths"]')) {
                    event.preventDefault();
                    this.navigate('learning-paths');
                }
            });

            // 绑定功能卡片点击
            document.addEventListener('click', (event) => {
                const featureCard = event.target.closest('.feature-card');
                if (featureCard) {
                    const feature = featureCard.getAttribute('data-feature');
                    if (feature) {
                        event.preventDefault();
                        this.navigate(feature);
                    }
                }
            });
        }

        /**
         * 初始化路由
         */
        _init() {
            try {
                // 注册所有路由
                this._registerRoutes();
                
                // 获取初始路由
                const initialRoute = this._getCurrentRoute();
                console.log('📝 初始路由:', initialRoute);
                
                // 加载初始路由
                this._loadRoute(initialRoute);
                
                console.log('✅ 路由系统初始化完成');
            } catch (error) {
                console.error('❌ 路由系统初始化失败:', error);
                this._showErrorPage(error);
            }
        }

        /**
         * 注册应用路由
         */
        _registerRoutes() {
            // 安全检查
            if (!window.MLGConfig || !window.MLGConfig.routing || !window.MLGConfig.routing.pages) {
                console.warn('⚠️ MLGConfig 路由配置未找到，使用默认配置');
                this.routes = {
                    'home': {
                        id: 'home',
                        title: '首页 - 医学学习指南',
                        description: '医学学习指南与桥梁项目首页',
                        loadContent: () => this._getDefaultContent()
                    },
                    'learning-paths': {
                        id: 'learning-paths', 
                        title: '学习路径 - 医学学习指南',
                        description: '个性化医学学习路径规划',
                        loadContent: () => this._getLearningPathsContent()
                    },
                    'resources': {
                        id: 'resources',
                        title: '资源中心 - 医学学习指南', 
                        description: '开源医学学习资源库',
                        loadContent: () => this._getResourcesContent()
                    },
                    'career-guide': {
                        id: 'career-guide',
                        title: '职业规划 - 医学学习指南',
                        description: '中美医学职业发展规划',
                        loadContent: () => this._getCareerGuideContent()
                    },
                    'about': {
                        id: 'about',
                        title: '关于项目 - 医学学习指南',
                        description: '关于医学学习指南项目的信息',
                        loadContent: () => this._getAboutContent()
                    }
                };
                return;
            }

            // 使用MLGConfig中的路由配置
            Object.entries(window.MLGConfig.routing.pages).forEach(([pageId, pageConfig]) => {
                this.routes[pageId] = {
                    id: pageId,
                    title: pageConfig.title,
                    description: pageConfig.description,
                    loadContent: this._getPageLoader(pageId)
                };
            });
        }

        /**
         * 获取页面内容加载器
         */
        _getPageLoader(pageId) {
            return async () => {
                // 这里可以动态加载页面内容
                // 目前我们使用内置的页面结构
                return this._getPageContent(pageId);
            };
        }

        /**
         * 获取页面内容
         */
        _getPageContent(pageId) {
            const pageTemplates = {
                'learning-paths': this._getLearningPathsContent(),
                'resources': this._getResourcesContent(),
                'career-guide': this._getCareerGuideContent(),
                'about': this._getAboutContent()
            };

            return pageTemplates[pageId] || this._getDefaultContent();
        }

        /**
         * 获取学习路径页面内容
         */
        _getLearningPathsContent() {
            return `
                <div class="page-header">
                    <div class="container">
                        <h1>个性化学习路径</h1>
                        <p class="page-subtitle">根据您的背景和目标定制专属学习路线</p>
                    </div>
                </div>
                
                <section class="paths-section">
                    <div class="container">
                        <div class="user-selection">
                            <h2>选择您的学习阶段</h2>
                            <div class="selection-grid">
                                <div class="selection-card" data-level="beginner">
                                    <div class="selection-icon">🎓</div>
                                    <h3>医学小白</h3>
                                    <p>刚开始接触医学的学习者</p>
                                </div>
                                <div class="selection-card" data-level="student">
                                    <div class="selection-icon">👨‍⚕️</div>
                                    <h3>医学生</h3>
                                    <p>在校医学专业学生</p>
                                </div>
                                <div class="selection-card" data-level="professional">
                                    <div class="selection-icon">🏥</div>
                                    <h3>医学从业者</h3>
                                    <p>在职医疗专业人员</p>
                                </div>
                            </div>
                        </div>

                        <div class="paths-container hidden">
                            <div class="path-display">
                                <!-- 动态内容将在这里显示 -->
                            </div>
                        </div>
                    </div>
                </section>
            `;
        }

        /**
         * 获取资源中心页面内容
         */
        _getResourcesContent() {
            return `
                <div class="page-header">
                    <div class="container">
                        <h1>开源资源库</h1>
                        <p class="page-subtitle">精选高质量开源医学学习资源</p>
                    </div>
                </div>
                
                <section class="resources-section">
                    <div class="container">
                        <div class="resources-filters">
                            <div class="filter-group">
                                <label>资源类型:</label>
                                <select id="resource-type">
                                    <option value="all">全部</option>
                                    <option value="textbooks">教材与参考书</option>
                                    <option value="videos">视频课程</option>
                                    <option value="questions">题库与模拟考试</option>
                                    <option value="guidelines">临床指南</option>
                                    <option value="tools">学习工具</option>
                                </select>
                            </div>
                            <div class="filter-group">
                                <label>适用对象:</label>
                                <select id="resource-audience">
                                    <option value="all">全部</option>
                                    <option value="beginner">医学小白</option>
                                    <option value="student">医学生</option>
                                    <option value="professional">从业者</option>
                                </select>
                            </div>
                        </div>

                        <div class="resources-grid">
                            <div class="resource-card">
                                <div class="resource-icon">📚</div>
                                <h3>OpenStax 医学教材</h3>
                                <p>免费的大学级医学教科书</p>
                                <div class="resource-meta">
                                    <span class="resource-type">教材</span>
                                    <span class="resource-level">初学者</span>
                                </div>
                                <a href="#" class="resource-link">查看资源</a>
                            </div>
                            
                            <div class="resource-card">
                                <div class="resource-icon">🎥</div>
                                <h3>医学视频课程</h3>
                                <p>来自全球顶尖医学院的公开课</p>
                                <div class="resource-meta">
                                    <span class="resource-type">视频</span>
                                    <span class="resource-level">所有级别</span>
                                </div>
                                <a href="#" class="resource-link">查看资源</a>
                            </div>
                            
                            <div class="resource-card">
                                <div class="resource-icon">❓</div>
                                <h3>USMLE 题库</h3>
                                <p>美国医师执照考试练习题</p>
                                <div class="resource-meta">
                                    <span class="resource-type">题库</span>
                                    <span class="resource-level">进阶</span>
                                </div>
                                <a href="#" class="resource-link">查看资源</a>
                            </div>
                        </div>
                    </div>
                </section>
            `;
        }

        /**
         * 获取职业规划页面内容
         */
        _getCareerGuideContent() {
            return `
                <div class="page-header">
                    <div class="container">
                        <h1>职业发展规划</h1>
                        <p class="page-subtitle">中美医学职业路径详解与规划</p>
                    </div>
                </div>
                
                <section class="career-section">
                    <div class="container">
                        <div class="career-tabs">
                            <button class="tab-button active" data-tab="china">中国路径</button>
                            <button class="tab-button" data-tab="usa">美国路径</button>
                            <button class="tab-button" data-tab="international">国际认证</button>
                        </div>

                        <div class="tab-content">
                            <div class="tab-pane active" id="china-tab">
                                <h3>中国医学职业发展路径</h3>
                                <div class="career-path">
                                    <div class="path-step">
                                        <div class="step-number">1</div>
                                        <div class="step-content">
                                            <h4>医学本科教育 (5-8年)</h4>
                                            <p>完成基础医学教育和临床实习</p>
                                        </div>
                                    </div>
                                    <div class="path-step">
                                        <div class="step-number">2</div>
                                        <div class="step-content">
                                            <h4>执业医师资格考试</h4>
                                            <p>通过国家统一的医师资格考试</p>
                                        </div>
                                    </div>
                                    <div class="path-step">
                                        <div class="step-number">3</div>
                                        <div class="step-content">
                                            <h4>住院医师规范化培训 (3年)</h4>
                                            <p>完成指定专业的住院医师培训</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>
            `;
        }

        /**
         * 获取关于页面内容
         */
        _getAboutContent() {
            return `
                <div class="page-header">
                    <div class="container">
                        <h1>关于项目</h1>
                        <p class="page-subtitle">医学学习指南与桥梁项目信息</p>
                    </div>
                </div>
                
                <section class="about-section">
                    <div class="container">
                        <div class="about-content">
                            <h2>项目愿景</h2>
                            <p>构建一个连接全球医学学习者的开放平台，提供系统化的学习指导和资源支持。</p>
                            
                            <h3>核心价值</h3>
                            <div class="values-grid">
                                <div class="value-item">
                                    <h4>🎯 精准导航</h4>
                                    <p>为不同背景的学习者提供个性化学习路径</p>
                                </div>
                                <div class="value-item">
                                    <h4>🌍 全球视野</h4>
                                    <p>整合中美医学教育体系的优势资源</p>
                                </div>
                                <div class="value-item">
                                    <h4>📚 开放共享</h4>
                                    <p>聚合高质量的开源医学学习资源</p>
                                </div>
                            </div>

                            <h3>技术架构</h3>
                            <p>基于现代Web技术构建，支持响应式设计和无障碍访问。</p>
                            
                            <div class="tech-stack">
                                <span class="tech-tag">HTML5</span>
                                <span class="tech-tag">CSS3</span>
                                <span class="tech-tag">JavaScript</span>
                                <span class="tech-tag">GitHub Pages</span>
                            </div>
                        </div>
                    </div>
                </section>
            `;
        }

        /**
         * 获取默认页面内容
         */
        _getDefaultContent() {
            return `
                <div class="container">
                    <h1>页面开发中</h1>
                    <p>该页面正在积极开发中，敬请期待...</p>
                </div>
            `;
        }

        /**
         * 获取当前路由
         */
        _getCurrentRoute() {
            const hash = window.location.hash.substring(1);
            return hash || 'home';
        }

        /**
         * 处理浏览器前进后退
         */
        _handlePopState(event) {
            const route = this._getCurrentRoute();
            this._loadRoute(route, false);
        }

        /**
         * 导航到指定页面
         */
        navigate(route, updateHistory = true) {
            if (route === this.currentRoute) {
                return;
            }

            if (updateHistory) {
                window.history.pushState({}, '', `#${route}`);
            }

            this._loadRoute(route);
        }

        /**
         * 加载路由对应的页面
         */
        async _loadRoute(route) {
            // 显示加载指示器
            const loadingIndicator = document.getElementById('loading-indicator');
            if (loadingIndicator) {
                loadingIndicator.classList.remove('hidden');
            }

            try {
                // 获取路由配置
                const routeConfig = this.routes[route] || this.routes['home'];
                
                if (!routeConfig) {
                    throw new Error(`路由 ${route} 未注册`);
                }

                // 更新当前路由
                this.currentRoute = route;

                // 更新页面标题
                document.title = routeConfig.title;

                // 加载页面内容
                await this._renderPage(route, routeConfig);

                // 更新导航状态
                this._updateNavigationState(route);

                // 发布路由变更事件
                if (window.MLGUtils && window.MLGUtils.events) {
                    window.MLGUtils.events.emit('routeChange', { 
                        from: this.currentPage, 
                        to: route,
                        routeConfig 
                    });
                }

                this.currentPage = route;

            } catch (error) {
                console.error('加载路由失败:', error);
                this._showErrorPage(error);
            } finally {
                // 隐藏加载指示器
                const loadingIndicator = document.getElementById('loading-indicator');
                if (loadingIndicator) {
                    loadingIndicator.classList.add('hidden');
                }
            }
        }

        /**
         * 渲染页面内容
         */
        async _renderPage(route, routeConfig) {
            const pageContainer = document.getElementById('page-container');
            if (!pageContainer) {
                throw new Error('页面容器未找到');
            }

            // 隐藏所有页面
            const pages = document.querySelectorAll('.page');
            pages.forEach(page => {
                page.classList.remove('active');
            });

            // 查找或创建目标页面
            let pageElement = document.getElementById(`${route}-page`);
            if (!pageElement) {
                pageElement = await this._createPageElement(route, routeConfig);
                pageContainer.appendChild(pageElement);
            }

            // 显示目标页面
            pageElement.classList.add('active');
        }

        /**
         * 创建页面元素
         */
        async _createPageElement(route, routeConfig) {
            const pageElement = document.createElement('section');
            pageElement.id = `${route}-page`;
            pageElement.className = 'page';
            pageElement.setAttribute('data-page', route);

            const content = await routeConfig.loadContent();
            pageElement.innerHTML = content;

            return pageElement;
        }

        /**
         * 更新导航状态
         */
        _updateNavigationState(route) {
            // 更新导航链接激活状态
            const navLinks = document.querySelectorAll('.nav-link');
            navLinks.forEach(link => {
                const isActive = link.getAttribute('data-page') === route;
                link.classList.toggle('active', isActive);
            });

            // 更新移动端菜单状态
            const mobileMenu = document.querySelector('.main-nav');
            if (window.innerWidth <= 768) {
                mobileMenu.classList.remove('active');
            }
        }

        /**
         * 显示错误页面
         */
        _showErrorPage(error) {
            const pageContainer = document.getElementById('page-container');
            if (!pageContainer) return;

            pageContainer.innerHTML = `
                <section class="page active">
                    <div class="container">
                        <div class="error-content">
                            <h1>页面加载失败</h1>
                            <p>抱歉，加载请求的页面时出现了错误。</p>
                            <p class="error-details">${error.message}</p>
                            <button class="btn btn-primary" onclick="router.navigate('home')">
                                返回首页
                            </button>
                        </div>
                    </div>
                </section>
            `;
        }
    }

    // 创建路由实例
    const router = new Router();

    // 暴露到全局作用域
    global.router = router;
    
    console.log('✅ Router 加载完成');
    
})(window);