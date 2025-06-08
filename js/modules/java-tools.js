// ==================== Java工具模块 ====================

// Java工具相关元素
let javaJsonInput, javaBeanOutput, javaBeanOptions, generateComments;
let javaClassInput, javaBuilderOutput, builderInnerClass, builderFluentStyle;
let javaLombokInput, javaLombokOutput, streamExampleType;

// 初始化Java工具
function initJavaTools() {
    // 获取DOM元素
    javaJsonInput = document.getElementById('javaJsonInput');
    javaBeanOutput = document.getElementById('javaBeanOutput');
    javaBeanOptions = document.getElementById('javaBeanOptions');
    generateComments = document.getElementById('generateComments');
    javaClassInput = document.getElementById('javaClassInput');
    javaBuilderOutput = document.getElementById('javaBuilderOutput');
    builderInnerClass = document.getElementById('builderInnerClass');
    builderFluentStyle = document.getElementById('builderFluentStyle');
    javaLombokInput = document.getElementById('javaLombokInput');
    javaLombokOutput = document.getElementById('javaLombokOutput');
    streamExampleType = document.getElementById('streamExampleType');

    // JSON转JavaBean功能
    const convertJavaBeanBtn = document.getElementById('convertJavaBean');
    if (convertJavaBeanBtn) {
        convertJavaBeanBtn.addEventListener('click', () => {
            try {
                if (!javaJsonInput || !javaBeanOutput) return;
                const json = javaJsonInput.value.trim();
                const className = 'Response';
                const result = convertJsonToJavaBean(json, className);
                javaBeanOutput.value = result;
                if (typeof showNotification === 'function') {
                    showNotification('JavaBean转换成功', 'success');
                }
            } catch (e) {
                if (typeof showNotification === 'function') {
                    showNotification('转换失败：' + e.message, 'error');
                }
            }
        });
    }

    // Builder生成功能
    const generateBuilderBtn = document.getElementById('generateBuilder');
    if (generateBuilderBtn) {
        generateBuilderBtn.addEventListener('click', generateBuilderCode);
    }

    // Lombok注解功能
    const addLombokBtn = document.getElementById('addLombok');
    if (addLombokBtn) {
        addLombokBtn.addEventListener('click', addLombokAnnotations);
    }

    // Stream示例功能
    if (streamExampleType) {
        streamExampleType.addEventListener('change', updateStreamExample);
    }

    // 初始化Stream示例
    updateStreamExample();
}

