import { Table, Column, Model, Index } from "sequelize-typescript";

@Table({
  tableName: "Translations",
  timestamps: false
})
class Translation extends Model {
  @Index("index_language")
  @Column({ primaryKey: true })
  declare language: string;

  @Index("index_namespace")
  @Column({ primaryKey: true })
  declare namespace: string;

  @Index("index_key")
  @Column({ primaryKey: true })
  declare key: string;

  @Column
  declare value: string;
}

export default Translation;
