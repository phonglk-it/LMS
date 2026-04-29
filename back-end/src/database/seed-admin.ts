import { Admin, DataSource } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User } from '../users/user.entity';
import { Role } from '../users/role.enum';

export async function seedAdmin(dataSource: DataSource) {
  const userRepo = dataSource.getRepository(User);

  const existingAdmin = await userRepo.findOne({
    where: { email: 'admin@gmail.com' },
  });

  if (existingAdmin) {
    console.log('Admin already exists');
    return;
  }

  const password = await bcrypt.hash('123456', 10);

  const admin = userRepo.create({
    email: 'admin@gmail.com',
    password,
    role: Role.ADMIN,
  });

  await userRepo.save(admin);
}
