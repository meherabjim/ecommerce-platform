export type ShipmentInput = {
  orderId: string;
  orderNumber: string;
  customerName: string;
  phone: string;
  address: string;
  district?: string | null;
  area?: string | null;
  codAmount: number;
};

export type ShipmentResult = {
  provider: string;
  consignmentId: string;
  status: string;
  trackingUrl?: string;
};

export interface CourierProvider {
  readonly key: string;
  readonly displayName: string;
  isConfigured(): boolean;
  createShipment(input: ShipmentInput): Promise<ShipmentResult>;
  track(consignmentId: string): Promise<ShipmentResult>;
}
