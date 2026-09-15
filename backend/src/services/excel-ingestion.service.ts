/**
 * ============================================================================
 * EXCEL DATA INGESTION & SYNCHRONIZATION ENGINE
 * Streaming Ingestion (50,000+ Rows), Dynamic Column Auto-Mapper,
 * Zod Schema Validation, Dry-Run Preview & Transactional Rollback
 * ============================================================================
 */

import { Readable } from 'stream';
import ExcelJS from 'exceljs';
import { z } from 'zod';
import { PrismaClient } from '@prisma/client';

// ----------------------------------------------------------------------------
// 1. STRICT LOT INGESTION ZOD SCHEMA
// ----------------------------------------------------------------------------

export const RawLotRowSchema = z.object({
  lotNumber: z.coerce.number().int().positive({ message: 'Lot number must be a positive integer.' }),
  title: z.string().min(2, { message: 'Item title must be at least 2 characters.' }).max(255),
  category: z.string().min(1, { message: 'Category is required.' }),
  description: z.string().optional().default(''),
  sellerName: z.string().optional().default('Consignor'),
  startingBid: z.coerce.number().positive({ message: 'Starting bid must be greater than zero.' }),
  reservePrice: z.coerce.number().nonnegative().optional().nullable(),
  minIncrement: z.coerce.number().positive().default(50),
  estimatedLow: z.coerce.number().positive().optional().nullable(),
  estimatedHigh: z.coerce.number().positive().optional().nullable(),
  imageUrls: z.array(z.string().url()).default([]),
  attributes: z.record(z.any()).default({}),
});

export type ValidatedLotRow = z.infer<typeof RawLotRowSchema>;

export interface ColumnMapping {
  [excelColumnHeader: string]: keyof ValidatedLotRow | 'ignored';
}

export interface IngestionDryRunReport {
  batchId: string;
  totalRowsParsed: number;
  validRowCount: number;
  errorRowCount: number;
  detectedColumns: string[];
  inferredMapping: ColumnMapping;
  sampleValidRows: ValidatedLotRow[];
  validationErrors: Array<{
    rowNumber: number;
    lotNumber?: number | string;
    field: string;
    value: any;
    errorMessage: string;
  }>;
  duplicateLotNumbers: number[];
  canCommit: boolean;
}

export class ExcelIngestionService {
  private prisma: PrismaClient;

  constructor(prisma: PrismaClient) {
    this.prisma = prisma;
  }

  /**
   * CANONICAL HEADER DICTIONARY
   * Fuzzy auto-mapping dictionary for varied client spreadsheets
   */
  private static readonly HEADER_ALIASES: Record<keyof ValidatedLotRow, string[]> = {
    lotNumber: ['lot', 'lot #', 'lot_number', 'lot number', 'item #', 'item id', 'lot no', 'lotno', 'id'],
    title: ['item name', 'title', 'item title', 'lot title', 'name', 'product name', 'description header'],
    category: ['category', 'department', 'genre', 'classification', 'section', 'collection'],
    description: ['description', 'item description', 'lot description', 'notes', 'provenance notes', 'details'],
    sellerName: ['seller', 'seller name', 'consignor', 'consignor name', 'vendor', 'owner'],
    startingBid: ['starting bid', 'start price', 'opening bid', 'starting price', 'start bid', 'opening price', 'min bid'],
    reservePrice: ['reserve', 'reserve price', 'min reserve', 'hidden reserve', 'reserve amount'],
    minIncrement: ['min increment', 'increment', 'bid increment', 'step', 'increment step'],
    estimatedLow: ['estimated low', 'est low', 'low estimate', 'estimate min', 'low est', 'estimate low'],
    estimatedHigh: ['estimated high', 'est high', 'high estimate', 'estimate max', 'high est', 'estimate high'],
    imageUrls: ['images', 'image urls', 'photo urls', 'photos', 'image links', 'image url', 'primary image'],
    attributes: ['attributes', 'specs', 'details json', 'metadata', 'properties'],
  };

  /**
   * Automatically infers column mappings using fuzzy string matching
   */
  public inferColumnMapping(detectedHeaders: string[]): ColumnMapping {
    const mapping: ColumnMapping = {};

    for (const rawHeader of detectedHeaders) {
      const normalized = rawHeader.toLowerCase().trim().replace(/[_-]/g, ' ');
      let matchedKey: keyof ValidatedLotRow | 'ignored' = 'ignored';

      for (const [targetField, aliases] of Object.entries(ExcelIngestionService.HEADER_ALIASES)) {
        if (aliases.includes(normalized) || aliases.some((alias) => normalized.includes(alias))) {
          matchedKey = targetField as keyof ValidatedLotRow;
          break;
        }
      }
      mapping[rawHeader] = matchedKey;
    }

    return mapping;
  }

