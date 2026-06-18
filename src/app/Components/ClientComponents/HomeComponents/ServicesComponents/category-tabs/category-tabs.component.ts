import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../../../environments/environment';
// import { environment } from '../../../../../environments/environment';

export interface ICategory {
  id: number;
  name: string;
  servicesCount: number;
}

@Component({
  selector: 'app-category-tabs',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './category-tabs.component.html',
  styleUrls: ['./category-tabs.component.scss'],
})
export class CategoryTabsComponent implements OnInit {
  @Output() categoryChange = new EventEmitter<number>();

  categories: ICategory[] = [];
  selectedId: number = 0; // 0 = all
  isLoading = true;

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.http
      .get<{ success: boolean; data: ICategory[] }>(`${environment.apiUrl}/Categories`)
      .subscribe({
        next: (res) => {
          this.categories = res.data;
          this.isLoading = false;
        },
        error: () => {
          this.isLoading = false;
        },
      });
  }

  selectCategory(id: number): void {
    this.selectedId = id;
    this.categoryChange.emit(id);
  }
}