/**
 * 路径验证脚本 - 检查所有关键文件路径
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 开始路径验证...');
console.log(`📁 当前工作目录: ${process.cwd()}`);

// 检查关键文件
const criticalFiles = [
    'src/pages/index.html',
    'public/data/categories/basic_sciences.json',
    'public/data/categories/usmle_prep.json',
    'public/data/learning_paths.json',
    'src/assets/js/utils.js',
    'src/assets/js/config.js',
    'src/assets/js/data-manager.js',
    'src/assets/js/router.js',
    'src/assets/js/main.js'
];

console.log('\n📁 关键文件路径检查:');
criticalFiles.forEach(file => {
    const fullPath = path.join(process.cwd(), file);
    const exists = fs.existsSync(fullPath);
    console.log(`   ${exists ? '✅' : '❌'} ${file}`);
    console.log(`      完整路径: ${fullPath}`);
    
    if (exists && file.endsWith('.json')) {
        try {
            const content = fs.readFileSync(fullPath, 'utf8');
            JSON.parse(content);
            console.log(`      ✅ JSON格式正确`);
        } catch (error) {
            console.log(`      ❌ JSON格式错误: ${error.message}`);
        }
    }
});

// 检查目录结构
console.log('\n📂 目录结构检查:');
const directories = [
    'public',
    'public/data', 
    'public/data/categories',
    'src',
    'src/pages',
    'src/assets',
    'src/assets/js'
];

directories.forEach(dir => {
    const fullPath = path.join(process.cwd(), dir);
    const exists = fs.existsSync(fullPath);
    console.log(`   ${exists ? '✅' : '❌'} ${dir}`);
    if (exists) {
        const files = fs.readdirSync(fullPath);
        console.log(`      包含文件: ${files.slice(0, 5).join(', ')}${files.length > 5 ? '...' : ''}`);
    }
});

console.log('\n🎯 路径验证完成');