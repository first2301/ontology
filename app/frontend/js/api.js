// API.js - 백엔드 API 호출 함수들

const API_BASE_URL = '/api';

// HTTP 클라이언트
class HttpClient {
    constructor(baseURL = API_BASE_URL) {
        this.baseURL = baseURL;
    }

    async request(endpoint, options = {}) {
        const url = `${this.baseURL}${endpoint}`;
        const config = {
            headers: {
                'Content-Type': 'application/json',
                ...options.headers
            },
            ...options
        };

        try {
            const response = await fetch(url, config);
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const contentType = response.headers.get('content-type');
            if (contentType && contentType.includes('application/json')) {
                return await response.json();
            }
            
            return await response.text();
        } catch (error) {
            console.error('API request failed:', error);
            throw error;
        }
    }

    async get(endpoint, params = {}) {
        const queryString = new URLSearchParams(params).toString();
        const url = queryString ? `${endpoint}?${queryString}` : endpoint;
        return this.request(url, { method: 'GET' });
    }

    async post(endpoint, data = {}) {
        return this.request(endpoint, {
            method: 'POST',
            body: JSON.stringify(data)
        });
    }

    async put(endpoint, data = {}) {
        return this.request(endpoint, {
            method: 'PUT',
            body: JSON.stringify(data)
        });
    }

    async delete(endpoint, data = {}) {
        return this.request(endpoint, {
            method: 'DELETE',
            body: JSON.stringify(data)
        });
    }

    async upload(endpoint, formData) {
        return this.request(endpoint, {
            method: 'POST',
            body: formData,
            headers: {} // Content-Type을 자동으로 설정하도록 헤더 제거
        });
    }
}

const api = new HttpClient();

// 온톨로지 관련 API
const ontologyAPI = {
    // 그래프 요소 조회
    async getGraphElements(limit = 100) {
        return api.get('/graph/elements', { limit });
    },

    // 관계 조회
    async getTriples(subject = null, predicate = null, object = null) {
        const params = {};
        if (subject) params.subject = subject;
        if (predicate) params.predicate = predicate;
        if (object) params.object = object;
        return api.get('/ontology/triples', params);
    },

    // 관계 추가
    async createTriple(triple) {
        return api.post('/ontology/triples', triple);
    },

    // 관계 삭제
    async deleteTriple(triple) {
        return api.delete('/ontology/triples', triple);
    },

    // 노드 삭제
    async deleteNode(nodeId) {
        return api.delete(`/ontology/nodes/${nodeId}`);
    },

    // 벌크 작업
    async bulkTripleOperation(operation) {
        return api.post('/ontology/triples/bulk', operation);
    },

    // 파일 업로드 및 검증
    async validateAndImport(dataFile, shapesFile) {
        const formData = new FormData();
        formData.append('data_ttl', dataFile);
        formData.append('shapes_ttl', shapesFile);
        return api.upload('/ontology/validate-and-import', formData);
    }
};

// 제조 데이터 관리 API
const manufacturingAPI = {
    // 제조 라인 조회
    async getManufacturingLines() {
        return api.get('/manufacturing/lines');
    },

    async getManufacturingLine(lineId) {
        return api.get(`/manufacturing/lines/${lineId}`);
    },

    // 작업지시서 관리
    async getWorkOrders() {
        return api.get('/manufacturing/work-orders');
    },

    async createWorkOrder(workOrder) {
        return api.post('/manufacturing/work-orders', workOrder);
    },

    async updateWorkOrder(workOrderId, workOrder) {
        return api.put(`/manufacturing/work-orders/${workOrderId}`, workOrder);
    },

    // 품질 데이터
    async getQualityData(productId) {
        return api.get(`/manufacturing/quality/${productId}`);
    },

    async createQualityData(quality) {
        return api.post('/manufacturing/quality', quality);
    },

    // 설비 상태
    async getEquipmentStatus(equipmentId) {
        return api.get(`/manufacturing/equipment/${equipmentId}/status`);
    },

    async getMaintenanceHistory(equipmentId) {
        return api.get(`/manufacturing/equipment/${equipmentId}/maintenance-history`);
    }
};

// 고급 쿼리 API
const analyticsAPI = {
    // 프로세스 플로우 조회
    async getProcessFlow(processId) {
        return api.get(`/graph/process-flow/${processId}`);
    },

    // 설비 계층구조 조회
    async getEquipmentHierarchy() {
        return api.get('/graph/equipment-hierarchy');
    },

    // 품질 트렌드 분석
    async getQualityTrend(period = '7d') {
        return api.get('/analytics/quality-trend', { period });
    },

    // 설비 효율성 (OEE)
    async getEquipmentEfficiency(equipmentId) {
        return api.get(`/analytics/equipment-efficiency/${equipmentId}`);
    }
};

