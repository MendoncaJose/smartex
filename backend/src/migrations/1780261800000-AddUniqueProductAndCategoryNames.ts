import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddUniqueProductAndCategoryNames1780261800000 implements MigrationInterface {
  name = 'AddUniqueProductAndCategoryNames1780261800000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE UNIQUE INDEX "UQ_categories_user_name" ON "categories" ("userId", "name")`,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "UQ_products_user_title" ON "products" ("userId", "title")`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX "public"."UQ_products_user_title"`);
    await queryRunner.query(`DROP INDEX "public"."UQ_categories_user_name"`);
  }
}
