// Relationship.js - 관계 편집기 관리

class RelationshipManager {
    constructor() {
        this.relationships = [];
        this.newTriple = {
            subject: '',
            predicate: '',
            object: ''
        };
        this.showAddForm = false;
        this.selectedRelationships = [];
        this.history = [];
        this.historyIndex = -1;
        
        this.init();
    }

    init() {
        this.loadRelationships();
        this.setupEventListeners();
    }

    setupEventListeners() {
        // 폼 유효성 검사
        this.setupFormValidation();
        
        // 키보드 단축키
        this.setupKeyboardShortcuts();
    }

    setupFormValidation() {
        // 실시간 유효성 검사
        const validateForm = () => {
            const isValid = this.newTriple.subject && 
                           this.newTriple.predicate && 
                           this.newTriple.object;
            
            const addButton = document.querySelector('.btn-success');
            if (addButton) {
                addButton.disabled = !isValid;
            }
        };

        // 입력 필드 변경 감지
        if (window.Alpine) {
            window.Alpine.effect(() => {
                validateForm();
            });
        }
    }

    setupKeyboardShortcuts() {
        document.addEventListener('keydown', (event) => {
            // Ctrl+Z: 실행 취소
            if (event.ctrlKey && event.key === 'z') {
                event.preventDefault();
                this.undo();
            }
            
            // Ctrl+Y: 다시 실행
            if (event.ctrlKey && event.key === 'y') {
                event.preventDefault();
                this.redo();
            }
            
            // Escape: 폼 닫기
            if (event.key === 'Escape') {
                this.showAddForm = false;
            }
        });
    }

    async loadRelationships() {
        try {
            if (window.utils && window.utils.loading) {
                window.utils.loading.show();
            }

            const response = await window.api.ontology.getTriples();
            this.relationships = window.api.transformers.transformTriples(response);
            
            this.updateAlpineState();

        } catch (error) {
            console.error('Failed to load relationships:', error);
            if (window.showToast) {
                window.showToast({
                    type: 'error',
                    message: 'Failed to load relationships',
                    icon: 'lucide-alert-circle'
                });
            }
        } finally {
            if (window.utils && window.utils.loading) {
                window.utils.loading.hide();
            }
        }
    }

    async addTriple() {
        if (!this.validateTriple(this.newTriple)) {
            if (window.showToast) {
                window.showToast({
                    type: 'error',
                    message: 'Please fill in all fields',
                    icon: 'lucide-alert-circle'
                });
            }
            return;
        }

        try {
            if (window.utils && window.utils.loading) {
                window.utils.loading.show();
            }

            // 히스토리에 현재 상태 저장
            this.saveToHistory();

            const response = await window.api.ontology.createTriple(this.newTriple);
            
            // 성공 시 관계 목록에 추가
            const newRelationship = {
                subject: this.newTriple.subject,
                predicate: this.newTriple.predicate,
                object: this.newTriple.object,
                subject_label: this.newTriple.subject,
                object_label: this.newTriple.object
            };
            
            this.relationships.unshift(newRelationship);
            
            // 폼 초기화
            this.resetForm();
            
            this.updateAlpineState();

            if (window.showToast) {
                window.showToast({
                    type: 'success',
                    message: 'Relationship added successfully',
                    icon: 'lucide-check-circle'
                });
            }

            // 그래프 새로고침
            if (window.graphManager && window.graphManager.getInstance()) {
                window.graphManager.getInstance().loadGraph();
            }

        } catch (error) {
            console.error('Failed to add relationship:', error);
            if (window.showToast) {
                window.showToast({
                    type: 'error',
                    message: 'Failed to add relationship',
                    icon: 'lucide-alert-circle'
                });
            }
        } finally {
            if (window.utils && window.utils.loading) {
                window.utils.loading.hide();
            }
        }
    }

