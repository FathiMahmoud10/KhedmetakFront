import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, NavigationEnd, RouterModule } from '@angular/router';
import { filter } from 'rxjs/operators';
import { FooterCom } from "./Components/SharedComponents/footer-com/footer-com";
import { NavbarCom } from "./Components/SharedComponents/navbar-com/navbar-com";
import { AdminSidebar } from "./Components/admin-sidebar/admin-sidebar";
import { UserSidebar } from "./Components/user-sidebar/sidebar";
import { ThemeService } from './Services/theme.service';
import { AuthService } from './APIServices/SharedServices/auth.service';
import { Title, Meta } from '@angular/platform-browser';

@Component({
  selector: 'app-root',
  imports: [CommonModule, RouterModule, FooterCom, NavbarCom, AdminSidebar, UserSidebar],
  templateUrl: './app.html',
  styleUrls: ['./app.scss']
})
export class App implements OnInit {
  showFooter: boolean = true;
  showNavbar: boolean = true;

  constructor(
    private router: Router,
    private themeService: ThemeService,
    private authService: AuthService,
    private titleService: Title,
    private metaService: Meta
  ) {}

  ngOnInit(): void {
    this.authService.clearStaleSession();
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event: any) => {
      const currentUrl = event.url;

      const authPages =
        currentUrl.includes('/login') ||
        currentUrl.includes('/signup');

      const adminPages =
        currentUrl.includes('admin-profile') ||
        currentUrl.includes('admin-dashboard') ||
        currentUrl.includes('manage-services');

      const noFooterPages =
        adminPages ||
        currentUrl.includes('/chat') ||
        authPages;

      this.showFooter = !noFooterPages;
      // الـ navbar يتخبى على صفحات اللوجن والسيجنأب بس
      this.showNavbar = !authPages;

      // تحديث الـ SEO عند تغيير الصفحة
      this.updateSEO(currentUrl);
    });
  }

  private updateSEO(url: string): void {
    let title = 'منصة خدمتك | بوابة الخدمات الحكومية الذكية بالذكاء الاصطناعي';
    let description = 'منصة خدمتك هي بوابتك الإلكترونية الذكية لإنهاء وتسهيل كافة الخدمات والمعاملات الحكومية المصرية بمساعدة الذكاء الاصطناعي. استخراج بطاقات، تراخيص، شهادات وغيرها بسهولة.';
    let keywords = 'خدمتك, الخدمات الحكومية, بوابة مصر الرقمية, بطاقة الرقم القومي, رخصة القيادة, شهادة الميلاد, الذكاء الاصطناعي, معاملات حكومية, مصر الرقمية, استخراج مستندات';

    if (url.includes('/home')) {
      title = 'الرئيسية | منصة خدمتك الحكومية الذكية';
      description = 'الصفحة الرئيسية لمنصة خدمتك. تصفح الخدمات الحكومية المتاحة وتواصل مع المساعد الذكي لإنجاز معاملاتك بسهولة وسرعة.';
    } else if (url.includes('/login')) {
      title = 'تسجيل الدخول | منصة خدمتك';
      description = 'سجل الدخول إلى حسابك في منصة خدمتك للوصول لخدماتك الحكومية، ومتابعة طلباتك ومستنداتك الرسمية.';
    } else if (url.includes('/signup')) {
      title = 'إنشاء حساب جديد | منصة خدمتك';
      description = 'قم بإنشاء حساب جديد على منصة خدمتك لتستفيد من المساعد الذكي وتستخرج مستنداتك الرسمية وتتابع طلباتك بكل أمان.';
    } else if (url.includes('/chat')) {
      title = 'المساعد الذكي - شات خدمتك | منصة خدمتك';
      description = 'تحدث مع المساعد الذكي لمنصة خدمتك لمساعدتك في استخراج الأوراق الرسمية، ملء الاستمارات، ومعرفة متطلبات كافة المعاملات الحكومية.';
    } else if (url.includes('/services')) {
      title = 'دليل الخدمات الحكومية | منصة خدمتك';
      description = 'تصفح دليل الخدمات الحكومية الشامل في منصة خدمتك. استخراج بطاقة الرقم القومي، تجديد الرخص، بدل فاقد لشهادات الميلاد والعديد من الخدمات.';
      keywords += ', دليل الخدمات, تجديد بطاقة, تجديد رخصة قيادة';
    } else if (url.includes('/my-requests')) {
      title = 'طلباتي الحكومية | منصة خدمتك';
      description = 'تابع حالة طلباتك الحكومية المقدمة عبر منصة خدمتك وتعرف على مراحل المعالجة ونتائج المراجعة.';
    } else if (url.includes('/my-files')) {
      title = 'مستنداتي وحقيبتي الرقمية | منصة خدمتك';
      description = 'استعرض مستنداتك الرسمية الصادرة من بوابة مصر الرقمية وحقيبتك الإلكترونية المؤمنة بكل سهولة.';
    } else if (url.includes('/user-dashboard')) {
      title = 'لوحة التحكم للمواطن | منصة خدمتك';
      description = 'لوحة التحكم الخاصة بك لمتابعة الإحصائيات، الوصول السريع للخدمات، وإدارة حسابك الشخصي.';
    } else if (url.includes('/admin-dashboard')) {
      title = 'لوحة تحكم الإدارة | منصة خدمتك';
      description = 'لوحة تحكم المشرفين لمراجعة الطلبات، إدارة الخدمات، والتحكم في إعدادات المنصة.';
    }

    this.titleService.setTitle(title);
    this.metaService.updateTag({ name: 'description', content: description });
    this.metaService.updateTag({ name: 'keywords', content: keywords });

    // Open Graph
    this.metaService.updateTag({ property: 'og:title', content: title });
    this.metaService.updateTag({ property: 'og:description', content: description });

    // Twitter
    this.metaService.updateTag({ name: 'twitter:title', content: title });
    this.metaService.updateTag({ name: 'twitter:description', content: description });
  }
}
