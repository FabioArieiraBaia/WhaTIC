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
  DataType
} from "sequelize-typescript";
import Company from "./Company";

@Table
class Expense extends Model<Expense> {
  @PrimaryKey
  @AutoIncrement
  @Column
  declare id: number;

  @Column
  declare description: string;

  @Column(DataType.DECIMAL(10, 2))
  declare value: number;

  @Column
  declare expenseDate: Date;

  @Column
  declare category: string;

  @ForeignKey(() => Company)
  @Column
  declare companyId: number;

  @BelongsTo(() => Company)
  company: Company;

  @CreatedAt
  declare createdAt: Date;

  @UpdatedAt
  declare updatedAt: Date;
}

export default Expense;