// JSON转JavaBean功能
function convertJsonToJavaBean(json, className = 'Response') {
    try {
        const data = JSON.parse(json);
        const includeComments = generateComments ? generateComments.checked : false;
        const options = javaBeanOptions ? javaBeanOptions.value : 'getterSetter';
        let classes = new Map();

        function capitalizeFirstLetter(string) {
            return string.charAt(0).toUpperCase() + string.slice(1);
        }

        function getJavaType(value, fieldName) {
            if (value === null) return 'Object';
            switch (typeof value) {
                case 'string': return 'String';
                case 'number':
                    if (Number.isInteger(value)) {
                        if (value > 2147483647 || value < -2147483648) {
                            return 'Long';
                        }
                        return 'Integer';
                    }
                    return 'Double';
                case 'boolean': return 'Boolean';
                case 'object':
                    if (Array.isArray(value)) {
                        const itemType = value.length > 0 
                            ? getJavaType(value[0], capitalizeFirstLetter(fieldName)) 
                            : 'Object';
                        return `List<${itemType}>`;
                    }
                    const classType = capitalizeFirstLetter(fieldName);
                    createClass(value, classType);
                    return classType;
                default: return 'Object';
            }
        }

        function formatFieldName(name) {
            const javaKeywords = ['abstract', 'continue', 'for', 'new', 'switch',
                'assert', 'default', 'goto', 'package', 'synchronized',
                'boolean', 'do', 'if', 'private', 'this',
                'break', 'double', 'implements', 'protected', 'throw',
                'byte', 'else', 'import', 'public', 'throws',
                'case', 'enum', 'instanceof', 'return', 'transient',
                'catch', 'extends', 'int', 'short', 'try',
                'char', 'final', 'interface', 'static', 'void',
                'class', 'finally', 'long', 'strictfp', 'volatile',
                'const', 'float', 'native', 'super', 'while'];

            let fieldName = name.replace(/[^a-zA-Z0-9_]/g, '_');
            
            if (/^[0-9]/.test(fieldName)) {
                fieldName = '_' + fieldName;
            }

            if (javaKeywords.includes(fieldName.toLowerCase())) {
                fieldName = '_' + fieldName;
            }

            return fieldName;
        }

        function createClass(obj, className) {
            if (classes.has(className)) return;

            const fields = [];
            const methods = [];

            Object.entries(obj).forEach(([key, value]) => {
                const fieldName = formatFieldName(key);
                const fieldType = getJavaType(value, fieldName);

                // 字段定义
                let fieldDef = `    private ${fieldType} ${fieldName};`;
                if (includeComments) {
                    fieldDef = `    /** ${key} */\n${fieldDef}`;
                }
                fields.push(fieldDef);

                // 生成getter/setter方法
                if (options.includes('getter') || options.includes('getterSetter')) {
                    const getter = `    public ${fieldType} get${capitalizeFirstLetter(fieldName)}() {\n        return ${fieldName};\n    }`;
                    methods.push(getter);
                }

                if (options.includes('setter') || options.includes('getterSetter')) {
                    const setter = `    public void set${capitalizeFirstLetter(fieldName)}(${fieldType} ${fieldName}) {\n        this.${fieldName} = ${fieldName};\n    }`;
                    methods.push(setter);
                }
            });

            let classCode = '';
            if (includeComments) {
                classCode += `/**\n * ${className}类\n */\n`;
            }
            classCode += `public class ${className} {\n`;
            classCode += fields.join('\n\n') + '\n\n';
            classCode += methods.join('\n\n') + '\n';
            classCode += '}';

            classes.set(className, classCode);
        }

        createClass(data, className);

        return Array.from(classes.values()).join('\n\n');
    } catch (e) {
        throw new Error('JSON格式错误：' + e.message);
    }
}

// 生成Builder代码
function generateBuilderCode() {
    if (!javaClassInput || !javaBuilderOutput) return;

    const classCode = javaClassInput.value.trim();
    const isInnerClass = builderInnerClass ? builderInnerClass.checked : false;
    const isFluentStyle = builderFluentStyle ? builderFluentStyle.checked : true;

    // 简单的类解析
    const classMatch = classCode.match(/public\s+class\s+(\w+)/);
    if (!classMatch) {
        if (typeof showNotification === 'function') {
            showNotification('请输入有效的Java类代码', 'error');
        }
        return;
    }

    const className = classMatch[1];
    const builderClassName = isInnerClass ? 'Builder' : className + 'Builder';

    // 提取字段
    const fieldMatches = classCode.match(/private\s+(\w+(?:<[^>]+>)?)\s+(\w+);/g) || [];
    const fields = fieldMatches.map(match => {
        const parts = match.match(/private\s+(\w+(?:<[^>]+>)?)\s+(\w+);/);
        return { type: parts[1], name: parts[2] };
    });

    let builderCode = '';

    if (isInnerClass) {
        builderCode += `    public static class Builder {\n`;
    } else {
        builderCode += `public class ${builderClassName} {\n`;
    }

    // Builder字段
    fields.forEach(field => {
        builderCode += `        private ${field.type} ${field.name};\n`;
    });

    builderCode += '\n';

    // Builder方法
    fields.forEach(field => {
        const methodName = field.name;
        const returnType = isFluentStyle ? 'Builder' : 'void';
        const returnStatement = isFluentStyle ? '            return this;' : '';
        
        builderCode += `        public ${returnType} ${methodName}(${field.type} ${field.name}) {\n`;
        builderCode += `            this.${field.name} = ${field.name};\n`;
        if (returnStatement) {
            builderCode += returnStatement + '\n';
        }
        builderCode += `        }\n\n`;
    });

    // build方法
    builderCode += `        public ${className} build() {\n`;
    builderCode += `            ${className} instance = new ${className}();\n`;
    fields.forEach(field => {
        builderCode += `            instance.set${capitalizeFirstLetter(field.name)}(this.${field.name});\n`;
    });
    builderCode += `            return instance;\n`;
    builderCode += `        }\n`;
    builderCode += `    }`;

    if (!isInnerClass) {
        // 静态工厂方法
        builderCode = `public class ${builderClassName} {\n` + 
                     builderCode.substring(builderCode.indexOf('\n') + 1) + '\n\n' +
                     `    public static ${builderClassName} builder() {\n` +
                     `        return new ${builderClassName}();\n` +
                     `    }\n}`;
    }

    javaBuilderOutput.value = builderCode;
}

