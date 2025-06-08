// ==================== Go工具模块 ====================

// Go工具相关元素
let goJsonInput, goStructOutput, goStructTags, usePointer;
let goTimeFormat, goErrorInput, goErrorOutput, errorHandleType;
let goStructInput, goInterfaceOutput, includeComments;

// 初始化Go工具
function initGoTools() {
    // 获取DOM元素
    goJsonInput = document.getElementById('goJsonInput');
    goStructOutput = document.getElementById('goStructOutput');
    goStructTags = document.getElementById('goStructTags');
    usePointer = document.getElementById('usePointer');
    goTimeFormat = document.getElementById('goTimeFormat');
    goErrorInput = document.getElementById('goErrorInput');
    goErrorOutput = document.getElementById('goErrorOutput');
    errorHandleType = document.getElementById('errorHandleType');
    goStructInput = document.getElementById('goStructInput');
    goInterfaceOutput = document.getElementById('goInterfaceOutput');
    includeComments = document.getElementById('includeComments');

    // JSON转Struct功能
    const convertBtn = document.getElementById('convertToStruct');
    if (convertBtn) {
        convertBtn.addEventListener('click', () => {
            try {
                if (!goJsonInput || !goStructOutput) return;
                const json = goJsonInput.value.trim();
                const structName = 'Response';
                const result = convertJsonToStruct(json, structName);
                goStructOutput.value = result;
                if (typeof showNotification === 'function') {
                    showNotification('Struct转换成功', 'success');
                }
            } catch (e) {
                if (typeof showNotification === 'function') {
                    showNotification('转换失败：' + e.message, 'error');
                }
            }
        });
    }

    // 时间格式化功能
    if (goTimeFormat) {
        goTimeFormat.addEventListener('change', updateGoTimeFormat);
    }

    // 错误处理功能
    const generateErrorBtn = document.getElementById('generateError');
    if (generateErrorBtn) {
        generateErrorBtn.addEventListener('click', generateErrorHandler);
    }

    // 接口生成功能
    const generateInterfaceBtn = document.getElementById('generateInterface');
    if (generateInterfaceBtn) {
        generateInterfaceBtn.addEventListener('click', generateInterface);
    }

    // 初始化时间格式化
    updateGoTimeFormat();
}

