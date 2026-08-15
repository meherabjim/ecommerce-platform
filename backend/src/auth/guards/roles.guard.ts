import {
  CanActivate,
  ExecutionContext,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from '../decorators/roles.decorator';
import { UserRole } from '../../common/enums/user-role.enum';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  private delegatedAdminAccess(role:UserRole, method:string, url:string) {
    const path=String(url||'').toLowerCase();

    if(role===UserRole.CATALOG_MANAGER){
      return path.includes('catalog') || path.includes('barcode');
    }

    if(role===UserRole.INVENTORY_MANAGER){
      return path.includes('inventory') || path.includes('warehouse') ||
        path.includes('barcode') || path.includes('reports');
    }

    if(role===UserRole.ORDER_MANAGER){
      return path.includes('admin/orders') || path.includes('courier') ||
        path.includes('shipping-zone') || path.includes('admin/delivery') ||
        path.includes('return') || path.includes('reports');
    }

    if(role===UserRole.CUSTOMER_SUPPORT){
      if(path.includes('admin/customers') || path.includes('return') ||
         path.includes('review') || path.includes('notification')) return true;
      if(path.includes('admin/orders')) return method==='GET';
      if(path==='/users' || path.endsWith('/users')) return method==='GET';
      return false;
    }

    if(role===UserRole.MARKETING_MANAGER){
      return path.includes('promotion') || path.includes('cms') ||
        path.includes('review') || path.includes('reports');
    }

    if(role===UserRole.FINANCE){
      if(path.includes('payment') || path.includes('finance') ||
         path.includes('reports')) return true;
      if(path.includes('admin/orders')) {
        return method==='GET' || path.includes('payment-status');
      }
      return false;
    }

    return false;
  }

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<UserRole[]>(
      ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!requiredRoles || requiredRoles.length === 0) return true;

    const request = context.switchToHttp().getRequest();
    const role=request.user?.role as UserRole|undefined;

    if(!role) return false;
    if(requiredRoles.includes(role)) return true;

    // Super Admin can perform every staff/admin action.
    if(role===UserRole.SUPER_ADMIN &&
       requiredRoles.some(x=>x!==UserRole.CUSTOMER&&x!==UserRole.DELIVERY_AGENT)){
      return true;
    }

    // Existing controllers commonly declare ADMIN. Specialized staff are
    // restricted by module/path here until every controller adopts
    // permission decorators.
    if(requiredRoles.includes(UserRole.ADMIN)){
      if(role===UserRole.ADMIN) return true;
      return this.delegatedAdminAccess(
        role,
        String(request.method||'GET').toUpperCase(),
        request.originalUrl||request.url||'',
      );
    }

    return false;
  }
}
