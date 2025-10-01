/**
 * 医学学习指南 - 配置文件
 * 管理应用的全局配置和设置
 */

(function(global) {
    'use strict';
    
    console.log('🔧 开始加载 MLGConfig...');
    
    const MLGConfig = {
        // 应用基本信息
        app: {
            name: '医学学习指南与桥梁',
            version: '1.0.0',
            description: '为医学学习者提供的全面学习导航系统',
            repository: 'https://github.com/Andrewwuuu-9527/medical-learning-guide'
        },

        // API 端点配置
        api: {
            baseUrl: '/api',
            endpoints: {
                resources: '/resources',
                learningPaths: '/learning-paths',
                users: '/users',
                assessments: '/assessments'
            },
            timeout: 10000
        },

        // 路由配置
        routing: {
            defaultPage: 'home',
            pages: {
                home: {
                    id: 'home',
                    title: '首页 - 医学学习指南',
                    description: '医学学习指南与桥梁项目首页'
                },
                'learning-paths': {
                    id: 'learning-paths',
                    title: '学习路径 - 医学学习指南',
                    description: '个性化医学学习路径规划'
                },
                resources: {
                    id: 'resources',
                    title: '资源中心 - 医学学习指南',
                    description: '开源医学学习资源库'
                },
                'career-guide': {
                    id: 'career-guide',
                    title: '职业规划 - 医学学习指南',
                    description: '中美医学职业发展规划'
                },
                about: {
                    id: 'about',
                    title: '关于项目 - 医学学习指南',
                    description: '关于医学学习指南项目的信息'
                }
            }
        },

        // 主题配置
        theme: {
            availableThemes: ['light', 'dark'],
            defaultTheme: 'light',
            autoDetect: true
        },

        // 语言配置
        language: {
            default: 'zh-CN',
            supported: ['zh-CN', 'en-US'],
            resources: {
                'zh-CN': {
                    name: '简体中文',
                    flag: '🇨🇳'
                },
                'en-US': {
                    name: 'English',
                    flag: '🇺🇸'
                }
            }
        },

        // 学习路径配置
        learningPaths: {
            levels: {
                beginner: {
                    name: '医学小白',
                    description: '刚开始接触医学的学习者',
                    color: '#4CAF50'
                },
                student: {
                    name: '医学生',
                    description: '在校医学专业学生',
                    color: '#2196F3'
                },
                professional: {
                    name: '医学从业者',
                    description: '在职医疗专业人员',
                    color: '#FF9800'
                }
            },
            regions: {
                china: {
                    name: '中国',
                    systems: ['执业医师考试', '住院医师规范化培训']
                },
                usa: {
                    name: '美国',
                    systems: ['USMLE', 'Match', 'Residency']
                },
                international: {
                    name: '国际',
                    systems: ['WFME标准', '国际认证']
                }
            }
        },

        // 资源库配置
        resources: {
            categories: {
                textbooks: {
                    name: '教材与参考书',
                    icon: '📚'
                },
                videos: {
                    name: '视频课程',
                    icon: '🎥'
                },
                questions: {
                    name: '题库与模拟考试',
                    icon: '❓'
                },
                guidelines: {
                    name: '临床指南',
                    icon: '📋'
                },
                tools: {
                    name: '学习工具',
                    icon: '🛠️'
                }
            },
            // 开源资源许可
            licenses: [
                'CC-BY',
                'CC-BY-SA',
                'CC-BY-NC',
                'MIT',
                'Apache-2.0',
                'Public Domain'
            ]
        },

        // 缓存配置
        cache: {
            enabled: true,
            defaultTTL: 3600000, // 1小时
            strategies: {
                resources: 86400000, // 24小时
                userData: 1800000, // 30分钟
                navigation: 300000 // 5分钟
            }
        },

        // 性能配置
        performance: {
            enableMonitoring: true,
            logLevel: 'error',
            lazyLoad: {
                enabled: true,
                threshold: 0.1
            }
        },

        // 错误处理配置
        errorHandling: {
            showUserFriendlyErrors: true,
            logToConsole: true,
            maxRetries: 3
        },

        // 功能开关
        features: {
            darkMode: true,
            offlineSupport: false,
            progressTracking: true,
            socialSharing: true,
            analytics: false
        },

        /**
         * 获取配置值
         * @param {string} path - 配置路径，例如 'app.name'
         * @param {any} defaultValue - 默认值
         * @returns {any} 配置值
         */
        get(path, defaultValue = null) {
            return path.split('.').reduce((obj, key) => {
                return obj && obj[key] !== undefined ? obj[key] : defaultValue;
            }, this);
        },

        /**
         * 设置配置值
         * @param {string} path - 配置路径
         * @param {any} value - 配置值
         */
        set(path, value) {
            const keys = path.split('.');
            const lastKey = keys.pop();
            const target = keys.reduce((obj, key) => {
                if (!obj[key] || typeof obj[key] !== 'object') {
                    obj[key] = {};
                }
                return obj[key];
            }, this);

            target[lastKey] = value;
        },

        /**
         * 合并配置
         * @param {Object} newConfig - 新配置
         */
        merge(newConfig) {
            Object.assign(this, this._deepMerge(this, newConfig));
        },

        /**
         * 深度合并对象
         * @param {Object} target - 目标对象
         * @param {Object} source - 源对象
         * @returns {Object} 合并后的对象
         */
        _deepMerge(target, source) {
            const result = { ...target };
            
            for (const key in source) {
                if (source[key] instanceof Object && key in target) {
                    result[key] = this._deepMerge(target[key], source[key]);
                } else {
                    result[key] = source[key];
                }
            }
            
            return result;
        },

        /**
         * 初始化配置
         */
        init() {
            console.log('⚙️ 初始化 MLGConfig...');
            
            try {
                // 从localStorage加载用户配置
                const userConfig = MLGUtils.storage.getItem('user_config', {});
                this.merge(userConfig);

                // 设置环境变量
                const isDevelopment = window.location.hostname === 'localhost' || 
                                    window.location.hostname === '127.0.0.1';
                
                this.environment = isDevelopment ? 'development' : 'production';

                // 发布配置就绪事件
                MLGUtils.events.emit('configReady', this);

                if (this.environment === 'development') {
                    console.log('✅ MLGConfig 初始化完成', this);
                } else {
                    console.log('✅ MLGConfig 初始化完成');
                }
                
                return true;
            } catch (error) {
                console.error('❌ MLGConfig 初始化失败:', error);
                return false;
            }
        },

        /**
         * 保存用户配置
         */
        saveUserConfig() {
            const userConfig = {
                theme: this.theme,
                language: this.language,
                features: this.features
            };
            
            MLGUtils.storage.setItem('user_config', userConfig);
        }
    };

    // 暴露到全局作用域
    global.MLGConfig = MLGConfig;
    
    console.log('✅ MLGConfig 加载完成');
    
    // 自动初始化
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            MLGConfig.init();
        });
    } else {
        setTimeout(() => MLGConfig.init(), 0);
    }
    
})(window);