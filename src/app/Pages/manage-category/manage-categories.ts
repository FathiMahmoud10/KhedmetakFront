import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';

// ============================================================
// Models — مطابقة لشكل الـ Response اللي وصلني من الـ API
// ============================================================
export interface Category {
  id: number;
  name: string;
  servicesCount: number;
}

interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

@Component({
  selector: 'app-manage-categories',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './manage-categories.html',
  styleUrls: ['./manage-categories.scss']
})
export class ManageCategories implements OnInit {
  private http = inject(HttpClient);

  private apiUrl = `${environment.apiUrl}/admin/categories`;

  categoriesList: Category[] = [];
  isLoading = false;
  errorMsg = '';

  newCategory = {
    name: ''
  };

  ngOnInit(): void {
    this.loadCategories();
  }

  // --------------------------------------------------------
  // GET — تحميل الفئات
  // --------------------------------------------------------
  loadCategories(): void {
    this.isLoading = true;
    this.errorMsg = '';

    this.http.get<ApiResponse<Category[]>>(this.apiUrl).subscribe({
      next: (res) => {
        this.categoriesList = res?.data ?? [];
        this.isLoading = false;
      },
      error: (err) => {
        console.error(err);
        this.errorMsg = 'حدث خطأ أثناء تحميل الفئات';
        this.isLoading = false;
      }
    });
  }

  // --------------------------------------------------------
  // POST — إضافة فئة جديدة
  // --------------------------------------------------------
  isAdding = false;

  addCategory(): void {
    const name = this.newCategory.name.trim();
    if (!name || this.isAdding) return;

    this.isAdding = true;

    this.http.post<ApiResponse<Category>>(this.apiUrl, { name }).subscribe({
      next: (res) => {
        if (res?.data) {
          this.categoriesList.push(res.data);
        } else {
          this.loadCategories();
        }
        this.newCategory.name = '';
        this.isAdding = false;
      },
      error: (err) => {
        console.error(err);
        this.errorMsg = 'حدث خطأ أثناء إضافة الفئة';
        this.isAdding = false;
      }
    });
  }

  // --------------------------------------------------------
  // Edit Modal
  // --------------------------------------------------------
  showEditModal = false;
  selectedCategory: Category | null = null;
  editName = '';
  isSaving = false;

  openEdit(cat: Category): void {
    this.selectedCategory = cat;
    this.editName = cat.name;
    this.showEditModal = true;
  }

  closeEdit(): void {
    this.showEditModal = false;
    this.selectedCategory = null;
    this.editName = '';
  }

  // PUT — حفظ تعديل اسم الفئة
  saveEdit(): void {
    const name = this.editName.trim();
    if (!name || !this.selectedCategory || this.isSaving) return;

    const id = this.selectedCategory.id;
    this.isSaving = true;

    this.http.put<ApiResponse<Category>>(`${this.apiUrl}/${id}`, { name }).subscribe({
      next: (res) => {
        const idx = this.categoriesList.findIndex(c => c.id === id);
        if (idx > -1) {
          this.categoriesList[idx] = res?.data ?? { ...this.categoriesList[idx], name };
        }
        this.isSaving = false;
        this.closeEdit();
      },
      error: (err) => {
        console.error(err);
        this.errorMsg = 'حدث خطأ أثناء تعديل الفئة';
        this.isSaving = false;
      }
    });
  }

  // --------------------------------------------------------
  // Delete Modal
  // --------------------------------------------------------
  showDeleteModal = false;
  isDeleting = false;

  openDelete(cat: Category): void {
    this.selectedCategory = cat;
    this.showDeleteModal = true;
  }

  closeDelete(): void {
    this.showDeleteModal = false;
    this.selectedCategory = null;
  }

  // DELETE — تنفيذ الحذف بعد التأكيد من المودال
  confirmDelete(): void {
    if (!this.selectedCategory || this.isDeleting) return;

    const id = this.selectedCategory.id;
    this.isDeleting = true;

    this.http.delete<ApiResponse<null>>(`${this.apiUrl}/${id}`).subscribe({
      next: () => {
        this.categoriesList = this.categoriesList.filter(c => c.id !== id);
        this.isDeleting = false;
        this.closeDelete();
      },
      error: (err) => {
        console.error(err);
        this.errorMsg = 'حدث خطأ أثناء حذف الفئة';
        this.isDeleting = false;
      }
    });
  }

  // --------------------------------------------------------
  // Helpers — لون وأيقونة لكل فئة
  // --------------------------------------------------------
  private readonly knownIcons: { [key: string]: string } = {
    'المرور': 'fa-car',
    'الأحوال المدنية': 'fa-id-card',
    'الشهر العقاري': 'fa-file-contract',
    'الجوازات والهجرة': 'fa-passport',
    'التعليم': 'fa-graduation-cap',
    'الصحة': 'fa-heartbeat',
    'التموين': 'fa-shopping-basket'
  };

  private readonly colorClasses = ['cc--blue', 'cc--green', 'cc--purple', 'cc--teal', 'cc--orange'];

  getCategoryIcon(name: string): string {
    return this.knownIcons[name] || 'fa-layer-group';
  }

  getCategoryColorClass(id: number): string {
    return this.colorClasses[id % this.colorClasses.length];
  }

  get totalServicesCount(): number {
    return this.categoriesList.reduce((sum, c) => sum + (c.servicesCount || 0), 0);
  }
}