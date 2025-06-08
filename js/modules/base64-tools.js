// ==================== Base64工具模块 ====================

// 初始化Base64工具
function initBase64Tools() {
    // Base64编码按钮
    const encodeBtn = document.getElementById('encodeBase64');
    if (encodeBtn) {
        encodeBtn.addEventListener('click', () => {
            const input = document.getElementById('base64Input');
            const output = document.getElementById('base64Output');
            
            if (!input || !output) return;
            
            try {
                const encoded = btoa(unescape(encodeURIComponent(input.value)));
                output.value = encoded;
                if (typeof showNotification === 'function') {
                    showNotification('Base64编码成功', 'success');
                }
            } catch (e) {
                if (typeof showNotification === 'function') {
                    showNotification('Base64编码失败：' + e.message, 'error');
                }
            }
        });
    }

    // Base64解码按钮
    const decodeBtn = document.getElementById('decodeBase64');
    if (decodeBtn) {
        decodeBtn.addEventListener('click', () => {
            const input = document.getElementById('base64Input');
            const output = document.getElementById('base64Output');
            
            if (!input || !output) return;
            
            try {
                const decoded = decodeURIComponent(escape(atob(input.value)));
                output.value = decoded;
                if (typeof showNotification === 'function') {
                    showNotification('Base64解码成功', 'success');
                }
            } catch (e) {
                if (typeof showNotification === 'function') {
                    showNotification('Base64解码失败：' + e.message, 'error');
                }
            }
        });
    }
} 