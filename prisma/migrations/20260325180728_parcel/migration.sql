-- CreateEnum
CREATE TYPE "ParcelCategory" AS ENUM ('PARCEL', 'CARGO');

-- AlterTable
ALTER TABLE "parcels" ADD COLUMN     "category" "ParcelCategory" NOT NULL DEFAULT 'PARCEL';
