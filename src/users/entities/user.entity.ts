import { Column, Entity, PrimaryGeneratedColumn, Unique } from 'typeorm';

@Entity()
@Unique(['email', 'username'])
export class User {
  constructor(userObject: {
    email: string;
    password: string;
    username: string;
  }) {
    this.email = userObject?.email;
    this.password = userObject?.password;
    this.username = userObject?.username;
  }
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  email: string;

  @Column()
  password: string;

  @Column()
  username: string;
}
