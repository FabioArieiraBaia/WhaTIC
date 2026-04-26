import {
  Table,
  Column,
  Model,
  DataType,
  ForeignKey,
  PrimaryKey,
  Default,
  CreatedAt,
  UpdatedAt,
  BelongsTo
} from "sequelize-typescript";
import User from "./User"; // Importação da model User

@Table
class UserSocketSession extends Model<UserSocketSession> {
  @PrimaryKey
  @Column(DataType.STRING)
  declare id: string;

  @ForeignKey(() => User)
  @Column
  declare userId: number;

  @Default(true)
  @Column(DataType.BOOLEAN)
  declare active: boolean;

  @CreatedAt
  declare createdAt: Date;

  @UpdatedAt
  declare updatedAt: Date;

  @BelongsTo(() => User)
  user: User; // Associação com User
}

export default UserSocketSession;
