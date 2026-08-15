import {
  IsEmail, IsEnum, IsOptional, IsString, MaxLength, Matches,
} from 'class-validator';
import { UserRole } from '../../common/enums/user-role.enum';

const strongPassword=/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,128}$/;

export const CREATABLE_STAFF_ROLES=[
  UserRole.ADMIN,
  UserRole.CATALOG_MANAGER,
  UserRole.INVENTORY_MANAGER,
  UserRole.ORDER_MANAGER,
  UserRole.CUSTOMER_SUPPORT,
  UserRole.MARKETING_MANAGER,
  UserRole.FINANCE,
  UserRole.DELIVERY_AGENT,
] as const;

export class CreateStaffDto{
  @IsString() @MaxLength(120)
  name!:string;

  @IsEmail()
  email!:string;

  @IsOptional() @IsString() @MaxLength(30)
  phone?:string;

  @IsString()
  @Matches(strongPassword,{
    message:'Password must contain uppercase, lowercase and number and be at least 8 characters.',
  })
  password!:string;

  @IsEnum(UserRole)
  role!:UserRole;
}

export class UpdateUserRoleDto{
  @IsEnum(UserRole)
  role!:UserRole;
}
