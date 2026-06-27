import { Component, AfterViewInit, OnInit, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { ChatApiService, ChatResponse } from '../../APIServices/SharedServices/chat-api.service';
import { AuthService } from '../../APIServices/SharedServices/auth.service';
import { environment } from '../../../environments/environment';
import { ApiResponse } from '../../Utilities/Interfaces/IService';

interface RequiredDocument {
  id: number;
  documentName: string;
  isMandatory: boolean;
}

interface ServiceDetailApi {
  id: number;
  srvName: string;
  requiredDocuments: RequiredDocument[];
}

@Component({
  selector: 'app-chat-page',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './chat-page.component.html',
  styleUrls: ['./chat-page.component.scss']
})
export class ChatPageComponent implements OnInit, AfterViewInit {

  @ViewChild('msgsContainer') msgsContainer!: ElementRef<HTMLDivElement>;
  @ViewChild('fileInput') fileInputRef!: ElementRef<HTMLInputElement>;

  // ===========================
  // State variables
  // ===========================
  readonly MAX_FREE_MSGS = 3;
  freeRemaining = this.MAX_FREE_MSGS;
  guestMessageCount = 0;
  
  sessionGuid: string | null = null;
  chatSessionId: number | null = null;
  isLoggedIn = false;
  isSending = false;
  showLoginPopup = false;
  loginLoading = false;
  loginError = '';

  loginEmail = '';
  loginPassword = '';
  msgText = '';

  // Service info (populated from API or AI response)
  serviceName = 'جاري التحميل...';
  serviceAgency = '';
  serviceFee: number | null = null;
  serviceTime = '3–5 أيام';
  serviceAlertActive = true;
  // Track whether sidebar info has been overridden by AI
  sidebarUpdatedByAI = false;

  // Chat message history
  messages: Array<{
    sender: 'bot' | 'user';
    text: string;
    isHtml?: boolean;
    isTyping?: boolean;
    timestamp?: string;
    steps?: string[];
    currentStep?: number;
  }> = [];


  // File Upload State
  requiredDocuments: RequiredDocument[] = [];
  selectedDocumentIdForUpload: number | null = null;
  uploadProgress: number | null = null;
  uploadSuccessMessage = '';
  uploadErrorMessage = '';

  fallbackDocuments: RequiredDocument[] = [
    { id: 1, documentName: 'بطاقة الرقم القومي', isMandatory: true },
    { id: 2, documentName: 'الرخصة الحالية', isMandatory: true },
    { id: 3, documentName: '6 صور شخصية', isMandatory: true }
  ];

  // Step-by-step assistant variables
  activeStep = 1;
  onlineMode = false;
  officeMode = false;
  showUploadZone = false;
  uploadVerified = false;
  step3Completed = false;
  step4Completed = false;
  chatDone = false;

  step1Checklist = [
    { label: 'بطاقة الرقم القومي', checked: false },
    { label: 'الرخصة الحالية', checked: false },
    { label: '6 صور شخصية', checked: false }
  ];


  constructor(
    private http: HttpClient,
    private chatApiService: ChatApiService,
    private authService: AuthService
  ) {}

  // ===========================
  // Lifecycle
  // ===========================

  ngOnInit(): void {
    this.isLoggedIn = this.checkLoggedInStatus();
    this.initGuestLimits();
    this.ensureSession();
    this.fetchRequiredDocuments();
    // Chat starts empty — messages appear only after user sends first message
  }

  ngAfterViewInit(): void {
    this.scrollToBottom();
  }

  // ===========================
  // Initialization Helpers
  // ===========================

  private checkLoggedInStatus(): boolean {
    return !!this.authService.getTokenFromCookie();
  }

  private initGuestLimits(): void {
    if (!this.isLoggedIn) {
      const storedCount = localStorage.getItem('guest_msg_count');
      this.guestMessageCount = storedCount ? parseInt(storedCount, 10) : 0;
      this.freeRemaining = Math.max(0, this.MAX_FREE_MSGS - this.guestMessageCount);
    } else {
      this.freeRemaining = 0;
    }
  }

  // ===========================
  // Step-based Response Parsing
  // ===========================

  /**
   * Splits a bot reply into logical step segments.
   * Tries numbered list → markdown headers → paragraph breaks → single step.
   */
  private parseIntoSteps(text: string): string[] {
    if (!text || text.trim().length === 0) return [];

    // 1. Try Arabic/Latin numbered lists (1. / ١. / 1- / etc.)
    const numbered = text.split(/(?=\n(?:\d+|[١٢٣٤٥٦٧٨٩])[.)\-:]\s)/);
    const numFiltered = numbered.map(s => s.trim()).filter(s => s.length > 15);
    if (numFiltered.length >= 2) return numFiltered.map(s => this.mdToHtml(s));

    // 2. Try markdown headers (## or ###)
    const headers = text.split(/(?=\n#{1,3}\s)/);
    const hFiltered = headers.map(s => s.trim()).filter(s => s.length > 15);
    if (hFiltered.length >= 2) return hFiltered.map(s => this.mdToHtml(s));

    // 3. Try double newline paragraph breaks
    const paras = text.split(/\n{2,}/).map(s => s.trim()).filter(s => s.length > 25);
    if (paras.length >= 2) return paras.map(s => this.mdToHtml(s));

    // 4. Fallback — single step
    return [this.mdToHtml(text)];
  }

  /**
   * Advances a step-message to the next step.
   * Called when user taps the "التالي" button on a step card.
   */
  advanceStep(msgIndex: number): void {
    const msg = this.messages[msgIndex];
    if (!msg?.steps) return;
    const current = msg.currentStep ?? 0;
    if (current < msg.steps.length - 1) {
      msg.currentStep = current + 1;
      this.scrollToBottom();
    }
  }

  // ===========================
  // Cookie Helpers
  // ===========================

  private getCookie(name: string): string | null {
    const match = document.cookie.match(new RegExp('(?:^|; )' + name + '=([^;]*)'));
    return match ? decodeURIComponent(match[1]) : null;
  }

  private setCookie(name: string, value: string, days = 1): void {
    const d = new Date();
    d.setTime(d.getTime() + days * 24 * 60 * 60 * 1000);
    document.cookie = `${name}=${value}; expires=${d.toUTCString()}; path=/`;
  }

  // ===========================
  // API Fetching & Sessions
  // ===========================

  async ensureSession(): Promise<boolean> {
    if (this.sessionGuid) return true;

    // Try restoring session from cookies
    const savedGuid = this.getCookie('sessionGuidId');
    const savedId = this.getCookie('chatSessionId');

    if (savedGuid) {
      this.sessionGuid = savedGuid;
      this.chatSessionId = savedId ? parseInt(savedId, 10) : null;
      return true;
    }

    try {
      const email = this.isLoggedIn
        ? (this.getCookie('user_email') || 'guest@moamaltak.ai')
        : 'guest@moamaltak.ai';

      const res = await firstValueFrom(this.chatApiService.createSession(email));
      
      // Support both unwrapped (direct SessionResponse) and wrapped (ApiResponse<SessionResponse>)
      let data = res;
      if (res && res.success !== undefined && res.data !== undefined) {
        data = res.data;
      }

      if (data) {
        if (typeof data === 'string') {
          this.sessionGuid = data;
          this.chatSessionId = null;
        } else {
          this.sessionGuid = data.sessionGuidId || data.guid || data.sessionId || (typeof data.id === 'string' ? data.id : null) || null;
          this.chatSessionId = typeof data.id === 'number' ? data.id : (data.chatSessionId ? parseInt(data.chatSessionId, 10) : null);
          
          if (!this.chatSessionId && data.id) {
            const parsed = parseInt(data.id, 10);
            if (!isNaN(parsed)) {
              this.chatSessionId = parsed;
            }
          }
        }

        if (this.sessionGuid) {
          this.setCookie('sessionGuidId', this.sessionGuid, 1);
          if (this.chatSessionId) {
            this.setCookie('chatSessionId', this.chatSessionId.toString(), 1);
          }
        }
      }
      return !!this.sessionGuid;
    } catch (err) {
      console.error('Session creation failed:', err);
      return false;
    }
  }

  private fetchRequiredDocuments(): void {
    this.http.get<ApiResponse<ServiceDetailApi>>(`${environment.apiUrl}/GovServices/1`).subscribe({
      next: (res) => {
        if (res && res.success && res.data) {
          const data = res.data;
          // Populate service display info only if AI hasn't overridden yet
          if (!this.sidebarUpdatedByAI) {
            this.serviceName    = data.srvName || 'خدمة حكومية';
            this.serviceAgency  = (data as any).agencyName || (data as any).agency || 'هيئة حكومية';
            this.serviceFee     = (data as any).fee ?? (data as any).totalFee ?? (data as any).cost ?? null;
          }

          if (data.requiredDocuments && data.requiredDocuments.length > 0) {
            this.requiredDocuments = data.requiredDocuments;
          } else {
            this.requiredDocuments = this.fallbackDocuments;
          }
        } else {
          if (!this.sidebarUpdatedByAI) {
            this.serviceName = 'تجديد رخصة القيادة';
          }
          this.requiredDocuments = this.fallbackDocuments;
        }
        this.initSelectedDocumentId();
      },
      error: (err) => {
        console.warn('Failed to fetch service data, using fallback.', err);
        if (!this.sidebarUpdatedByAI) {
          this.serviceName = 'تجديد رخصة القيادة';
        }
        this.requiredDocuments = this.fallbackDocuments;
        this.initSelectedDocumentId();
      }
    });
  }

  /**
   * Extracts structured service info from an AI reply text and updates
   * the sidebar info-cards dynamically.
   */
  private extractServiceInfoFromReply(text: string): void {
    if (!text || text.trim().length === 0) return;

    // ── 1. Service Name ──────────────────────────────────────
    // Look for patterns like: "خدمة: ...", "اسم الخدمة ...", or quoted names
    const namePatterns = [
      /(?:اسم الخدمة|الخدمة)[:\s]+([^\n،,]{4,60})/i,
      /(?:معاملة|تجديد|استخراج|إصدار)[\s]+([^\n،,]{4,50})/i,
    ];
    for (const pat of namePatterns) {
      const m = text.match(pat);
      if (m && m[1]) {
        this.serviceName = m[1].trim().replace(/[*#_]/g, '');
        this.sidebarUpdatedByAI = true;
        break;
      }
    }

    // ── 2. Fee / Cost ─────────────────────────────────────────
    // e.g. "370 جنيه", "الرسوم: 250", "تكلفة 500 ج"
    const feePatterns = [
      /(?:الرسوم|رسوم|التكلفة|تكلفة|إجمالي|المبلغ)[:\s]*(\d+(?:\.\d+)?)/i,
      /(\d+(?:\.\d+)?)\s*(?:جنيه|ج\.م|EGP|LE)/i,
    ];
    for (const pat of feePatterns) {
      const m = text.match(pat);
      if (m && m[1]) {
        const parsed = parseFloat(m[1]);
        if (!isNaN(parsed) && parsed > 0) {
          this.serviceFee = parsed;
          this.sidebarUpdatedByAI = true;
          break;
        }
      }
    }

    // ── 3. Time ──────────────────────────────────────────────
    // e.g. "3-5 أيام", "من 7 إلى 10 أيام عمل", "أسبوع"
    const timePatterns = [
      /(?:الوقت|وقت|مدة|يستغرق|تستغرق|خلال)[:\s]*([\d٠-٩\-–]+(?:\s*(?:إلى|to|–|-)\s*[\d٠-٩]+)?\s*(?:يوم|أيام|يوماً|ساعة|ساعات|أسبوع|أسابيع|شهر|شهور))/i,
      /([\d٠-٩]+\s*(?:–|-|إلى)\s*[\d٠-٩]+\s*(?:أيام|يوم|يوماً|أسبوع|ساعة))/i,
    ];
    for (const pat of timePatterns) {
      const m = text.match(pat);
      if (m && m[1]) {
        this.serviceTime = m[1].trim();
        this.sidebarUpdatedByAI = true;
        break;
      }
    }

    // ── 4. Required Documents ─────────────────────────────────
    // Look for lists of documents in the AI reply
    const docListPatterns = [
      /(?:الأوراق|المستندات|الوثائق|متطلبات)[:\s\n]+([\s\S]{10,400}?)(?=\n\n|\n#|$)/i,
    ];
    for (const pat of docListPatterns) {
      const m = text.match(pat);
      if (m && m[1]) {
        // Extract individual document items (numbered or bulleted)
        const items = m[1]
          .split(/\n/)
          .map(l => l.replace(/^[\s\d١٢٣٤٥٦٧٨٩\-.*•\[\]]+/, '').trim())
          .filter(l => l.length > 3 && l.length < 100);
        if (items.length >= 2) {
          this.requiredDocuments = items.map((name, idx) => ({
            id: idx + 1,
            documentName: name,
            isMandatory: true
          }));
          this.initSelectedDocumentId();
          this.sidebarUpdatedByAI = true;
          break;
        }
      }
    }
  }


  private initSelectedDocumentId(): void {
    if (this.requiredDocuments.length > 0) {
      this.selectedDocumentIdForUpload = this.requiredDocuments[0].id;
    }
  }

  // ===========================
  // Send Message Logic
  // ===========================

  async sendMsg(customText?: string): Promise<void> {
    if (this.isSending) return;

    const text = (customText || this.msgText || '').trim();
    if (!text) return;

    // Check guest quota limits
    if (!this.isLoggedIn) {
      if (this.freeRemaining <= 0) {
        this.openLoginPopup();
        return;
      }
      this.guestMessageCount++;
      this.freeRemaining = Math.max(0, this.MAX_FREE_MSGS - this.guestMessageCount);
      localStorage.setItem('guest_msg_count', this.guestMessageCount.toString());
    }

    this.msgText = '';
    this.isSending = true;

    // Add user message
    this.messages.push({ sender: 'user', text });
    this.scrollToBottom();

    // Add typing indicator
    const typingIndicatorIndex = this.messages.push({ sender: 'bot', text: '', isTyping: true }) - 1;
    this.scrollToBottom();

    try {
      const ok = await this.ensureSession();
      if (!ok) {
        throw new Error('فشل تهيئة جلسة المحادثة. يرجى التحقق من اتصالك بالإنترنت.');
      }

      // res is a plain text string
      const res = await firstValueFrom(this.chatApiService.sendMessage(text, this.sessionGuid!));

      // Remove typing indicator
      this.messages.splice(typingIndicatorIndex, 1);

      const replyText = (res || '').trim() || 'عذراً، لم أتلق ردًا صالحاً من الخدمة.';

      // ── Extract & update sidebar info from the AI reply ──
      this.extractServiceInfoFromReply(replyText);

      this.messages.push({ sender: 'bot', text: this.mdToHtml(replyText), isHtml: true });
    } catch (err: any) {
      this.messages.splice(typingIndicatorIndex, 1);
      this.messages.push({ 
        sender: 'bot', 
        text: `<span style="color:var(--red-dk)">حصل خطأ: ${this.escHtml(err?.error?.message || err?.message || 'خطأ غير معروف')}</span>`,
        isHtml: true 
      });

      // Refund the message count on fail
      if (!this.isLoggedIn && this.guestMessageCount > 0) {
        this.guestMessageCount--;
        this.freeRemaining = Math.min(this.MAX_FREE_MSGS, this.MAX_FREE_MSGS - this.guestMessageCount);
        localStorage.setItem('guest_msg_count', this.guestMessageCount.toString());
      }
    } finally {
      this.isSending = false;
      this.scrollToBottom();
    }

    // Trigger popup after bot reply if guest quota reached
    if (!this.isLoggedIn && this.freeRemaining <= 0) {
      setTimeout(() => this.openLoginPopup(), 800);
    }
  }

  quickSend(text: string): void {
    this.sendMsg(text);
  }

  onKey(event: KeyboardEvent): void {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      this.sendMsg();
    }
  }

  // ===========================
  // File Upload Operations
  // ===========================

  triggerFileUpload(docId?: number): void {
    if (!this.isLoggedIn) {
      this.openLoginPopup();
      return;
    }
    if (docId !== undefined) {
      this.selectedDocumentIdForUpload = docId;
    } else if (this.requiredDocuments.length > 0 && this.selectedDocumentIdForUpload === null) {
      this.selectedDocumentIdForUpload = this.requiredDocuments[0].id;
    }
    this.fileInputRef.nativeElement.click();
  }

  async onFileSelected(event: any): Promise<void> {
    const file = event.target?.files?.[0];
    if (!file) return;

    if (!this.isLoggedIn) {
      this.openLoginPopup();
      return;
    }

    const docId = this.selectedDocumentIdForUpload || 1;
    const docName = this.requiredDocuments.find(d => d.id === Number(docId))?.documentName || 'مستند';

    const ok = await this.ensureSession();
    if (!ok || (!this.chatSessionId && !this.sessionGuid)) {
      this.uploadErrorMessage = 'خطأ: لم يتم العثور على معرف الجلسة. يرجى محاولة إرسال رسالة أولاً.';
      this.messages.push({ sender: 'bot', text: `<span style="color:var(--red-dk)">فشل الرفع: ${this.uploadErrorMessage}</span>`, isHtml: true });
      this.scrollToBottom();
      return;
    }

    this.uploadProgress = 0;
    this.uploadSuccessMessage = '';
    this.uploadErrorMessage = '';
    this.appendBotMsg(`جاري رفع ملف: <strong>${file.name}</strong> كـ <strong>${docName}</strong>...`);

    const uploadSessionId = this.chatSessionId || this.sessionGuid || '';
    this.chatApiService.uploadDocument(file, uploadSessionId, docId).subscribe({
      next: (res) => {
        this.uploadProgress = null;
        if (res && res.success) {
          this.uploadSuccessMessage = `تم رفع الملف بنجاح! المعرف: ${res.data?.id || res.data || ''}`;
          this.appendBotMsg(`تم رفع <strong>${docName}</strong> بنجاح! ✅ المعرف: ${res.data?.id || res.data || ''}`);
          
          // Check off step 1 items dynamically
          if (docId === 1 || docName.includes('القومي') || docName.includes('بطاقة')) this.step1Checklist[0].checked = true;
          if (docId === 2 || docName.includes('الرخصة') || docName.includes('الحالية')) this.step1Checklist[1].checked = true;
          if (docId === 3 || docName.includes('صور') || docName.includes('شخصية')) this.step1Checklist[2].checked = true;
          
          this.uploadVerified = true;
        } else {
          this.uploadErrorMessage = res?.message || 'فشل رفع الملف.';
          this.appendBotMsg(`فشل رفع الملف: ${this.uploadErrorMessage} ❌`);
        }
        this.scrollToBottom();
      },
      error: (err) => {
        this.uploadProgress = null;
        this.uploadErrorMessage = err?.error?.message || err?.message || 'حدث خطأ غير متوقع أثناء الرفع.';
        this.appendBotMsg(`حدث خطأ أثناء الرفع: ${this.uploadErrorMessage} ❌`);
        this.scrollToBottom();
      }
    });

    event.target.value = '';
  }

  private appendBotMsg(html: string): void {
    this.messages.push({ sender: 'bot', text: html, isHtml: true });
    this.scrollToBottom();
  }

  // ===========================
  // Login Popup Handling
  // ===========================

  openLoginPopup(): void {
    this.loginError = '';
    this.showLoginPopup = true;
    this.loginEmail = '';
    this.loginPassword = '';
  }

  closeLoginPopup(): void {
    this.showLoginPopup = false;
    this.loginError = '';
  }

  continueAsGuest(): void {
    this.closeLoginPopup();
    if (this.freeRemaining <= 0) {
      this.appendBotMsg('عشان تكمل الأسئلة، هتحتاج تسجل دخولك. ممكن تكلمنا في أي وقت بعد التسجيل.');
    }
  }

  async doLogin(): Promise<void> {
    if (!this.loginEmail.trim() || !this.loginPassword) {
      this.loginError = 'من فضلك ادخل البريد الإلكتروني وكلمة المرور';
      return;
    }

    this.loginLoading = true;
    this.loginError = '';

    try {
      const res = await firstValueFrom(
        this.authService.login(this.loginEmail.trim(), this.loginPassword)
      );

      if (res && res.data && res.data.token) {
        const expireDate = new Date(res.data.expiresAt || new Date().getTime() + 86400000);
        document.cookie = `token=${res.data.token}; expires=${expireDate.toUTCString()}; path=/`;
        
        // Save user email
        const userEmail = res.data.userEmail || this.loginEmail.trim();
        document.cookie = `user_email=${userEmail}; expires=${expireDate.toUTCString()}; path=/`;

        this.isLoggedIn = true;
        this.freeRemaining = 0;

        // Reset session on login so we start an authenticated chat session
        this.sessionGuid = null;
        this.chatSessionId = null;
        document.cookie = 'sessionGuidId=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
        document.cookie = 'chatSessionId=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';

        await this.ensureSession();

        this.closeLoginPopup();
        this.appendBotMsg('تم تسجيل دخولك بنجاح ✅ يمكنك استكمال المحادثة الآن.');
      } else {
        throw new Error('فشل استلام التوكن');
      }
    } catch (err: any) {
      this.loginError = err?.error?.message || err?.message || 'بيانات الدخول غلط، حاول تاني';
    } finally {
      this.loginLoading = false;
    }
  }

  // ===========================
  // Steps / Navigation Handlers
  // ===========================

  showOnline(): void { 
    this.onlineMode = true; 
    this.officeMode = false;
    this.scrollToBottom();
  }
  
  showOffice(): void { 
    this.officeMode = true; 
    this.onlineMode = false;
    this.scrollToBottom();
  }
  
  showUpload(): void { 
    if (!this.isLoggedIn) {
      this.openLoginPopup();
      return;
    }
    this.showUploadZone = true; 
    this.scrollToBottom();
  }

  showStep3(): void { 
    this.step3Completed = true; 
    this.activeStep = 3; 
    this.scrollToBottom();
  }
  
  showStep4(): void { 
    this.step4Completed = true; 
    this.activeStep = 4; 
    this.scrollToBottom();
  }
  
  showDone(): void { 
    this.chatDone = true; 
    this.activeStep = 5; 
    this.scrollToBottom();
  }

  // ===========================
  // Formatting & DOM
  // ===========================

  scrollToBottom(): void {
    setTimeout(() => {
      if (this.msgsContainer && this.msgsContainer.nativeElement) {
        this.msgsContainer.nativeElement.scrollTop = this.msgsContainer.nativeElement.scrollHeight;
      }
    }, 100);
  }

  private escHtml(s: string): string {
    return s
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  private mdToHtml(text: string): string {
    return text
      .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.+?)\*/g, '<em>$1</em>')
      .replace(/^### (.+)$/gm, '<h3>$1</h3>')
      .replace(/^## (.+)$/gm, '<h2>$1</h2>')
      .replace(/^# (.+)$/gm, '<h1>$1</h1>')
      .replace(/^\d+\. (.+)$/gm, '<li>$1</li>')
      .replace(/^- (.+)$/gm, '<li>$1</li>')
      .replace(/\n/g, '<br>');
  }

  getProgressDotClass(step: number): string {
    if (step < this.activeStep) return 'ps-dot done';
    if (step === this.activeStep) return 'ps-dot curr';
    return 'ps-dot next';
  }

  getProgressDotContent(step: number): string {
    return step < this.activeStep ? '✓' : step.toString();
  }

  getSidebarDotClass(step: number): string {
    if (step < this.activeStep) return 's-dot done';
    if (step === this.activeStep) return 's-dot active';
    return 's-dot idle';
  }

  getSidebarDotContent(step: number): string {
    return step < this.activeStep ? '✓' : step.toString();
  }
}