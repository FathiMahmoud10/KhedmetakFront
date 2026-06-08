import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class SharedService {
  // myHttp = inject(HttpClient);
  // URL:string = 'https://localhost:44335/api/Services';

  getAllServices(){
    return this.Services;
  }
  s1:IService = {id:1, title:'تجديد رخصة القيادة', img:'/Images/ServImgs/driver1.png', description:'استخراج او تجديد رخصة القيادة الخاصة.', categoryId:1, categoryName:'خدمات المرور'};
  s2:IService = {id:2, title:'تجديد بطاقة الرقم القومي', img:'/Images/ServImgs/Id2.png',description:'استخراج او تجديد بطاقة الرقم القومي الخاصة.', categoryId:2, categoryName:'خدمات الأحوال المدنية'};
  s3:IService = {id:3, title:'تجديد جواز السفر',img:'/Images/ServImgs/passpor.png', description:'استخراج او تجديد جواز السفر الخاص.', categoryId:3, categoryName:'خدمات الجوازات'};
  s4:IService = {id:4, title:'تجديد بطاقة الهوية',img:'/Images/ServImgs/Id2.png', description:'استخراج او تجديد بطاقة الهوية الخاصة.', categoryId:4, categoryName:'خدمات الأحوال المدنية'};
  s5:IService = {id:5, title:'تجديد رخصة القيادة', img:'/Images/ServImgs/driver1.png', description:'استخراج او تجديد رخصة القيادة الخاصة.', categoryId:1, categoryName:'خدمات المرور'};
  s6:IService = {id:6, title:'تجديد بطاقة الرقم القومي', img:'/Images/ServImgs/Id2.png',description:'استخراج او تجديد بطاقة الرقم القومي الخاصة.', categoryId:2, categoryName:'خدمات الأحوال المدنية'};
  s7:IService = {id:7, title:'تجديد جواز السفر',img:'/Images/ServImgs/passpor.png', description:'استخراج او تجديد جواز السفر الخاص.', categoryId:3, categoryName:'خدمات الجوازات'}
 s8:IService = {id:8, title:'تجديد بطاقة الهوية',img:'/Images/ServImgs/Id2.png', description:'استخراج او تجديد بطاقة الهوية الخاصة.', categoryId:4, categoryName:'خدمات الأحوال المدنية'};
 s9:IService = {id:9, title:'تجديد رخصة القيادة', img:'/Images/ServImgs/driver1.png', description:'استخراج او تجديد رخصة القيادة الخاصة.', categoryId:1, categoryName:'خدمات المرور'};
  Services: IService[] = [
    this.s1,
    this.s2,this.s3,this.s4,this.s5,this.s6,this.s7,this.s8,this.s9];

}