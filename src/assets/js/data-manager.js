/**
 * 医学学习指南 - 数据管理器
 * 处理所有数据加载、缓存和检索操作
 * 作者: Medical Learning Guide Team
 * 版本: 2.0.1 - 修复路径配置问题
 * 修复说明: 将数据路径从 /src/data/ 改为 /data/ 以适配public目录
 */

(function(global) {
    'use strict';

    // 日志前缀，便于在控制台识别数据管理器相关日志
    const LOG_PREFIX = '📊 [数据管理器]';
    console.log(`${LOG_PREFIX} 开始加载数据管理器...`);

    /**
     * 医学学习指南数据管理器类
     * 负责所有数据操作，包括加载、缓存、检索和搜索
     */
    class MLGDataManager {
        
        /**
         * 构造函数 - 初始化数据管理器
         */
        constructor() {
            // 数据存储结构 - 使用Map提高检索性能
            this.resources = new Map();           // 存储所有学习资源，键为资源ID，值为资源对象
            this.learningPaths = new Map();       // 存储所有学习路径，键为路径ID，值为路径对象
            this.userProfiles = new Map();        // 存储用户画像数据，键为用户ID，值为用户配置
            
            // 状态管理 - 跟踪数据加载状态
            this.loadingStates = new Map();       // 跟踪正在加载的数据请求
            this.cache = new Map();               // 数据缓存，提高重复访问性能
            this.cacheTimeout = 5 * 60 * 1000;    // 缓存超时时间：5分钟（300000毫秒）
            
            console.log(`${LOG_PREFIX} 数据管理器初始化完成`);
        }

        // ==================== 公共方法 ====================

        /**
         * 异步加载指定类别的数据
         * @param {string} category - 数据类别名称
         * @param {boolean} forceReload - 是否强制重新加载（忽略缓存）
         * @returns {Promise<Object>} 加载的数据对象
         * @throws {Error} 当数据加载失败时抛出错误
         */
        async loadData(category, forceReload = false) {
            const cacheKey = `data_${category}`;
            
            // 第一步：检查缓存
            const cachedData = this._getFromCache(cacheKey);
            if (cachedData && !forceReload) {
                console.log(`${LOG_PREFIX} 从缓存加载数据: ${category}`);
                return cachedData;
            }

            // 第二步：检查是否正在加载
            if (this.loadingStates.has(cacheKey)) {
                console.log(`${LOG_PREFIX} 数据正在加载中: ${category}`);
                return this.loadingStates.get(cacheKey);
            }

            console.log(`${LOG_PREFIX} 开始加载数据: ${category}`);

            // 第三步：创建加载Promise
            const loadPromise = new Promise(async (resolve, reject) => {
                try {
                    let loadedData;
                    
                    // 根据数据类型选择不同的加载策略
                    if (category.startsWith('category_')) {
                        const categoryName = category.replace('category_', '');
                        loadedData = await this._loadCategoryData(categoryName);
                    } else {
                        loadedData = await this._loadGenericData(category);
                    }

                    // 处理加载完成的数据
                    await this._processLoadedData(category, loadedData);
                    
                    // 更新缓存
                    this._addToCache(cacheKey, loadedData);
                    
                    // 清理加载状态
                    this.loadingStates.delete(cacheKey);
                    
                    console.log(`${LOG_PREFIX} 数据加载成功: ${category}`);
                    resolve(loadedData);
                    
                } catch (error) {
                    console.error(`${LOG_PREFIX} 数据加载失败: ${category}`, error);
                    this.loadingStates.delete(cacheKey);
                    reject(error);
                }
            });

            // 记录加载状态
            this.loadingStates.set(cacheKey, loadPromise);
            return loadPromise;
        }

        /**
         * 根据分类获取学习资源
         * @param {string} category - 资源分类名称
         * @param {Object} filters - 过滤条件对象
         * @returns {Array<Object>} 过滤后的资源数组，按推荐度和评分排序
         */
        getResourcesByCategory(category, filters = {}) {
            const filteredResources = [];
            
            // 遍历所有资源，筛选匹配分类和过滤条件的资源
            for (const [resourceId, resource] of this.resources) {
                if (resource.category === category && this._matchesFilters(resource, filters)) {
                    filteredResources.push(resource);
                }
            }
            
            // 排序：推荐资源优先，然后按评分降序排列
            return filteredResources.sort((resourceA, resourceB) => {
                if (resourceA.featured && !resourceB.featured) return -1;
                if (!resourceA.featured && resourceB.featured) return 1;
                return resourceB.rating - resourceA.rating;
            });
        }

        /**
         * 根据资源ID获取特定资源
         * @param {string} resourceId - 资源唯一标识符
         * @returns {Object|null} 资源对象，如果未找到则返回null
         */
        getResourceById(resourceId) {
            return this.resources.get(resourceId) || null;
        }

        /**
         * 根据路径ID获取学习路径
         * @param {string} pathId - 学习路径唯一标识符
         * @returns {Object|null} 学习路径对象，如果未找到则返回null
         */
        getLearningPath(pathId) {
            return this.learningPaths.get(pathId) || null;
        }

        /**
         * 根据用户背景推荐学习路径
         * @param {string} userBackground - 用户背景（newbie/student/professional）
         * @returns {Array<Object>} 推荐的学习路径数组，按推荐度排序
         */
        getRecommendedPaths(userBackground) {
            const recommendedPaths = [];
            
            // 筛选适合用户背景的学习路径
            for (const [pathId, path] of this.learningPaths) {
                if (path.targetAudience.includes(userBackground)) {
                    recommendedPaths.push(path);
                }
            }
            
            // 根据推荐算法排序
            return recommendedPaths.sort((pathA, pathB) => {
                const scoreA = this._calculatePathScore(pathA, userBackground);
                const scoreB = this._calculatePathScore(pathB, userBackground);
                return scoreB - scoreA;
            });
        }

        /**
         * 搜索学习资源
         * @param {string} query - 搜索查询字符串
         * @param {Object} filters - 过滤条件对象
         * @returns {Array<Object>} 搜索结果数组，按相关度排序
         */
        searchResources(query, filters = {}) {
            const searchResults = [];
            const searchTerms = query.toLowerCase().split(' ');
            
            // 遍历所有资源进行搜索
            for (const [resourceId, resource] of this.resources) {
                if (this._matchesSearch(resource, searchTerms) && this._matchesFilters(resource, filters)) {
                    searchResults.push(resource);
                }
            }
            
            // 按评分降序排列
            return searchResults.sort((resourceA, resourceB) => resourceB.rating - resourceA.rating);
        }

        /**
         * 获取所有可用的资源分类
         * @returns {Array<string>} 分类名称数组
         */
        getCategories() {
            const categories = new Set();
            
            for (const [resourceId, resource] of this.resources) {
                categories.add(resource.category);
            }
            
            return Array.from(categories);
        }

        /**
         * 获取指定分类的所有子分类
         * @param {string} category - 主分类名称
         * @returns {Array<string>} 子分类名称数组
         */
        getSubcategories(category) {
            const subcategories = new Set();
            
            for (const [resourceId, resource] of this.resources) {
                if (resource.category === category && resource.subcategory) {
                    subcategories.add(resource.subcategory);
                }
            }
            
            return Array.from(subcategories);
        }

        /**
         * 预加载核心数据 - 应用启动时调用
         * @returns {Promise<void>}
         */
        async preloadCoreData() {
            // 预加载的核心数据类型
            const coreCategories = ['basic_sciences', 'usmle_prep'];
            
            const loadPromises = coreCategories.map(category => 
                this.loadData(`category_${category}`)
            );
            
            // 同时加载学习路径数据
            loadPromises.push(this.loadData('learning_paths'));
            
            try {
                await Promise.all(loadPromises);
                console.log(`${LOG_PREFIX} 核心数据预加载完成`);
            } catch (error) {
                console.error(`${LOG_PREFIX} 核心数据预加载失败:`, error);
                // 注意：这里不抛出错误，因为预加载失败不应阻止应用启动
            }
        }

        /**
         * 清除所有缓存数据
         */
        clearCache() {
            this.cache.clear();
            console.log(`${LOG_PREFIX} 数据缓存已清除`);
        }

        // ==================== 私有方法 ====================

        /**
         * 加载分类数据 - 使用正确的public目录路径
         * @private
         */
        async _loadCategoryData(categoryName) {
            // 重要：使用public目录的正确路径
            const dataUrl = `/data/categories/${categoryName}.json`;
            console.log(`${LOG_PREFIX} 加载分类数据URL: ${dataUrl}`);
            
            const response = await fetch(dataUrl);
            
            if (!response.ok) {
                throw new Error(`无法加载分类数据: ${categoryName}, 状态: ${response.status}`);
            }
            
            const data = await response.json();
            
            // 将资源存入资源映射表
            if (data.resources && Array.isArray(data.resources)) {
                data.resources.forEach(resource => {
                    this.resources.set(resource.id, resource);
                });
            }
            
            return data;
        }

        /**
         * 加载通用数据 - 使用正确的public目录路径
         * @private
         */
        async _loadGenericData(dataType) {
            const dataUrl = `/data/${dataType}.json`;
            console.log(`${LOG_PREFIX} 加载通用数据URL: ${dataUrl}`);
            
            const response = await fetch(dataUrl);
            
            if (!response.ok) {
                throw new Error(`无法加载数据: ${dataType}, 状态: ${response.status}`);
            }
            
            return await response.json();
        }

        /**
         * 处理已加载的数据
         * @private
         */
        async _processLoadedData(category, data) {
            switch (category) {
                case 'learning_paths':
                    this._processLearningPaths(data);
                    break;
                case 'user_profiles':
                    this._processUserProfiles(data);
                    break;
                // 分类数据已在_loadCategoryData中处理
            }
        }

        /**
         * 处理学习路径数据
         * @private
         */
        _processLearningPaths(data) {
            if (data.paths && Array.isArray(data.paths)) {
                data.paths.forEach(path => {
                    this.learningPaths.set(path.id, path);
                });
            }
        }

        /**
         * 处理用户画像数据
         * @private
         */
        _processUserProfiles(data) {
            if (data.profiles && Array.isArray(data.profiles)) {
                data.profiles.forEach(profile => {
                    this.userProfiles.set(profile.userId, profile);
                });
            }
        }

        /**
         * 计算学习路径推荐分数
         * @private
         */
        _calculatePathScore(path, userBackground) {
            let score = 0;
            
            // 目标用户匹配度加权
            if (path.targetAudience.includes(userBackground)) {
                score += 10;
            }
            
            // 路径时长权重（较短的路径得分更高）
            const duration = path.duration;
            if (duration.includes('月')) {
                const months = parseInt(duration);
                score += Math.max(0, 10 - months); // 每减少一个月加1分，最多加10分
            }
            
            return score;
        }

        /**
         * 检查资源是否匹配搜索条件
         * @private
         */
        _matchesSearch(resource, searchTerms) {
            // 构建可搜索的文本内容
            const searchableText = `
                ${resource.title} 
                ${resource.description}
                ${resource.tags.join(' ')}
                ${resource.author}
            `.toLowerCase();
            
            // 要求所有搜索词都匹配
            return searchTerms.every(term => searchableText.includes(term));
        }

        /**
         * 检查资源是否匹配过滤条件
         * @private
         */
        _matchesFilters(resource, filters) {
            return Object.entries(filters).every(([filterKey, filterValue]) => {
                if (filterValue === 'all' || filterValue === '') return true;
                
                switch (filterKey) {
                    case 'difficulty':
                        return resource.difficulty === filterValue;
                    case 'language':
                        return resource.language === filterValue;
                    case 'subcategory':
                        return resource.subcategory === filterValue;
                    case 'tags':
                        return resource.tags.includes(filterValue);
                    default:
                        return true; // 未知的过滤键默认通过
                }
            });
        }

        /**
         * 从缓存获取数据
         * @private
         */
        _getFromCache(cacheKey) {
            const cached = this.cache.get(cacheKey);
            
            if (cached && Date.now() - cached.timestamp < this.cacheTimeout) {
                return cached.data;
            }
            
            // 缓存过期或不存在，清理并返回null
            this.cache.delete(cacheKey);
            return null;
        }

        /**
         * 添加数据到缓存
         * @private
         */
        _addToCache(cacheKey, data) {
            this.cache.set(cacheKey, {
                data: data,
                timestamp: Date.now()
            });
        }
    }

    // 创建全局数据管理器实例
    const dataManager = new MLGDataManager();

    // 暴露到全局作用域，供其他模块使用
    global.dataManager = dataManager;

    console.log(`${LOG_PREFIX} 数据管理器加载完成`);
    
})(window);