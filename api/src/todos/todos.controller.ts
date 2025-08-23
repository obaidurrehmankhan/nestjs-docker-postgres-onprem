import {
    Body,
    Controller,
    Delete,
    Get,
    Param,
    Patch,
    Post,
    ParseUUIDPipe,
} from '@nestjs/common';
import { TodosService } from './todos.service';
import { CreateTodoDto } from './dtos/create-todo.dto';
import { UpdateTodoDto } from './dtos/update-todo.dto';

@Controller('todos')
export class TodosController {
    constructor(private readonly todosService: TodosService) { }

    @Post()
    create(@Body() dto: CreateTodoDto) {
        return this.todosService.create(dto);
    }

    @Get()
    findAll() {
        return this.todosService.findAll();
    }

    @Get(':id')
    findOne(@Param('id', new ParseUUIDPipe({ version: '4' })) id: string) {
        return this.todosService.findOne(id);
    }

    @Patch(':id')
    update(
        @Param('id', new ParseUUIDPipe({ version: '4' })) id: string,
        @Body() dto: UpdateTodoDto,
    ) {
        return this.todosService.update(id, dto);
    }

    @Delete(':id')
    remove(@Param('id', new ParseUUIDPipe({ version: '4' })) id: string) {
        return this.todosService.remove(id);
    }
}
