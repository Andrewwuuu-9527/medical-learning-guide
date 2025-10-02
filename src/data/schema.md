# 医学学习指南 - 数据结构规范

## 资源数据结构 (Resource)
```json
{
  "id": "string, 唯一标识符",
  "title": "string, 资源标题", 
  "description": "string, 资源描述",
  "url": "string, 资源链接",
  "category": "string, 主分类",
  "subcategory": "string, 子分类", 
  "difficulty": "enum: beginner, intermediate, advanced",
  "language": "enum: zh-CN, en-US, multilingual",
  "tags": "array, 标签列表",
  "rating": "number, 评分 0-5",
  "timeRequired": "string, 预计学习时间",
  "lastUpdated": "string, 最后更新日期",
  "author": "string, 作者/来源",
  "license": "string, 许可证类型",
  "featured": "boolean, 是否推荐资源",
  "prerequisites": "array, 先决条件资源ID列表"
}

{
  "id": "string, 路径ID",
  "name": "string, 路径名称",
  "description": "string, 路径描述", 
  "targetAudience": "array, 目标用户类型",
  "duration": "string, 预计完成时间",
  "stages": "array, 学习阶段列表",
  "resources": "array, 关联资源ID列表",
  "completionCriteria": "object, 完成标准"
}

{
  "userId": "string, 用户ID",
  "background": "enum: newbie, student, professional",
  "goals": "array, 学习目标",
  "currentLevel": "string, 当前水平",
  "timeCommitment": "enum: casual, regular, intensive", 
  "preferredLanguage": "enum: zh-CN, en-US",
  "completedResources": "array, 已完成资源ID列表",
  "savedResources": "array, 收藏资源ID列表"
}