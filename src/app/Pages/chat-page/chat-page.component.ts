import {
  Component, OnInit, ViewChild, ElementRef, AfterViewChecked, HostListener
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

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

  ngOnInit(): void {
    // Initialize with welcome message if needed
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
    if (this.genTimeout) {
      clearTimeout(this.genTimeout);
      this.genTimeout = null;
    }
  }

  loadChat(index: number): void { 
    this.activeChat = index; 
    this.messages = []; 
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
    const responses: { [key: string]: string } = {
      license: `<p>لتجديد <strong>رخصة القيادة</strong> في مصر، اتبع الخطوات التالية:</p>
<ol>
  <li>بطاقة الرقم القومي (سارية المفعول)</li>
  <li>الرخصة الحالية</li>
  <li>نتيجة الكشف الطبي من طبيب معتمد</li>
  <li>4 صور شخصية حديثة (4×6)</li>
  <li>سداد الرسوم: <strong>300 جنيه مصري</strong></li>
</ol>
<p>توجه إلى أقرب <strong>إدارة مرور</strong> تابع لمحل إقامتك. مدة الإنجاز: <strong>1–3 أيام عمل</strong>.</p>
<p>يمكنك حجز موعد مسبق عبر <a href="#">بوابة مصر الرقمية</a> لتوفير الوقت.</p>`,

      id: `<p>لاستخراج <strong>بطاقة الرقم القومي</strong>:</p>
<ol>
  <li>شهادة الميلاد الأصلية</li>
  <li>صورة بطاقة أحد الوالدين (للقصر)</li>
  <li>4 صور شخصية حديثة بخلفية بيضاء</li>
  <li>نموذج الطلب من مكتب السجل المدني</li>
  <li>سداد الرسوم: <strong>25 جنيهاً</strong></li>
</ol>
<p>مدة الإنجاز: <strong>3–5 أيام عمل</strong> — يمكن الاستلام من نفس المكتب أو اختيار التوصيل.</p>`,

      birth: `<p>لاستخراج <strong>شهادة الميلاد</strong>:</p>
<ol>
  <li>بلاغ الميلاد من المستشفى أو الولادة</li>
  <li>بطاقة الرقم القومي للوالدين</li>
  <li>عقد الزواج الموثق</li>
  <li>استمارة الطلب من مكتب الصحة</li>
</ol>
<p>التقديم في <strong>مكتب الصحة</strong> التابع لمحل الميلاد خلال <strong>15 يوماً</strong> من تاريخ الولادة.</p>
<p>التأخير عن المدة المحددة يستلزم موافقة خاصة من الجهات المختصة.</p>`,

      commercial: `<p>لتسجيل <strong>شركة في السجل التجاري</strong>:</p>
<ol>
  <li>صورة بطاقة الرقم القومي للمؤسسين</li>
  <li>عقد تأسيس الشركة موثق من الشهر العقاري</li>
  <li>إيصال سداد رسوم التسجيل</li>
  <li>عقد إيجار أو ملكية مقر الشركة</li>
</ol>
<p>التقديم إلكترونياً عبر <a href="#">بوابة الاستثمار</a> أو يدوياً في <strong>السجل التجاري</strong>.</p>
<p>مدة الإنجاز: <strong>7–14 يوم عمل</strong> حسب نوع الشركة.</p>`,

      passport: `<p>لتجديد <strong>جواز السفر المصري</strong>:</p>
<ol>
  <li>بطاقة الرقم القومي سارية</li>
  <li>جواز السفر القديم (إن وجد)</li>
  <li>4 صور شخصية حديثة</li>
  <li>سداد الرسوم: <strong>300–500 جنيه</strong> حسب نوع الجواز</li>
</ol>
<p>التقديم في <strong>مصلحة الجوازات</strong> أو عبر <a href="#">بوابة مصر الرقمية</a>.</p>`,

      default: `<p>مرحباً! أنا مساعد <strong>خدمتك AI</strong> للخدمات الحكومية المصرية. يمكنني مساعدتك في:</p>
<ul>
  <li>الاستفسار عن أي خدمة حكومية</li>
  <li>معرفة المستندات والرسوم المطلوبة</li>
  <li>إرشادك خطوة بخطوة حتى إتمام الخدمة</li>
  <li>تحديد الجهة المختصة والموقع المناسب</li>
</ul>
<p>كيف يمكنني مساعدتك اليوم؟</p>`
    };

    const lowerQuery = query.toLowerCase();
    let reply = responses['default'];

    if (lowerQuery.includes('رخصة') || lowerQuery.includes('قيادة') || lowerQuery.includes('license') || lowerQuery.includes('مرور')) {
      reply = responses['license'];
    } else if (lowerQuery.includes('رقم قومي') || lowerQuery.includes('بطاقة') || lowerQuery.includes('id') || lowerQuery.includes('شخصية')) {
      reply = responses['id'];
    } else if (lowerQuery.includes('ميلاد') || lowerQuery.includes('birth') || lowerQuery.includes('صحة')) {
      reply = responses['birth'];
    } else if (lowerQuery.includes('سجل') || lowerQuery.includes('تجاري') || lowerQuery.includes('شركة') || lowerQuery.includes('commercial')) {
      reply = responses['commercial'];
    } else if (lowerQuery.includes('جواز') || lowerQuery.includes('سفر') || lowerQuery.includes('passport')) {
      reply = responses['passport'];
    }

    // Simulate realistic typing delay
    const delay = 1200 + Math.random() * 1000;

    this.genTimeout = setTimeout(() => {
      this.messages.push({ 
        role: 'assistant', 
        content: reply, 
        timestamp: new Date() 
      });
      this.isTyping = false; 
      this.shouldScroll = true;
    }, delay);
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