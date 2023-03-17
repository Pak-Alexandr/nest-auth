import { Column, DataType, Model, Table } from 'sequelize-typescript';

interface UserCreationAttrs {
  email: string;
  password: string;
  fullName: string;
  account: string;
  individualIdentificationNumber: string;
}
@Table({ tableName: 'user' })
export class UserModel extends Model<UserModel, UserCreationAttrs> {
  @Column({
    type: DataType.INTEGER,
    unique: true,
    autoIncrement: true,
    primaryKey: true,
  })
  id: number;
  @Column({
    type: DataType.STRING,
    unique: true,
    allowNull: false,
  })
  email: string;
  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  password: string;
  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  fullName: string;
  @Column({
    type: DataType.STRING,
    unique: true,
    allowNull: false,
  })
  account: string;
  @Column({
    type: DataType.STRING,
    unique: true,
    allowNull: false,
  })
  individualIdentificationNumber: string;
}