// 에러 처리 래퍼
function withErrorHandling(apiFunction, context = '') {
    return async (...args) => {
        try {
            return await apiFunction(...args);
        } catch (error) {
            console.error(`API Error in ${context}:`, error);
            
            // 사용자에게 에러 메시지 표시
            if (window.showToast) {
                window.showToast({
                    type: 'error',
                    message: error.message || 'API request failed',
                    icon: 'lucide-alert-circle'
                });
            }
            
            throw error;
        }
    };
}

// 로딩 상태와 함께 API 호출
function withLoading(apiFunction, context = '') {
    return async (...args) => {
        try {
            if (window.utils && window.utils.loading) {
                window.utils.loading.show();
            }
            return await apiFunction(...args);
        } finally {
            if (window.utils && window.utils.loading) {
                window.utils.loading.hide();
            }
        }
    };
}

// 재시도 로직이 있는 API 호출
function withRetry(apiFunction, maxRetries = 3, delay = 1000) {
    return async (...args) => {
        let lastError;
        
        for (let i = 0; i < maxRetries; i++) {
            try {
                return await apiFunction(...args);
            } catch (error) {
                lastError = error;
                
                if (i < maxRetries - 1) {
                    await new Promise(resolve => setTimeout(resolve, delay * Math.pow(2, i)));
                }
            }
        }
        
        throw lastError;
    };
}

// 캐시가 있는 API 호출
function withCache(apiFunction, ttl = 5 * 60 * 1000) { // 5분 기본 TTL
    const cache = new Map();
    
    return async (...args) => {
        const key = JSON.stringify(args);
        const cached = cache.get(key);
        
        if (cached && Date.now() - cached.timestamp < ttl) {
            return cached.data;
        }
        
        const data = await apiFunction(...args);
        cache.set(key, {
            data,
            timestamp: Date.now()
        });
        
        return data;
    };
}

// API 응답 변환기
const transformers = {
    // 그래프 요소를 Cytoscape.js 형식으로 변환
    transformGraphElements(response) {
        const elements = response.elements || [];
        const nodes = new Map();
        const edges = [];

        elements.forEach(element => {
            if (element.data.source && element.data.target) {
                // 엣지
                edges.push({
                    data: {
                        id: element.data.id,
                        source: element.data.source,
                        target: element.data.target,
                        label: element.data.label,
                        type: 'edge'
                    }
                });
            } else {
                // 노드
                nodes.set(element.data.id, {
                    data: {
                        id: element.data.id,
                        label: element.data.label,
                        type: 'node'
                    }
                });
            }
        });

        return {
            nodes: Array.from(nodes.values()),
            edges: edges
        };
    },

    // 관계 데이터 변환
    transformTriples(response) {
        return response.triples || [];
    },

    // 제조 라인 데이터 변환
    transformManufacturingLines(response) {
        return response.lines || [];
    },

    // 작업지시서 데이터 변환
    transformWorkOrders(response) {
        return response.workOrders || [];
    },

    // 품질 데이터 변환
    transformQualityData(response) {
        return response.qualityData || [];
    },

    // 설비 상태 데이터 변환
    transformEquipmentStatus(response) {
        return response.equipment || {};
    },

    // 유지보수 이력 변환
    transformMaintenanceHistory(response) {
        return response.maintenanceHistory || [];
    },

    // 프로세스 플로우 변환
    transformProcessFlow(response) {
        return response.processFlow || [];
    },

    // 설비 계층구조 변환
    transformEquipmentHierarchy(response) {
        return response.hierarchy || [];
    },

    // 품질 트렌드 변환
    transformQualityTrend(response) {
        return response.trend || [];
    },

    // 설비 효율성 변환
    transformEquipmentEfficiency(response) {
        return response.efficiency || {};
    }
};

// API 클라이언트 인스턴스 생성 (에러 처리, 로딩, 재시도, 캐시 적용)
function createEnhancedAPI(apiFunction, options = {}) {
    let enhancedFunction = apiFunction;

    if (options.errorHandling !== false) {
        enhancedFunction = withErrorHandling(enhancedFunction, options.context);
    }

    if (options.loading !== false) {
        enhancedFunction = withLoading(enhancedFunction, options.context);
    }

    if (options.retry) {
        enhancedFunction = withRetry(enhancedFunction, options.maxRetries, options.retryDelay);
    }

    if (options.cache) {
        enhancedFunction = withCache(enhancedFunction, options.cacheTTL);
    }

    return enhancedFunction;
}

// 내보내기
window.api = {
    client: api,
    ontology: ontologyAPI,
    manufacturing: manufacturingAPI,
    analytics: analyticsAPI,
    transformers,
    withErrorHandling,
    withLoading,
    withRetry,
    withCache,
    createEnhancedAPI
};
