-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('DEVELOPER', 'REVIEWER', 'ADMIN', 'USER');

-- CreateEnum
CREATE TYPE "AppStatus" AS ENUM ('DRAFT', 'IN_REVIEW', 'CHANGES_REQUESTED', 'APPROVED', 'PUBLISHED', 'SUSPENDED', 'REMOVED');

-- CreateEnum
CREATE TYPE "ReviewStatus" AS ENUM ('PENDING', 'IN_PROGRESS', 'APPROVED', 'REJECTED', 'CHANGES_REQUESTED');

-- CreateEnum
CREATE TYPE "Category" AS ENUM ('GAMES', 'EDUCATION', 'PRODUCTIVITY', 'ENTERTAINMENT', 'SOCIAL', 'UTILITIES', 'MEDICAL', 'FITNESS', 'ADVENTURE', 'SIMULATION', 'SPORTS', 'MUSIC', 'ART_CREATIVITY', 'TRAVEL', 'NEWS', 'COMMUNICATION', 'TOOLS');

-- CreateEnum
CREATE TYPE "ContentRating" AS ENUM ('EVERYONE', 'TEEN', 'MATURE', 'ADULT_ONLY');

-- CreateEnum
CREATE TYPE "ComfortLevel" AS ENUM ('COMFORTABLE', 'MODERATE', 'INTENSE');

-- CreateEnum
CREATE TYPE "PlayArea" AS ENUM ('SEATED', 'STANDING', 'ROOMSCALE');

-- CreateEnum
CREATE TYPE "ReleaseChannel" AS ENUM ('ALPHA', 'BETA', 'RC', 'PRODUCTION');

-- CreateEnum
CREATE TYPE "TransactionType" AS ENUM ('PURCHASE', 'REFUND', 'SUBSCRIPTION', 'IN_APP_PURCHASE');

