import {
  Component, OnInit, ViewChild, ElementRef,
  AfterViewChecked, HostListener
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ChatApiService } from '../../APIServices/SharedServices/chat-api.service';
import { AuthService } from '../../APIServices/SharedServices/auth.service';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  liked?: boolean;
  attachments?: UploadedFile[];
}

interface Suggestion {
  icon: string;
  text: string;
}

interface Service {
  id: string;
  icon: string;
  name: string;
  description: string;
  active: boolean;
}

export interface UploadedFile {
  name: string;
  size: number;
  type: string;
  previewUrl?: string;
  isImage: boolean;
}

@Component({
  selector: 'app-chat-page',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './chat-page.component.html',
  styleUrls: ['./chat-page.component.scss'],
})
export class ChatPageComponent implements OnInit, AfterViewChecked {
  @ViewChild('messagesContainer') messagesContainer!: ElementRef;
  @ViewChild('messageInput')      messageInput!: ElementRef;
  @ViewChild('fileInput')         fileInput!: ElementRef;
  @ViewChild('imageInput')        imageInput!: ElementRef;

  sidebarCollapsed = false;
  modelMenuOpen    = false;
  isTyping         = false;
  currentMessage   = '';
  activeChat       = 0;
  currentSessionGuid: string | null = null;
  isDragging       = false;

  // ── Guest / Auth ──────────────────────────
  isLoggedIn        = false;
  userEmail         = '';
  userDisplayName   = '';
  guestMessageLimit = 3;
  guestMessageCount = 0;
  showLoginPopup    = false;
  showImagePreview  = false;
  previewImageUrl   = '';
  copiedIndex       = -1;

  private readonly GUEST_COUNT_KEY   = 'khedmetak_guest_msg_count';
  private readonly GUEST_SESSION_KEY = 'khedmetak_guest_session';
  private readonly GUEST_ID_KEY      = 'khedmetak_guest_id';

  messages:      Message[]      = [];
  uploadedFiles: UploadedFile[] = [];

  services: Service[] = [
    { id: 'general',    icon: '🤖', name: 'المساعد العام',         description: 'أسئلة عامة عن الخدمات الحكومية',     active: true  },
    { id: 'license',    icon: '🚗', name: 'رخصة القيادة',          description: 'تجديد واستخراج الرخص المرورية',       active: false },
    { id: 'id',         icon: '🪪', name: 'بطاقة الرقم القومي',    description: 'استخراج وتجديد البطاقة الشخصية',      active: false },
    { id: 'birth',      icon: '📄', name: 'شهادة الميلاد',         description: 'طلب واستخراج شهادات الميلاد',         active: false },
    { id: 'commercial', icon: '🏢', name: 'السجل التجاري',         description: 'تسجيل الشركات والمنشآت التجارية',     active: false },
  ];

  recentChats: string[] = [
    'كيف أجدد رخصة القيادة؟',
    'المستندات المطلوبة للرقم القومي',
    'خطوات استخراج شهادة الميلاد',
    'رسوم السجل التجاري',
    'تجديد جواز السفر',
  ];

  suggestions: Suggestion[] = [
    { icon: '🪪', text: 'كيف أجدد بطاقة الرقم القومي؟' },
    { icon: '🚗', text: 'خطوات تجديد رخصة القيادة' },
    { icon: '📄', text: 'المستندات المطلوبة لشهادة الميلاد' },
    { icon: '🏢', text: 'كيف أسجّل شركتي في مصر؟' },
  ];

  private shouldScroll = false;
  private genTimeout: ReturnType<typeof setTimeout> | null = null;

  constructor(
    private chatApiService: ChatApiService,
    private authService: AuthService,
    private router: Router
  ) {}

  // ─────────────────────────────────────────
  // Init — check cookie session
  // ─────────────────────────────────────────
  ngOnInit(): void {
    const token = this.authService.getTokenFromCookie();
    if (token) {
      this.isLoggedIn = true;
      const payload = this.authService.decodeJwt(token);
      if (payload) {
        // Extract email from common JWT claims
        this.userEmail =
          payload['email'] ||
          payload['unique_name'] ||
          payload['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress'] ||
          '';

        // Extract display name
        this.userDisplayName =
          payload['name'] ||
          payload['given_name'] ||
          payload['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name'] ||
          this.userEmail.split('@')[0] ||
          'مستخدم';
      }
    } else {
      // Guest mode — restore saved count and session
      this.isLoggedIn = false;
      const stored = localStorage.getItem(this.GUEST_COUNT_KEY);
      this.guestMessageCount = stored ? parseInt(stored, 10) : 0;

      const storedSession = localStorage.getItem(this.GUEST_SESSION_KEY);
      if (storedSession) {
        this.currentSessionGuid = storedSession;
      }
    }
  }

  ngAfterViewChecked(): void {
    if (this.shouldScroll) {
      this.scrollBottom();
      this.shouldScroll = false;
    }
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    const target = event.target as HTMLElement;
    if (!target.closest('.service-selector')) {
      this.modelMenuOpen = false;
    }
  }