  /**
   * Sanitizes dirty strings (e.g. "$1,250.00 USD" -> 1250.00)
   */
  private sanitizeNumericValue(val: any): number | null {
    if (val === null || val === undefined || val === '') return null;
    if (typeof val === 'number') return val;
    if (typeof val === 'string') {
      const cleaned = val.replace(/[^0-9.-]/g, '');
      const parsed = parseFloat(cleaned);
      return isNaN(parsed) ? null : parsed;
    }
    return null;
  }

  /**
   * STREAMING DRY-RUN & VALIDATION PREVIEW
   * Handles files up to 50,000+ rows with low memory footprint via ExcelJS WorkbookReader
   */
  public async previewAndValidateStream(
    fileStream: Readable,
    auctionId: string,
    operatorId: string,
    fileName: string,
    fileSizeBytes: number,
    customMapping?: ColumnMapping
  ): Promise<IngestionDryRunReport> {
    const workbookReader = new ExcelJS.stream.xlsx.WorkbookReader(fileStream, {
      entries: 'emit',
      sharedStrings: 'cache',
      hyperlinks: 'ignore',
      styles: 'ignore',
    });

    let detectedHeaders: string[] = [];
    let mapping: ColumnMapping = {};
    const validRows: ValidatedLotRow[] = [];
    const validationErrors: IngestionDryRunReport['validationErrors'] = [];
    const lotNumberSet = new Set<number>();
    const duplicateLotNumbers: number[] = [];

    let rowCount = 0;
    let isHeaderRow = true;

    for await (const worksheetReader of workbookReader) {
      for await (const row of worksheetReader) {
        rowCount++;
        const rowValues = (row.values as any[]) || [];

        // 1. Process Header Row
        if (isHeaderRow) {
          detectedHeaders = rowValues
            .filter((v) => v !== undefined && v !== null)
            .map((v) => String(v).trim());

          mapping = customMapping || this.inferColumnMapping(detectedHeaders);
          isHeaderRow = false;
          continue;
        }

        // 2. Map Row Cells to Schema Entity
        const rawEntity: Record<string, any> = {};
        for (let colIdx = 1; colIdx < rowValues.length; colIdx++) {
          const headerName = detectedHeaders[colIdx - 1];
          const targetField = mapping[headerName];
          if (targetField && targetField !== 'ignored') {
            const cellValue = rowValues[colIdx];
            rawEntity[targetField] = cellValue;
          }
        }

        // 3. Clean & Sanitize Common Cell Formats
        const sanitizedLotNumber = this.sanitizeNumericValue(rawEntity.lotNumber);
        const sanitizedStartingBid = this.sanitizeNumericValue(rawEntity.startingBid);
        const sanitizedReserve = this.sanitizeNumericValue(rawEntity.reservePrice);
        const sanitizedIncrement = this.sanitizeNumericValue(rawEntity.minIncrement) || 50;
        const sanitizedEstLow = this.sanitizeNumericValue(rawEntity.estimatedLow);
        const sanitizedEstHigh = this.sanitizeNumericValue(rawEntity.estimatedHigh);

        // Sanitize Image URLs (split commas/semicolons)
        let parsedImageUrls: string[] = [];
        if (typeof rawEntity.imageUrls === 'string') {
          parsedImageUrls = rawEntity.imageUrls
            .split(/[,;\n]/)
            .map((u) => u.trim())
            .filter((u) => u.startsWith('http'));
        } else if (Array.isArray(rawEntity.imageUrls)) {
          parsedImageUrls = rawEntity.imageUrls;
        }

        const candidate = {
          lotNumber: sanitizedLotNumber,
          title: rawEntity.title ? String(rawEntity.title).trim() : '',
          category: rawEntity.category ? String(rawEntity.category).trim() : 'General',
          description: rawEntity.description ? String(rawEntity.description).trim() : '',
          sellerName: rawEntity.sellerName ? String(rawEntity.sellerName).trim() : 'Consignor',
          startingBid: sanitizedStartingBid,
          reservePrice: sanitizedReserve,
          minIncrement: sanitizedIncrement,
          estimatedLow: sanitizedEstLow,
          estimatedHigh: sanitizedEstHigh,
          imageUrls: parsedImageUrls,
          attributes: rawEntity.attributes && typeof rawEntity.attributes === 'object' ? rawEntity.attributes : {},
        };

        // 4. Duplicate Lot Number Check
        if (candidate.lotNumber) {
          if (lotNumberSet.has(candidate.lotNumber)) {
            duplicateLotNumbers.push(candidate.lotNumber);
            validationErrors.push({
              rowNumber: rowCount,
              lotNumber: candidate.lotNumber,
              field: 'lotNumber',
              value: candidate.lotNumber,
              errorMessage: `Duplicate Lot #${candidate.lotNumber} detected within import file.`,
            });
          } else {
            lotNumberSet.add(candidate.lotNumber);
          }
        }

        // 5. Strict Zod Validation
        const parsed = RawLotRowSchema.safeParse(candidate);
        if (!parsed.success) {
          for (const issue of parsed.error.issues) {
            validationErrors.push({
              rowNumber: rowCount,
              lotNumber: candidate.lotNumber ?? 'N/A',
              field: issue.path.join('.'),
              value: (candidate as any)[issue.path[0]],
              errorMessage: issue.message,
            });
          }
        } else {
          validRows.push(parsed.data);
        }
      }
    }

    // 6. Persist Ingestion Batch in PREVIEW_READY status
    const batch = await this.prisma.excelIngestionBatch.create({
      data: {
        auctionId,
        uploadedById: operatorId,
        fileName,
        fileSizeBytes: BigInt(fileSizeBytes),
        totalRows: rowCount - 1,
        validRows: validRows.length,
        errorRows: validationErrors.length,
        status: 'PREVIEW_READY',
        columnMapping: mapping,
        validationErrors: validationErrors.slice(0, 500) as any, // Store up to first 500 errors
      },
    });

    return {
      batchId: batch.id,
      totalRowsParsed: rowCount - 1,
      validRowCount: validRows.length,
      errorRowCount: validationErrors.length,
      detectedColumns: detectedHeaders,
      inferredMapping: mapping,
      sampleValidRows: validRows.slice(0, 10),
      validationErrors: validationErrors.slice(0, 100),
      duplicateLotNumbers: Array.from(new Set(duplicateLotNumbers)),
      canCommit: validationErrors.length === 0,
    };
  }

