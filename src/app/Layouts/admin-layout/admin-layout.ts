import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router'; 
import { Sidebar } from '../../Components/SharedComponents/sidebar/sidebar'; 
import { AdminNavbar } from '../../Components/SharedComponents/admin-navbar/admin-navbar';

@Component({
  selector: 'app-admin-layout',
  standalone: true,
  imports: [
    RouterOutlet, 
    Sidebar, 
    AdminNavbar
  ], 
  templateUrl: './admin-layout.html',
  styleUrl: './admin-layout.scss'
})
export class AdminLayout { }