    async deleteTriple(triple) {
        if (!confirm('Are you sure you want to delete this relationship?')) {
            return;
        }

        try {
            if (window.utils && window.utils.loading) {
                window.utils.loading.show();
            }

            // 히스토리에 현재 상태 저장
            this.saveToHistory();

            await window.api.ontology.deleteTriple(triple);
            
            // 관계 목록에서 제거
            this.relationships = this.relationships.filter(rel => 
                !(rel.subject === triple.subject && 
                  rel.predicate === triple.predicate && 
                  rel.object === triple.object)
            );
            
            this.updateAlpineState();

            if (window.showToast) {
                window.showToast({
                    type: 'success',
                    message: 'Relationship deleted successfully',
                    icon: 'lucide-check-circle'
                });
            }

            // 그래프 새로고침
            if (window.graphManager && window.graphManager.getInstance()) {
                window.graphManager.getInstance().loadGraph();
            }

        } catch (error) {
            console.error('Failed to delete relationship:', error);
            if (window.showToast) {
                window.showToast({
                    type: 'error',
                    message: 'Failed to delete relationship',
                    icon: 'lucide-alert-circle'
                });
            }
        } finally {
            if (window.utils && window.utils.loading) {
                window.utils.loading.hide();
            }
        }
    }

    async bulkDelete(selectedTriples) {
        if (selectedTriples.length === 0) {
            if (window.showToast) {
                window.showToast({
                    type: 'warning',
                    message: 'No relationships selected',
                    icon: 'lucide-alert-triangle'
                });
            }
            return;
        }

        if (!confirm(`Are you sure you want to delete ${selectedTriples.length} relationships?`)) {
            return;
        }

        try {
            if (window.utils && window.utils.loading) {
                window.utils.loading.show();
            }

            // 히스토리에 현재 상태 저장
            this.saveToHistory();

            const operation = {
                add: [],
                delete: selectedTriples
            };

            await window.api.ontology.bulkTripleOperation(operation);
            
            // 관계 목록에서 제거
            this.relationships = this.relationships.filter(rel => 
                !selectedTriples.some(selected => 
                    selected.subject === rel.subject && 
                    selected.predicate === rel.predicate && 
                    selected.object === rel.object
                )
            );
            
            this.updateAlpineState();

            if (window.showToast) {
                window.showToast({
                    type: 'success',
                    message: `${selectedTriples.length} relationships deleted successfully`,
                    icon: 'lucide-check-circle'
                });
            }

            // 그래프 새로고침
            if (window.graphManager && window.graphManager.getInstance()) {
                window.graphManager.getInstance().loadGraph();
            }

        } catch (error) {
            console.error('Failed to bulk delete relationships:', error);
            if (window.showToast) {
                window.showToast({
                    type: 'error',
                    message: 'Failed to delete relationships',
                    icon: 'lucide-alert-circle'
                });
            }
        } finally {
            if (window.utils && window.utils.loading) {
                window.utils.loading.hide();
            }
        }
    }

    validateTriple(triple) {
        return triple.subject && triple.predicate && triple.object;
    }

    resetForm() {
        this.newTriple = {
            subject: '',
            predicate: '',
            object: ''
        };
        this.showAddForm = false;
    }

    saveToHistory() {
        // 현재 상태를 히스토리에 저장
        const currentState = {
            relationships: [...this.relationships],
            timestamp: Date.now()
        };
        
        // 현재 인덱스 이후의 히스토리 제거
        this.history = this.history.slice(0, this.historyIndex + 1);
        
        // 새 상태 추가
        this.history.push(currentState);
        this.historyIndex = this.history.length - 1;
        
        // 히스토리 크기 제한 (최대 50개)
        if (this.history.length > 50) {
            this.history.shift();
            this.historyIndex--;
        }
    }

    undo() {
        if (this.historyIndex > 0) {
            this.historyIndex--;
            const previousState = this.history[this.historyIndex];
            this.relationships = [...previousState.relationships];
            this.updateAlpineState();
            
            if (window.showToast) {
                window.showToast({
                    type: 'info',
                    message: 'Undo completed',
                    icon: 'lucide-undo'
                });
            }
        }
    }

