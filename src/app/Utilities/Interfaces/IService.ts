export interface IService{id:number; title:string; img:string; description:string;  categoryId:number; categoryName:string;}
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
  icon: string;
  estimatedTime: string;
  fees: string;
  documents: ServiceDocument[];
  steps: ServiceStep[];
  processingMinutes: number;
  documentsCount: number;
}

export interface ServiceCategoryTab {
  id: ServiceCategory;
  label: string;
  route: string;
  icon: string;
}
