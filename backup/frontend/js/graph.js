// Graph.js - Cytoscape.js 그래프 관리

class GraphManager {
    constructor(containerId) {
        this.containerId = containerId;
        this.cy = null;
        this.selectedNode = null;
        this.selectedEdge = null;
        this.layouts = {
            cose: { name: 'cose', animate: false },
            grid: { name: 'grid', animate: false },
            hierarchical: { name: 'dagre', animate: false },
            circle: { name: 'circle', animate: false }
        };
        this.currentLayout = 'cose';
        this.nodeTypes = new Set();
        this.relationshipTypes = new Set();
        this.filteredElements = new Set();
        
        this.init();
    }

    init() {
        this.cy = cytoscape({
            container: document.getElementById(this.containerId),
            style: this.getStyles(),
            layout: this.layouts[this.currentLayout],
            userZoomingEnabled: true,
            userPanningEnabled: true,
            boxSelectionEnabled: true,
            selectionType: 'single'
        });

        this.setupEventListeners();
        this.setupContextMenu();
    }

    getStyles() {
        return [
            {
                selector: 'node',
                style: {
                    'label': 'data(label)',
                    'background-color': (ele) => this.getNodeColor(ele.data('type')),
                    'color': '#fff',
                    'font-size': '10px',
                    'font-weight': '500',
                    'text-outline-width': 1,
                    'text-outline-color': '#000',
                    'width': '30px',
                    'height': '30px',
                    'border-width': 2,
                    'border-color': '#fff',
                    'border-style': 'solid'
                }
            },
            {
                selector: 'node:selected',
                style: {
                    'border-width': 3,
                    'border-color': '#667eea',
                    'background-color': '#667eea'
                }
            },
            {
                selector: 'node:hover',
                style: {
                    'border-width': 3,
                    'border-color': '#667eea'
                }
            },
            {
                selector: 'edge',
                style: {
                    'curve-style': 'bezier',
                    'target-arrow-shape': 'triangle',
                    'target-arrow-size': '8px',
                    'label': 'data(label)',
                    'font-size': '8px',
                    'font-weight': '400',
                    'line-color': '#999',
                    'target-arrow-color': '#999',
                    'width': 2,
                    'text-outline-width': 1,
                    'text-outline-color': '#fff',
                    'text-background-color': '#fff',
                    'text-background-opacity': 0.8,
                    'text-background-padding': '2px'
                }
            },
            {
                selector: 'edge:selected',
                style: {
                    'line-color': '#667eea',
                    'target-arrow-color': '#667eea',
                    'width': 3
                }
            },
            {
                selector: 'edge:hover',
                style: {
                    'line-color': '#667eea',
                    'target-arrow-color': '#667eea',
                    'width': 3
                }
            }
        ];
    }

    getNodeColor(nodeType) {
        if (!nodeType) return '#6c757d';
        
        const colorMap = {
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
        };
        
        return colorMap[nodeType] || '#6c757d';
    }

    setupEventListeners() {
        // 노드 클릭 이벤트
        this.cy.on('tap', 'node', (event) => {
            const node = event.target;
            this.selectedNode = {
                id: node.id(),
                label: node.data('label'),
                type: this.getNodeTypeFromLabel(node.data('label'))
            };
            
            // Alpine.js 상태 업데이트
            if (window.Alpine && window.Alpine.store) {
                const store = window.Alpine.store('app');
                if (store) {
                    store.selectedNode = this.selectedNode;
                }
            }
        });

        // 엣지 클릭 이벤트
        this.cy.on('tap', 'edge', (event) => {
            const edge = event.target;
            this.selectedEdge = {
                id: edge.id(),
                source: edge.source().id(),
                target: edge.target().id(),
                label: edge.data('label')
            };
        });

        // 빈 공간 클릭 시 선택 해제
        this.cy.on('tap', (event) => {
            if (event.target === this.cy) {
                this.selectedNode = null;
                this.selectedEdge = null;
                
                if (window.Alpine && window.Alpine.store) {
                    const store = window.Alpine.store('app');
                    if (store) {
                        store.selectedNode = null;
                    }
                }
            }
        });

        // 우클릭 이벤트
        this.cy.on('cxttap', (event) => {
            event.preventDefault();
            this.showContextMenu(event);
        });
    }

    setupContextMenu() {
        // 컨텍스트 메뉴는 별도로 구현
    }

    showContextMenu(event) {
        const target = event.target;
        const position = event.cyPosition;
        
        // 컨텍스트 메뉴 표시 로직
        if (window.showContextMenu) {
            window.showContextMenu(target, position);
        }
    }

    getNodeTypeFromLabel(label) {
        if (!label) return 'Unknown';
        
        // 라벨에서 노드 타입 추출 로직
        const typeMap = {
            'Equipment': 'Equipment',
            'Sensor': 'Sensor',
            'Variable': 'Variable',
            'Unit': 'Unit',
            'Process': 'Process',
            'Operation': 'Operation',
            'Material': 'Material',
            'Product': 'Product',
            'Area': 'Area',
            'WorkOrder': 'WorkOrder',
            'QualityControl': 'QualityControl',
            'Maintenance': 'Maintenance',
            'Batch': 'Batch',
            'Defect': 'Defect'
        };
        
        for (const [type, keyword] of Object.entries(typeMap)) {
            if (label.includes(keyword)) {
                return type;
            }
        }
        
        return 'Unknown';
    }