// 添加Lombok注解
function addLombokAnnotations() {
    if (!javaLombokInput || !javaLombokOutput) return;

    const classCode = javaLombokInput.value.trim();
    const selectedAnnotations = [];
    
    // 获取选中的注解
    document.querySelectorAll('.lombok-options input[type="checkbox"]:checked').forEach(checkbox => {
        selectedAnnotations.push(checkbox.value);
    });

    if (selectedAnnotations.length === 0) {
        if (typeof showNotification === 'function') {
            showNotification('请至少选择一个Lombok注解', 'error');
        }
        return;
    }

    // 简单的类处理
    let result = classCode;
    
    // 添加导入语句
    const imports = selectedAnnotations.map(annotation => `import lombok.${annotation};`).join('\n');
    
    // 添加注解
    const annotations = selectedAnnotations.map(annotation => `@${annotation}`).join('\n');
    
    // 查找类定义
    const classMatch = result.match(/(public\s+class\s+\w+)/);
    if (classMatch) {
        result = result.replace(classMatch[1], `${annotations}\n${classMatch[1]}`);
        
        // 如果有@Data或@Getter/@Setter，移除getter/setter方法
        if (selectedAnnotations.includes('Data') || 
            (selectedAnnotations.includes('Getter') && selectedAnnotations.includes('Setter'))) {
            result = result.replace(/\s+public\s+\w+\s+get\w+\(\)[^}]+}\s*/g, '');
            result = result.replace(/\s+public\s+void\s+set\w+\([^}]+}\s*/g, '');
        }
        
        // 添加导入语句到文件开头
        if (!result.includes('import lombok')) {
            result = imports + '\n\n' + result;
        }
    }

    javaLombokOutput.value = result;
}

// 更新Stream示例
function updateStreamExample() {
    if (!streamExampleType) return;

    const type = streamExampleType.value;
    const output = document.getElementById('streamExampleOutput');
    if (!output) return;

    let example = '';

    switch (type) {
        case 'filter':
            example = `// Stream过滤示例
List<Person> adults = people.stream()
    .filter(person -> person.getAge() >= 18)
    .collect(Collectors.toList());`;
            break;
        case 'map':
            example = `// Stream映射示例
List<String> names = people.stream()
    .map(Person::getName)
    .collect(Collectors.toList());`;
            break;
        case 'reduce':
            example = `// Stream归约示例
int totalAge = people.stream()
    .mapToInt(Person::getAge)
    .reduce(0, Integer::sum);`;
            break;
        case 'groupBy':
            example = `// Stream分组示例
Map<String, List<Person>> peopleByCity = people.stream()
    .collect(Collectors.groupingBy(Person::getCity));`;
            break;
        default:
            example = '// 请选择一个Stream操作类型';
    }

    output.value = example;
}

function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
} 