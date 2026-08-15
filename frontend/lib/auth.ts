export type UserRole =
  | 'SUPER_ADMIN'
  | 'ADMIN'
  | 'CATALOG_MANAGER'
  | 'INVENTORY_MANAGER'
  | 'ORDER_MANAGER'
  | 'CUSTOMER_SUPPORT'
  | 'MARKETING_MANAGER'
  | 'FINANCE'
  | 'CUSTOMER'
  | 'DELIVERY_AGENT';

export type AuthUser = {
  id: string;
  name: string;
  email: string;
  phone?: string | null;
  role: UserRole;
  status: 'ACTIVE' | 'INACTIVE';
};

export const STAFF_ROLES: UserRole[] = [
  'SUPER_ADMIN',
  'ADMIN',
  'CATALOG_MANAGER',
  'INVENTORY_MANAGER',
  'ORDER_MANAGER',
  'CUSTOMER_SUPPORT',
  'MARKETING_MANAGER',
  'FINANCE',
];

export function isStaffRole(role?: string | null){

  if(!role){
    return false;
  }

  return STAFF_ROLES.includes(
    role.toUpperCase() as UserRole
  );

}

export function saveAuth(
  accessToken:string,
  user:AuthUser,
  refreshToken?:string
){

  localStorage.setItem(
    'accessToken',
    accessToken
  );

  localStorage.setItem(
    'authUser',
    JSON.stringify(user)
  );

  if(refreshToken){

    localStorage.setItem(
      'refreshToken',
      refreshToken
    );

  }

}


export function updateAccessToken(
  accessToken:string
){

  localStorage.setItem(
    'accessToken',
    accessToken
  );

}


export function getRefreshToken(){

  if(typeof window === 'undefined'){
    return null;
  }

  return localStorage.getItem(
    'refreshToken'
  );

}


export function clearAuth(){

  localStorage.removeItem(
    'accessToken'
  );

  localStorage.removeItem(
    'refreshToken'
  );

  localStorage.removeItem(
    'authUser'
  );

}


export function getStoredUser():AuthUser|null{

  if(typeof window === 'undefined'){
    return null;
  }

  const raw =
    localStorage.getItem('authUser');


  if(!raw){
    return null;
  }


  try{

    return JSON.parse(raw);

  }
  catch{

    clearAuth();

    return null;

  }

}


export const ADMIN_PATH_ROLES: Record<string, UserRole[]> = {
  '/admin/catalog':['SUPER_ADMIN','ADMIN','CATALOG_MANAGER'],
  '/admin/barcodes':['SUPER_ADMIN','ADMIN','CATALOG_MANAGER','INVENTORY_MANAGER'],
  '/admin/inventory':['SUPER_ADMIN','ADMIN','INVENTORY_MANAGER'],
  '/admin/orders':['SUPER_ADMIN','ADMIN','ORDER_MANAGER','CUSTOMER_SUPPORT','FINANCE'],
  '/admin/shipments':['SUPER_ADMIN','ADMIN','ORDER_MANAGER'],
  '/admin/delivery':['SUPER_ADMIN','ADMIN','ORDER_MANAGER'],
  '/admin/shipping':['SUPER_ADMIN','ADMIN','ORDER_MANAGER'],
  '/admin/customers':['SUPER_ADMIN','ADMIN','CUSTOMER_SUPPORT'],
  '/admin/users':['SUPER_ADMIN','ADMIN'],
  '/admin/promotions':['SUPER_ADMIN','ADMIN','MARKETING_MANAGER'],
  '/admin/reviews':['SUPER_ADMIN','ADMIN','MARKETING_MANAGER','CUSTOMER_SUPPORT'],
  '/admin/returns':['SUPER_ADMIN','ADMIN','ORDER_MANAGER','CUSTOMER_SUPPORT'],
  '/admin/notifications':['SUPER_ADMIN','ADMIN','CUSTOMER_SUPPORT','MARKETING_MANAGER'],
  '/admin/finance':['SUPER_ADMIN','ADMIN','FINANCE'],
  '/admin/reports':['SUPER_ADMIN','ADMIN','INVENTORY_MANAGER','ORDER_MANAGER','MARKETING_MANAGER','FINANCE'],
  '/admin/integrations':['SUPER_ADMIN','ADMIN'],
  '/admin/cms':['SUPER_ADMIN','ADMIN','MARKETING_MANAGER'],
  '/admin/security':['SUPER_ADMIN','ADMIN'],
  '/admin/settings':['SUPER_ADMIN','ADMIN'],
};

export function canAccessAdminPath(role:string|undefined|null, pathname:string){
  const normalized=String(role||'').toUpperCase() as UserRole;
  if(!isStaffRole(normalized)) return false;
  const key=Object.keys(ADMIN_PATH_ROLES).sort((a,b)=>b.length-a.length).find(x=>pathname===x||pathname.startsWith(x+'/'));
  return key ? ADMIN_PATH_ROLES[key].includes(normalized) : true;
}
