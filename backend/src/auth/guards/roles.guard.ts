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
    const verb=String(method||'GET').toUpperCase();

    if(role===UserRole.CATALOG_MANAGER){
      return path.includes('catalog') || path.includes('barcode');
    }

    if(role===UserRole.INVENTORY_MANAGER){
      // Inventory staff must not inherit customer/order/financial reports merely
      // because their URL contains "reports".
      return path.includes('inventory') || path.includes('warehouse') ||
        path.includes('barcode');
    }

    if(role===UserRole.ORDER_MANAGER){
      return path.includes('admin/orders') || path.includes('courier') ||
        path.includes('shipping-zone') || path.includes('admin/delivery') ||
        path.includes('return');
    }

    if(role===UserRole.CUSTOMER_SUPPORT){
      if(path.includes('admin/customers') || path.includes('return') ||
         path.includes('review')) return true;
      if(path.includes('notification')) return verb==='GET';
      if(path.includes('admin/orders')) return verb==='GET';
      if(path==='/users' || path.endsWith('/users')) return verb==='GET';
      return false;
    }

    if(role===UserRole.MARKETING_MANAGER){
      if(path.includes('promotion') || path.includes('cms') ||
         path.includes('review')) return true;
      // Marketing may broadcast notifications, but access to business-wide
      // reports is intentionally not inherited.
      if(path.includes('notification')) return ['GET','POST'].includes(verb);
      return false;
    }

    if(role===UserRole.FINANCE){
      if(path.includes('payment') || path.includes('finance') ||
         path.includes('reports')) return true;
      if(path.includes('admin/orders')) {
        return verb==='GET' || path.includes('payment-status');
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

    if(role===UserRole.SUPER_ADMIN &&
       requiredRoles.some(x=>x!==UserRole.CUSTOMER&&x!==UserRole.DELIVERY_AGENT)){
      return true;
    }

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
