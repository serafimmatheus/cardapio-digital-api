-- DropForeignKey
ALTER TABLE "categories_and_products" DROP CONSTRAINT "categories_and_products_category_id_fkey";

-- DropForeignKey
ALTER TABLE "categories_and_products" DROP CONSTRAINT "categories_and_products_product_id_fkey";

-- AddForeignKey
ALTER TABLE "categories_and_products" ADD CONSTRAINT "categories_and_products_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "categories"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "categories_and_products" ADD CONSTRAINT "categories_and_products_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE CASCADE ON UPDATE CASCADE;
