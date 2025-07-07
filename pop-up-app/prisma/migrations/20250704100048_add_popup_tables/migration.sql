-- CreateTable
CREATE TABLE "PopupSubscriber" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT NOT NULL,
    "phone" TEXT,
    "discountCode" TEXT NOT NULL,
    "blockId" TEXT,
    "shopDomain" TEXT NOT NULL,
    "subscribedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "usedDiscount" BOOLEAN NOT NULL DEFAULT false,
    "usedAt" DATETIME
);

-- CreateTable
CREATE TABLE "PopupSettings" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "shopDomain" TEXT NOT NULL,
    "isEnabled" BOOLEAN NOT NULL DEFAULT true,
    "title" TEXT NOT NULL DEFAULT 'Get 10% Off Your First Order!',
    "description" TEXT NOT NULL DEFAULT 'Enter your email to receive an exclusive discount code',
    "discountPercentage" INTEGER NOT NULL DEFAULT 10,
    "position" TEXT NOT NULL DEFAULT 'center',
    "triggerType" TEXT NOT NULL DEFAULT 'page_load',
    "delaySeconds" INTEGER NOT NULL DEFAULT 5,
    "frequency" TEXT NOT NULL DEFAULT 'once_per_session',
    "backgroundColor" TEXT NOT NULL DEFAULT '#ffffff',
    "textColor" TEXT NOT NULL DEFAULT '#333333',
    "buttonColor" TEXT NOT NULL DEFAULT '#007cba',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateIndex
CREATE INDEX "PopupSubscriber_email_idx" ON "PopupSubscriber"("email");

-- CreateIndex
CREATE INDEX "PopupSubscriber_shopDomain_idx" ON "PopupSubscriber"("shopDomain");

-- CreateIndex
CREATE INDEX "PopupSubscriber_subscribedAt_idx" ON "PopupSubscriber"("subscribedAt");

-- CreateIndex
CREATE UNIQUE INDEX "PopupSettings_shopDomain_key" ON "PopupSettings"("shopDomain");
