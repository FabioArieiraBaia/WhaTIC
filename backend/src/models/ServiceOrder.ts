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
  Default
} from "sequelize-typescript";
import Contact from "./Contact";
import Product from "./Product";
import Company from "./Company";

@Table
class ServiceOrder extends Model<ServiceOrder> {
  @PrimaryKey
  @AutoIncrement
  @Column
  id: number;

  @ForeignKey(() => Contact)
  @Column
  contactId: number;

  @BelongsTo(() => Contact)
  contact: Contact;

  @ForeignKey(() => Product)
  @Column
  productId: number;

  @BelongsTo(() => Product)
  product: Product;

  @Column(DataType.TEXT)
  description: string;

  @Default("PENDENTE")
  @Column(DataType.ENUM("PENDENTE", "EM_ANDAMENTO", "REVISAO", "CONCLUIDO"))
  status: string;

  @Default(0)
  @Column(DataType.DECIMAL(10, 2))
  value: number;

  @ForeignKey(() => Company)
  @Column
  companyId: number;

  @BelongsTo(() => Company)
  company: Company;

  @CreatedAt
  createdAt: Date;

  @UpdatedAt
  updatedAt: Date;
}

export default ServiceOrder;