    async loadGraph(limit = 100) {
        try {
            if (window.utils && window.utils.loading) {
                window.utils.loading.show();
            }

            const response = await window.api.ontology.getGraphElements(limit);
            const transformed = window.api.transformers.transformGraphElements(response);
            
            this.cy.elements().remove();
            this.cy.add(transformed.nodes.concat(transformed.edges));
            
            // 노드 타입과 관계 타입 수집
            this.collectTypes();
            
            // 레이아웃 적용
            this.applyLayout();
            
            // 통계 업데이트
            this.updateStatistics();
            
        } catch (error) {
            console.error('Failed to load graph:', error);
            if (window.showToast) {
                window.showToast({
                    type: 'error',
                    message: 'Failed to load graph data',
                    icon: 'lucide-alert-circle'
                });
            }
        } finally {
            if (window.utils && window.utils.loading) {
                window.utils.loading.hide();
            }
        }
    }

    collectTypes() {
        this.nodeTypes.clear();
        this.relationshipTypes.clear();
        
        this.cy.nodes().forEach(node => {
            const type = this.getNodeTypeFromLabel(node.data('label'));
            this.nodeTypes.add(type);
        });
        
        this.cy.edges().forEach(edge => {
            this.relationshipTypes.add(edge.data('label'));
        });
        
        // Alpine.js 상태 업데이트
        if (window.Alpine && window.Alpine.store) {
            const store = window.Alpine.store('app');
            if (store) {
                store.nodeTypes = Array.from(this.nodeTypes);
                store.relationshipTypes = Array.from(this.relationshipTypes);
            }
        }
    }

    applyLayout() {
        const layout = this.layouts[this.currentLayout];
        this.cy.layout(layout).run();
        this.cy.fit();
    }

    changeLayout(layoutName) {
        if (this.layouts[layoutName]) {
            this.currentLayout = layoutName;
            this.applyLayout();
        }
    }

    updateStatistics() {
        const nodeCount = this.cy.nodes().length;
        const edgeCount = this.cy.edges().length;
        
        // Alpine.js 상태 업데이트
        if (window.Alpine && window.Alpine.store) {
            const store = window.Alpine.store('app');
            if (store) {
                store.nodeCount = nodeCount;
                store.edgeCount = edgeCount;
            }
        }
    }

    filterByTypes(selectedTypes, selectedRelationships) {
        this.filteredElements.clear();
        
        // 노드 필터링
        this.cy.nodes().forEach(node => {
            const type = this.getNodeTypeFromLabel(node.data('label'));
            if (selectedTypes.length === 0 || selectedTypes.includes(type)) {
                this.filteredElements.add(node.id());
            }
        });
        
        // 엣지 필터링
        this.cy.edges().forEach(edge => {
            const sourceVisible = this.filteredElements.has(edge.source().id());
            const targetVisible = this.filteredElements.has(edge.target().id());
            const relationshipVisible = selectedRelationships.length === 0 || 
                                      selectedRelationships.includes(edge.data('label'));
            
            if (sourceVisible && targetVisible && relationshipVisible) {
                this.filteredElements.add(edge.id());
            }
        });
        
        // 필터링된 요소만 표시
        this.cy.elements().forEach(element => {
            if (this.filteredElements.has(element.id())) {
                element.show();
            } else {
                element.hide();
            }
        });
        
        this.applyLayout();
    }

    searchNodes(query) {
        if (!query) {
            this.cy.elements().show();
            this.applyLayout();
            return;
        }
        
        const searchQuery = query.toLowerCase();
        this.cy.elements().forEach(element => {
            const label = element.data('label') || '';
            if (label.toLowerCase().includes(searchQuery)) {
                element.show();
            } else {
                element.hide();
            }
        });
        
        this.applyLayout();
    }

    fit() {
        this.cy.fit();
    }

    center() {
        this.cy.center();
    }

    zoomIn() {
        this.cy.zoom(this.cy.zoom() * 1.2);
    }

    zoomOut() {
        this.cy.zoom(this.cy.zoom() * 0.8);
    }

    resetZoom() {
        this.cy.zoom(1);
        this.cy.center();
    }

    exportImage(format = 'png') {
        const png = this.cy.png({
            output: 'blob',
            bg: 'white',
            full: true
        });
        
        const url = URL.createObjectURL(png);
        const link = document.createElement('a');
        link.href = url;
        link.download = `ontology-graph.${format}`;
        link.click();
        URL.revokeObjectURL(url);
    }

    exportData(format = 'json') {
        const elements = this.cy.elements().jsons();
        
        if (format === 'json') {
            const dataStr = JSON.stringify(elements, null, 2);
            const dataBlob = new Blob([dataStr], { type: 'application/json' });
            const url = URL.createObjectURL(dataBlob);
            const link = document.createElement('a');
            link.href = url;
            link.download = 'ontology-graph.json';
            link.click();
            URL.revokeObjectURL(url);
        }
    }

    destroy() {
        if (this.cy) {
            this.cy.destroy();
            this.cy = null;
        }
    }
}

// 그래프 매니저 인스턴스
let graphManager = null;

// 그래프 초기화 함수
function initGraph(containerId = 'cy') {
    if (graphManager) {
        graphManager.destroy();
    }
    
    graphManager = new GraphManager(containerId);
    return graphManager;
}

// 전역 함수들
window.graphManager = {
    init: initGraph,
    getInstance: () => graphManager,
    
    // 편의 함수들
    loadGraph: (limit) => graphManager?.loadGraph(limit),
    changeLayout: (layout) => graphManager?.changeLayout(layout),
    filterByTypes: (types, relationships) => graphManager?.filterByTypes(types, relationships),
    searchNodes: (query) => graphManager?.searchNodes(query),
    fit: () => graphManager?.fit(),
    center: () => graphManager?.center(),
    zoomIn: () => graphManager?.zoomIn(),
    zoomOut: () => graphManager?.zoomOut(),
    resetZoom: () => graphManager?.resetZoom(),
    exportImage: (format) => graphManager?.exportImage(format),
    exportData: (format) => graphManager?.exportData(format)
};