  // ─────────────────────────────────────────
  // Drag & Drop
  // ─────────────────────────────────────────
  onDragOver(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    if (!this.isGuestLimitReached) this.isDragging = true;
  }

  onDragLeave(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragging = false;
  }

  onDrop(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragging = false;
    if (this.isGuestLimitReached) return;

    const files = event.dataTransfer?.files;
    if (files && files.length > 0) {
      this.processFiles(Array.from(files));
    }
  }

  // ─────────────────────────────────────────
  // Sidebar / Service
  // ─────────────────────────────────────────
  toggleSidebar(): void { this.sidebarCollapsed = !this.sidebarCollapsed; }
  toggleModelMenu(): void { this.modelMenuOpen = !this.modelMenuOpen; }

  selectService(serviceId: string): void {
    this.services.forEach(s => s.active = s.id === serviceId);
    this.modelMenuOpen = false;
  }

  get activeService(): Service {
    return this.services.find(s => s.active) || this.services[0];
  }

  startNewChat(): void {
    this.messages = [];
    this.uploadedFiles = [];
    this.currentMessage = '';
    this.activeChat = -1;
    this.isTyping = false;
    this.currentSessionGuid = null;

    if (!this.isLoggedIn) {
      this.guestMessageCount = 0;
      localStorage.removeItem(this.GUEST_COUNT_KEY);
      localStorage.removeItem(this.GUEST_SESSION_KEY);
    }

    if (this.genTimeout) { clearTimeout(this.genTimeout); this.genTimeout = null; }
  }

  loadChat(index: number): void {
    this.activeChat = index;
    this.messages = [];
    this.currentSessionGuid = null;
  }

  sendSuggestion(text: string): void {
    this.currentMessage = text;
    this.sendMessage();
  }

  onEnterKey(event: KeyboardEvent): void {
    if (!event.shiftKey) {
      event.preventDefault();
      if (this.currentMessage.trim() || this.uploadedFiles.length > 0) {
        this.sendMessage();
      }
    }
  }

  // ─────────────────────────────────────────
  // Send Message
  // ─────────────────────────────────────────
  sendMessage(): void {
    const text = this.currentMessage.trim();
    if (!text && this.uploadedFiles.length === 0) return;
    if (this.isTyping) return;

    // Check guest limit
    if (!this.isLoggedIn && this.guestMessageCount >= this.guestMessageLimit) {
      this.showLoginPopup = true;
      return;
    }

    const msgAttachments: UploadedFile[] = this.uploadedFiles.map(f => ({ ...f }));

    this.messages.push({
      role: 'user',
      content: text,
      timestamp: new Date(),
      attachments: msgAttachments.length > 0 ? msgAttachments : undefined,
    });

    if (!this.isLoggedIn) {
      this.guestMessageCount++;
      localStorage.setItem(this.GUEST_COUNT_KEY, this.guestMessageCount.toString());
    }

    this.currentMessage = '';
    this.uploadedFiles  = [];
    this.shouldScroll   = true;
    this.isTyping       = true;

    if (this.messageInput?.nativeElement) {
      this.messageInput.nativeElement.style.height = 'auto';
    }

    this.generateAIResponse(text);
  }

  // ─────────────────────────────────────────
  // AI Response
  // ─────────────────────────────────────────
  private getEmail(): string {
    if (this.isLoggedIn && this.userEmail) {
      return this.userEmail;
    }
    // Guest: use stored UUID
    let guestId = localStorage.getItem(this.GUEST_ID_KEY);
    if (!guestId) {
      guestId = 'guest_' + this.generateUUID();
      localStorage.setItem(this.GUEST_ID_KEY, guestId);
    }
    return `${guestId}@guest.khedmetak.eg`;
  }

