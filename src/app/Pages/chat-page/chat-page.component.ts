import { Component, AfterViewInit, OnInit, ViewChild, ElementRef } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';

interface SessionResponse {
  sessionGuidId?: string;
  id?: string;
  guid?: string;
  sessionId?: string;
}

interface ChatResponse {
  reply?: string;
  message?: string;
  response?: string;
  content?: string;
}

interface LoginResponse {
  token?: string;
  accessToken?: string;
}

@Component({
  selector: 'app-chat-page',
  templateUrl: './chat-page.component.html',
  styleUrls: ['./chat-page.component.scss']
})
export class ChatPageComponent implements OnInit, AfterViewInit {

  // ===========================
  // ViewChild refs (بدل ngModel)
  // ===========================

  @ViewChild('emailInput')    emailInputRef!: ElementRef<HTMLInputElement>;
  @ViewChild('passwordInput') passwordInputRef!: ElementRef<HTMLInputElement>;
  @ViewChild('msgInput')      msgInputRef!: ElementRef<HTMLTextAreaElement>;

  // ===========================
  // State
  // ===========================

  readonly MAX_FREE_MSGS = 3;
  freeRemaining          = this.MAX_FREE_MSGS;
  sessionGuid: string | null = null;
  isLoggedIn   = false;
  isSending    = false;
  showLoginPopup = false;
  loginLoading   = false;
  loginError     = '';

  constructor(private http: HttpClient) {}

  // ===========================
  // Lifecycle
  // ===========================

  ngOnInit(): void {
    this.isLoggedIn = this.hasToken();
    this.ensureSession();
  }

  ngAfterViewInit(): void {
    this.scrollToBottom();
  }

  // ===========================
  // Token / Auth Helpers
  // ===========================

  private hasToken(): boolean {
    return !!this.getCookie('token') || !!localStorage.getItem('auth_token');
  }

  private getToken(): string | null {
    return this.getCookie('token') || localStorage.getItem('auth_token');
  }

  private getCookie(name: string): string | null {
    const match = document.cookie.match(
      new RegExp('(?:^|; )' + name + '=([^;]*)')
    );
    return match ? decodeURIComponent(match[1]) : null;
  }

  private saveToken(token: string): void {
    localStorage.setItem('auth_token', token);
    document.cookie = `token=${token}; path=/; max-age=86400`;
  }

  private buildHeaders(): HttpHeaders {
    let headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    const token = this.getToken();
    if (token) {
      headers = headers.set('Authorization', `Bearer ${token}`);
    }
    return headers;
  }

  // ===========================
  // Session
  // ===========================

  async ensureSession(): Promise<boolean> {
    if (this.sessionGuid) return true;

    try {
      const body = {
        userEmail: this.isLoggedIn
          ? (this.getCookie('user_email') || 'guest@moamaltak.ai')
          : 'guest@moamaltak.ai',
        createdAt: new Date().toISOString()
      };

      const res = await firstValueFrom(
        this.http.post<SessionResponse>(
          '/api/Session/newSession',
          body,
          { headers: this.buildHeaders() }
        )
      );

      this.sessionGuid =
        res?.sessionGuidId ||
        res?.id            ||
        res?.guid          ||
        res?.sessionId     ||
        null;

      return !!this.sessionGuid;

    } catch (err) {
      console.error('Session creation failed:', err);
      return false;
    }
  }

  // ===========================
  // Chat API
  // ===========================

  async callChatAPI(message: string): Promise<string> {
    const ok = await this.ensureSession();
    if (!ok) throw new Error('لا يمكن إنشاء جلسة. تحقق من الاتصال.');

    const res = await firstValueFrom(
      this.http.post<ChatResponse>(
        '/api/AI/chat',
        { message, sessionGuidId: this.sessionGuid },
        { headers: this.buildHeaders() }
      )
    );

    return res?.reply || res?.message || res?.response || res?.content || '';
  }

  // ===========================
  // Send Message
  // ===========================

