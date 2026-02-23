import React, { useState, useMemo } from 'react';
import { MES_ONTOLOGY, ONTOLOGY_SECTION_DESCRIPTION_KO } from '../constants';
import { MESFunction } from '../types';
import OntologyGraph from './OntologyGraph';
import {
  Network,
  Database,
  ShieldCheck,
  Settings,
  Package,
  Activity,
  X,
  Info,
  CheckCircle,
  ChevronDown,
  ChevronRight,
  GitBranch,
  List,
} from 'lucide-react';

/** 카테고리별 아이콘 */
const CategoryIcon = ({ category, className }: { category: string; className?: string }) => {
  switch (category) {
    case 'Tracking': return <Network className={className || 'w-5 h-5 text-blue-500'} />;
    case 'Quality': return <ShieldCheck className={className || 'w-5 h-5 text-emerald-500'} />;
    case 'Maintenance': return <Settings className={className || 'w-5 h-5 text-amber-500'} />;
    case 'Inventory': return <Package className={className || 'w-5 h-5 text-indigo-500'} />;
    case 'Production': return <Activity className={className || 'w-5 h-5 text-rose-500'} />;
    default: return <Database className={className || 'w-5 h-5 text-slate-500'} />;
  }
};

const CATEGORY_ORDER = ['Tracking', 'Quality', 'Maintenance', 'Inventory', 'Production'] as const;

function groupByCategory(ontology: MESFunction[]): Map<string, MESFunction[]> {
  const map = new Map<string, MESFunction[]>();
  for (const fn of ontology) {
    const list = map.get(fn.category) ?? [];
    list.push(fn);
    map.set(fn.category, list);
  }
  return map;
}

interface OntologyVisualizerProps {
  embedded?: boolean;
  /** 분석 결과로 매칭된 기능 ID 목록. 리스트/그래프에서 해당 항목을 강조 표시합니다. */
  highlightedFunctionIds?: string[];
}

