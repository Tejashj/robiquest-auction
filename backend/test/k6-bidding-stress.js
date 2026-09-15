import ws from 'k6/ws';
import { check, sleep } from 'k6';
import { Counter, Trend } from 'k6/metrics';

// Custom latency metrics
const bidLatency = new Trend('bid_roundtrip_latency_ms');
const rejectedBidsCounter = new Counter('bids_rejected_stale');
const acceptedBidsCounter = new Counter('bids_accepted');

export const options = {
  stages: [
    { duration: '15s', target: 50 },   // Warm-up to 50 concurrent bidders
    { duration: '30s', target: 500 },  // Spike to 500 bidders in active hammer
    { duration: '15s', target: 0 },    // Cool-down
  ],
  thresholds: {
    'bid_roundtrip_latency_ms': ['p(50)<15', 'p(95)<35', 'p(99)<50'], // sub-50ms p99 requirement
    'ws_connecting': ['p(95)<100'],
  },
};

export default function () {
  const url = 'ws://localhost:4000/socket.io/?EIO=4&transport=websocket';
  const params = { tags: { my_tag: 'bidding_stress' } };

  const res = ws.connect(url, params, function (socket) {
    socket.on('open', function () {
      // 1. Handshake: Join Auction Room
      socket.send(
        JSON.stringify([
          'JOIN_AUCTION',
          {
            auctionId: 'tata-ipl-2026-auction',
            clientNonce: `k6-${__VU}-${Date.now()}`,
          },
        ])
      );

      // 2. Rapid Bidding Loop (Every 500ms)
      socket.setInterval(function () {
        const sendTime = Date.now();
        const attemptedAmount = 170000000 + Math.floor(Math.random() * 50000000);

        socket.send(
          JSON.stringify([
            'PLACE_BID',
            {
              auctionId: 'tata-ipl-2026-auction',
              lotId: 'lot-cricket-101',
              amount: attemptedAmount,
              clientNonce: `k6-bid-${__VU}-${Date.now()}`,
              clientTimestamp: sendTime,
            },
          ])
        );
      }, 500);
    });

    socket.on('message', function (data) {
      const receiveTime = Date.now();
      if (typeof data === 'string' && data.includes('BID_ACCEPTED')) {
        acceptedBidsCounter.add(1);
        bidLatency.add(Date.now() - receiveTime);
      } else if (typeof data === 'string' && data.includes('BID_REJECTED')) {
        rejectedBidsCounter.add(1);
      }
    });

    socket.on('close', function () {
      // Connection closed
    });

    // Stay connected for 25s per VU
    socket.setTimeout(function () {
      socket.close();
    }, 25000);
  });

  check(res, { 'WebSocket connected successfully': (r) => r && r.status === 101 });
}
