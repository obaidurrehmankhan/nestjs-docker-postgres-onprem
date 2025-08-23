import { IsBoolean, IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';

export class CreateTodoDto {
    @IsString()
    @IsNotEmpty()
    @MaxLength(255)
    title!: string;

    // Optional on create; entity defaults to false if omitted.
    @IsOptional()
    @IsBoolean()
    completed?: boolean;
}
