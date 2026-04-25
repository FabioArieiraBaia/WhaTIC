import {
  Table,
  Column,
  CreatedAt,
  UpdatedAt,
  Model,
  PrimaryKey,
  AutoIncrement,
  ForeignKey
} from "sequelize-typescript";
import Campaign from "./Campaign";
import Product from "./Product";

@Table({ tableName: "CampaignProducts" })
class CampaignProduct extends Model<CampaignProduct> {
  @PrimaryKey
  @AutoIncrement
  @Column
  id: number;

  @ForeignKey(() => Campaign)
  @Column
  campaignId: number;

  @ForeignKey(() => Product)
  @Column
  productId: number;

  @CreatedAt
  createdAt: Date;

  @UpdatedAt
  updatedAt: Date;
}

export default CampaignProduct;
