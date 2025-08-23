import { MigrationInterface, QueryRunner } from "typeorm";

export class Init1755884665217 implements MigrationInterface {
    name = 'Init1755884665217'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "todos" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "title" character varying(255) NOT NULL, "completed" boolean NOT NULL DEFAULT false, "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "PK_ca8cafd59ca6faaf67995344225" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_c427d5928f463be5c8965e0d68" ON "todos" ("title") `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX "public"."IDX_c427d5928f463be5c8965e0d68"`);
        await queryRunner.query(`DROP TABLE "todos"`);
    }

}
