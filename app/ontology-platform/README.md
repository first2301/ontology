<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Smart MES Selection Platform (Ontology Platform)

로컬 실행 및 배포를 위한 저장소입니다.

## 기술개발 맥락

1. **제조기업 공정 모델링 및 필요 기능 추출 기술개발**  
   - 입력한 산업데이터에 적합한 모델을 AutoML로 도출  
   - 입력한 산업데이터에 대한 필요 기능 추출  

2. **국제 표준 MES 기능 모델에 대한 온톨로지(Ontology) 모델 구축**  
   - 다양한 산업데이터의 모델링 결과를 반영한 온톨로지 구축  

3. **도출된 필요기능(제조공정 모델링) 모델과 표준기능(온톨로지) 모델 간 매칭**  
   - 입력 산업데이터와 온톨로지에 구축된 다양한 산업데이터 모델링 결과 간 매칭  

4. **매칭 결과를 바탕으로 제조기업에 필요한 MES 기능 제안(우선순위) 시스템 개발**  
   - 매칭 결과 기반 필요 MES 기능 제안 (Rule based)  

5. **산업데이터 증강분석 플랫폼을 활용한 필요기능·표준기능 매칭 자동화**  
   - 매칭 시스템 자동화 및 증강분석 활용 제안  

## Run Locally

**Prerequisites:** Node.js  

1. Install dependencies: `npm install`  
2. Run the app: `npm run dev`  

### 백엔드 연동 (선택)

Manufacturing Ontology API 백엔드가 떠 있을 때, AutoML 단계에서 실제 모델 도출을 쓰려면 프로젝트 루트에 `.env` 또는 `.env.local`을 두고 다음을 설정합니다.

- `VITE_API_URL=http://localhost:8000` (백엔드 주소)

설정 시 Run Analysis 시 백엔드 `POST /automl/fit`를 호출해 도출된 모델명을 파이프라인에 표시합니다. 미설정 시 해당 단계는 시뮬레이션으로 동작합니다.
