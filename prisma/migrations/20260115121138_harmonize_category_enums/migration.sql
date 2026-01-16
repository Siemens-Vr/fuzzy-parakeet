/*
  Warnings:

  - The values [EDUCATION,PRODUCTIVITY,ENTERTAINMENT,SOCIAL,UTILITIES,MEDICAL,FITNESS,ADVENTURE,SIMULATION,SPORTS,MUSIC,ART_CREATIVITY,TRAVEL,NEWS,COMMUNICATION] on the enum `Category` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "Category_new" AS ENUM ('GAMES', 'APPS', 'EXPERIENCES', 'TOOLS');
ALTER TABLE "App" ALTER COLUMN "category" TYPE "Category_new" USING ("category"::text::"Category_new");
ALTER TYPE "Category" RENAME TO "Category_old";
ALTER TYPE "Category_new" RENAME TO "Category";
DROP TYPE "public"."Category_old";
COMMIT;
