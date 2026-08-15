import {
  BadRequestException, ConflictException, Injectable, NotFoundException, OnModuleInit,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { User } from './models/user.model';
import { Address, LocationSource } from './models/address.model';
import { UserRole, isStaffRole } from '../common/enums/user-role.enum';
import { UserStatus } from '../common/enums/user-status.enum';
import { AddressDto, CreateDeliveryAgentDto } from './dto/address.dto';
import { CreateStaffDto, CREATABLE_STAFF_ROLES } from './dto/staff.dto';
import { AuditLog } from '../auth/models/audit-log.model';

@Injectable()
export class UsersService implements OnModuleInit {
  constructor(
    @InjectModel(User) private readonly userModel: typeof User,
    @InjectModel(Address) private readonly addressModel: typeof Address,
    @InjectModel(AuditLog) private readonly auditModel:typeof AuditLog,
    private readonly configService: ConfigService,
  ) {}

  private audit(actorUserId:string|undefined,action:string,entityId:string,metadata:any={}){
    return this.auditModel.create({
      actorUserId:actorUserId||null,
      action,
      entityType:'USER',
      entityId,
      metadata,
    } as any);
  }

  async onModuleInit(){ await this.ensureAdminUser(); }

  async ensureAdminUser(){
    const email=(this.configService.get<string>('ADMIN_EMAIL')||'').trim().toLowerCase();
    const password=this.configService.get<string>('ADMIN_PASSWORD')||'';

    // Never create a privileged account from hardcoded fallback credentials.
    // Existing databases continue to work normally; fresh environments can
    // bootstrap their first Super Admin explicitly through environment values.
    if(!email&&!password) return;
    if(!email||!password){
      throw new Error('ADMIN_EMAIL and ADMIN_PASSWORD must be configured together.');
    }
    if(password.length<12){
      throw new Error('ADMIN_PASSWORD must be at least 12 characters long.');
    }

    const existing=await this.userModel.findOne({where:{email}});
    if(existing) return;

    const passwordHash=await bcrypt.hash(password,12);
    await this.userModel.create({
      name:(this.configService.get<string>('ADMIN_NAME')||'Super Admin').trim(),
      email,phone:null,passwordHash,
      role:UserRole.SUPER_ADMIN,
      status:UserStatus.ACTIVE,
    } as any);
  }

  async createCustomer(input:{name:string;email:string;phone?:string;password:string}){
    const email=input.email.trim().toLowerCase();
    if(await this.userModel.findOne({where:{email}})) throw new ConflictException('An account with this email already exists.');
    return this.userModel.create({
      name:input.name.trim(),email,phone:input.phone?.trim()||null,
      passwordHash:await bcrypt.hash(input.password,12),
      role:UserRole.CUSTOMER,status:UserStatus.ACTIVE,
    } as any);
  }

  findByEmail(email:string){return this.userModel.findOne({where:{email:email.trim().toLowerCase()}})}
  findById(id:string){return this.userModel.findByPk(id)}
  async findByIdOrFail(id:string){const u=await this.findById(id);if(!u)throw new NotFoundException('User not found.');return u}
  async findAll(){return (await this.userModel.findAll({order:[['createdAt','DESC']]})).map(u=>u.toSafeJSON())}

  private async protectLastSuperAdmin(target:User,nextStatus?:UserStatus,nextRole?:UserRole){
    if(target.role!==UserRole.SUPER_ADMIN)return;
    const removingRole=nextRole!==undefined&&nextRole!==UserRole.SUPER_ADMIN;
    const disabling=nextStatus!==undefined&&nextStatus!==UserStatus.ACTIVE;
    if(!removingRole&&!disabling)return;

    const count=await this.userModel.count({
      where:{role:UserRole.SUPER_ADMIN,status:UserStatus.ACTIVE},
    });
    if(count<=1)throw new ConflictException('The last active Super Admin cannot be disabled or demoted.');
  }

  async updateStatus(id:string,status:UserStatus,actorId?:string){
    const u=await this.findByIdOrFail(id);
    if(actorId===u.id&&status!==UserStatus.ACTIVE){
      throw new ConflictException('You cannot disable your own account.');
    }
    await this.protectLastSuperAdmin(u,status,undefined);
    u.status=status;
    await u.save();
    await this.audit(actorId,'USER_STATUS_UPDATED',u.id,{status});
    return u.toSafeJSON();
  }

  async createStaff(dto:CreateStaffDto,actorId:string){
    if(!CREATABLE_STAFF_ROLES.includes(dto.role as any)){
      throw new BadRequestException('This role cannot be created from staff management.');
    }
    const actor=await this.findByIdOrFail(actorId);
    if(actor.role!==UserRole.SUPER_ADMIN){
      throw new ConflictException('Only Super Admin can create staff accounts.');
    }
    const email=dto.email.trim().toLowerCase();
    if(await this.userModel.findOne({where:{email}}))throw new ConflictException('An account with this email already exists.');
    const user=await this.userModel.create({
      name:dto.name.trim(),
      email,
      phone:dto.phone?.trim()||null,
      passwordHash:await bcrypt.hash(dto.password,12),
      role:dto.role,
      status:UserStatus.ACTIVE,
    } as any);
    await this.audit(actorId,'STAFF_CREATED',user.id,{role:user.role});
    return user.toSafeJSON();
  }

  async updateRole(id:string,role:UserRole,actorId:string){
    const actor=await this.findByIdOrFail(actorId);
    if(actor.role!==UserRole.SUPER_ADMIN)throw new ConflictException('Only Super Admin can change staff roles.');
    const user=await this.findByIdOrFail(id);
    if(user.id===actorId&&role!==UserRole.SUPER_ADMIN){
      throw new ConflictException('You cannot demote your own Super Admin account.');
    }
    if(role===UserRole.CUSTOMER){
      throw new BadRequestException('Use customer management for customer accounts.');
    }
    await this.protectLastSuperAdmin(user,undefined,role);
    const previous=user.role;
    user.role=role;
    await user.save();
    await this.audit(actorId,'USER_ROLE_UPDATED',user.id,{previousRole:previous,role});
    return user.toSafeJSON();
  }

  async createDeliveryAgent(dto:CreateDeliveryAgentDto,actorId?:string){
    const email=dto.email.trim().toLowerCase();
    if(await this.userModel.findOne({where:{email}})) throw new ConflictException('An account with this email already exists.');
    const user=await this.userModel.create({
      name:dto.name.trim(),email,phone:dto.phone.trim(),
      passwordHash:await bcrypt.hash(dto.password,12),
      role:UserRole.DELIVERY_AGENT,status:UserStatus.ACTIVE,
    } as any);
    if(actorId)await this.audit(actorId,'DELIVERY_AGENT_CREATED',user.id,{});
    return user.toSafeJSON();
  }

  async deliveryAgents(){return (await this.userModel.findAll({where:{role:UserRole.DELIVERY_AGENT},order:[['createdAt','DESC']]})).map(u=>u.toSafeJSON())}

  async addresses(userId:string){
    const rows=await this.addressModel.findAll({where:{userId},order:[['isDefault','DESC'],['createdAt','DESC']]});
    const seen=new Set<string>(); const unique:any[]=[];
    for(const row of rows){
      const key=[row.recipientName,row.phone,row.type,row.division,row.district,row.area,row.addressLine,row.landmark||'',row.postalCode||''].map(v=>String(v||'').trim().toLowerCase()).join('|');
      if(seen.has(key)) continue; seen.add(key); unique.push(row);
    }
    return unique;
  }
  async addressById(userId:string,id:string){const a=await this.addressModel.findOne({where:{id,userId}});if(!a)throw new NotFoundException('Address not found.');return a}
  async createAddress(userId:string,dto:AddressDto){
    const existing=await this.addressModel.findAll({where:{userId}});
    const norm=(v:any)=>String(v||'').trim().toLowerCase();
    const duplicate=existing.find(a=>norm(a.recipientName)===norm(dto.recipientName)&&norm(a.phone)===norm(dto.phone)&&norm(a.type)===norm(dto.type)&&norm(a.division)===norm(dto.division)&&norm(a.district)===norm(dto.district)&&norm(a.area)===norm(dto.area)&&norm(a.addressLine)===norm(dto.addressLine));
    if(duplicate){ if(dto.isDefault&&!duplicate.isDefault) await this.setDefaultAddress(userId,duplicate.id); return duplicate; }
    const count=existing.length;const makeDefault=dto.isDefault||count===0;
    if(makeDefault) await this.addressModel.update({isDefault:false},{where:{userId}});
    return this.addressModel.create({...dto,userId,isDefault:makeDefault,landmark:dto.landmark||null,postalCode:dto.postalCode||null,latitude:dto.latitude===undefined?null:String(dto.latitude),longitude:dto.longitude===undefined?null:String(dto.longitude),locationSource:dto.locationSource||LocationSource.NONE} as any);
  }
  async updateAddress(userId:string,id:string,dto:AddressDto){const a=await this.addressById(userId,id);if(dto.isDefault)await this.addressModel.update({isDefault:false},{where:{userId}});await a.update({...dto,landmark:dto.landmark||null,postalCode:dto.postalCode||null,latitude:dto.latitude===undefined?null:String(dto.latitude),longitude:dto.longitude===undefined?null:String(dto.longitude),locationSource:dto.locationSource||LocationSource.NONE} as any);return a}
  async deleteAddress(userId:string,id:string){const a=await this.addressById(userId,id);const wasDefault=a.isDefault;await a.destroy();if(wasDefault){const next=await this.addressModel.findOne({where:{userId},order:[['createdAt','DESC']]});if(next){next.isDefault=true;await next.save()}}return {deleted:true}}
  async setDefaultAddress(userId:string,id:string){const a=await this.addressById(userId,id);await this.addressModel.update({isDefault:false},{where:{userId}});a.isDefault=true;await a.save();return a}

  async updateProfile(userId:string,dto:{name?:string;email?:string;phone?:string}){
    const user=await this.findByIdOrFail(userId);
    if(dto.email!==undefined){
      const email=dto.email.trim().toLowerCase();
      const existing=await this.userModel.findOne({where:{email}});
      if(existing&&existing.id!==user.id)throw new BadRequestException('Email is already in use.');
      if(email!==user.email){user.email=email;user.emailVerifiedAt=null;}
    }
    if(dto.name!==undefined)user.name=dto.name.trim();
    if(dto.phone!==undefined)user.phone=dto.phone.trim()||null;
    await user.save();
    return user.toSafeJSON();
  }
}
