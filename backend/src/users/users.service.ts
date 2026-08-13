import { ConflictException, Injectable, NotFoundException, OnModuleInit } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { User } from './models/user.model';
import { Address } from './models/address.model';
import { UserRole } from '../common/enums/user-role.enum';
import { UserStatus } from '../common/enums/user-status.enum';
import { AddressDto, CreateDeliveryAgentDto } from './dto/address.dto';

@Injectable()
export class UsersService implements OnModuleInit {
  constructor(
    @InjectModel(User) private readonly userModel: typeof User,
    @InjectModel(Address) private readonly addressModel: typeof Address,
    private readonly configService: ConfigService,
  ) {}

  async onModuleInit(){ await this.ensureAdminUser(); }
  async ensureAdminUser(){
    const email=this.configService.get<string>('ADMIN_EMAIL','admin@neurocommerce.local').trim().toLowerCase();
    if(await this.userModel.findOne({where:{email}})) return;
    const passwordHash=await bcrypt.hash(this.configService.get<string>('ADMIN_PASSWORD','Admin12345!'),12);
    await this.userModel.create({name:this.configService.get<string>('ADMIN_NAME','Super Admin'),email,phone:null,passwordHash,role:UserRole.ADMIN,status:UserStatus.ACTIVE} as any);
  }

  async createCustomer(input:{name:string;email:string;phone?:string;password:string}){
    const email=input.email.trim().toLowerCase();
    if(await this.userModel.findOne({where:{email}})) throw new ConflictException('An account with this email already exists.');
    return this.userModel.create({name:input.name.trim(),email,phone:input.phone?.trim()||null,passwordHash:await bcrypt.hash(input.password,12),role:UserRole.CUSTOMER,status:UserStatus.ACTIVE} as any);
  }
  findByEmail(email:string){return this.userModel.findOne({where:{email:email.trim().toLowerCase()}})}
  findById(id:string){return this.userModel.findByPk(id)}
  async findByIdOrFail(id:string){const u=await this.findById(id);if(!u)throw new NotFoundException('User not found.');return u}
  async findAll(){return (await this.userModel.findAll({order:[['createdAt','DESC']]})).map(u=>u.toSafeJSON())}
  async updateStatus(id:string,status:UserStatus){const u=await this.findByIdOrFail(id);if(u.role===UserRole.ADMIN&&status===UserStatus.INACTIVE)throw new ConflictException('Admin account cannot be disabled from this endpoint.');u.status=status;await u.save();return u.toSafeJSON()}

  async createDeliveryAgent(dto:CreateDeliveryAgentDto){
    const email=dto.email.trim().toLowerCase();
    if(await this.userModel.findOne({where:{email}})) throw new ConflictException('An account with this email already exists.');
    const user=await this.userModel.create({name:dto.name.trim(),email,phone:dto.phone.trim(),passwordHash:await bcrypt.hash(dto.password,12),role:UserRole.DELIVERY_AGENT,status:UserStatus.ACTIVE} as any);
    return user.toSafeJSON();
  }
  async deliveryAgents(){return (await this.userModel.findAll({where:{role:UserRole.DELIVERY_AGENT},order:[['createdAt','DESC']]})).map(u=>u.toSafeJSON())}

  addresses(userId:string){return this.addressModel.findAll({where:{userId},order:[['isDefault','DESC'],['createdAt','DESC']]})}
  async addressById(userId:string,id:string){const a=await this.addressModel.findOne({where:{id,userId}});if(!a)throw new NotFoundException('Address not found.');return a}
  async createAddress(userId:string,dto:AddressDto){
    const count=await this.addressModel.count({where:{userId}});const makeDefault=dto.isDefault||count===0;
    if(makeDefault) await this.addressModel.update({isDefault:false},{where:{userId}});
    return this.addressModel.create({...dto,userId,isDefault:makeDefault,landmark:dto.landmark||null,postalCode:dto.postalCode||null} as any);
  }
  async updateAddress(userId:string,id:string,dto:AddressDto){const a=await this.addressById(userId,id);if(dto.isDefault)await this.addressModel.update({isDefault:false},{where:{userId}});await a.update({...dto,landmark:dto.landmark||null,postalCode:dto.postalCode||null});return a}
  async deleteAddress(userId:string,id:string){const a=await this.addressById(userId,id);const wasDefault=a.isDefault;await a.destroy();if(wasDefault){const next=await this.addressModel.findOne({where:{userId},order:[['createdAt','DESC']]});if(next){next.isDefault=true;await next.save()}}return {deleted:true}}
  async setDefaultAddress(userId:string,id:string){const a=await this.addressById(userId,id);await this.addressModel.update({isDefault:false},{where:{userId}});a.isDefault=true;await a.save();return a}
}