    redo() {
        if (this.historyIndex < this.history.length - 1) {
            this.historyIndex++;
            const nextState = this.history[this.historyIndex];
            this.relationships = [...nextState.relationships];
            this.updateAlpineState();
            
            if (window.showToast) {
                window.showToast({
                    type: 'info',
                    message: 'Redo completed',
                    icon: 'lucide-redo'
                });
            }
        }
    }

    filterRelationships(filter) {
        if (!filter) {
            return this.relationships;
        }
        
        const searchTerm = filter.toLowerCase();
        return this.relationships.filter(rel => 
            rel.subject.toLowerCase().includes(searchTerm) ||
            rel.predicate.toLowerCase().includes(searchTerm) ||
            rel.object.toLowerCase().includes(searchTerm) ||
            (rel.subject_label && rel.subject_label.toLowerCase().includes(searchTerm)) ||
            (rel.object_label && rel.object_label.toLowerCase().includes(searchTerm))
        );
    }

    sortRelationships(sortBy, direction = 'asc') {
        return this.relationships.sort((a, b) => {
            let aVal = a[sortBy] || '';
            let bVal = b[sortBy] || '';
            
            if (direction === 'asc') {
                return aVal > bVal ? 1 : -1;
            } else {
                return aVal < bVal ? 1 : -1;
            }
        });
    }

    exportRelationships(format = 'json') {
        const data = this.relationships.map(rel => ({
            subject: rel.subject,
            predicate: rel.predicate,
            object: rel.object,
            subject_label: rel.subject_label,
            object_label: rel.object_label
        }));

        if (format === 'json') {
            const dataStr = JSON.stringify(data, null, 2);
            const dataBlob = new Blob([dataStr], { type: 'application/json' });
            const url = URL.createObjectURL(dataBlob);
            const link = document.createElement('a');
            link.href = url;
            link.download = 'relationships.json';
            link.click();
            URL.revokeObjectURL(url);
        } else if (format === 'csv') {
            const csvContent = this.convertToCSV(data);
            const dataBlob = new Blob([csvContent], { type: 'text/csv' });
            const url = URL.createObjectURL(dataBlob);
            const link = document.createElement('a');
            link.href = url;
            link.download = 'relationships.csv';
            link.click();
            URL.revokeObjectURL(url);
        }
    }

    convertToCSV(data) {
        if (data.length === 0) return '';
        
        const headers = ['Subject', 'Predicate', 'Object', 'Subject Label', 'Object Label'];
        const csvRows = [headers.join(',')];
        
        data.forEach(row => {
            const values = [
                `"${row.subject}"`,
                `"${row.predicate}"`,
                `"${row.object}"`,
                `"${row.subject_label || ''}"`,
                `"${row.object_label || ''}"`
            ];
            csvRows.push(values.join(','));
        });
        
        return csvRows.join('\n');
    }

    updateAlpineState() {
        if (window.Alpine && window.Alpine.store) {
            const store = window.Alpine.store('app');
            if (store) {
                store.relationships = this.relationships;
                store.newTriple = this.newTriple;
                store.showAddForm = this.showAddForm;
            }
        }
    }

    destroy() {
        this.history = [];
        this.historyIndex = -1;
        this.relationships = [];
    }
}

// 관계 매니저 인스턴스
let relationshipManager = null;

// 관계 매니저 초기화 함수
function initRelationshipManager() {
    if (relationshipManager) {
        relationshipManager.destroy();
    }
    
    relationshipManager = new RelationshipManager();
    return relationshipManager;
}

// 전역 함수들
window.relationshipManager = {
    init: initRelationshipManager,
    getInstance: () => relationshipManager,
    
    // 편의 함수들
    loadRelationships: () => relationshipManager?.loadRelationships(),
    addTriple: () => relationshipManager?.addTriple(),
    deleteTriple: (triple) => relationshipManager?.deleteTriple(triple),
    bulkDelete: (triples) => relationshipManager?.bulkDelete(triples),
    undo: () => relationshipManager?.undo(),
    redo: () => relationshipManager?.redo(),
    exportRelationships: (format) => relationshipManager?.exportRelationships(format)
};
