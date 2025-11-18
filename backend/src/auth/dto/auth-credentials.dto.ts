import { IsString, Length, Matches } from 'class-validator';

export class AuthCredentialsDto {
  @IsString({ message: 'username must be a string' })
  @Length(4, 20, { message: 'username must be between 4 and 20 characters' })
  username: string;

  @IsString({ message: 'password must be a string' })
  @Length(8, 32, { message: 'password must be between 8 and 32 characters' })
  @Matches(/^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d@$!%*#?&]+$/, {
    message: 'password is too weak (need letters and numbers)',
  })
  password: string;
}