-- CreateEnum
CREATE TYPE "TransactionStatus" AS ENUM ('PENDING', 'PROCESSING', 'COMPLETED', 'FAILED', 'REFUNDED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "PurchaseStatus" AS ENUM ('PENDING', 'COMPLETED', 'FAILED', 'REFUNDED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "PayoutStatus" AS ENUM ('PENDING', 'PROCESSING', 'COMPLETED', 'FAILED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "PaymentProvider" AS ENUM ('FLUTTERWAVE', 'STRIPE', 'MPESA_DIRECT');

-- CreateEnum
CREATE TYPE "PayoutMethod" AS ENUM ('BANK_TRANSFER', 'MPESA', 'MOBILE_MONEY', 'STRIPE_CONNECT', 'PAYPAL');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "company" TEXT,
    "role" "UserRole" NOT NULL DEFAULT 'DEVELOPER',
    "emailVerified" BOOLEAN NOT NULL DEFAULT false,
    "verifyToken" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Developer" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "organizationName" TEXT NOT NULL,
    "websiteUrl" TEXT,
    "phone" TEXT,
    "address" TEXT,
    "taxId" TEXT,
    "isVerified" BOOLEAN NOT NULL DEFAULT false,
    "verificationDocs" JSONB,
    "payoutMethod" "PayoutMethod",
    "payoutCurrency" TEXT NOT NULL DEFAULT 'USD',
    "flutterwaveSubaccountId" TEXT,
    "flutterwaveBankCode" TEXT,
    "flutterwaveBankAccount" TEXT,
    "flutterwaveBankName" TEXT,
    "stripeConnectAccountId" TEXT,
    "stripeAccountStatus" TEXT,
    "stripePayoutsEnabled" BOOLEAN NOT NULL DEFAULT false,
    "stripeChargesEnabled" BOOLEAN NOT NULL DEFAULT false,
    "mpesaPhoneNumber" TEXT,
    "mobileMoneyNetwork" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Developer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Reviewer" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "department" TEXT NOT NULL,
    "level" INTEGER NOT NULL DEFAULT 1,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Reviewer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "App" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "developerId" TEXT NOT NULL,
    "version" TEXT NOT NULL,
    "summary" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "category" "Category" NOT NULL,
    "subcategory" TEXT,
    "tags" JSONB NOT NULL DEFAULT '[]',
    "contentRating" "ContentRating" NOT NULL DEFAULT 'EVERYONE',
    "price" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "salePrice" DOUBLE PRECISION,
    "saleEndDate" TIMESTAMP(3),
    "apkUrl" TEXT,
    "iconUrl" TEXT,
    "screenshots" JSONB NOT NULL,
    "heroImageUrl" TEXT,
    "trailerUrl" TEXT,
    "promoVideoUrl" TEXT,
    "sizeBytes" BIGINT NOT NULL,
    "sha256" TEXT,
    "minApiLevel" INTEGER NOT NULL DEFAULT 29,
    "targetApiLevel" INTEGER,
    "targetDevices" JSONB NOT NULL,
    "permissions" JSONB NOT NULL,
    "features" JSONB NOT NULL DEFAULT '[]',
    "whatsNew" TEXT,
    "languages" JSONB NOT NULL DEFAULT '[]',
    "privacyPolicyUrl" TEXT,
    "supportUrl" TEXT,
    "supportEmail" TEXT,
    "discordUrl" TEXT,
    "twitterUrl" TEXT,
    "youtubeUrl" TEXT,
    "requiresHandTracking" BOOLEAN NOT NULL DEFAULT false,
    "requiresPassthrough" BOOLEAN NOT NULL DEFAULT false,
    "requiresControllers" BOOLEAN NOT NULL DEFAULT true,
    "comfortLevel" "ComfortLevel" NOT NULL DEFAULT 'COMFORTABLE',
    "playArea" "PlayArea" NOT NULL DEFAULT 'STANDING',
    "playerModes" JSONB NOT NULL DEFAULT '["SINGLE_PLAYER"]',
    "estimatedPlayTime" TEXT,
    "ageRating" TEXT,
    "containsAds" BOOLEAN NOT NULL DEFAULT false,
    "hasInAppPurchases" BOOLEAN NOT NULL DEFAULT false,
    "inAppPurchaseInfo" TEXT,
    "developerNotes" TEXT,
    "credits" TEXT,
    "acknowledgments" TEXT,
    "status" "AppStatus" NOT NULL DEFAULT 'DRAFT',
    "publishedAt" TIMESTAMP(3),
    "lastUpdated" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "rating" DOUBLE PRECISION,
    "ratingCount" INTEGER NOT NULL DEFAULT 0,
    "downloads" INTEGER NOT NULL DEFAULT 0,
    "revenue" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "viewCount" INTEGER NOT NULL DEFAULT 0,
    "wishlistCount" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "App_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AppBuild" (
    "id" TEXT NOT NULL,
    "appId" TEXT NOT NULL,
    "version" TEXT NOT NULL,
    "buildNumber" INTEGER NOT NULL,
    "apkUrl" TEXT NOT NULL,
    "releaseNotes" TEXT,
    "channel" "ReleaseChannel" NOT NULL DEFAULT 'ALPHA',
    "isActive" BOOLEAN NOT NULL DEFAULT false,
    "sizeBytes" BIGINT,
    "sha256" TEXT,
    "uploadedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AppBuild_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AppReview" (
    "id" TEXT NOT NULL,
    "appId" TEXT NOT NULL,
    "reviewerId" TEXT NOT NULL,
    "status" "ReviewStatus" NOT NULL,
    "technicalPass" BOOLEAN,
    "contentPass" BOOLEAN,
    "notes" TEXT,
    "vrcResults" JSONB,
    "reviewedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AppReview_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserReview" (
    "id" TEXT NOT NULL,
    "appId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "rating" INTEGER NOT NULL,
    "title" TEXT,
    "content" TEXT,
    "helpful" INTEGER NOT NULL DEFAULT 0,
    "verified" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UserReview_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Analytics" (
    "id" TEXT NOT NULL,
    "appId" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "downloads" INTEGER NOT NULL DEFAULT 0,
    "views" INTEGER NOT NULL DEFAULT 0,
    "revenue" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "sessions" INTEGER NOT NULL DEFAULT 0,
    "crashRate" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "userRating" DOUBLE PRECISION,

    CONSTRAINT "Analytics_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Transaction" (
    "id" TEXT NOT NULL,
    "appId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "platformFee" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "developerAmount" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "provider" "PaymentProvider" NOT NULL,
    "providerTransactionId" TEXT,
    "providerSessionId" TEXT,
    "paymentMethod" TEXT,
    "type" "TransactionType" NOT NULL,
    "status" "TransactionStatus" NOT NULL,
    "metadata" JSONB,
    "errorMessage" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" TIMESTAMP(3),
    "refundedAt" TIMESTAMP(3),

    CONSTRAINT "Transaction_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Purchase" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "appId" TEXT NOT NULL,
    "status" "PurchaseStatus" NOT NULL,
    "totalAmount" DECIMAL(65,30) NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "transactionId" TEXT,
    "provider" "PaymentProvider",
    "completedAt" TIMESTAMP(3),
    "refundedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Purchase_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Payout" (
    "id" TEXT NOT NULL,
    "developerId" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "platformFee" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "netAmount" DOUBLE PRECISION NOT NULL,
    "provider" "PaymentProvider" NOT NULL,
    "providerTransactionId" TEXT,
    "payoutMethod" "PayoutMethod" NOT NULL,
    "accountDetails" JSONB,
    "status" "PayoutStatus" NOT NULL,
    "periodStart" TIMESTAMP(3) NOT NULL,
    "periodEnd" TIMESTAMP(3) NOT NULL,
    "errorMessage" TEXT,
    "processedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Payout_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DeveloperEarning" (
    "id" TEXT NOT NULL,
    "developerId" TEXT NOT NULL,
    "transactionId" TEXT NOT NULL,
    "appId" TEXT NOT NULL,
    "grossAmount" DOUBLE PRECISION NOT NULL,
    "platformFee" DOUBLE PRECISION NOT NULL,
    "netAmount" DOUBLE PRECISION NOT NULL,
    "currency" TEXT NOT NULL,
    "isPaidOut" BOOLEAN NOT NULL DEFAULT false,
    "payoutId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DeveloperEarning_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "User_verifyToken_key" ON "User"("verifyToken");

-- CreateIndex
CREATE UNIQUE INDEX "Developer_userId_key" ON "Developer"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Reviewer_userId_key" ON "Reviewer"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "App_slug_key" ON "App"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "UserReview_appId_userId_key" ON "UserReview"("appId", "userId");

-- CreateIndex
CREATE UNIQUE INDEX "Purchase_userId_appId_key" ON "Purchase"("userId", "appId");

-- AddForeignKey
ALTER TABLE "Developer" ADD CONSTRAINT "Developer_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Reviewer" ADD CONSTRAINT "Reviewer_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "App" ADD CONSTRAINT "App_developerId_fkey" FOREIGN KEY ("developerId") REFERENCES "Developer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AppBuild" ADD CONSTRAINT "AppBuild_appId_fkey" FOREIGN KEY ("appId") REFERENCES "App"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AppReview" ADD CONSTRAINT "AppReview_appId_fkey" FOREIGN KEY ("appId") REFERENCES "App"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AppReview" ADD CONSTRAINT "AppReview_reviewerId_fkey" FOREIGN KEY ("reviewerId") REFERENCES "Reviewer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserReview" ADD CONSTRAINT "UserReview_appId_fkey" FOREIGN KEY ("appId") REFERENCES "App"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Analytics" ADD CONSTRAINT "Analytics_appId_fkey" FOREIGN KEY ("appId") REFERENCES "App"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Transaction" ADD CONSTRAINT "Transaction_appId_fkey" FOREIGN KEY ("appId") REFERENCES "App"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Transaction" ADD CONSTRAINT "Transaction_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Purchase" ADD CONSTRAINT "Purchase_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Purchase" ADD CONSTRAINT "Purchase_appId_fkey" FOREIGN KEY ("appId") REFERENCES "App"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Payout" ADD CONSTRAINT "Payout_developerId_fkey" FOREIGN KEY ("developerId") REFERENCES "Developer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DeveloperEarning" ADD CONSTRAINT "DeveloperEarning_developerId_fkey" FOREIGN KEY ("developerId") REFERENCES "Developer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
