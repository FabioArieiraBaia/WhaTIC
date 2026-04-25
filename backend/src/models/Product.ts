import {
  Table,
  Column,
  CreatedAt,
  UpdatedAt,
  Model,
  PrimaryKey,
  AutoIncrement,
  ForeignKey,
  BelongsTo,
  DataType,
  Default,
  BelongsToMany,
  HasMany
} from "sequelize-typescript";

import Company from "./Company";
import Campaign from "./Campaign";
import CampaignProduct from "./CampaignProduct";
import ContactPurchase from "./ContactPurchase";
import ServiceOrder from "./ServiceOrder";

@Table
class Product extends Model<Product> {
  @PrimaryKey
  @AutoIncrement
  @Column
  id: number;

  @Column
  name: string;

  @Column(DataType.TEXT)
  description: string;

  @Default(0)
  @Column(DataType.DECIMAL(10, 2))
  price: number;

  @Column(DataType.DECIMAL(10, 2))
  promotionalPrice: number;

  @Default("BRL")
  @Column
  currency: string;

  @Column
  purchaseUrl: string;

  @Column
  videoUrl: string;

  @Column(DataType.TEXT)
  testimonials: string;

  @Column
  testimonialAudioUrl: string;

  @Column
  testimonialImageUrl: string;

  @Column(DataType.TEXT)
  relatedProducts: string;

  @Column
  imageUrl: string;

  @Column
  category: string;

  @Default(true)
  @Column
  isActive: boolean;

  @ForeignKey(() => Company)
  @Column
  companyId: number;

  @BelongsTo(() => Company)
  company: Company;

  @CreatedAt
  createdAt: Date;

  @UpdatedAt
  updatedAt: Date;

  @BelongsToMany(() => Campaign, () => CampaignProduct)
  campaigns: Campaign[];

  @HasMany(() => ContactPurchase)
  purchases: ContactPurchase[];

  @HasMany(() => ServiceOrder)
  serviceOrders: ServiceOrder[];
}

export default Product;
