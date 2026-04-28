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
  Default,
  HasMany,
  ForeignKey,
  BelongsTo,
  BelongsToMany,
  HasOne,
  BeforeUpdate,
  BeforeCreate,
  DataType
} from "sequelize-typescript";
import { hash, compare } from "bcryptjs";
import ContactCustomField from "./ContactCustomField";
import Ticket from "./Ticket";
import Company from "./Company";
import Schedule from "./Schedule";
import ContactTag from "./ContactTag";
import Tag from "./Tag";
import WhatsappLidMap from "./WhatsappLidMap";
import ContactPurchase from "./ContactPurchase";
import ServiceOrder from "./ServiceOrder";

@Table
class Contact extends Model {
  @PrimaryKey
  @AutoIncrement
  @Column
  id: number;

  @Column
  name: string;

  @AllowNull(false)
  @Unique
  @Column
  number: string;

  @AllowNull(false)
  @Default("")
  @Column
  email: string;

  @Default("")
  @Column
  profilePicUrl: string;

  @Default("whatsapp")
  @Column
  channel: string;

  @Default(false)
  @Column
  isGroup: boolean;

  @Default(false)
  @Column
  disableBot: boolean;

  @Default("available")
  @Column
  presence: string;

  @Column
  language: string;

  @Column(DataType.VIRTUAL)
  password: string;

  @Column
  passwordHash: string;

  @Default(0)
  @Column
  tokenVersion: number;

  @Default(false)
  @Column
  isVerified: boolean;

  @CreatedAt
  createdAt: Date;

  @UpdatedAt
  updatedAt: Date;

  @HasMany(() => Ticket)
  tickets: Ticket[];

  @HasMany(() => ContactCustomField)
  extraInfo: ContactCustomField[];

  @HasOne(() => WhatsappLidMap)
  whatsappLidMap: WhatsappLidMap;

  @ForeignKey(() => Company)
  @Column
  companyId: number;

  @BelongsTo(() => Company)
  company: Company;

  @HasMany(() => Schedule, {
    onUpdate: "CASCADE",
    onDelete: "CASCADE",
    hooks: true
  })
  schedules: Schedule[];

  @HasMany(() => ContactTag)
  contactTags: ContactTag[];

  @BelongsToMany(() => Tag, () => ContactTag)
  tags: Tag[];

  @HasMany(() => ContactPurchase)
  purchases: ContactPurchase[];

  @HasMany(() => ServiceOrder)
  serviceOrders: ServiceOrder[];

  @BeforeUpdate
  @BeforeCreate
  static hashPassword = async (instance: Contact): Promise<void> => {
    if (instance.password) {
      instance.passwordHash = await hash(instance.password, 8);
    }
  };

  public checkPassword = async (password: string): Promise<boolean> => {
    return compare(password, this.getDataValue("passwordHash"));
  };
}

export default Contact;
