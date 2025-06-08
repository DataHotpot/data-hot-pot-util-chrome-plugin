# JavaScript 模块化重构说明

## 项目结构

```
js/
├── modules/                    # 模块化后的JS文件
│   ├── core.js                # 核心功能模块
│   ├── storage.js             # 数据持久化模块
│   ├── json-tools.js          # JSON工具模块
│   ├── base64-tools.js        # Base64工具模块
│   ├── time-tools.js          # 时间转换工具模块
│   ├── cron-tools.js          # Cron表达式工具模块
│   ├── go-tools.js            # Go语言工具模块
│   ├── java-tools.js          # Java语言工具模块
│   ├── main.js                # 主入口文件
│   └── README.md              # 本说明文档
└── popup.js                   # 原始文件（已被模块化替代）
```

## 模块功能说明

### 1. core.js - 核心功能模块
- **功能**: 工具切换、通知系统、工具组展开/折叠
- **主要函数**:
  - `initCore()` - 初始化核心功能
  - `showNotification(message, type)` - 显示通知
  - `initToolGroups()` - 初始化工具组
  - `initToolSwitcher()` - 初始化工具切换

### 2. storage.js - 数据持久化模块
- **功能**: 本地存储、状态恢复、数据持久化
- **主要函数**:
  - `initPersistence()` - 初始化持久化功能
  - `saveToStorage(key, value)` - 保存数据
  - `loadFromStorage(key, defaultValue)` - 读取数据
  - `restoreAllStates()` - 恢复所有状态

### 3. json-tools.js - JSON工具模块
- **功能**: JSON格式化、压缩、验证、对比、树形视图
- **主要函数**:
  - `initJsonTools()` - 初始化JSON工具
  - `updateJsonTree(json)` - 更新树形视图
  - `compareJson(original, target)` - JSON对比
  - `highlightJsonError(error)` - 错误高亮

### 4. base64-tools.js - Base64工具模块
- **功能**: Base64编码、解码
- **主要函数**:
  - `initBase64Tools()` - 初始化Base64工具

### 5. time-tools.js - 时间转换工具模块
- **功能**: 时间戳转换、时区处理、格式化
- **主要函数**:
  - `initTimeTools()` - 初始化时间工具
  - `updateAllTimes(source)` - 更新所有时间显示
  - `updateTimestampUnit(isMilliseconds)` - 更新时间戳单位

### 6. cron-tools.js - Cron表达式工具模块
- **功能**: Cron表达式解析、下次执行时间计算
- **主要函数**:
  - `initCronTools()` - 初始化Cron工具
  - `parseCronExpression(cronExp)` - 解析Cron表达式
  - `getNextExecutionTimes(cronExp, count)` - 计算执行时间

### 7. go-tools.js - Go语言工具模块
- **功能**: JSON转Struct、时间格式化、错误处理、接口生成
- **主要函数**:
  - `initGoTools()` - 初始化Go工具
  - `convertJsonToStruct(json, structName)` - JSON转Struct
  - `generateErrorHandler()` - 生成错误处理代码
  - `generateInterface()` - 生成接口代码

### 8. java-tools.js - Java语言工具模块
- **功能**: JSON转JavaBean、Builder生成、Lombok注解、Stream示例
- **主要函数**:
  - `initJavaTools()` - 初始化Java工具
  - `convertJsonToJavaBean(json, className)` - JSON转JavaBean
  - `generateBuilderCode()` - 生成Builder代码
  - `addLombokAnnotations()` - 添加Lombok注解

### 9. main.js - 主入口文件
- **功能**: 统一初始化所有模块
- **初始化顺序**:
  1. 核心功能
  2. 数据持久化
  3. 各工具模块
  4. 首次使用帮助

## 模块间依赖关系

```
main.js
├── core.js (核心功能)
├── storage.js (数据持久化)
├── json-tools.js (依赖 core.showNotification)
├── base64-tools.js (依赖 core.showNotification)
├── time-tools.js (依赖 core.showNotification)
├── cron-tools.js (依赖 core.showNotification)
├── go-tools.js (依赖 core.showNotification)
└── java-tools.js (依赖 core.showNotification)
```

## 重构优势

1. **模块化**: 每个功能独立成模块，便于维护和测试
2. **可读性**: 代码结构清晰，功能职责明确
3. **可扩展性**: 新增功能只需添加对应模块
4. **可维护性**: 修改某个功能不影响其他模块
5. **代码复用**: 公共功能可在多个模块间复用

## 使用说明

1. **添加新功能**: 在`modules/`目录下创建新的模块文件
2. **修改现有功能**: 直接编辑对应的模块文件
3. **引入新模块**: 在`popup.html`和`main.js`中添加对应引用
4. **依赖管理**: 确保模块间的依赖关系正确

## 注意事项

1. 模块加载顺序很重要，`main.js`必须最后加载
2. 所有工具模块都依赖`core.js`中的`showNotification`函数
3. 数据持久化模块`storage.js`需要在其他工具模块之前初始化
4. 修改模块时要注意全局函数的命名冲突问题 