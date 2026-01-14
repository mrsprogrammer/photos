import { IsString, Length, Matches, IsEmail } from 'class-validator';

export class AuthCredentialsDto {
  @IsEmail({}, { message: 'email must be a valid email address' })
  email: string;

  @IsString({ message: 'password must be a string' })
  @Length(8, 32, { message: 'password must be between 8 and 32 characters' })
  @Matches(/^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d@$!%*#?&]+$/, {
    message: 'password is too weak (need letters and numbers)',
  })
  password: string;
}
