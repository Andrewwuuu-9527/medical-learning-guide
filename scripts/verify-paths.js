/**
 * 路径验证工具 - 验证静态资源路径映射
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 验证静态资源路径映射...\n');

const projectRoot = process.cwd();

// 测试路径映射
const testMappings = [
    {
        url: '/assets/css/main.css',
        expected: 'src/assets/css/main.css',
        description: 'CSS文件路径映射'
    },
    {
        url: '/assets/js/main.js', 
        expected: 'src/assets/js/main.js',
        description: 'JS文件路径映射'
    },
    {
        url: '/data/categories/basic_sciences.json',
        expected: 'public/data/categories/basic_sciences.json', 
        description: '数据文件路径映射'
    },
    {
        url: '/',
        expected: 'src/pages/index.html',
        description: '根路径映射'
    }
];

console.log('📋 测试路径映射:');
testMappings.forEach(test => {
    const fullExpectedPath = path.join(projectRoot, test.expected);
    const exists = fs.existsSync(fullExpectedPath);
    
    console.log(`\n   ${exists ? '✅' : '❌'} ${test.description}`);
    console.log(`      URL: ${test.url}`);
    console.log(`      预期文件: ${test.expected}`);
    console.log(`      文件存在: ${exists ? '是' : '否'}`);
    
    if (!exists) {
        console.log(`      🚨 问题: 文件不存在，请创建: ${fullExpectedPath}`);
    }
});

// 检查项目结构
console.log('\n📁 检查项目结构:');
const criticalDirs = [
    'src/assets/css',
    'src/assets/js',
    'src/pages', 
    'public/data/categories'
];

criticalDirs.forEach(dir => {
    const fullPath = path.join(projectRoot, dir);
    const exists = fs.existsSync(fullPath);
    console.log(`   ${exists ? '✅' : '❌'} ${dir}`);
});

console.log('\n💡 验证完成！如果显示❌，请检查相应文件或目录是否存在。');