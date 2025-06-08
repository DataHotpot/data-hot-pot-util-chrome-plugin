// ==================== 时间工具模块 ====================

// 时区名称映射表
const timezoneNames = {
    'UTC': '世界标准-格林威治(UTC)',
    // 东亚
    'Asia/Shanghai': '中国-北京(CN-BJS)',
    'Asia/Hong_Kong': '中国香港(HK-HKG)',
    'Asia/Macau': '中国澳门(MO-MFM)',
    'Asia/Taipei': '中国台湾-台北(TW-TPE)',
    'Asia/Tokyo': '日本-东京(JP-TYO)',
    'Asia/Seoul': '韩国-首尔(KR-SEL)',
    // 东南亚
    'Asia/Singapore': '新加坡-新加坡(SG-SGP)',
    'Asia/Bangkok': '泰国-曼谷(TH-BKK)',
    'Asia/Jakarta': '印度尼西亚-雅加达(ID-JKT)',
    'Asia/Kuala_Lumpur': '马来西亚-吉隆坡(MY-KUL)',
    'Asia/Manila': '菲律宾-马尼拉(PH-MNL)',
    'Asia/Ho_Chi_Minh': '越南-胡志明市(VN-SGN)',
    'Asia/Yangon': '缅甸-仰光(MM-RGN)',
    'Asia/Phnom_Penh': '柬埔寨-金边(KH-PNH)',
    // 南亚
    'Asia/Kolkata': '印度-新德里(IN-DEL)',
    'Asia/Colombo': '斯里兰卡-科伦坡(LK-CMB)',
    'Asia/Dhaka': '孟加拉-达卡(BD-DAC)',
    'Asia/Kathmandu': '尼泊尔-加德满都(NP-KTM)',
    // 中亚
    'Asia/Almaty': '哈萨克斯坦-阿拉木图(KZ-ALA)',
    'Asia/Tashkent': '乌兹别克斯坦-塔什干(UZ-TAS)',
    // 西亚
    'Asia/Dubai': '阿联酋-迪拜(AE-DXB)',
    'Asia/Qatar': '卡塔尔-多哈(QA-DOH)',
    'Asia/Jerusalem': '以色列-耶路撒冷(IL-JRS)',
    // 欧洲
    'Europe/Moscow': '俄罗斯-莫斯科(RU-MOW)',
    'Europe/London': '英国-伦敦(GB-LON)',
    'Europe/Paris': '法国-巴黎(FR-PAR)',
    'Europe/Berlin': '德国-柏林(DE-BER)',
    'Europe/Rome': '意大利-罗马(IT-ROM)',
    'Europe/Madrid': '西班牙-马德里(ES-MAD)',
    'Europe/Amsterdam': '荷兰-阿姆斯特丹(NL-AMS)',
    'Europe/Brussels': '比利时-布鲁塞尔(BE-BRU)',
    'Europe/Vienna': '奥地利-维也纳(AT-VIE)',
    // 美洲
    'America/New_York': '美国-纽约(US-NYC)',
    // 大洋洲
    'Australia/Sydney': '澳大利亚-悉尼(AU-SYD)'
};

// 时区偏移量映射
const timezoneOffsets = {
    'UTC': '+00:00',
    // 东亚
    'Asia/Shanghai': '+08:00',
    'Asia/Hong_Kong': '+08:00',
    'Asia/Macau': '+08:00',
    'Asia/Taipei': '+08:00',
    'Asia/Tokyo': '+09:00',
    'Asia/Seoul': '+09:00',
    // 东南亚
    'Asia/Singapore': '+08:00',
    'Asia/Bangkok': '+07:00',
    'Asia/Jakarta': '+07:00',
    'Asia/Kuala_Lumpur': '+08:00',
    'Asia/Manila': '+08:00',
    'Asia/Ho_Chi_Minh': '+07:00',
    'Asia/Yangon': '+06:30',
    'Asia/Phnom_Penh': '+07:00',
    // 南亚
    'Asia/Kolkata': '+05:30',
    'Asia/Colombo': '+05:30',
    'Asia/Dhaka': '+06:00',
    'Asia/Kathmandu': '+05:45',
    // 中亚
    'Asia/Almaty': '+06:00',
    'Asia/Tashkent': '+05:00',
    // 西亚
    'Asia/Dubai': '+04:00',
    'Asia/Qatar': '+03:00',
    'Asia/Jerusalem': '+03:00',
    // 欧洲
    'Europe/Moscow': '+03:00',
    'Europe/London': '+00:00',
    'Europe/Paris': '+01:00',
    'Europe/Berlin': '+01:00',
    'Europe/Rome': '+01:00',
    'Europe/Madrid': '+01:00',
    'Europe/Amsterdam': '+01:00',
    'Europe/Brussels': '+01:00',
    'Europe/Vienna': '+01:00',
    // 美洲
    'America/New_York': '-05:00',
    // 大洋洲
    'Australia/Sydney': '+11:00'
};

