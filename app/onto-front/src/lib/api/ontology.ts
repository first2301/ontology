// 온톨로지 관련 API

import { apiClient } from './client';
import type {
  GraphElementsResponse,
  TriplesResponse,
  Triple,
  BulkTripleOperation,
  ImportResult,
} from '@/types/api';

export const ontologyAPI = {
  /**
   * 그래프 요소 조회
   */
  async getGraphElements(limit: number = 100): Promise<GraphElementsResponse> {
    return apiClient.get<GraphElementsResponse>('/graph/elements', { limit });
  },

  /**
   * 관계 조회
   */
  async getTriples(
    subject?: string,
    predicate?: string,
    object?: string
  ): Promise<TriplesResponse> {
    const params: Record<string, string> = {};
    if (subject) params.subject = subject;
    if (predicate) params.predicate = predicate;
    if (object) params.object = object;
    return apiClient.get<TriplesResponse>('/ontology/triples', params);
  },

  /**
   * 관계 추가
   */
  async createTriple(triple: Triple): Promise<{ message: string }> {
    return apiClient.post('/ontology/triples', triple);
  },

  /**
   * 관계 삭제
   */
  async deleteTriple(triple: Triple): Promise<{ message: string }> {
    return apiClient.delete('/ontology/triples', triple);
  },

  /**
   * 노드 삭제
   */
  async deleteNode(nodeId: string): Promise<{ message: string }> {
    return apiClient.delete(`/ontology/nodes/${nodeId}`);
  },

  /**
   * 벌크 작업
   */
  async bulkTripleOperation(
    operation: BulkTripleOperation
  ): Promise<{ added: number; deleted: number; errors: string[] }> {
    return apiClient.post('/ontology/triples/bulk', operation);
  },

  /**
   * 파일 업로드 및 검증
   */
  async validateAndImport(
    dataFile: File,
    shapesFile: File
  ): Promise<ImportResult> {
    const formData = new FormData();
    formData.append('data_ttl', dataFile);
    formData.append('shapes_ttl', shapesFile);
    return apiClient.upload<ImportResult>('/ontology/validate-and-import', formData);
  },
};

