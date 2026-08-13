import { Column, DataType, Default, Model, PrimaryKey, Table } from 'sequelize-typescript';

export enum ReviewStatus { PENDING='PENDING', APPROVED='APPROVED', REJECTED='REJECTED' }

@Table({ tableName:'reviews', timestamps:true, underscored:true,
  indexes:[{unique:true,fields:['user_id','product_id']}] })
export class Review extends Model<Review> {
  @PrimaryKey @Default(DataType.UUIDV4) @Column(DataType.UUID) declare id:string;
  @Column({ field:'user_id', type:DataType.UUID, allowNull:false }) declare userId:string;
  @Column({ field:'product_id', type:DataType.UUID, allowNull:false }) declare productId:string;
  @Column({ type:DataType.INTEGER, allowNull:false }) declare rating:number;
  @Column({ type:DataType.STRING(1000), allowNull:true }) declare comment:string|null;
  @Default(ReviewStatus.PENDING) @Column({ type:DataType.ENUM(...Object.values(ReviewStatus)), allowNull:false }) declare status:ReviewStatus;
}
