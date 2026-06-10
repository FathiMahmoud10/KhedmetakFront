
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BaseChartDirective } from 'ng2-charts';
import { Chart, registerables, ChartConfiguration, ChartOptions } from 'chart.js';

Chart.register(...registerables);

@Component({
  selector: 'app-dashboard',
  standalone: true, // ضروري جداً ليعمل التحميل الكسول في الـ Routing
  imports: [CommonModule, BaseChartDirective], // تضمين أدوات Angular والرسومات البيانية
  templateUrl: './dashboard.html',
  styleUrls: ['./dashboard.scss']
})
export class Dashboard {

  // بيانات الرسم البياني للطلبات (Jan - Jun)
  public lineChartData: ChartConfiguration<'line'>['data'] = {
    labels: ['يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو'],
    datasets: [
      {
        data: [200, 450, 520, 410, 630, 900],
        label: 'الطلبات',
        backgroundColor: 'rgba(14, 77, 70, 0.1)', // خلفية تدرج خفيفة متناسقة مع الهوية
        borderColor: '#0e4d46', // لون الخط الأخضر الداكن المستهدف
        pointBackgroundColor: '#0e4d46',
        pointBorderColor: '#fff',
        pointHoverBackgroundColor: '#fff',
        pointHoverBorderColor: '#0e4d46',
        fill: true // لتعبئة المساحة تحت المنحنى
      }
    ]
  };

  // خيارات وعناصر التحكم بالرسم البياني لمنحه المظهر الانسيابي الناعم
  public lineChartOptions: ChartOptions<'line'> = {
    responsive: true,
    maintainAspectRatio: false,
    elements: {
      line: {
        tension: 0.4 // انحناء الخط اللطيف كالصورة المستهدفة تماماً
      }
    },
    plugins: {
      legend: {
        display: false // إخفاء مربع الدلالات العلوي لشكل أنظف
      }
    },
    scales: {
      y: {
        grid: {
          display: true,
          color: 'rgba(0, 0, 0, 0.03)' // خطوط أفقية خفيفة جداً
        },
        ticks: { 
          color: '#9ca3af',
          font: { family: 'Cairo' }
        }
      },
      x: {
        grid: { 
          display: false // إخفاء الخطوط العمودية
        },
        ticks: { 
          color: '#9ca3af',
          font: { family: 'Cairo' }
        }
      }
    }
  };

}
