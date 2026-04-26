import {
  Table,
  Column,
  CreatedAt,
  UpdatedAt,
  Model,
  PrimaryKey,
  AutoIncrement,
  AllowNull,
  Unique,
  Default
} from "sequelize-typescript";

@Table
class Plan extends Model<Plan> {
  @PrimaryKey
  @AutoIncrement
  @Column
  declare id: number;

  @AllowNull(false)
  @Unique
  @Column
  declare name: string;

  @Column
  declare users: number;

  @Column
  declare connections: number;

  @Column
  declare queues: number;

  @Column
  declare value: number;

  @Column
  declare currency: string;

  @CreatedAt
  declare createdAt: Date;

  @UpdatedAt
  declare updatedAt: Date;

  @Default(true)
  @Column
  declare isPublic: boolean;
}

export default Plan;
