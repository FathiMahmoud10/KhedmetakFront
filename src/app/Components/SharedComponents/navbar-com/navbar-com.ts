import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common'; // استيراد CommonModule لتفعيل NgClass و NgIf
import { Router, NavigationEnd, RouterLink } from '@angular/router';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-navbar-com',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './navbar-com.html',
  styleUrl: './navbar-com.scss',
})
export class NavbarCom implements OnInit {
  isAdminPage: boolean = false;
  isSidebarOpen: boolean = false; // التحكم في فتح وغلق السايد بار
  isDarkMode: boolean = false; // التحكم في الوضع الليلي

  constructor(private router: Router) {}

  ngOnInit(): void {
    // مراقبة مسار الصفحة لتحديد إذا كان أدمن أم مواطن عادي
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event: any) => {
      this.isAdminPage = event.url.includes('admin') || event.url.includes('manage');


    });
  }

  // دالة فتح وغلق السايد بار
  toggleSidebar(): void {
    this.isSidebarOpen = !this.isSidebarOpen;
  }

  // دالة تبديل الوضع الليلي والنهاري للموقع بالكامل
  toggleDarkMode(): void {
    this.isDarkMode = !this.isDarkMode;
    if (this.isDarkMode) {
      document.body.classList.add('dark-theme');
    } else {
      document.body.classList.remove('dark-theme');
    }
  }
}
