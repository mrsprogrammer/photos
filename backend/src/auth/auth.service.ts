import {
  Injectable,
  ConflictException,
  InternalServerErrorException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { AuthCredentialsDto } from './dto/auth-credentials.dto';
import { User } from './user.entity';
import { JwtPayload } from './jwt-payload.interface';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    private jwtService: JwtService,
  ) {}

  async signUp(authCredentialsDto: AuthCredentialsDto): Promise<void> {
    const { email, password } = authCredentialsDto;
    const salt = await bcrypt.genSalt();
    const hashed = await bcrypt.hash(password, salt);

    // Generate unique username from email (e.g., test1234_gmail from test1234@gmail.com)
    const [emailUser, emailDomain] = email.split('@');
    const domainName = emailDomain.split('.')[0];
    const username = `${emailUser}_${domainName}`;

    const user = this.usersRepository.create({
      email,
      username,
      password: hashed,
    });

    try {
      await this.usersRepository.save(user);
    } catch (error) {
      if ((error as any)?.code === '23505') {
        const constraint = (error as any)?.constraint;
        if (constraint === 'UQ_4a204e4e7fc1d2df18c0c6d5e7') {
          throw new ConflictException('Email already exists');
        } else {
          throw new ConflictException('Username already exists');
        }
      } else {
        throw new InternalServerErrorException();
      }
    }
  }

  async signIn(
    authCredentialsDto: AuthCredentialsDto,
  ): Promise<{ accessToken: string }> {
    const { email, password } = authCredentialsDto;
    const user = await this.usersRepository.findOne({
      where: { email },
    });

    if (user && (await bcrypt.compare(password, user.password))) {
      const payload: JwtPayload = { username: user.username };
      const accessToken: string = await this.jwtService.sign(payload);
      return { accessToken };
    } else {
      throw new UnauthorizedException('Please check your login credentials');
    }
  }
}
