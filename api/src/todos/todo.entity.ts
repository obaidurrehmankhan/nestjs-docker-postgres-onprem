import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
    Index,
} from 'typeorm';

@Entity({ name: 'todos' })
export class Todo {
    @PrimaryGeneratedColumn('uuid')
    id!: string;

    // Title is required; indexed to keep future search/snippets fast.
    @Index()
    @Column({ type: 'varchar', length: 255 })
    title!: string;

    // Defaults to false; stays boolean in DB.
    @Column({ type: 'boolean', default: false })
    completed!: boolean;

    // Timestamps use timestamptz for proper timezone semantics.
    @CreateDateColumn({ type: 'timestamptz' })
    createdAt!: Date;

    @UpdateDateColumn({ type: 'timestamptz' })
    updatedAt!: Date;
}