const OntologyVisualizer: React.FC<OntologyVisualizerProps> = ({ embedded = false, highlightedFunctionIds }) => {
  const [selectedFunction, setSelectedFunction] = useState<MESFunction | null>(null);
  const [viewMode, setViewMode] = useState<'graph' | 'list'>('graph');
  const [expanded, setExpanded] = useState<Record<string, boolean>>(() => {
    const init: Record<string, boolean> = {};
    CATEGORY_ORDER.forEach((c) => { init[c] = true; });
    return init;
  });

  const ontologyByCategory = useMemo(() => groupByCategory(MES_ONTOLOGY), []);
  const toggleCategory = (category: string) => setExpanded((prev) => ({ ...prev, [category]: !prev[category] }));

  return (
    <div className={embedded ? 'p-5 sm:p-6' : 'bg-white p-6 rounded-xl border border-slate-200 shadow-sm'}>
      {!embedded && (
        <>
          <div className="flex items-center gap-2 mb-2">
            <Database className="w-6 h-6 text-indigo-600" />
            <h2 className="text-xl font-bold text-slate-800">Standard MES Ontology</h2>
          </div>
          <p className="text-sm text-slate-500 mb-4 leading-relaxed">
            {ONTOLOGY_SECTION_DESCRIPTION_KO}
          </p>
          <div className="flex gap-1 p-1 rounded-lg bg-slate-100 w-fit mb-4">
            <button
              type="button"
              onClick={() => setViewMode('graph')}
              className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                viewMode === 'graph' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-600 hover:text-slate-800'
              }`}
            >
              <GitBranch className="w-4 h-4" />
              그래프
            </button>
            <button
              type="button"
              onClick={() => setViewMode('list')}
              className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                viewMode === 'list' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-600 hover:text-slate-800'
              }`}
            >
              <List className="w-4 h-4" />
              목록
            </button>
          </div>
        </>
      )}
      {embedded && (
        <p className="text-sm text-slate-500 mb-4 leading-relaxed">{ONTOLOGY_SECTION_DESCRIPTION_KO}</p>
      )}

      {viewMode === 'graph' && (
        <OntologyGraph
          onSelectFunction={setSelectedFunction}
          height={embedded ? 320 : 420}
          highlightedIds={highlightedFunctionIds}
        />
      )}

      {viewMode === 'list' && (
        <div className="space-y-1">
          {CATEGORY_ORDER.map((category) => {
            const functions = ontologyByCategory.get(category) ?? [];
            if (functions.length === 0) return null;
            const isOpen = expanded[category] ?? true;
            return (
              <div key={category} className="rounded-lg border border-slate-200 overflow-hidden">
                <button
                  type="button"
                  onClick={() => toggleCategory(category)}
                  className="w-full flex items-center gap-3 px-4 py-3 bg-slate-50 hover:bg-slate-100 border-b border-slate-100 text-left transition-colors"
                  aria-expanded={isOpen}
                >
                  <span className="text-slate-400">{isOpen ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}</span>
                  <CategoryIcon category={category} className="w-5 h-5 shrink-0" />
                  <span className="font-bold text-slate-800 uppercase tracking-wide text-sm">{category}</span>
                  <span className="text-xs px-2 py-0.5 bg-slate-200 text-slate-600 rounded-full font-medium">
                    {functions.length} function{functions.length !== 1 ? 's' : ''}
                  </span>
                </button>
                {isOpen && (
                  <div className="bg-white">
                    {functions.map((fn) => (
                      <div key={fn.id} className="relative flex border-t border-slate-50 first:border-t-0">
                        <div className="absolute left-4 top-0 bottom-0 w-px bg-slate-200" style={{ marginLeft: '0.625rem' }} aria-hidden />
                        <div className="absolute left-4 top-[1.125rem] w-3 h-px bg-slate-200" style={{ marginLeft: '0.625rem' }} aria-hidden />
                        <button
                          type="button"
                          onClick={() => setSelectedFunction(fn)}
                          className={`flex-1 text-left pl-10 pr-4 py-3 hover:bg-slate-50/80 transition-colors group min-w-0 ${
                            highlightedFunctionIds?.includes(fn.id) ? 'bg-indigo-50/80 border-l-2 border-l-indigo-400' : ''
                          }`}
                        >
                          <div className="flex items-center gap-2 flex-wrap">
                            {highlightedFunctionIds?.includes(fn.id) && (
                              <span className="text-[10px] font-bold text-indigo-600 bg-indigo-100 px-1.5 py-0.5 rounded">매칭</span>
                            )}
                            <span className="font-mono text-xs text-slate-400 group-hover:text-indigo-600">{fn.id}</span>
                            <span className="font-semibold text-slate-800 group-hover:text-indigo-600 text-sm">{fn.name}</span>
                            <span className="text-xs px-2 py-0.5 bg-slate-100 rounded font-medium text-slate-500">{fn.standard}</span>
                          </div>
                          <p className="text-xs text-slate-500 mt-0.5 line-clamp-1">{fn.descriptionKo ?? fn.description}</p>
                          <span className="inline-flex items-center gap-1 mt-1 text-xs text-indigo-500 opacity-0 group-hover:opacity-100 transition-opacity">
                            <Info className="w-3 h-3" /> 상세 보기
                          </span>
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* 상세 모달 */}
      {selectedFunction && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm"
          onClick={() => setSelectedFunction(null)}
        >
          <div
            className="bg-white w-full max-w-lg rounded-2xl shadow-xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="bg-slate-800 p-6 text-white relative">
              <button
                type="button"
                onClick={() => setSelectedFunction(null)}
                className="absolute top-4 right-4 p-2 hover:bg-white/10 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
              <div className="flex items-center gap-3 mb-2">
                <CategoryIcon category={selectedFunction.category} className="w-6 h-6 text-indigo-300" />
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">{selectedFunction.category} Module</span>
              </div>
              <h2 className="text-xl font-bold pr-10">{selectedFunction.name}</h2>
              <div className="mt-4 flex flex-wrap gap-2">
                <span className="px-3 py-1 bg-indigo-500/20 text-indigo-200 rounded-md text-xs font-medium border border-indigo-500/30">ID: {selectedFunction.id}</span>
                <span className="px-3 py-1 bg-slate-700 text-slate-300 rounded-md text-xs font-medium">Standard: {selectedFunction.standard}</span>
              </div>
            </div>
            <div className="p-6 space-y-5">
              <section>
                <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-2">
                  <Info className="w-3.5 h-3.5 text-indigo-500" /> Description
                </h4>
                <p className="text-slate-600 text-sm leading-relaxed">{selectedFunction.descriptionKo ?? selectedFunction.description}</p>
              </section>
              <section>
                <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-2">
                  <CheckCircle className="w-3.5 h-3.5 text-emerald-500" /> Implementation Benefits
                </h4>
                <ul className="space-y-2 text-sm text-slate-700">
                  <li className="flex items-start gap-3"><span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />가시성 향상 및 공정 병목 감소.</li>
                  <li className="flex items-start gap-3"><span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />국제 규격 {selectedFunction.standard} 준수.</li>
                  <li className="flex items-start gap-3"><span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />ERP·자동화 계층과 연동 용이.</li>
                </ul>
              </section>
              <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                <p className="text-xs text-slate-400">지식 베이스 기준 최종 반영: 2024년 10월</p>
                <button
                  type="button"
                  onClick={() => setSelectedFunction(null)}
                  className="bg-indigo-600 text-white px-5 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors flex items-center gap-2"
                >
                  <CheckCircle className="w-4 h-4" /> 확인
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OntologyVisualizer;
