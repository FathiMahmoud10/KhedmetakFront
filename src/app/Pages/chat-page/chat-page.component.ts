import {
  Component, OnInit, ViewChild, ElementRef, AfterViewChecked, HostListener
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { ChatApiService } from '../../APIServices/SharedServices/chat-api.service';
import { AuthService } from '../../APIServices/SharedServices/auth.service';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  liked?: boolean;
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

  sidebarCollapsed = false;
  modelMenuOpen    = false;
  isTyping         = false;
  currentMessage   = '';
  activeChat       = 0;
  currentSessionGuid: string | null = null;

  messages:      Message[]    = [];
  uploadedFiles: string[]     = [];

  services: Service[] = [
    {
      id: 'general',
      icon: '🤖',
      name: 'المساعد العام',
      description: 'أسئلة عامة عن الخدمات الحكومية',
      active: true
    },
    {
      id: 'license',
      icon: '🚗',
      name: 'رخصة القيادة',
      description: 'تجديد واستخراج الرخص المرورية',
      active: false
    },
    {
      id: 'id',
      icon: '🪪',
      name: 'بطاقة الرقم القومي',
      description: 'استخراج وتجديد البطاقة الشخصية',
      active: false
    },
    {
      id: 'birth',
      icon: '📄',
      name: 'شهادة الميلاد',
      description: 'طلب واستخراج شهادات الميلاد',
      active: false
    },
    {
      id: 'commercial',
      icon: '🏢',
      name: 'السجل التجاري',
      description: 'تسجيل الشركات والمنشآت التجارية',
      active: false
    }
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
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    const token = this.authService.getTokenFromCookie();
    if (!token) {
      this.router.navigate(['/login']);
      return;
    }

    // لو الصفحة وصلت برسالة جاهزة من صفحة تفاصيل خدمة (زرار "اسأل المساعد الذكي" مثلاً)
    // نبعتها تلقائيًا كأول رسالة في المحادثة
    const prefill = this.route.snapshot.queryParamMap.get('prefill');
    if (prefill && prefill.trim()) {
      this.currentMessage = prefill.trim();
      setTimeout(() => this.sendMessage());
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

  toggleSidebar(): void {
    this.sidebarCollapsed = !this.sidebarCollapsed;
  }

  toggleModelMenu(): void {
    this.modelMenuOpen = !this.modelMenuOpen;
  }

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
    if (this.genTimeout) {
      clearTimeout(this.genTimeout);
      this.genTimeout = null;
    }
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
      if (this.currentMessage.trim()) {
        this.sendMessage();
      }
    }
  }

  sendMessage(): void {
    const text = this.currentMessage.trim();
    if (!text || this.isTyping) return;

    this.messages.push({
      role: 'user',
      content: text,
      timestamp: new Date()
    });

    this.currentMessage = '';
    this.shouldScroll = true;
    this.isTyping = true;

    if (this.messageInput?.nativeElement) {
      this.messageInput.nativeElement.style.height = 'auto';
    }

    this.generateAIResponse(text);
  }

  // ── AI Response Generator ──
  private generateAIResponse(query: string): void {
    const token = this.authService.getTokenFromCookie();
    let email = 'user@khedmetak.gov.eg';
    if (token) {
      const payload = this.authService.decodeJwt(token);
      email = payload?.email || payload?.unique_name || payload?.['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress'] || email;
    }

    if (!this.currentSessionGuid) {
      this.chatApiService.createSession(email).subscribe({
        next: (res) => {
          this.currentSessionGuid = res.data?.sessionGuidId || res.data?.id || res.data;
          this.sendChatMessage(query);
        },
        error: (err) => {
          console.error('فشل إنشاء الجلسة:', err);
          this.messages.push({
            role: 'assistant',
            content: 'عذراً، فشل إنشاء جلسة محادثة جديدة. يرجى المحاولة لاحقاً.',
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
        const reply = res.data?.message || res.message || 'نعتذر، حدث خطأ أثناء الاتصال بالخادم.';
        this.messages.push({
          role: 'assistant',
          content: reply,
          timestamp: new Date()
        });
        this.isTyping = false;
        this.shouldScroll = true;
      },
      error: (err) => {
        console.error('فشل إرسال الرسالة للذكاء الاصطناعي:', err);
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

  stopGeneration(): void {
    if (this.genTimeout) {
      clearTimeout(this.genTimeout);
      this.genTimeout = null;
    }
    this.isTyping = false;
  }

  copyMessage(content: string): void {
    const plainText = content.replace(/<[^>]*>/g, '');
    navigator.clipboard.writeText(plainText).then(() => {
      // Could show a toast notification here
    }).catch(() => {});
  }

  likeMessage(index: number): void {
    if (this.messages[index]) {
      this.messages[index].liked = !this.messages[index].liked;
    }
  }

  triggerUpload(): void {
    this.fileInput?.nativeElement.click();
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files) {
      Array.from(input.files).forEach(file => {
        if (!this.uploadedFiles.includes(file.name)) {
          this.uploadedFiles.push(file.name);
        }
      });
    }
    input.value = '';
  }

  removeFile(index: number): void {
    this.uploadedFiles.splice(index, 1);
  }

  autoResize(event: Event): void {
    const element = event.target as HTMLTextAreaElement;
    element.style.height = 'auto';
    element.style.height = Math.min(element.scrollHeight, 180) + 'px';
  }

  private scrollBottom(): void {
    try {
      const element = this.messagesContainer?.nativeElement;
      if (element) {
        element.scrollTo({
          top: element.scrollHeight,
          behavior: 'smooth'
        });
      }
    } catch {
      // Silent fail
    }
  }
}
