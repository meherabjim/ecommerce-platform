import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';

import { Order, OrderStatus, PaymentStatus } from '../commerce/models/order.model';
import { OrderItem } from '../commerce/models/order-item.model';
import { User } from '../users/models/user.model';
import { UserRole } from '../common/enums/user-role.enum';
import { Product } from '../catalog/models/product.model';
import { ProductVariant } from '../catalog/models/product-variant.model';
import { Inventory } from '../inventory/models/inventory.model';
import { ReturnRequest } from '../customer/models/return-request.model';

@Injectable()
export class OpsService {
  constructor(
    @InjectModel(Order) private readonly orderModel: typeof Order,
    @InjectModel(OrderItem) private readonly orderItemModel: typeof OrderItem,
    @InjectModel(User) private readonly userModel: typeof User,
    @InjectModel(Product) private readonly productModel: typeof Product,
    @InjectModel(ProductVariant) private readonly variantModel: typeof ProductVariant,
    @InjectModel(Inventory) private readonly inventoryModel: typeof Inventory,
    @InjectModel(ReturnRequest) private readonly returnModel: typeof ReturnRequest,
  ) {}

  health() {
    return {
      status: 'ok',
      service: 'ecommerce-platform-api',
      timestamp: new Date().toISOString(),
      uptimeSeconds: Math.round(process.uptime()),
      environment: process.env.NODE_ENV || 'development',
    };
  }

  private dateKey(input: Date | string) {
    const d = new Date(input);
    return d.toISOString().slice(0, 10);
  }

  async overview() {
    const [orders, items, users, products, variants, inventory, returns] =
      await Promise.all([
        this.orderModel.findAll({ order: [['createdAt', 'ASC']] }),
        this.orderItemModel.findAll(),
        this.userModel.findAll(),
        this.productModel.findAll(),
        this.variantModel.findAll(),
        this.inventoryModel.findAll(),
        this.returnModel.findAll(),
      ]);

    const today = new Date().toISOString().slice(0, 10);
    const paidOrders = orders.filter((o) => o.paymentStatus === PaymentStatus.PAID);
    const delivered = orders.filter((o) => o.status === OrderStatus.DELIVERED);

    const totalPaid = paidOrders.reduce((sum, o) => sum + Number(o.total || 0), 0);
    const todaySales = paidOrders
      .filter((o) => this.dateKey(o.createdAt as any) === today)
      .reduce((sum, o) => sum + Number(o.total || 0), 0);

    const dueAmount = orders
      .filter((o) => ![PaymentStatus.PAID, PaymentStatus.REFUNDED].includes(o.paymentStatus))
      .reduce((sum, o) => sum + Number(o.total || 0) - Number(o.codCollected || 0), 0);

    const statusCounts: Record<string, number> = {};
    const paymentCounts: Record<string, number> = {};
    for (const order of orders) {
      statusCounts[order.status] = (statusCounts[order.status] || 0) + 1;
      paymentCounts[order.paymentStatus] = (paymentCounts[order.paymentStatus] || 0) + 1;
    }

    const customerOrders = new Map<string, number>();
    for (const order of orders) {
      customerOrders.set(order.userId, (customerOrders.get(order.userId) || 0) + 1);
    }
    const customers = users.filter((u) => u.role === UserRole.CUSTOMER);
    const repeatCustomers = customers.filter((u) => (customerOrders.get(u.id) || 0) > 1).length;

    const thirtyDaysAgo = Date.now() - 30 * 24 * 60 * 60 * 1000;
    const newCustomers30d = customers.filter(
      (u) => new Date(u.createdAt as any).getTime() >= thirtyDaysAgo,
    ).length;

    const variantStock = new Map<string, { onHand: number; reserved: number; reorder: number }>();
    for (const row of inventory) {
      const current = variantStock.get(row.variantId) || { onHand: 0, reserved: 0, reorder: 0 };
      current.onHand += Number(row.stockOnHand || 0);
      current.reserved += Number(row.reserved || 0);
      current.reorder = Math.max(current.reorder, Number(row.reorderLevel || 0));
      variantStock.set(row.variantId, current);
    }
    const stockRows = [...variantStock.entries()].map(([variantId, s]) => ({
      variantId,
      available: s.onHand - s.reserved,
      reorderLevel: s.reorder,
    }));
    const lowStock = stockRows.filter((x) => x.available <= x.reorderLevel).length;
    const outOfStock = stockRows.filter((x) => x.available <= 0).length;
    const availableUnits = stockRows.reduce((sum, x) => sum + Math.max(0, x.available), 0);

    const productSales = new Map<string, { quantity: number; revenue: number }>();
    for (const item of items) {
      const current = productSales.get(item.productName) || { quantity: 0, revenue: 0 };
      current.quantity += Number(item.quantity || 0);
      current.revenue += Number(item.lineTotal || 0);
      productSales.set(item.productName, current);
    }
    const topProducts = [...productSales.entries()]
      .map(([name, value]) => ({ name, ...value }))
      .sort((a, b) => b.quantity - a.quantity)
      .slice(0, 8);

    const trendMap = new Map<string, { paid: number; orders: number }>();
    for (let i = 13; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      trendMap.set(this.dateKey(d), { paid: 0, orders: 0 });
    }
    for (const order of orders) {
      const key = this.dateKey(order.createdAt as any);
      const row = trendMap.get(key);
      if (!row) continue;
      row.orders += 1;
      if (order.paymentStatus === PaymentStatus.PAID) row.paid += Number(order.total || 0);
    }

    const returnCounts: Record<string, number> = {};
    for (const row of returns) {
      returnCounts[row.status] = (returnCounts[row.status] || 0) + 1;
    }

    return {
      generatedAt: new Date().toISOString(),
      sales: {
        totalPaid,
        todaySales,
        grossDelivered: delivered.reduce((sum, o) => sum + Number(o.total || 0), 0),
        averageOrderValue: orders.length
          ? orders.reduce((sum, o) => sum + Number(o.total || 0), 0) / orders.length
          : 0,
        dueAmount: Math.max(0, dueAmount),
      },
      orders: {
        total: orders.length,
        byStatus: statusCounts,
      },
      payments: {
        byStatus: paymentCounts,
      },
      customers: {
        total: customers.length,
        repeat: repeatCustomers,
        newLast30Days: newCustomers30d,
      },
      inventory: {
        products: products.length,
        variants: variants.length,
        lowStock,
        outOfStock,
        availableUnits,
      },
      delivery: {
        delivered: delivered.length,
        failed: statusCounts[OrderStatus.DELIVERY_FAILED] || 0,
        active:
          (statusCounts[OrderStatus.READY_FOR_PICKUP] || 0) +
          (statusCounts[OrderStatus.SHIPPED] || 0) +
          (statusCounts[OrderStatus.IN_TRANSIT] || 0) +
          (statusCounts[OrderStatus.OUT_FOR_DELIVERY] || 0),
      },
      returns: {
        total: returns.length,
        byStatus: returnCounts,
      },
      topProducts,
      salesTrend: [...trendMap.entries()].map(([date, value]) => ({ date, ...value })),
    };
  }

