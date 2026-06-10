import { Component } from '@angular/core';
import { RouterModule } from '@angular/router'; // استيراد الـ Router للربط

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [RouterModule], // إضافته هنا
  templateUrl: './sidebar.html',
  styleUrl: './sidebar.scss',
})
export class Sidebar {}

