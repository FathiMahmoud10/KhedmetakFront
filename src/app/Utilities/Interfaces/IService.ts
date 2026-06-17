// export interface IService{id:number; title:string;  description:string;  categoryId:number; categoryName:string; img?:string; fees?:number; estimatedFees?:number; processingTime?:string;}
//----------------------------------------------------


export type ServiceCategory =
  | 'all'
  | 'traffic'
  | 'civil-status'
  | 'passports'
  | 'supply'
  | 'education'
  | 'health';

export interface ServiceDocument {
  name: string;
  required: boolean;
}

export interface ServiceStep {
  order: number;
  description: string;
}

export interface GovernmentService {
  id: string;
  title: string;
  description: string;
  category: ServiceCategory;
  icon?: string;
  estimatedTime?: string;
  fees?: string;
  documents?: ServiceDocument[];
  steps?: ServiceStep[];
  processingMinutes?: number;
  documentsCount?: number;
}

export interface ServiceCategoryTab {
  id: ServiceCategory;
  label: string;
  route: string;
  icon: string;
}

//----------------------------------------------------
// إضافات خاصة بالتعامل مع GovServices API

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

// شكل البيانات الراجعة فعليًا من الباك إند (GovServices)
export interface GovServiceDto {
  id: number;
  srvName: string;
  srvDesc: string;
  srvFees: number;
  srvTime: string;
  estimatedFees: number;
  categoryName: string;
  categoryId: number;
}

export interface IService{
   id: number;
  srvName: string;
  srvDesc: string;
  srvFees: number;
  srvTime: string;
  estimatedFees: number;
  categoryName: string;
  categoryId: number;
}