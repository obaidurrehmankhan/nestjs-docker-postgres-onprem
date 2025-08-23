import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Todo } from './todo.entity';
import { CreateTodoDto } from './dtos/create-todo.dto';
import { UpdateTodoDto } from './dtos/update-todo.dto';

@Injectable()
export class TodosService {
    constructor(
        @InjectRepository(Todo)
        private readonly repo: Repository<Todo>,
    ) { }

    async create(dto: CreateTodoDto): Promise<Todo> {
        const todo = this.repo.create({
            title: dto.title,
            completed: dto.completed ?? false,
        });
        return this.repo.save(todo);
        // Future‑ready: business rules, domain events, etc. can be added here.
    }

    findAll(): Promise<Todo[]> {
        return this.repo.find({ order: { createdAt: 'DESC' } });
    }

    async findOne(id: string): Promise<Todo> {
        const found = await this.repo.findOne({ where: { id } });
        if (!found) throw new NotFoundException(`Todo ${id} not found`);
        return found;
    }

    async update(id: string, dto: UpdateTodoDto): Promise<Todo> {
        const todo = await this.findOne(id);
        Object.assign(todo, dto);
        return this.repo.save(todo);
    }

    async remove(id: string): Promise<void> {
        const res = await this.repo.delete(id);
        if (res.affected === 0) throw new NotFoundException(`Todo ${id} not found`);
    }
}
