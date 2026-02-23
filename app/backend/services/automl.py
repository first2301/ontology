"""
scikit-learn 기반 간단 AutoML: 여러 모델을 비교해 최적 모델·점수 반환.
산업데이터에 적합한 모델 도출용 (분류/회귀).
"""
from typing import Any, List, Optional, Literal
import numpy as np
from sklearn.model_selection import cross_val_score
from sklearn.preprocessing import StandardScaler
from sklearn.pipeline import Pipeline
from sklearn.linear_model import LogisticRegression, Ridge
from sklearn.ensemble import RandomForestClassifier, RandomForestRegressor
from sklearn.svm import SVC, SVR

# 분류용 후보
CLASSIFIERS = [
    ("LogisticRegression", LogisticRegression(max_iter=1000)),
    ("RandomForest", RandomForestClassifier(n_estimators=50, random_state=42)),
    ("SVC", SVC(kernel="rbf", random_state=42)),
]
# 회귀용 후보
REGRESSORS = [
    ("Ridge", Ridge()),
    ("RandomForest", RandomForestRegressor(n_estimators=50, random_state=42)),
    ("SVR", SVR(kernel="rbf")),
]


def _get_pipeline(name: str, estimator: Any) -> Pipeline:
    """스케일링 + 추정기 파이프라인."""
    return Pipeline([
        ("scaler", StandardScaler()),
        ("estimator", estimator),
    ])


def select_best_model(
    X: np.ndarray,
    y: np.ndarray,
    task: Literal["classification", "regression"] = "classification",
    cv: int = 3,
    scoring: Optional[str] = None,
) -> dict:
    """
    여러 모델을 교차검증으로 비교해 최적 모델 이름·평균 점수 반환.
    X, y: numpy array (2D, 1D). task가 classification이면 scoring 기본 accuracy, regression이면 r2.
    """
    if task == "classification":
        candidates = CLASSIFIERS
        scoring = scoring or "accuracy"
    else:
        candidates = REGRESSORS
        scoring = scoring or "r2"

    best_name, best_score = None, -np.inf
    results: List[dict] = []

    for name, est in candidates:
        pipe = _get_pipeline(name, est)
        try:
            scores = cross_val_score(pipe, X, y, cv=cv, scoring=scoring)
            mean_score = float(np.mean(scores))
            results.append({"model": name, "mean_score": mean_score, "cv_scores": scores.tolist()})
            if mean_score > best_score:
                best_score = mean_score
                best_name = name
        except Exception:
            continue

    return {
        "best_model": best_name,
        "best_score": best_score,
        "task": task,
        "scoring": scoring,
        "all_results": results,
    }
