#!/usr/bin/env python3
"""
Manufacturing Ontology Sample Data Generator

이 스크립트는 제조 산업 온톨로지 시스템을 위한 샘플 데이터를 생성합니다.
실제 제조 환경을 시뮬레이션하여 테스트 및 데모용 데이터를 제공합니다.
"""

import random
import datetime
from typing import List, Dict, Any
import json

class ManufacturingDataGenerator:
    def __init__(self):
        self.equipment_types = [
            "Assembly Machine", "Testing Machine", "Packaging Machine", 
            "Quality Control Station", "Conveyor Belt", "Robot Arm"
        ]
        self.sensor_types = [
            "Temperature Sensor", "Pressure Sensor", "Vibration Sensor",
            "Quality Sensor", "Speed Sensor", "Position Sensor"
        ]
        self.material_types = [
            "Raw Material A", "Raw Material B", "Component C", 
            "Packaging Material", "Fastener", "Label"
        ]
        self.product_types = [
            "Product Alpha", "Product Beta", "Product Gamma",
            "Product Delta", "Product Epsilon"
        ]
        self.defect_types = [
            "Dimensional Error", "Surface Defect", "Assembly Error",
            "Material Defect", "Packaging Error"
        ]
        
    def generate_equipment(self, count: int = 10) -> List[Dict[str, Any]]:
        """설비 데이터 생성"""
        equipment = []
        for i in range(count):
            equipment.append({
                "id": f"EQ{i+1:03d}",
                "name": f"{random.choice(self.equipment_types)} {i+1}",
                "type": random.choice(self.equipment_types),
                "status": random.choice(["active", "maintenance", "idle", "error"]),
                "location": f"Area {chr(65 + i % 5)}",
                "manufacturer": random.choice(["Siemens", "ABB", "Fanuc", "KUKA", "Yaskawa"]),
                "model": f"Model-{random.randint(1000, 9999)}",
                "installation_date": self.random_date(days_back=365*5),
                "last_maintenance": self.random_date(days_back=30)
            })
        return equipment
    
    def generate_sensors(self, equipment: List[Dict], count_per_equipment: int = 2) -> List[Dict[str, Any]]:
        """센서 데이터 생성"""
        sensors = []
        sensor_id = 1
        
        for eq in equipment:
            for _ in range(count_per_equipment):
                sensors.append({
                    "id": f"SN{sensor_id:03d}",
                    "name": f"{random.choice(self.sensor_types)} {sensor_id}",
                    "type": random.choice(self.sensor_types),
                    "equipment_id": eq["id"],
                    "unit": self.get_sensor_unit(random.choice(self.sensor_types)),
                    "spec_upper": random.uniform(80, 120),
                    "spec_lower": random.uniform(20, 40),
                    "current_value": random.uniform(30, 90),
                    "status": random.choice(["active", "warning", "error"])
                })
                sensor_id += 1
        return sensors
    
    def generate_work_orders(self, count: int = 50) -> List[Dict[str, Any]]:
        """작업지시서 데이터 생성"""
        work_orders = []
        statuses = ["planned", "in_progress", "completed", "cancelled"]
        
        for i in range(count):
            planned_qty = random.randint(50, 500)
            status = random.choice(statuses)
            
            if status == "completed":
                actual_qty = planned_qty + random.randint(-20, 20)
            elif status == "in_progress":
                actual_qty = random.randint(0, planned_qty)
            else:
                actual_qty = 0
            
            work_orders.append({
                "id": f"WO{i+1:04d}",
                "work_order_number": f"WO{i+1:04d}",
                "product_type": random.choice(self.product_types),
                "planned_quantity": planned_qty,
                "actual_quantity": max(0, actual_qty),
                "status": status,
                "priority": random.choice(["low", "medium", "high", "urgent"]),
                "start_time": self.random_date(days_back=30),
                "end_time": self.random_date(days_back=1) if status in ["completed", "cancelled"] else None,
                "equipment_id": f"EQ{random.randint(1, 10):03d}",
                "operator": f"Operator {random.randint(1, 20)}",
                "quality_target": random.uniform(95, 99.5)
            })
        return work_orders
    
    def generate_quality_data(self, work_orders: List[Dict]) -> List[Dict[str, Any]]:
        """품질 데이터 생성"""
        quality_data = []
        
        for wo in work_orders:
            if wo["status"] == "completed":
                # 완료된 작업지시서에 대해 품질 데이터 생성
                for _ in range(random.randint(1, 3)):
                    quality_data.append({
                        "id": f"QC{len(quality_data)+1:04d}",
                        "work_order_id": wo["id"],
                        "product_id": f"P{wo['id']}_{random.randint(1, wo['actual_quantity'])}",
                        "test_type": random.choice(["Dimensional", "Functional", "Visual", "Performance"]),
                        "result": random.choice(["pass", "fail", "pending"]),
                        "score": random.uniform(80, 100),
                        "test_time": self.random_date(days_back=5),
                        "inspector": f"Inspector {random.randint(1, 10)}",
                        "notes": self.generate_random_notes()
                    })
        return quality_data
    
    def generate_defects(self, quality_data: List[Dict]) -> List[Dict[str, Any]]:
        """불량 데이터 생성"""
        defects = []
        
        for qc in quality_data:
            if qc["result"] == "fail":
                defects.append({
                    "id": f"DF{len(defects)+1:04d}",
                    "quality_check_id": qc["id"],
                    "product_id": qc["product_id"],
                    "defect_type": random.choice(self.defect_types),
                    "severity": random.choice(["minor", "major", "critical"]),
                    "count": random.randint(1, 10),
                    "description": f"Defect in {qc['test_type']} test",
                    "detected_time": qc["test_time"],
                    "corrective_action": random.choice(["Rework", "Scrap", "Repair", "Return to supplier"])
                })
        return defects
    
    def generate_maintenance_records(self, equipment: List[Dict]) -> List[Dict[str, Any]]:
        """유지보수 기록 생성"""
        maintenance = []
        
        for eq in equipment:
            # 각 설비당 2-5개의 유지보수 기록
            for _ in range(random.randint(2, 5)):
                maintenance.append({
                    "id": f"MT{len(maintenance)+1:04d}",
                    "equipment_id": eq["id"],
                    "type": random.choice(["preventive", "corrective", "predictive"]),
                    "description": f"{random.choice(['Routine maintenance', 'Component replacement', 'Calibration', 'Cleaning'])} for {eq['name']}",
                    "start_time": self.random_date(days_back=60),
                    "duration_hours": random.uniform(1, 8),
                    "technician": f"Tech {random.randint(1, 15)}",
                    "status": random.choice(["completed", "in_progress", "scheduled"]),
                    "cost": random.uniform(100, 2000),
                    "parts_replaced": random.randint(0, 5),
                    "notes": self.generate_random_notes()
                })
        return maintenance
    
    def generate_batches(self, work_orders: List[Dict]) -> List[Dict[str, Any]]:
        """배치 데이터 생성"""
        batches = []
        batch_id = 1
        
        for wo in work_orders:
            if wo["status"] == "completed":
                # 완료된 작업지시서를 배치로 그룹화
                batch_size = random.randint(10, wo["actual_quantity"])
                batch_count = (wo["actual_quantity"] + batch_size - 1) // batch_size
                
                for _ in range(batch_count):
                    batches.append({
                        "id": f"BT{batch_id:04d}",
                        "batch_number": f"B{batch_id:04d}",
                        "work_order_id": wo["id"],
                        "product_type": wo["product_type"],
                        "quantity": min(batch_size, wo["actual_quantity"] - (batch_id - 1) * batch_size),
                        "start_time": wo["start_time"],
                        "end_time": wo["end_time"],
                        "status": random.choice(["completed", "in_progress", "pending"]),
                        "quality_score": random.uniform(90, 100),
                        "operator": wo["operator"]
                    })
                    batch_id += 1
        return batches
    
    def generate_sensor_readings(self, sensors: List[Dict], days: int = 7) -> List[Dict[str, Any]]:
        """센서 측정값 데이터 생성"""
        readings = []
        
        for sensor in sensors:
            # 각 센서당 하루에 24개 측정값 (시간당 1개)
            for day in range(days):
                for hour in range(24):
                    timestamp = datetime.datetime.now() - datetime.timedelta(days=day, hours=hour)
                    
                    # 센서 타입에 따른 값 범위 설정
                    if "Temperature" in sensor["type"]:
                        value = random.uniform(20, 100)
                    elif "Pressure" in sensor["type"]:
                        value = random.uniform(0.5, 3.0)
                    elif "Vibration" in sensor["type"]:
                        value = random.uniform(0, 10)
                    elif "Speed" in sensor["type"]:
                        value = random.uniform(50, 150)
                    else:
                        value = random.uniform(0, 100)
                    
                    readings.append({
                        "id": f"RD{len(readings)+1:06d}",
                        "sensor_id": sensor["id"],
                        "equipment_id": sensor["equipment_id"],
                        "value": round(value, 2),
                        "unit": sensor["unit"],
                        "timestamp": timestamp.isoformat(),
                        "status": "normal" if sensor["spec_lower"] <= value <= sensor["spec_upper"] else "warning"
                    })
        return readings
    
    def get_sensor_unit(self, sensor_type: str) -> str:
        """센서 타입에 따른 단위 반환"""
        units = {
            "Temperature Sensor": "°C",
            "Pressure Sensor": "bar",
            "Vibration Sensor": "mm/s",
            "Speed Sensor": "rpm",
            "Quality Sensor": "%",
            "Position Sensor": "mm"
        }
        return units.get(sensor_type, "unit")
    
    def random_date(self, days_back: int = 30) -> str:
        """랜덤 날짜 생성"""
        now = datetime.datetime.now()
        random_days = random.randint(0, days_back)
        random_hours = random.randint(0, 23)
        random_minutes = random.randint(0, 59)
        
        date = now - datetime.timedelta(days=random_days, hours=random_hours, minutes=random_minutes)
        return date.isoformat()
    
    def generate_random_notes(self) -> str:
        """랜덤 노트 생성"""
        notes = [
            "No issues detected",
            "Minor adjustment required",
            "Component needs replacement",
            "Calibration completed successfully",
            "Cleaning performed",
            "Lubrication applied",
            "Software update installed",
            "Hardware inspection passed"
        ]
        return random.choice(notes)
    
    def generate_all_data(self) -> Dict[str, Any]:
        """모든 데이터 생성"""
        print("Generating manufacturing sample data...")
        
        equipment = self.generate_equipment(10)
        sensors = self.generate_sensors(equipment, 2)
        work_orders = self.generate_work_orders(50)
        quality_data = self.generate_quality_data(work_orders)
        defects = self.generate_defects(quality_data)
        maintenance = self.generate_maintenance_records(equipment)
        batches = self.generate_batches(work_orders)
        sensor_readings = self.generate_sensor_readings(sensors, 7)
        
        data = {
            "metadata": {
                "generated_at": datetime.datetime.now().isoformat(),
                "total_records": {
                    "equipment": len(equipment),
                    "sensors": len(sensors),
                    "work_orders": len(work_orders),
                    "quality_data": len(quality_data),
                    "defects": len(defects),
                    "maintenance": len(maintenance),
                    "batches": len(batches),
                    "sensor_readings": len(sensor_readings)
                }
            },
            "equipment": equipment,
            "sensors": sensors,
            "work_orders": work_orders,
            "quality_data": quality_data,
            "defects": defects,
            "maintenance": maintenance,
            "batches": batches,
            "sensor_readings": sensor_readings
        }
        
        print(f"Generated {data['metadata']['total_records']} total records")
        return data
    
    def save_to_files(self, data: Dict[str, Any], output_dir: str = "generated_data"):
        """데이터를 파일로 저장"""
        import os
        
        os.makedirs(output_dir, exist_ok=True)
        
        # 전체 데이터를 JSON으로 저장
        with open(f"{output_dir}/manufacturing_data.json", "w", encoding="utf-8") as f:
            json.dump(data, f, indent=2, ensure_ascii=False)
        
        # 각 카테고리별로 개별 파일 저장
        for category in ["equipment", "sensors", "work_orders", "quality_data", 
                        "defects", "maintenance", "batches", "sensor_readings"]:
            with open(f"{output_dir}/{category}.json", "w", encoding="utf-8") as f:
                json.dump(data[category], f, indent=2, ensure_ascii=False)
        
        print(f"Data saved to {output_dir}/ directory")

def main():
    """메인 함수"""
    generator = ManufacturingDataGenerator()
    
    # 데이터 생성
    data = generator.generate_all_data()
    
    # 파일로 저장
    generator.save_to_files(data)
    
    # 통계 출력
    print("\n=== Generated Data Summary ===")
    for category, count in data["metadata"]["total_records"].items():
        print(f"{category.replace('_', ' ').title()}: {count:,} records")
    
    print(f"\nTotal records: {sum(data['metadata']['total_records'].values()):,}")

if __name__ == "__main__":
    main()