  async ordersCsv() {
    const orders = await this.orderModel.findAll({ order: [['createdAt', 'DESC']] });
    const quote = (value: unknown) =>
      `"${String(value ?? '').replaceAll('"', '""')}"`;

    const header = [
      'order_number',
      'created_at',
      'customer_name',
      'phone',
      'district',
      'area',
      'status',
      'payment_mode',
      'payment_status',
      'subtotal',
      'shipping_charge',
      'discount',
      'total',
      'tracking_number',
    ];

    const rows = orders.map((o) =>
      [
        o.orderNumber,
        new Date(o.createdAt as any).toISOString(),
        o.customerName,
        o.phone,
        o.district || o.city,
        o.area || '',
        o.status,
        o.paymentMode,
        o.paymentStatus,
        o.subtotal,
        o.shippingCharge,
        o.discount,
        o.total,
        o.trackingNumber || '',
      ]
        .map(quote)
        .join(','),
    );

    return [header.join(','), ...rows].join('\n');
  }

  private csvCell(value:any) {
    const text=String(value??'').replaceAll('"','""');
    return `"${text}"`;
  }

  async customersCsv() {
    const users=await this.userModel.findAll({order:[['createdAt','DESC']]});
    const customers=users.filter((u:any)=>u.role===UserRole.CUSTOMER);
    const rows=['name,email,phone,status,created_at'];
    for(const u of customers) rows.push([u.name,u.email,u.phone||'',u.status,u.createdAt].map(x=>this.csvCell(x)).join(','));
    return '\ufeff'+rows.join('\r\n');
  }

  async inventoryCsv() {
    const [inventory,variants,products]=await Promise.all([
      this.inventoryModel.findAll(),this.variantModel.findAll(),this.productModel.findAll()
    ]);
    const productById=new Map(products.map((p:any)=>[p.id,p]));
    const variantById=new Map(variants.map((v:any)=>[v.id,v]));
    const rows=['product,sku,barcode,stock_on_hand,reserved,available,reorder_level'];
    for(const i of inventory){
      const v:any=variantById.get(i.variantId); const p:any=v?productById.get(v.productId):null;
      rows.push([p?.name||'',v?.sku||'',v?.barcode||'',i.stockOnHand,i.reserved,Number(i.stockOnHand||0)-Number(i.reserved||0),i.reorderLevel].map(x=>this.csvCell(x)).join(','));
    }
    return '\ufeff'+rows.join('\r\n');
  }

}