// 时间工具相关元素
let timezone, timestamp, datetime, formattedTime, timestampFormat, timestampFormatLabel, timestampUnit;
let isMilliseconds = true; // 默认为毫秒级时间戳

// 初始化时间工具
function initTimeTools() {
    // 获取DOM元素
    timezone = document.getElementById('timezone');
    timestamp = document.getElementById('timestamp');
    datetime = document.getElementById('datetime');
    formattedTime = document.getElementById('formattedTime');
    timestampFormat = document.getElementById('timestampFormat');
    timestampFormatLabel = document.getElementById('timestampFormatLabel');
    timestampUnit = document.getElementById('timestampUnit');

    if (!timezone || !timestamp || !datetime || !formattedTime) return;

    // 初始化时间戳格式切换
    if (timestampFormat) {
        timestampFormat.addEventListener('change', () => {
            isMilliseconds = timestampFormat.checked;
            updateTimestampUnit(isMilliseconds);
            
            // 如果当前有时间戳，则进行转换
            if (timestamp.value) {
                const currentValue = parseInt(timestamp.value);
                if (!isNaN(currentValue)) {
                    if (isMilliseconds) {
                        // 秒转毫秒
                        timestamp.value = currentValue * 1000;
                    } else {
                        // 毫秒转秒
                        timestamp.value = Math.floor(currentValue / 1000);
                    }
                }
            }
        });
    }

    // 监听输入变化
    timestamp.addEventListener('input', () => updateAllTimes('timestamp'));
    datetime.addEventListener('input', () => updateAllTimes('datetime'));
    timezone.addEventListener('change', () => updateAllTimes());

    // 初始化显示
    updateTimestampUnit(isMilliseconds);
    updateAllTimes();
}

// 更新时间戳单位显示
function updateTimestampUnit(isMilliseconds) {
    const unit = isMilliseconds ? '毫秒' : '秒';
    if (timestampFormatLabel) {
        timestampFormatLabel.textContent = unit;
    }
    if (timestampUnit) {
        timestampUnit.textContent = unit;
    }
}

// 更新所有时间显示
function updateAllTimes(source) {
    if (!timezone || !timestamp || !datetime || !formattedTime) return;

    const tz = timezone.value;
    let date;

    try {
        switch (source) {
            case 'timestamp':
                const tsValue = parseInt(timestamp.value);
                if (isNaN(tsValue)) {
                    throw new Error('无效的时间戳');
                }
                // 根据当前模式转换时间戳
                date = new Date(isMilliseconds ? tsValue : tsValue * 1000);
                break;
            case 'datetime':
                date = new Date(datetime.value);
                break;
            default:
                date = new Date();
        }

        if (isNaN(date.getTime())) {
            throw new Error('无效的日期时间');
        }

        // 更新时间戳
        timestamp.value = isMilliseconds ? date.getTime() : Math.floor(date.getTime() / 1000);

        // 更新日期时间
        const tzDate = new Date(date.toLocaleString('en-US', { timeZone: tz }));
        datetime.value = tzDate.toISOString().slice(0, 16);

        // 更新格式化时间
        const timezoneName = timezoneNames[tz] || tz;
        const timezoneOffset = timezoneOffsets[tz] || '';
        formattedTime.value = `${date.toLocaleString('zh-CN', {
            timeZone: tz,
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hour12: false
        })} [${timezoneName} UTC${timezoneOffset}]`;
    } catch (e) {
        if (typeof showNotification === 'function') {
            showNotification('时间转换失败：' + e.message, 'error');
        }
    }
} 