-- AlterTable
ALTER TABLE "parcels" ADD COLUMN     "deliveryDistrict" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "pickupDistrict" TEXT NOT NULL DEFAULT '';
