// Utils.js - 공통 유틸리티 함수들

// 날짜 포맷팅
function formatDate(date, format = 'YYYY-MM-DD HH:mm:ss') {
    return dayjs(date).format(format);
}

// 상대 시간 표시
function formatRelativeTime(date) {
    return dayjs(date).fromNow();
}

// 숫자 포맷팅
function formatNumber(num, decimals = 0) {
    return new Intl.NumberFormat('ko-KR', {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals
    }).format(num);
}

// 퍼센트 포맷팅
function formatPercent(num, decimals = 1) {
    return formatNumber(num, decimals) + '%';
}

// 파일 크기 포맷팅
function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

// UUID 생성
function generateUUID() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        const r = Math.random() * 16 | 0;
        const v = c == 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}

// 디바운스 함수
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// 스로틀 함수
function throttle(func, limit) {
    let inThrottle;
    return function() {
        const args = arguments;
        const context = this;
        if (!inThrottle) {
            func.apply(context, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
}

// 로컬 스토리지 헬퍼
const storage = {
    set(key, value) {
        try {
            localStorage.setItem(key, JSON.stringify(value));
        } catch (e) {
            console.error('Storage set error:', e);
        }
    },
    
    get(key, defaultValue = null) {
        try {
            const item = localStorage.getItem(key);
            return item ? JSON.parse(item) : defaultValue;
        } catch (e) {
            console.error('Storage get error:', e);
            return defaultValue;
        }
    },
    
    remove(key) {
        try {
            localStorage.removeItem(key);
        } catch (e) {
            console.error('Storage remove error:', e);
        }
    }
};

// 쿠키 헬퍼
const cookies = {
    set(name, value, days = 7) {
        const expires = new Date();
        expires.setTime(expires.getTime() + (days * 24 * 60 * 60 * 1000));
        document.cookie = `${name}=${value};expires=${expires.toUTCString()};path=/`;
    },
    
    get(name) {
        const nameEQ = name + "=";
        const ca = document.cookie.split(';');
        for (let i = 0; i < ca.length; i++) {
            let c = ca[i];
            while (c.charAt(0) === ' ') c = c.substring(1, c.length);
            if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length, c.length);
        }
        return null;
    },
    
    remove(name) {
        document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/;`;
    }
};

// URL 파라미터 헬퍼
const urlParams = {
    get(name) {
        const urlSearchParams = new URLSearchParams(window.location.search);
        return urlSearchParams.get(name);
    },
    
    set(name, value) {
        const url = new URL(window.location);
        url.searchParams.set(name, value);
        window.history.replaceState({}, '', url);
    },
    
    remove(name) {
        const url = new URL(window.location);
        url.searchParams.delete(name);
        window.history.replaceState({}, '', url);
    }
};

// 에러 처리
function handleError(error, context = '') {
    console.error(`Error in ${context}:`, error);
    
    // 사용자에게 에러 메시지 표시
    if (window.showToast) {
        window.showToast({
            type: 'error',
            message: error.message || 'An error occurred',
            icon: 'lucide-alert-circle'
        });
    }
}

// 로딩 상태 관리
const loading = {
    show() {
        if (window.Alpine) {
            Alpine.store('app').loading = true;
        }
    },
    
    hide() {
        if (window.Alpine) {
            Alpine.store('app').loading = false;
        }
    }
};

// 검증 함수들
const validators = {
    email(email) {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
    },
    
    url(url) {
        try {
            new URL(url);
            return true;
        } catch {
            return false;
        }
    },
    
    required(value) {
        return value !== null && value !== undefined && value !== '';
    },
    
    minLength(value, min) {
        return value && value.length >= min;
    },
    
    maxLength(value, max) {
        return value && value.length <= max;
    },
    
    range(value, min, max) {
        return value >= min && value <= max;
    }
};

// 색상 유틸리티
const colors = {
    // 노드 타입별 색상
    nodeColors: {
        'Equipment': '#667eea',
        'Sensor': '#28a745',
        'Variable': '#17a2b8',
        'Unit': '#6c757d',
        'Process': '#fd7e14',
        'Operation': '#e83e8c',
        'Material': '#20c997',
        'Product': '#6f42c1',
        'Area': '#ffc107',
        'WorkOrder': '#dc3545',
        'QualityControl': '#28a745',
        'Maintenance': '#fd7e14',
        'Batch': '#6f42c1',
        'Defect': '#dc3545'
    },
    
    // 상태별 색상
    statusColors: {
        'active': '#28a745',
        'inactive': '#6c757d',
        'warning': '#ffc107',
        'error': '#dc3545',
        'pending': '#17a2b8'
    },
    
    // 품질 결과별 색상
    qualityColors: {
        'pass': '#28a745',
        'fail': '#dc3545',
        'pending': '#ffc107'
    },
    
    getNodeColor(nodeType) {
        return this.nodeColors[nodeType] || '#6c757d';
    },
    
    getStatusColor(status) {
        return this.statusColors[status] || '#6c757d';
    },
    
    getQualityColor(result) {
        return this.qualityColors[result] || '#6c757d';
    }
};

// 차트 색상 팔레트
const chartColors = {
    primary: '#667eea',
    secondary: '#764ba2',
    success: '#28a745',
    warning: '#ffc107',
    danger: '#dc3545',
    info: '#17a2b8',
    light: '#f8f9fa',
    dark: '#343a40',
    
    palette: [
        '#667eea', '#764ba2', '#28a745', '#ffc107',
        '#dc3545', '#17a2b8', '#6f42c1', '#fd7e14',
        '#20c997', '#e83e8c', '#6c757d', '#343a40'
    ]
};

// 텍스트 유틸리티
const text = {
    truncate(str, length = 50) {
        if (str.length <= length) return str;
        return str.substring(0, length) + '...';
    },
    
    capitalize(str) {
        return str.charAt(0).toUpperCase() + str.slice(1);
    },
    
    camelToKebab(str) {
        return str.replace(/([A-Z])/g, '-$1').toLowerCase();
    },
    
    kebabToCamel(str) {
        return str.replace(/-([a-z])/g, (match, letter) => letter.toUpperCase());
    }
};

// 배열 유틸리티
const array = {
    unique(arr) {
        return [...new Set(arr)];
    },
    
    groupBy(arr, key) {
        return arr.reduce((groups, item) => {
            const group = item[key];
            groups[group] = groups[group] || [];
            groups[group].push(item);
            return groups;
        }, {});
    },
    
    sortBy(arr, key, direction = 'asc') {
        return arr.sort((a, b) => {
            const aVal = a[key];
            const bVal = b[key];
            if (direction === 'asc') {
                return aVal > bVal ? 1 : -1;
            } else {
                return aVal < bVal ? 1 : -1;
            }
        });
    },
    
    chunk(arr, size) {
        const chunks = [];
        for (let i = 0; i < arr.length; i += size) {
            chunks.push(arr.slice(i, i + size));
        }
        return chunks;
    }
};

// 객체 유틸리티
const object = {
    deepClone(obj) {
        return JSON.parse(JSON.stringify(obj));
    },
    
    merge(target, source) {
        return { ...target, ...source };
    },
    
    isEmpty(obj) {
        return Object.keys(obj).length === 0;
    },
    
    pick(obj, keys) {
        const result = {};
        keys.forEach(key => {
            if (key in obj) {
                result[key] = obj[key];
            }
        });
        return result;
    },
    
    omit(obj, keys) {
        const result = { ...obj };
        keys.forEach(key => {
            delete result[key];
        });
        return result;
    }
};

// 내보내기
window.utils = {
    formatDate,
    formatRelativeTime,
    formatNumber,
    formatPercent,
    formatFileSize,
    generateUUID,
    debounce,
    throttle,
    storage,
    cookies,
    urlParams,
    handleError,
    loading,
    validators,
    colors,
    chartColors,
    text,
    array,
    object
};