// JSON转Struct功能
function convertJsonToStruct(json, structName = 'Response') {
    try {
        const data = JSON.parse(json);
        const usePointerVal = usePointer ? usePointer.checked : false;
        const tags = goStructTags ? goStructTags.value : 'json';
        let structs = new Map();

        function capitalizeFirstLetter(string) {
            return string.charAt(0).toUpperCase() + string.slice(1);
        }

        function formatFieldName(name) {
            const goKeywords = ['break', 'default', 'func', 'interface', 'select',
                'case', 'defer', 'go', 'map', 'struct',
                'chan', 'else', 'goto', 'package', 'switch',
                'const', 'fallthrough', 'if', 'range', 'type',
                'continue', 'for', 'import', 'return', 'var'];

            let fieldName = name
                .replace(/[^a-zA-Z0-9_]/g, '_')
                .split('_')
                .map(part => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
                .join('');

            if (/^[0-9]/.test(fieldName)) {
                fieldName = '_' + fieldName;
            }

            if (goKeywords.includes(fieldName.toLowerCase())) {
                fieldName = '_' + fieldName;
            }

            return fieldName;
        }

        function getGoType(value, fieldName) {
            if (value === null) return 'interface{}';
            switch (typeof value) {
                case 'string': return 'string';
                case 'number':
                    if (Number.isInteger(value)) {
                        if (value > 2147483647 || value < -2147483648) {
                            return 'int64';
                        }
                        return 'int';
                    }
                    return 'float64';
                case 'boolean': return 'bool';
                case 'object':
                    if (Array.isArray(value)) {
                        const itemType = value.length > 0 
                            ? getGoType(value[0], capitalizeFirstLetter(fieldName)) 
                            : 'interface{}';
                        return `[]${itemType}`;
                    }
                    const structType = capitalizeFirstLetter(fieldName);
                    createStruct(value, structType);
                    return structType;
                default: return 'interface{}';
            }
        }

        function createStruct(obj, structName) {
            if (structs.has(structName)) return;

            const fields = [];
            Object.entries(obj).forEach(([key, value]) => {
                const fieldName = formatFieldName(key);
                let fieldType = getGoType(value, fieldName);
                
                if (usePointerVal && fieldType !== 'interface{}' && !fieldType.startsWith('[]')) {
                    fieldType = '*' + fieldType;
                }

                const tagValue = tags.includes(',') ? tags : `${tags}:"${key}"`;
                const field = `    ${fieldName} ${fieldType} \`${tagValue}\``;
                fields.push(field);
            });

            const structCode = `type ${structName} struct {\n${fields.join('\n')}\n}`;
            structs.set(structName, structCode);
        }

        createStruct(data, structName);

        return Array.from(structs.values()).join('\n\n');
    } catch (e) {
        throw new Error('JSON格式错误：' + e.message);
    }
}

// 更新Go时间格式化
function updateGoTimeFormat() {
    if (!goTimeFormat) return;
    
    const format = goTimeFormat.value;
    const now = new Date();
    let example = '';

    switch (format) {
        case '2006-01-02 15:04:05':
            example = now.toISOString().slice(0, 19).replace('T', ' ');
            break;
        case '2006-01-02':
            example = now.toISOString().slice(0, 10);
            break;
        case '15:04:05':
            example = now.toTimeString().slice(0, 8);
            break;
        case 'RFC3339':
            example = now.toISOString();
            break;
        default:
            example = '自定义格式';
    }

    const output = document.getElementById('goTimeOutput');
    if (output) {
        output.value = `// Go时间格式化示例\npackage main\n\nimport (\n    "fmt"\n    "time"\n)\n\nfunc main() {\n    now := time.Now()\n    formatted := now.Format("${format}")\n    fmt.Println(formatted) // 输出: ${example}\n}`;
    }
}

// 生成错误处理代码
function generateErrorHandler() {
    if (!goErrorInput || !goErrorOutput || !errorHandleType) return;
    
    const functionName = goErrorInput.value.trim() || 'doSomething';
    const handleType = errorHandleType.value;
    
    let code = '';
    
    switch (handleType) {
        case 'return':
            code = `func ${functionName}() error {
    // 业务逻辑
    if err := someOperation(); err != nil {
        return fmt.Errorf("操作失败: %w", err)
    }
    return nil
}`;
            break;
        case 'log':
            code = `func ${functionName}() {
    if err := someOperation(); err != nil {
        log.Printf("错误: %v", err)
        return
    }
    // 继续处理
}`;
            break;
        case 'panic':
            code = `func ${functionName}() {
    if err := someOperation(); err != nil {
        panic(fmt.Sprintf("严重错误: %v", err))
    }
    // 继续处理
}`;
            break;
    }

    goErrorOutput.value = code;
}

// 生成接口代码
function generateInterface() {
    if (!goStructInput || !goInterfaceOutput) return;
    
    const structCode = goStructInput.value.trim();
    const includeCommentsVal = includeComments ? includeComments.checked : false;
    
    // 简单的结构体解析
    const structMatches = structCode.match(/type\s+(\w+)\s+struct/g);
    if (!structMatches) {
        if (typeof showNotification === 'function') {
            showNotification('请输入有效的Go结构体代码', 'error');
        }
        return;
    }

    const structName = structMatches[0].match(/type\s+(\w+)\s+struct/)[1];
    const interfaceName = structName + 'Interface';
    
    let interfaceCode = '';
    if (includeCommentsVal) {
        interfaceCode += `// ${interfaceName} 定义了${structName}的行为接口\n`;
    }
    
    interfaceCode += `type ${interfaceName} interface {\n`;
    interfaceCode += `    // Get${structName} 获取${structName}实例\n`;
    interfaceCode += `    Get${structName}() *${structName}\n`;
    interfaceCode += `    // Set${structName} 设置${structName}实例\n`;
    interfaceCode += `    Set${structName}(*${structName})\n`;
    interfaceCode += `    // Validate 验证数据有效性\n`;
    interfaceCode += `    Validate() error\n`;
    interfaceCode += `}`;

    goInterfaceOutput.value = interfaceCode;
} 