  private generateUUID(): string {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
      const r = Math.random() * 16 | 0;
      return (c === 'x' ? r : (r & 0x3 | 0x8)).toString(16);
    });
  }

  private generateAIResponse(query: string): void {
    if (!this.currentSessionGuid) {
      const email = this.getEmail();
      this.chatApiService.createSession(email).subscribe({
        next: (res) => {
          this.currentSessionGuid = res.data?.sessionGuidId || res.data?.id || res.data;
          if (!this.isLoggedIn && this.currentSessionGuid) {
            localStorage.setItem(this.GUEST_SESSION_KEY, this.currentSessionGuid);
          }
          this.sendChatMessage(query);
        },
        error: (err) => {
          console.error('فشل إنشاء الجلسة:', err);
          this.messages.push({
            role: 'assistant',
            content: 'عذراً، تعذّر الاتصال بالخادم. يرجى التأكد من تشغيل الخادم والمحاولة مجدداً.',
            timestamp: new Date()
          });
          this.isTyping = false;
          this.shouldScroll = true;
        }
      });
    } else {
      this.sendChatMessage(query);
    }
  }

  private sendChatMessage(query: string): void {
    if (!this.currentSessionGuid) return;

    this.chatApiService.sendMessage(query, this.currentSessionGuid).subscribe({
      next: (res) => {
        const reply = res.data?.message || (res as any).message || 'نعتذر، حدث خطأ أثناء الاتصال بالخادم.';
        this.messages.push({ role: 'assistant', content: reply, timestamp: new Date() });
        this.isTyping = false;
        this.shouldScroll = true;
      },
      error: (err) => {
        console.error('فشل إرسال الرسالة:', err);
        if (err.status === 400 || err.status === 404) {
          this.currentSessionGuid = null;
          if (!this.isLoggedIn) localStorage.removeItem(this.GUEST_SESSION_KEY);
        }
        this.messages.push({
          role: 'assistant',
          content: 'عذراً، حدث خطأ في الاتصال بالخادم. يرجى المحاولة لاحقاً.',
          timestamp: new Date()
        });
        this.isTyping = false;
        this.shouldScroll = true;
      }
    });
  }

  retryLastMessage(): void {
    const lastUserMsg = [...this.messages].reverse().find(m => m.role === 'user');
    if (!lastUserMsg || this.isTyping) return;

    const lastMsg = this.messages[this.messages.length - 1];
    if (lastMsg?.role === 'assistant') {
      this.messages.pop();
    }

    this.isTyping = true;
    this.shouldScroll = true;
    this.generateAIResponse(lastUserMsg.content);
  }

  stopGeneration(): void {
    if (this.genTimeout) { clearTimeout(this.genTimeout); this.genTimeout = null; }
    this.isTyping = false;
  }

  // ─────────────────────────────────────────
  // Login Popup
  // ─────────────────────────────────────────
  closeLoginPopup(): void { this.showLoginPopup = false; }

  goToLogin(): void {
    this.showLoginPopup = false;
    this.router.navigate(['/login']);
  }

  goToRegister(): void {
    this.showLoginPopup = false;
    this.router.navigate(['/signup']);
  }

  // ─────────────────────────────────────────
  // Message Actions
  // ─────────────────────────────────────────
  copyMessage(content: string, index: number): void {
    const plainText = content.replace(/<[^>]*>/g, '');
    navigator.clipboard.writeText(plainText).then(() => {
      this.copiedIndex = index;
      setTimeout(() => { this.copiedIndex = -1; }, 2000);
    }).catch(() => {});
  }

  likeMessage(index: number): void {
    if (this.messages[index]) {
      this.messages[index].liked = !this.messages[index].liked;
    }
  }

  formatTime(date: Date): string {
    return date.toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' });
  }

  // ─────────────────────────────────────────
  // File Upload
  // ─────────────────────────────────────────
  triggerUpload(): void { this.fileInput?.nativeElement.click(); }
  triggerImageUpload(): void { this.imageInput?.nativeElement.click(); }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (!input.files) return;
    this.processFiles(Array.from(input.files));
    input.value = '';
  }

  onImageSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (!input.files) return;
    const imageFiles = Array.from(input.files).filter(f => f.type.startsWith('image/'));
    this.processFiles(imageFiles);
    input.value = '';
  }

  processFiles(files: File[]): void {
    files.forEach(file => {
      if (this.uploadedFiles.some(f => f.name === file.name && f.size === file.size)) return;

      const isImage = file.type.startsWith('image/');

      if (isImage) {
        const reader = new FileReader();
        reader.onload = (e) => {
          const uploadedFile: UploadedFile = {
            name: file.name,
            size: file.size,
            type: file.type,
            previewUrl: e.target?.result as string,
            isImage: true,
          };
          this.uploadedFiles = [...this.uploadedFiles, uploadedFile];
        };
        reader.readAsDataURL(file);
      } else {
        const uploadedFile: UploadedFile = {
          name: file.name,
          size: file.size,
          type: file.type,
          isImage: false,
        };
        this.uploadedFiles = [...this.uploadedFiles, uploadedFile];
      }
    });
  }

  removeFile(index: number): void { this.uploadedFiles.splice(index, 1); }

  formatFileSize(bytes: number): string {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  }

  openImagePreview(url: string): void {
    this.previewImageUrl = url;
    this.showImagePreview = true;
  }

  closeImagePreview(): void {
    this.showImagePreview = false;
    this.previewImageUrl = '';
  }

  // ─────────────────────────────────────────
  // Input helpers
  // ─────────────────────────────────────────
  autoResize(event: Event): void {
    const element = event.target as HTMLTextAreaElement;
    element.style.height = 'auto';
    element.style.height = Math.min(element.scrollHeight, 180) + 'px';
  }

  get remainingGuestMessages(): number {
    return Math.max(0, this.guestMessageLimit - this.guestMessageCount);
  }

  get isGuestLimitReached(): boolean {
    return !this.isLoggedIn && this.guestMessageCount >= this.guestMessageLimit;
  }

  get guestProgressPercent(): number {
    return Math.min(100, (this.guestMessageCount / this.guestMessageLimit) * 100);
  }

  get userInitials(): string {
    if (this.isLoggedIn && this.userDisplayName) {
      return this.userDisplayName.charAt(0).toUpperCase();
    }
    return '؟';
  }

  private scrollBottom(): void {
    try {
      const element = this.messagesContainer?.nativeElement;
      if (element) { element.scrollTo({ top: element.scrollHeight, behavior: 'smooth' }); }
    } catch { /* silent */ }
  }
}