  /**
   * ATOMIC BATCH COMMIT
   * Executes chunked insertion (500 rows per transaction chunk) and records rollback snapshot
   */
  public async commitBatch(
    batchId: string,
    validRows: ValidatedLotRow[],
    defaultClosingTime: Date
  ): Promise<{ committedCount: number; batchId: string }> {
    const batch = await this.prisma.excelIngestionBatch.findUniqueOrThrow({
      where: { id: batchId },
    });

    const createdLotIds: string[] = [];
    const CHUNK_SIZE = 500;

    for (let i = 0; i < validRows.length; i += CHUNK_SIZE) {
      const chunk = validRows.slice(i, i + CHUNK_SIZE);

      await this.prisma.$transaction(async (tx) => {
        for (const row of chunk) {
          const lot = await tx.lot.create({
            data: {
              auctionId: batch.auctionId,
              lotNumber: row.lotNumber,
              title: row.title,
              category: row.category,
              description: row.description,
              sellerName: row.sellerName,
              startingBid: row.startingBid,
              reservePrice: row.reservePrice,
              minIncrement: row.minIncrement,
              estimatedLow: row.estimatedLow,
              estimatedHigh: row.estimatedHigh,
              status: 'UPCOMING',
              closingTime: defaultClosingTime,
              imageUrls: row.imageUrls,
              attributes: row.attributes,
            },
            select: { id: true },
          });
          createdLotIds.push(lot.id);
        }
      });
    }

    // Update batch status and record rollback snapshot
    await this.prisma.excelIngestionBatch.update({
      where: { id: batchId },
      data: {
        status: 'COMMITTED',
        rollbackSnapshot: { createdLotIds },
      },
    });

    // Update total lots count on auction
    await this.prisma.auction.update({
      where: { id: batch.auctionId },
      data: { totalLotsCount: { increment: createdLotIds.length } },
    });

    return { committedCount: createdLotIds.length, batchId };
  }

  /**
   * TRANSACTIONAL 1-CLICK ROLLBACK
   * Deletes all lots created by this batch and restores previous state
   */
  public async rollbackBatch(batchId: string, operatorId: string): Promise<{ rolledBackCount: number }> {
    const batch = await this.prisma.excelIngestionBatch.findUniqueOrThrow({
      where: { id: batchId },
    });

    if (batch.status !== 'COMMITTED') {
      throw new Error(`Cannot rollback batch with status ${batch.status}.`);
    }

    const snapshot = batch.rollbackSnapshot as { createdLotIds?: string[] } | null;
    const lotIds = snapshot?.createdLotIds || [];

    if (lotIds.length === 0) {
      return { rolledBackCount: 0 };
    }

    // Delete lots atomically
    await this.prisma.$transaction(async (tx) => {
      await tx.lot.deleteMany({
        where: { id: { in: lotIds } },
      });

      await tx.excelIngestionBatch.update({
        where: { id: batchId },
        data: { status: 'ROLLED_BACK' },
      });

      await tx.auction.update({
        where: { id: batch.auctionId },
        data: { totalLotsCount: { decrement: lotIds.length } },
      });

      await tx.itemAuditLog.create({
        data: {
          auctionId: batch.auctionId,
          actorId: operatorId,
          action: 'BATCH_ROLLBACK',
          details: `Rolled back Excel Ingestion Batch #${batchId} (${lotIds.length} lots removed).`,
        },
      });
    });

    return { rolledBackCount: lotIds.length };
  }
}
