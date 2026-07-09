import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminService } from '../../APIServices/SharedServices/admin';
import { environment } from '../../../environments/environment';

export interface StandardDocument {
  id: number;
  documentName: string;
  imagePath: string;
  generalRule?: string;
}

@Component({
  selector: 'app-admin-standard-documents',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-standard-documents.html',
  styleUrls: ['./admin-standard-documents.scss']
})
export class AdminStandardDocumentsComponent implements OnInit {

  documents: StandardDocument[] = [];
  isLoading = true;
  errorMessage: string | null = null;
  successMessage: string | null = null;

  // New Document Form
  newDocName: string = '';
  newGeneralRule: string = '';
  newFile: File | null = null;
  newFilePreview: string | null = null;
  isSaving = false;

  // Edit Modal
  showEditModal = false;
  editingDoc: StandardDocument | null = null;
  editDocName: string = '';
  editGeneralRule: string = '';
  editFile: File | null = null;
  editFilePreview: string | null = null;
  isSavingEdit = false;
  editErrorMessage: string | null = null;

  // Delete Modal
  showDeleteModal = false;
  selectedDoc: StandardDocument | null = null;
  isDeleting = false;
  deleteErrorMessage: string | null = null;

  constructor(private adminService: AdminService) {}

  ngOnInit(): void {
    this.loadDocuments();
  }

  loadDocuments(): void {
    this.isLoading = true;
    this.errorMessage = null;
    this.adminService.getStandardDocuments().subscribe({
      next: (res: any) => {
        this.isLoading = false;
        if (Array.isArray(res)) {
          this.documents = res;
        } else if (res?.data && Array.isArray(res.data)) {
          this.documents = res.data;
        } else {
          this.documents = [];
        }
      },
      error: (err) => {
        this.isLoading = false;
        this.errorMessage = err?.error?.message || err?.message || 'تعذر تحميل المستندات القياسية.';
      }
    });
  }

  getAbsoluteUrl(path?: string): string {
    if (!path) return '';
    if (path.startsWith('http://') || path.startsWith('https://')) return path;
    const cleanPath = path.startsWith('/') ? path : '/' + path;
    return `${environment.apiUrl}${cleanPath}`;
  }

  // Handle New File Selection
  onNewFileSelected(event: any): void {
    const file = event.target?.files?.[0];
    if (file) {
      this.newFile = file;
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.newFilePreview = e.target.result;
      };
      reader.readAsDataURL(file);
    } else {
      this.newFile = null;
      this.newFilePreview = null;
    }
  }

  // Handle Edit File Selection
  onEditFileSelected(event: any): void {
    const file = event.target?.files?.[0];
    if (file) {
      this.editFile = file;
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.editFilePreview = e.target.result;
      };
      reader.readAsDataURL(file);
    } else {
      this.editFile = null;
      this.editFilePreview = null;
    }
  }

  saveDocument(): void {
    this.successMessage = null;
    this.errorMessage = null;

    if (!this.newDocName.trim()) {
      this.errorMessage = 'يرجى إدخال اسم المستند.';
      return;
    }

    this.isSaving = true;
    const formData = new FormData();
    formData.append('DocumentName', this.newDocName.trim());
    formData.append('GeneralRule', this.newGeneralRule.trim());
    if (this.newFile) {
      formData.append('StandardDocumentFile', this.newFile);
    }

    this.adminService.createStandardDocument(formData).subscribe({
      next: (res) => {
        this.isSaving = false;
        this.successMessage = 'تم إضافة المستند القياسي بنجاح.';
        this.resetNewForm();
        this.loadDocuments();
      },
      error: (err) => {
        this.isSaving = false;
        this.errorMessage = err?.error?.message || err?.message || 'فشل إضافة المستند القياسي.';
      }
    });
  }

  resetNewForm(): void {
    this.newDocName = '';
    this.newGeneralRule = '';
    this.newFile = null;
    this.newFilePreview = null;
  }

  // Edit Modal Operations
  openEdit(doc: StandardDocument): void {
    this.editingDoc = doc;
    this.editDocName = doc.documentName;
    this.editGeneralRule = doc.generalRule || '';
    this.editFile = null;
    this.editFilePreview = null;
    this.editErrorMessage = null;
    this.showEditModal = true;
  }

  closeEdit(): void {
    if (this.isSavingEdit) return;
    this.showEditModal = false;
    this.editingDoc = null;
  }

  saveEdit(): void {
    if (!this.editingDoc) return;

    this.isSavingEdit = true;
    this.editErrorMessage = null;

    const formData = new FormData();
    formData.append('Id', this.editingDoc.id.toString());
    formData.append('DocumentName', this.editDocName.trim());
    formData.append('GeneralRule', this.editGeneralRule.trim());
    if (this.editFile) {
      formData.append('StandardDocumentFile', this.editFile);
    }

    this.adminService.updateStandardDocument(this.editingDoc.id, formData).subscribe({
      next: (res) => {
        this.isSavingEdit = false;
        this.showEditModal = false;
        this.editingDoc = null;
        this.loadDocuments();
      },
      error: (err) => {
        this.isSavingEdit = false;
        this.editErrorMessage = err?.error?.message || err?.message || 'فشل تعديل المستند القياسي.';
      }
    });
  }

  // Delete Operations
  openDelete(doc: StandardDocument): void {
    this.selectedDoc = doc;
    this.showDeleteModal = true;
    this.deleteErrorMessage = null;
  }

  closeDelete(): void {
    if (this.isDeleting) return;
    this.showDeleteModal = false;
    this.selectedDoc = null;
  }

  confirmDelete(): void {
    if (!this.selectedDoc) return;

    this.isDeleting = true;
    this.deleteErrorMessage = null;

    this.adminService.deleteStandardDocument(this.selectedDoc.id).subscribe({
      next: (res) => {
        this.isDeleting = false;
        this.showDeleteModal = false;
        this.selectedDoc = null;
        this.loadDocuments();
      },
      error: (err) => {
        this.isDeleting = false;
        this.deleteErrorMessage = err?.error?.message || err?.message || 'فشل حذف المستند القياسي.';
      }
    });
  }

  parseRules(ruleString?: string): string[] {
    if (!ruleString) return [];
    return ruleString
      .split(/[\n\r;]+/)
      .map(r => r.trim())
      .filter(r => r.length > 0);
  }
}
