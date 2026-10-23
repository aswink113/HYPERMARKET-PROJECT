export interface UserProfile {
  id: string;
  name: string;
  email: string;
  username?: string;
  password?: string;
  role: 'super_admin' | 'store_manager' | 'lp_reviewer' | 'analyst' | 'associate';
  assignedStoreId: string;
  avatar: string;
  facePhotos?: string[];
  phone: string;
  gender?: string;
  designation?: string;
  department: string;
  joinedDate: string;
  permissions: string[];
}

export interface Department {
  id: string;
  name: string;
  code?: string;
  description?: string;
  floorZone?: string;
  createdAt?: string;
}

export interface Designation {
  id: string;
  title: string;
  department?: string;
  level?: string;
  createdAt?: string;
}
