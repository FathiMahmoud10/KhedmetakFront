import { Component, AfterViewInit, OnInit, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { ChatApiService, ChatResponse, CurrentServiceDetails } from '../../APIServices/SharedServices/chat-api.service';
import { AuthService } from '../../APIServices/SharedServices/auth.service';
import { UserDashboardService } from '../../APIServices/SharedServices/user-dashboard.service';
import { LocationService, UserLocation } from '../../Services/location.service';
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
  srvTime?: string;
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
  @ViewChild('submitFileInput') submitFileInputRef!: ElementRef<HTMLInputElement>;

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

  // FIX: This used to be hardcoded to 1 (National ID issuance). Now we read it from query params.
  // If not provided, it remains null until the user selects a service.
  govServiceId: number | null = null;
  sessionLinked = false;

  loginEmail = '';
  loginPassword = '';
  msgText = '';

  // Service info (populated from API or chat response)
  serviceName = 'جاري التحميل...';
  serviceAgency = '';
  serviceFee: number | null = null;
  serviceTime = '30 دقيقة';
  serviceCategoryName = '';
  serviceRequiredDocsCount = 0;

  // Current service details from latest chat response
  currentServiceDetails: CurrentServiceDetails | null = null;

  // Submit Request Form State
  showSubmitForm = false;
  submitFormLoading = false;
  submitFormError = '';
  submitFormSuccess = '';
  submitUserName = '';
  submitPhoneNumber = '';
  submitNotes = '';
  submitFiles: File[] = [];
  uploadedDocIds = new Set<number>();

  isCollectingRequestInfo = false;
  currentRequestStep = 0; // 0: Name & Phone, 1: Notes & Files, 2: Review

  // Payment Flow State
  showPaymentCard = false;
  selectedPaymentMethod: 'fawry' | 'vodafone' | null = null;
  fawrySubMethod: 'visa' | 'code' | null = null;
  paymentCardServiceFee: number | null = null;
  paymentProcessing = false;
  paymentSuccess = false;

  showSuccessCard = false;
  successCardPaidAmount = 0;
  successCardServiceName = '';

  // Session list sidebar state
  sessionsLoading = false;
  historyCollapsed = false;
  userSessions: Array<{
    id: string;
    preview: string;
    startedAt: string;
    messageCount: number;
  }> = [];
  activeSessionId: string | null = null;

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

  copiedMap: { [key: number]: boolean } = {};

  // ===========================
  // Step wizard / checklist state
  // ===========================
  step1Checklist: { label: string; checked: boolean }[] = [
    { label: 'بطاقة الرقم القومي', checked: false },
    { label: 'الرخصة الحالية', checked: false },
    { label: '6 صور شخصية', checked: false }
  ];
  uploadVerified = false;
  onlineMode = false;
  officeMode = false;
  showUploadZone = false;
  step3Completed = false;
  step4Completed = false;
  chatDone = false;
  activeStep = 1;

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


  // User location (used to add local context to AI messages)
  userLocation: UserLocation | null = null;

  constructor(
    private http: HttpClient,
    private route: ActivatedRoute,
    private router: Router,
    private chatApiService: ChatApiService,
    private authService: AuthService,
    private dashboardService: UserDashboardService,
    private locationService: LocationService
  ) {}

  // ===========================
  // Lifecycle
  // ===========================

  ngOnInit(): void {
    this.isLoggedIn = this.checkLoggedInStatus();
    this.initGuestLimits();
    this.fetchRequiredDocuments();
    if (this.isLoggedIn) {
      this.loadUserSessions();
    }
    // Silently request user location for context-aware AI responses
    this.locationService.getLocation().then(loc => this.userLocation = loc);

    const resumeGuid = this.route.snapshot.queryParamMap.get('session');
    const serviceIdParam = this.route.snapshot.queryParamMap.get('serviceId');

    if (serviceIdParam) {
      this.govServiceId = parseInt(serviceIdParam, 10);
      if (isNaN(this.govServiceId)) {
        this.govServiceId = null;
      }
    }

    if (resumeGuid) {
      this.sessionGuid = resumeGuid;
      this.activeSessionId = resumeGuid;
      this.setCookie('sessionGuidId', resumeGuid, 1);
      this.loadSessionHistory(resumeGuid);
      this.ensureSession();
    } else {
      this.ensureSession();
    }
  }

  /**
   * Fetches and renders the previous messages of a session so resuming a
   * conversation shows what was already said, not a blank chat.
   */
  private loadSessionHistory(sessionGuidId: string): void {
    this.chatApiService.getSessionHistory(sessionGuidId).subscribe({
      next: (res) => {
        // FIX: backend wraps the result as ApiResponse<List<ChatSessionMessageDTO>>,
        // so `data` IS the messages array itself — not an object with a nested
        // ChatSession_ChatHistory property (that shape only exists internally in the
        // AI service layer, never on the wire from SessionController).
        const history = (res && res.success !== undefined) ? res.data : res;
        if (Array.isArray(history) && history.length > 0) {
          this.messages = history.map((m: any) => ({
            sender: (m.role || m.Role) === 'user' ? 'user' : 'bot',
            text: this.mdToHtml(m.content || m.Content || ''),
            isHtml: true
          }));
          this.scrollToBottom();
        }
      },
      error: (err) => {
        console.warn('فشل تحميل سجل المحادثة السابقة:', err);
      }
    });
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
    if (this.sessionGuid) {
      this.activeSessionId = this.sessionGuid;
      this.linkSessionIfNeeded();
      return true;
    }

    // Try restoring session from cookies
    const savedGuid = this.getCookie('sessionGuidId');
    const savedId = this.getCookie('chatSessionId');

    if (savedGuid) {
      this.sessionGuid = savedGuid;
      this.activeSessionId = savedGuid;
      this.chatSessionId = savedId ? parseInt(savedId, 10) : null;
      this.linkSessionIfNeeded();
      return true;
    }

    try {
      const email = this.isLoggedIn
        ? (this.authService.getUserEmail() || 'guest@moamaltak.ai')
        : 'guest@moamaltak.ai';

      const res = await firstValueFrom(this.chatApiService.createSession(email));

      // Support both unwrapped (direct SessionResponse) and wrapped (ApiResponse<SessionResponse>)
      let data: any = res;
      if (res && (res as any).success !== undefined && (res as any).data !== undefined) {
        data = (res as any).data;
      }

      if (data) {
        if (typeof data === 'string') {
          this.sessionGuid = data;
          this.activeSessionId = data;
          this.chatSessionId = null;
        } else {
          this.sessionGuid = data.sessionGuidId || data.guid || data.sessionId || (typeof data.id === 'string' ? data.id : null) || null;
          this.activeSessionId = this.sessionGuid;
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

      // FIX: link the brand-new session to the logged-in user's account right away,
      // so it's tracked as a real request (visible in "طلباتي" / dashboard stats)
      // from the moment the chat starts — not only if the user happens to upload a file.
      this.linkSessionIfNeeded();

      return !!this.sessionGuid;
    } catch (err) {
      console.error('Session creation failed:', err);
      return false;
    }
  }

  /**
   * Links the current chat session to the logged-in user's account and to this
   * page's gov service, marking it as a "Pending" request. Safe to call repeatedly —
   * it's a no-op once sessionLinked is true or there's no session/login yet.
   */
  private linkSessionIfNeeded(): void {
    if (this.sessionLinked || !this.isLoggedIn || !this.sessionGuid || !this.govServiceId) return;

    this.dashboardService
      .linkSessionToService(this.sessionGuid, this.govServiceId, 'Pending')
      .subscribe({
        next: () => {
          this.sessionLinked = true;
          this.loadUserSessions();
        },
        error: (err) => {
          // Non-fatal — the chat itself still works even if linking fails (e.g. session
          // not saved yet on the backend). We'll just retry next time ensureSession runs.
          console.warn('فشل ربط الجلسة بحساب المستخدم:', err);
        }
      });
  }

  private fetchRequiredDocuments(): void {
    if (!this.govServiceId) return;
    this.http.get<ApiResponse<ServiceDetailApi>>(`${environment.apiUrl}/GovServices/${this.govServiceId}`).subscribe({
      next: (res) => {
        if (res && res.success && res.data) {
          const data = res.data;
          // Populate service display info
          this.serviceName    = data.srvName || 'خدمة حكومية';
          this.serviceAgency  = (data as any).agencyName || (data as any).agency || 'هيئة حكومية';
          this.serviceFee     = (data as any).fee ?? (data as any).totalFee ?? (data as any).cost ?? null;
          this.serviceTime    = data.srvTime || (data as any).srvTime || '30 دقيقة';

          if (data.requiredDocuments && data.requiredDocuments.length > 0) {
            this.requiredDocuments = data.requiredDocuments;
          } else {
            this.requiredDocuments = this.fallbackDocuments;
          }
        } else {
          this.serviceName = 'تجديد رخصة القيادة';
          this.serviceTime = '30 دقيقة';
          this.requiredDocuments = this.fallbackDocuments;
        }
        this.initSelectedDocumentId();
      },
      error: (err) => {
        console.warn('Failed to fetch service data, using fallback.', err);
        this.serviceName = 'تجديد رخصة القيادة';
        this.serviceTime = '30 دقيقة';
        this.requiredDocuments = this.fallbackDocuments;
        this.initSelectedDocumentId();
      }
    });
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

    if (this.isCollectingRequestInfo) {
      this.handleRequestInfoStep(text);
      return;
    }

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

      // Append location context if available (only on the first message sent)
      const locationCtx = this.messages.filter(m => m.sender === 'user').length === 1
        ? this.locationService.buildLocationContext(this.userLocation)
        : '';
      const textWithCtx = locationCtx ? text + locationCtx : text;

      // res is now a JSON object: { currentServiceDetails, response }
      const res: ChatResponse = await firstValueFrom(this.chatApiService.sendMessage(textWithCtx, this.sessionGuid!));

      // Remove typing indicator
      this.messages.splice(typingIndicatorIndex, 1);

      // Update sidebar service details from the response
      if (res.currentServiceDetails) {
        this.currentServiceDetails = res.currentServiceDetails;
        this.updateSidebarFromServiceDetails(res.currentServiceDetails);
        
        // Link session to the newly detected service if it has an ID
        if (res.currentServiceDetails.id && this.govServiceId !== res.currentServiceDetails.id) {
          this.govServiceId = res.currentServiceDetails.id;
          this.fetchRequiredDocuments();
          this.linkSessionIfNeeded();
        }
      }

      const replyText = (res.response || '').trim() || 'عذراً، لم أتلق ردًا صالحاً من الخدمة.';
      // Render the full markdown response as a single formatted message
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
  // Service Details Sidebar Update
  // ===========================
  private updateSidebarFromServiceDetails(details: CurrentServiceDetails): void {
    this.serviceName = details.serviceName || this.serviceName;
    this.serviceAgency = details.categoryName || this.serviceAgency;
    this.serviceFee = details.fees ?? this.serviceFee;
    this.serviceTime = details.takenTime || this.serviceTime;
    this.serviceCategoryName = details.categoryName || this.serviceCategoryName;
    this.serviceRequiredDocsCount = details.requiredDocumentsCount ?? this.serviceRequiredDocsCount;
  }

  private handleRequestInfoStep(text: string): void {
    // Simple step wizard for collecting request info
    switch (this.currentRequestStep) {
      case 0:
        this.submitUserName = text;
        this.currentRequestStep = 1;
        this.appendBotMsg('الخطوة التالية: ادخل رقم الهاتف.');
        break;
      case 1:
        this.submitPhoneNumber = text;
        this.currentRequestStep = 2;
        this.appendBotMsg('الخطوة التالية: ادخل ملاحظاتك (إذا لم يكن لديك ملاحظات، اكتب "لا توجد").');
        break;
      case 2:
        this.submitNotes = (!text || text.trim() === '') ? 'لا توجد' : text;
        this.currentRequestStep = 3;
        this.appendBotMsg('هل تريد رفع ملفات الآن؟ إذا نعم اضغط على زر الرفع.');
        break;
      default:
        this.isCollectingRequestInfo = false;
        break;
    }
  }
  // ===========================
// Submit Request Form Handlers
// ===========================

/**
 * Opens the submit request form and starts collecting request info.
 */
openSubmitForm(): void {
  // Show payment card first with service fee
  this.paymentCardServiceFee = this.serviceFee;
  this.selectedPaymentMethod = null;
  this.fawrySubMethod = null;
  this.paymentSuccess = false;
  this.showPaymentCard = true;
  this.scrollToBottom();
}

/**
 * Called when user selects a payment method (fawry or vodafone)
 */
selectPaymentMethod(method: 'fawry' | 'vodafone'): void {
  this.selectedPaymentMethod = method;
  if (method === 'vodafone') {
    this.fawrySubMethod = null;
  }
  this.scrollToBottom();
}

/**
 * Called when user selects fawry sub-method (visa or code)
 */
selectFawryMethod(sub: 'visa' | 'code'): void {
  this.fawrySubMethod = sub;
  this.scrollToBottom();
}

/**
 * Confirms payment and proceeds to request collection
 */
confirmPayment(): void {
  this.paymentProcessing = true;
  this.showPaymentCard = false;
  this.paymentProcessing = false;

  // Now start collecting request info after payment selection (using multi-step form overlay)
  this.submitUserName = this.authService.getUserName() || '';
  this.submitPhoneNumber = '';
  this.submitNotes = '';
  this.submitFiles = [];
  this.uploadedDocIds.clear();
  this.currentRequestStep = 0;
  this.isCollectingRequestInfo = false; // Using form overlay instead of chat collection
  this.showSubmitForm = true;
  const methodLabel = this.selectedPaymentMethod === 'fawry'
    ? (this.fawrySubMethod === 'visa' ? 'فوري - فيزا/ماستركارد' : 'فوري - كود فوري')
    : 'فودافون كاش';
  this.appendBotMsg(`✅ تم اختيار طريقة الدفع: <strong>${methodLabel}</strong>.<br>برجاء إتمام ملء بيانات الطلب ورفع الملفات من نافذة التقديم.`);
}

isDocUploaded(docId: number): boolean {
  return this.uploadedDocIds.has(docId);
}

nextRequestStep(): void {
  if (this.currentRequestStep === 0) {
    if (!this.submitUserName.trim() || !this.submitPhoneNumber.trim()) {
      alert('برجاء إدخال الاسم بالكامل ورقم الهاتف للمتابعة');
      return;
    }
    this.currentRequestStep = 1;
  } else if (this.currentRequestStep === 1) {
    // Validate mandatory documents
    const missingMandatory = this.requiredDocuments.filter(doc => doc.isMandatory && !this.isDocUploaded(doc.id));
    if (missingMandatory.length > 0) {
      alert(`برجاء رفع الأوراق الإلزامية المطلوبة: ${missingMandatory.map(m => m.documentName).join(', ')}`);
      return;
    }
    this.currentRequestStep = 2;
  } else if (this.currentRequestStep === 2) {
    this.doSubmitRequest();
  }
}

prevRequestStep(): void {
  if (this.currentRequestStep > 0) {
    this.currentRequestStep--;
  }
}

/**
 * Cancels the payment flow
 */
cancelPayment(): void {
  this.showPaymentCard = false;
  this.selectedPaymentMethod = null;
  this.fawrySubMethod = null;
}

/**
 * Finalises the request and sends it to the backend.
 */
doSubmitRequest(): void {
  if (!this.sessionGuid) {
    this.appendBotMsg('⚠️ لا يمكن إرسال الطلب بدون جلسة. الرجاء بدء محادثة أولاً.');
    return;
  }

  const finalNotes = (!this.submitNotes || this.submitNotes.trim() === '') ? 'لا توجد' : this.submitNotes;

  const userEmail = this.authService.getUserEmail() 
    || this.loginEmail 
    || (document.cookie.match(/user_email=([^;]+)/) ? RegExp.$1 : '');

  if (!userEmail) {
    this.appendBotMsg('⚠️ لا يمكن إرسال الطلب. الرجاء تسجيل الدخول أولاً.');
    this.submitFormLoading = false;
    return;
  }

  const requestData = {
    userEmail,
    govServiceId: this.govServiceId || 1,
    sessionGuidId: this.sessionGuid,
    userName: this.submitUserName,
    phoneNumber: this.submitPhoneNumber,
    notes: finalNotes,
    files: this.submitFiles
  };

  this.submitFormLoading = true;
  this.chatApiService.submitServiceRequest(requestData).subscribe({
    next: (res) => {
      this.submitFormLoading = false;
      if (res && res.success) {
        const serviceNameVal = this.serviceName || 'الخدمة المطلوبة';
        const paidAmount = this.paymentCardServiceFee !== null ? this.paymentCardServiceFee : (this.serviceFee !== null ? this.serviceFee : 370);
        
        this.successCardPaidAmount = paidAmount;
        this.successCardServiceName = serviceNameVal;
        this.showSuccessCard = true;

        this.showSubmitForm = false;
        this.isCollectingRequestInfo = false;
        this.loadUserSessions();
        this.scrollToBottom();
      } else {
        const msg = res?.message || 'فشل إرسال الطلب.';
        this.appendBotMsg(`❌ ${msg}`);
      }
    },
    error: (err) => {
      this.submitFormLoading = false;
      const errMsg = err?.error?.message || err?.message || 'خطأ غير معروف أثناء إرسال الطلب.';
      this.appendBotMsg(`❌ ${errMsg}`);
    }
  });
}

// ===========================



  triggerFileUpload(docId?: number): void {
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

    const docId = this.selectedDocumentIdForUpload || 1;
    const docName = this.requiredDocuments.find(d => d.id === Number(docId))?.documentName || 'مستند';

    const ok = await this.ensureSession();
    if (!ok || !this.sessionGuid) {
      this.uploadErrorMessage = 'خطأ: لم يتم العثور على معرف الجلسة. يرجى محاولة إرسال رسالة أولاً.';
      this.messages.push({ sender: 'bot', text: `<span style="color:var(--red-dk)">فشل الرفع: ${this.uploadErrorMessage}</span>`, isHtml: true });
      this.scrollToBottom();
      return;
    }

    this.uploadProgress = 0;
    this.uploadSuccessMessage = '';
    this.uploadErrorMessage = '';
    this.appendBotMsg(`جاري رفع ملف: <strong>${file.name}</strong> كـ <strong>${docName}</strong>...`);

    // FIX: uploadDocument's 2nd param is sent to the backend as SessionGuidId (a Guid),
    // so it must always be the actual session GUID — never the numeric chatSessionId,
    // which previously took priority here and would fail to parse as a Guid server-side.
    if (!this.sessionGuid) {
      this.uploadErrorMessage = 'خطأ: لم يتم العثور على معرف الجلسة. يرجى محاولة إرسال رسالة أولاً.';
      this.appendBotMsg(`فشل الرفع: ${this.uploadErrorMessage}`);
      return;
    }

    this.chatApiService.uploadDocument(file, this.sessionGuid, docId).subscribe({
      next: (res) => {
        this.uploadProgress = null;
        if (res && res.success) {
          this.uploadSuccessMessage = `تم رفع الملف بنجاح! المعرف: ${res.data?.id || res.data || ''}`;
          this.appendBotMsg(`تم رفع <strong>${docName}</strong> بنجاح! ✅ المعرف: ${res.data?.id || res.data || ''}`);

          // تسجيل رفع الملف لتحديث الحالة في واجهة الفورم
          this.uploadedDocIds.add(Number(docId));

          // Check off step 1 items dynamically
          if (docId === 1 || docName.includes('القومي') || docName.includes('بطاقة')) this.step1Checklist[0].checked = true;
          if (docId === 2 || docName.includes('الرخصة') || docName.includes('الحالية')) this.step1Checklist[1].checked = true;
          if (docId === 3 || docName.includes('صور') || docName.includes('شخصية')) this.step1Checklist[2].checked = true;

          this.uploadVerified = true;

          // The user is now actively progressing through the request (uploaded a doc),
          // so reflect that in their "طلباتي" status instead of leaving it as Pending.
          if (this.isLoggedIn && this.sessionGuid && this.govServiceId) {
            this.dashboardService
              .linkSessionToService(this.sessionGuid, this.govServiceId, 'InProgress')
              .subscribe({
                next: () => this.loadUserSessions(),
                error: (err) => console.warn('فشل تحديث حالة الطلب إلى قيد التنفيذ:', err)
              });
          }
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
        this.sessionLinked = false;
        document.cookie = 'sessionGuidId=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
        document.cookie = 'chatSessionId=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';

        await this.ensureSession();
        this.loadUserSessions();

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

    if (this.isLoggedIn && this.sessionGuid && this.govServiceId) {
      this.dashboardService
        .linkSessionToService(this.sessionGuid, this.govServiceId, 'Completed')
        .subscribe({
          next: () => this.loadUserSessions(),
          error: (err) => console.warn('فشل تحديث حالة الطلب إلى مكتمل:', err)
        });
    }
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

  copyToClipboard(htmlText: string, index: number): void {
    if (!htmlText) return;
    const tempEl = document.createElement('div');
    tempEl.innerHTML = htmlText;
    const plainText = tempEl.textContent || tempEl.innerText || '';

    navigator.clipboard.writeText(plainText).then(() => {
      this.copiedMap[index] = true;
      setTimeout(() => {
        this.copiedMap[index] = false;
      }, 2000);
    }).catch(err => {
      console.error('Failed to copy text: ', err);
    });
  }

  private mdToHtml(text: string): string {
    if (!text) return '';

    let html = this.escHtml(text);

    // Replace headers
    html = html.replace(/^### (.+)$/gm, '<h3 class="bot-h3">$1</h3>');
    html = html.replace(/^## (.+)$/gm, '<h2 class="bot-h2">$1</h2>');
    html = html.replace(/^# (.+)$/gm, '<h1 class="bot-h1">$1</h1>');

    // Bold & Italic
    html = html.replace(/\*\*(.+?)\*\*/g, '<strong class="bot-bold">$1</strong>');
    html = html.replace(/\*(.+?)\*/g, '<em class="bot-italic">$1</em>');

    // Inline code
    html = html.replace(/`([^`]+)`/g, '<code class="bot-code">$1</code>');

    // Process lists and paragraphs line by line
    const lines = html.split('\n');
    const processedLines: string[] = [];
    let activeListType: 'ul' | 'ol' | null = null;

    for (let line of lines) {
      const trimmed = line.trim();

      const ulMatch = trimmed.match(/^[-*•]\s+(.+)$/);
      const olMatch = trimmed.match(/^(\d+|[١٢٣٤٥٦٧٨٩]+)\.\s+(.+)$/);

      if (ulMatch) {
        if (activeListType === 'ol') {
          processedLines.push('</ol>');
          activeListType = null;
        }
        if (activeListType === null) {
          processedLines.push('<ul class="bot-ul">');
          activeListType = 'ul';
        }
        processedLines.push(`<li class="bot-li">${ulMatch[1]}</li>`);
      } else if (olMatch) {
        if (activeListType === 'ul') {
          processedLines.push('</ul>');
          activeListType = null;
        }
        if (activeListType === null) {
          processedLines.push('<ol class="bot-ol">');
          activeListType = 'ol';
        }
        processedLines.push(`<li class="bot-li">${olMatch[2]}</li>`);
      } else {
        if (activeListType === 'ul') {
          processedLines.push('</ul>');
          activeListType = null;
        } else if (activeListType === 'ol') {
          processedLines.push('</ol>');
          activeListType = null;
        }

        if (trimmed.length > 0) {
          if (trimmed.startsWith('<h') && (trimmed.endsWith('</h3>') || trimmed.endsWith('</h2>') || trimmed.endsWith('</h1>'))) {
            processedLines.push(trimmed);
          } else {
            processedLines.push(`<p class="bot-p">${trimmed}</p>`);
          }
        } else {
          processedLines.push('<div class="bot-space"></div>');
        }
      }
    }

    if (activeListType === 'ul') {
      processedLines.push('</ul>');
    } else if (activeListType === 'ol') {
      processedLines.push('</ol>');
    }

    return processedLines.join('\n');
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

  // ===========================
  // Past Chat Sessions Helpers
  // ===========================

  loadUserSessions(): void {
    if (!this.isLoggedIn) return;
    this.sessionsLoading = true;
    this.dashboardService.getMyRequests().subscribe({
      next: (res) => {
        this.sessionsLoading = false;
        if (res && res.success && Array.isArray(res.data)) {
          // Build the sessions list, then enrich each with its first user message as preview
          this.userSessions = res.data.map(req => ({
            id: req.sessionGuidId,
            preview: req.serviceName || 'محادثة',
            startedAt: req.startedAt,
            messageCount: req.messagesCount
          }));

          // For each session, fetch history and use the first user message as preview
          this.userSessions.forEach((session, index) => {
            this.chatApiService.getSessionHistory(session.id).subscribe({
              next: (histRes) => {
                const history = (histRes && histRes.success !== undefined) ? histRes.data : histRes;
                if (Array.isArray(history) && history.length > 0) {
                  const firstUserMsg = history.find((m: any) => (m.role || m.Role) === 'user');
                  if (firstUserMsg) {
                    const msgText = (firstUserMsg.content || firstUserMsg.Content || '').trim();
                    if (msgText) {
                      // Truncate to 50 characters for sidebar display
                      this.userSessions[index].preview = msgText.length > 50
                        ? msgText.substring(0, 50) + '...'
                        : msgText;
                    }
                  }
                }
              },
              error: () => { /* keep serviceName as fallback */ }
            });
          });
        }
      },
      error: (err) => {
        this.sessionsLoading = false;
        console.warn('Failed to load user sessions:', err);
      }
    });
  }

  loadSession(session: any): void {
    if (!session || !session.id) return;
    this.sessionGuid = session.id;
    this.activeSessionId = session.id;
    this.setCookie('sessionGuidId', session.id, 1);

    // Reset steps
    this.uploadVerified = false;
    this.onlineMode = false;
    this.officeMode = false;
    this.showUploadZone = false;
    this.step3Completed = false;
    this.step4Completed = false;
    this.chatDone = false;
    this.activeStep = 1;
    this.step1Checklist.forEach(item => item.checked = false);
    this.showSuccessCard = false;

    this.loadSessionHistory(session.id);
  }

  async startNewChat(): Promise<void> {
    this.messages = [];
    this.sessionGuid = null;
    this.chatSessionId = null;
    this.sessionLinked = false;
    this.activeSessionId = null;

    // Reset wizard / checklist state
    this.uploadVerified = false;
    this.onlineMode = false;
    this.officeMode = false;
    this.showUploadZone = false;
    this.step3Completed = false;
    this.step4Completed = false;
    this.chatDone = false;
    this.activeStep = 1;
    this.step1Checklist.forEach(item => item.checked = false);
    this.showSuccessCard = false;

    // Delete cookies
    this.setCookie('sessionGuidId', '', -1);
    this.setCookie('chatSessionId', '', -1);

    await this.ensureSession();
    this.loadUserSessions();
  }

  getUserInitials(): string {
    if (!this.isLoggedIn) return 'ضيف';
    const name = this.authService.getUserName();
    if (!name) return 'م';
    const parts = name.trim().split(/\s+/);
    if (parts.length >= 2) {
      const first = parts[0][0] || '';
      const second = parts[1][0] || '';
      return (first + second).substring(0, 2);
    }
    return name.substring(0, 2);
  }

  formatSessionDate(dateString: string): string {
    if (!dateString) return '';
    try {
      const date = new Date(dateString);
      // C# default DateTime (0001-01-01) comes back as an invalid/very old date
      if (isNaN(date.getTime()) || date.getFullYear() < 2000) return '';
      const now = new Date();
      const isToday =
        date.getDate() === now.getDate() &&
        date.getMonth() === now.getMonth() &&
        date.getFullYear() === now.getFullYear();
      if (isToday) return 'اليوم';
      const isYesterday =
        date.getDate() === now.getDate() - 1 &&
        date.getMonth() === now.getMonth() &&
        date.getFullYear() === now.getFullYear();
      if (isYesterday) return 'أمس';
      const day = String(date.getDate()).padStart(2, '0');
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const year = date.getFullYear();
      return `${day}/${month}/${year}`;
    } catch (e) {
      return '';
    }
  }
}
