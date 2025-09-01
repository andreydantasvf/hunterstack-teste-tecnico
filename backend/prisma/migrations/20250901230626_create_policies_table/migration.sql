-- CreateTable
CREATE TABLE "public"."policies" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "source_url" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "policies_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "policies_source_url_key" ON "public"."policies"("source_url");

-- CreateIndex
CREATE INDEX "policies_category_idx" ON "public"."policies"("category");