  async sendMsg(customText?: string): Promise<void> {
    if (this.isSending) return;

    const inputEl = this.msgInputRef?.nativeElement;
    const text    = (customText || inputEl?.value || '').trim();
    if (!text) return;

    // ── Free message gate ──
    if (!this.hasToken() && !this.isLoggedIn) {
      if (this.freeRemaining <= 0) {
        this.openLoginPopup();
        return;
      }
      this.freeRemaining--;
    }

    if (inputEl) inputEl.value = '';
    this.isSending = true;

    this.appendUserMsg(text);
    const typingEl = this.appendTyping();

    try {
      const reply = await this.callChatAPI(text);
      typingEl.remove();
      this.appendBotMsg(this.mdToHtml(reply));
    } catch (err: any) {
      typingEl.remove();
      this.appendBotMsg(
        `<span style="color:var(--red-dk)">حصل خطأ: ${this.escHtml(err?.message || 'خطأ غير معروف')}</span>`
      );
      // أرجع الرصيد لو حصل error
      if (!this.hasToken() && !this.isLoggedIn) {
        this.freeRemaining = Math.min(this.freeRemaining + 1, this.MAX_FREE_MSGS);
      }
    } finally {
      this.isSending = false;
    }

    // ظهور popup بعد ما الـ bot يرد لو الرصيد خلص
    if (!this.hasToken() && !this.isLoggedIn && this.freeRemaining <= 0) {
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
  // DOM Helpers
  // ===========================

  private getMsgsContainer(): HTMLElement | null {
    return document.getElementById('msgs');
  }

  private appendUserMsg(text: string): void {
    const msgs = this.getMsgsContainer();
    if (!msgs) return;
    const el = document.createElement('div');
    el.className       = 'msg u';
    el.style.marginTop = '14px';
    el.innerHTML = `
      <div class="av usr">أح</div>
      <div class="bub usr">${this.escHtml(text)}</div>
    `;
    msgs.appendChild(el);
    this.scrollToBottom();
  }

  private appendBotMsg(html: string): void {
    const msgs = this.getMsgsContainer();
    if (!msgs) return;
    const el = document.createElement('div');
    el.className       = 'msg';
    el.style.marginTop = '14px';
    el.innerHTML = `
      <div class="av bot">AI</div>
      <div class="bub bot bot-response">${html}</div>
    `;
    msgs.appendChild(el);
    this.scrollToBottom();
  }

  private appendTyping(): HTMLElement {
    const msgs = this.getMsgsContainer();
    const el   = document.createElement('div');
    el.className       = 'msg';
    el.id              = 'typing-indicator';
    el.style.marginTop = '14px';
    el.innerHTML = `
      <div class="av bot">AI</div>
      <div class="bub bot">
        <div class="typing">
          <span></span><span></span><span></span>
        </div>
      </div>
    `;
    msgs?.appendChild(el);
    this.scrollToBottom();
    return el;
  }

  private escHtml(s: string): string {
    return s
      .replace(/&/g,  '&amp;')
      .replace(/</g,  '&lt;')
      .replace(/>/g,  '&gt;')
      .replace(/"/g,  '&quot;');
  }

  /** Markdown بسيط → HTML */
  private mdToHtml(text: string): string {
    return text
      .replace(/\*\*(.+?)\*\*/g,  '<strong>$1</strong>')
      .replace(/\*(.+?)\*/g,       '<em>$1</em>')
      .replace(/^### (.+)$/gm,     '<h3>$1</h3>')
      .replace(/^## (.+)$/gm,      '<h2>$1</h2>')
      .replace(/^# (.+)$/gm,       '<h1>$1</h1>')
      .replace(/^\d+\. (.+)$/gm,   '<li>$1</li>')
      .replace(/^- (.+)$/gm,       '<li>$1</li>')
      .replace(/\n/g,              '<br>');
  }

  // ===========================
  // Login Popup
  // ===========================

  openLoginPopup(): void {
    this.loginError     = '';
    this.showLoginPopup = true;
    setTimeout(() => {
      if (this.emailInputRef?.nativeElement)    this.emailInputRef.nativeElement.value    = '';
      if (this.passwordInputRef?.nativeElement) this.passwordInputRef.nativeElement.value = '';
    }, 50);
  }

  closeLoginPopup(): void {
    this.showLoginPopup = false;
    this.loginError     = '';
  }

  continueAsGuest(): void {
    this.closeLoginPopup();
    this.appendBotMsg(
      'عشان تكمل الأسئلة، هتحتاج تسجل دخولك. ممكن تكلمنا في أي وقت بعد التسجيل.'
    );
  }

  async doLogin(): Promise<void> {
    const email    = this.emailInputRef?.nativeElement?.value?.trim()    || '';
    const password = this.passwordInputRef?.nativeElement?.value?.trim() || '';

    if (!email || !password) {
      this.loginError = 'من فضلك ادخل البريد الإلكتروني وكلمة المرور';
      return;
    }

    this.loginLoading = true;
    this.loginError   = '';

    try {
      const res = await firstValueFrom(
        this.http.post<LoginResponse>('/api/Auth/login', { email, password })
      );

      const token = res?.token || res?.accessToken;
      if (!token) throw new Error('لم يتم استلام token');

      this.saveToken(token);
      this.isLoggedIn  = true;
      this.sessionGuid = null; // reset → session جديدة authenticated

      this.closeLoginPopup();
      this.appendBotMsg('تم تسجيل دخولك بنجاح ✅ ممكن تكمل أسئلتك.');

    } catch (err: any) {
      this.loginError =
        err?.error?.message ||
        err?.message        ||
        'بيانات الدخول غلط، حاول تاني';
    } finally {
      this.loginLoading = false;
    }
  }

  // ===========================
  // Scroll
  // ===========================

  scrollToBottom(): void {
    const msgs = this.getMsgsContainer();
    if (msgs) {
      setTimeout(() => (msgs.scrollTop = msgs.scrollHeight), 100);
    }
  }

  // ===========================
  // Sections / Flow
  // ===========================

  showOnline(): void { this.showSection('sec-online'); }
  showOffice(): void { this.showSection('sec-office'); }
  showUpload(): void { this.showSection('sec-upload'); }

  showStep3(): void { this.showSection('sec-step3'); this.advanceProgress(3); }
  showStep4(): void { this.showSection('sec-step4'); this.advanceProgress(4); }
  showDone():  void { this.showSection('sec-done');  this.advanceProgress(5); }

  private showSection(id: string): void {
    const el = document.getElementById(id);
    if (el) {
      el.style.display = 'block';
      this.scrollToBottom();
    }
  }

  // ===========================
  // Progress
  // ===========================

  advanceProgress(step: number): void {
    const labels = [
      '', 'جمع المستندات', 'التقديم',
      'سداد الرسوم', 'استلام الرخصة', 'مكتملة'
    ];

    for (let i = 1; i <= 4; i++) {
      const dot = document.getElementById('pd' + i);
      if (dot) {
        dot.className = 'ps-dot ' + (i < step ? 'done' : i === step ? 'curr' : 'next');
        dot.innerHTML = i < step ? '✓' : i.toString();
      }
      const line = document.getElementById('pl' + i);
      if (line) line.className = 'ps-line' + (i < step ? ' done' : '');
    }

    const txt = document.getElementById('ps-txt');
    if (txt) {
      txt.innerHTML = step > 4
        ? 'مكتملة — 4 من 4 خطوات'
        : `خطوة ${step - 1} من 4 — ${labels[step - 1]}`;
    }

    for (let i = 1; i <= 4; i++) {
      const sd = document.getElementById('sd' + i);
      if (sd) {
        sd.className = 's-dot ' + (i < step ? 'done' : i === step ? 'active' : 'idle');
        sd.innerHTML = i < step ? '✓' : i.toString();
      }
      const sl = document.getElementById('sl' + i);
      if (sl) sl.className = 's-line' + (i < step ? ' done' : '');

      const sn = document.getElementById('sn' + i);
      if (sn) sn.className = 's-name' + (i >= step ? ' idle' : '');
    }
  }

  // ===========================
  // Checklist
  // ===========================

  toggleCk(event: Event): void {
    const target = event.currentTarget as HTMLElement;
    target.classList.toggle('on');

    target.innerHTML = target.classList.contains('on')
      ? `<svg width="10" height="10" viewBox="0 0 12 12"
           fill="none" stroke="#fff" stroke-width="2.5"
           stroke-linecap="round" stroke-linejoin="round">
           <polyline points="2 6 5 9 10 3"/>
         </svg>`
      : '';

    const row = target.closest('.ck-row');
    if (row) {
      const lbl = row.querySelector('.ck-lbl');
      if (lbl) lbl.classList.toggle('on');
    }
  }

  // ===========================
  // Upload Simulation
  // ===========================

  simulateUpload(): void {
    const zone = document.getElementById('upload-zone');
    if (zone) zone.innerHTML = '<div class="up-title">جاري التحقق...</div>';
    setTimeout(() => this.showSection('sec-valid'), 1200);
  }
}