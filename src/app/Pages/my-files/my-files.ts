import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { AuthService } from '../../APIServices/SharedServices/auth.service';
import { DocumentsApiService, UserDocument } from '../../APIServices/SharedServices/documents-api.service';

@Component({
  selector: 'app-my-files',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './my-files.html',
  styleUrls: ['./my-files.scss']
})
export class MyFiles implements OnInit {
  @ViewChild('fileInput') fileInput!: ElementRef<HTMLInputElement>;

  loading = true;
  uploading = false;
  errorMsg = '';
  successMsg = '';

  files: UserDocument[] = [];
  selectedPreviewFile: UserDocument | null = null;

  constructor(
    private documentsService: DocumentsApiService,
    private authService: AuthService,
    private router: Router,
    private sanitizer: DomSanitizer
  ) {}

  ngOnInit(): void {
    const token = this.authService.getTokenFromCookie();
    if (!token) {
      this.router.navigate(['/login']);
      return;
    }
    this.loadFiles();
  }

  loadFiles(): void {
    this.loading = true;
    this.errorMsg = '';

    this.documentsService.getMyDocuments().subscribe({
      next: (res) => {
        this.files = res?.data ?? [];
        this.loading = false;
      },
      error: (err) => {
        console.error('فشل تحميل الملفات:', err);
        this.errorMsg = 'تعذر تحميل ملفاتك حالياً، حاول مرة أخرى لاحقاً.';
        this.loading = false;
      }
    });
  }

  triggerUpload(): void {
    this.fileInput?.nativeElement.click();
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    input.value = '';
    if (!file) return;

    this.uploading = true;
    this.errorMsg = '';
    this.successMsg = '';

    this.documentsService.upload(file).subscribe({
      next: (res) => {
        if (res?.data) {
          this.files = [res.data, ...this.files];
        }
        this.successMsg = `تم رفع "${file.name}" بنجاح.`;
        this.uploading = false;
      },
      error: (err) => {
        console.error('فشل رفع الملف:', err);
        this.errorMsg = err?.error?.message || 'فشل رفع الملف، حاول مرة أخرى.';
        this.uploading = false;
      }
    });
  }

  fileUrl(filePath: string): string {
    return this.documentsService.fileUrl(filePath);
  }

  getSafeUrl(filePath: string): SafeResourceUrl {
    return this.sanitizer.bypassSecurityTrustResourceUrl(this.fileUrl(filePath));
  }

  isImage(fileType: string): boolean {
    const ext = (fileType || '').toLowerCase().replace('.', '');
    return ['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(ext);
  }

  openPreview(file: UserDocument): void {
    this.selectedPreviewFile = file;
  }

  closePreview(): void {
    this.selectedPreviewFile = null;
  }

  getFileIcon(fileType: string): string {
    const ext = (fileType || '').toLowerCase().replace('.', '');
    if (['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(ext)) return 'fa-file-image';
    if (ext === 'pdf') return 'fa-file-pdf';
    if (['doc', 'docx'].includes(ext)) return 'fa-file-word';
    if (['xls', 'xlsx'].includes(ext)) return 'fa-file-excel';
    return 'fa-file';
  }
}
