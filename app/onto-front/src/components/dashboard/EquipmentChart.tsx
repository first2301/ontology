'use client';

import { useRef, useMemo } from 'react';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
} from 'chart.js';
import { Doughnut } from 'react-chartjs-2';
import type { EquipmentStatusData } from '@/types/manufacturing';

ChartJS.register(ArcElement, Tooltip, Legend);

interface EquipmentChartProps {
  data: EquipmentStatusData;
}

export default function EquipmentChart({ data }: EquipmentChartProps) {
  const chartRef = useRef<ChartJS<'doughnut'>>(null);

  const chartData = useMemo(() => ({
    labels: ['Active', 'Maintenance', 'Idle', 'Error'],
    datasets: [
      {
        data: [data.active, data.maintenance, data.idle, data.error],
        backgroundColor: ['#28a745', '#ffc107', '#6c757d', '#dc3545'],
        borderWidth: 2,
        borderColor: '#fff',
      },
    ],
  }), [data]);

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom' as const,
      },
      title: {
        display: false,
      },
    },
  };

  return (
    <div className="h-64">
      <Doughnut ref={chartRef} data={chartData} options={options} />
    </div>
  );
}

