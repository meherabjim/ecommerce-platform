import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { User } from '../users/models/user.model';
import { UserRole } from '../common/enums/user-role.enum';
import { Order } from '../commerce/models/order.model';
import { PaymentTransaction } from '../payments/models/payment-transaction.model';

@Injectable()
export class CustomerReportService{
  constructor(
    @InjectModel(User) private users:typeof User,
    @InjectModel(Order) private orders:typeof Order,
    @InjectModel(PaymentTransaction) private tx:typeof PaymentTransaction,
  ){}

  async list(){
    const [users,orders,transactions]=await Promise.all([
      this.users.findAll({where:{role:UserRole.CUSTOMER},order:[['createdAt','DESC']]}),
      this.orders.findAll(),
      this.tx.findAll(),
    ]);
    return users.map((u:any)=>{
      const os=orders.filter((o:any)=>o.userId===u.id);
      const paid=transactions.filter((t:any)=>t.userId===u.id&&t.status==='VERIFIED').reduce((s:number,t:any)=>s+Number(t.amount||0),0);
      const last=os.map((o:any)=>new Date(o.createdAt)).sort((a:any,b:any)=>b.getTime()-a.getTime())[0];
      return {...u.toSafeJSON(),metrics:{orders:os.length,lifetimeOrderValue:os.reduce((s:number,o:any)=>s+Number(o.total||0),0),verifiedPayments:paid,deliveredOrders:os.filter((o:any)=>o.status==='DELIVERED').length,cancelledOrders:os.filter((o:any)=>o.status==='CANCELLED').length,lastOrderAt:last?.toISOString()||null}};
    });
  }
}
