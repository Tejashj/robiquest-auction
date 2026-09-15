/**
 * ============================================================================
 * FASTIFY & SOCKET.IO SERVER ENTRYPOINT
 * High-Performance API Gateway, WebSocket Cluster & Streaming File Uploads
 * ============================================================================
 */

import Fastify from 'fastify';
import multipart from '@fastify/multipart';
import cors from '@fastify/cors';
import { createServer } from 'http';
import { PrismaClient } from '@prisma/client';
import { AuctionSocketGateway } from './realtime/auction-socket.gateway';
import { ExcelIngestionService } from './services/excel-ingestion.service';

const prisma = new PrismaClient();
const fastify = Fastify({ logger: true });

async function bootstrap() {
  await fastify.register(cors, { origin: true });
  await fastify.register(multipart, {
    limits: {
      fileSize: 100 * 1024 * 1024, // 100MB max Excel upload
    },
  });

  const httpServer = createServer(fastify.server);
  const socketGateway = new AuctionSocketGateway(httpServer, prisma);
  const excelService = new ExcelIngestionService(prisma);

  // Health check
  fastify.get('/health', async () => ({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  }));

  // Excel Streaming Ingestion Endpoint (Dry-Run & Preview)
  fastify.post('/api/v1/auctions/:auctionId/ingest/preview', async (request, reply) => {
    const { auctionId } = request.params as { auctionId: string };
    const data = await request.file();

    if (!data) {
      return reply.status(400).send({ error: 'No Excel file uploaded.' });
    }

    const operatorId = (request.headers['x-user-id'] as string) || 'system-admin';

    try {
      const report = await excelService.previewAndValidateStream(
        data.file,
        auctionId,
        operatorId,
        data.filename,
        data.file.bytesRead
      );
      return reply.send(report);
    } catch (err: any) {
      request.log.error(err);
      return reply.status(500).send({ error: err.message });
    }
  });

  // Batch Commit Endpoint
  fastify.post('/api/v1/ingest/batches/:batchId/commit', async (request, reply) => {
    const { batchId } = request.params as { batchId: string };
    const body = request.body as { validRows: any[]; closingTime: string };

    try {
      const result = await excelService.commitBatch(
        batchId,
        body.validRows,
        new Date(body.closingTime)
      );
      return reply.send(result);
    } catch (err: any) {
      return reply.status(500).send({ error: err.message });
    }
  });

  // Batch Rollback Endpoint
  fastify.post('/api/v1/ingest/batches/:batchId/rollback', async (request, reply) => {
    const { batchId } = request.params as { batchId: string };
    const operatorId = (request.headers['x-user-id'] as string) || 'system-admin';

    try {
      const result = await excelService.rollbackBatch(batchId, operatorId);
      return reply.send(result);
    } catch (err: any) {
      return reply.status(500).send({ error: err.message });
    }
  });

  const PORT = parseInt(process.env.PORT || '4000', 10);
  httpServer.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Real-Time Auction Backend running at http://localhost:${PORT}`);
  });
}

bootstrap().catch((err) => {
  console.error('Fatal bootstrap error:', err);
  process.exit(1);
});
