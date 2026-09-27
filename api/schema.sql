-- api/schema.sql — Cloudflare D1
-- 적용: wrangler d1 execute gof-shop --local --file=schema.sql   (로컬)
--       wrangler d1 execute gof-shop --remote --file=schema.sql  (배포)

CREATE TABLE IF NOT EXISTS orders (
  order_id      TEXT PRIMARY KEY,          -- GOF-YYMMDD-XXXXXX (토스 orderId 규칙: 6~64자, 영문·숫자·-_=)
  status        TEXT NOT NULL,             -- READY | PAID | WAITING_DEPOSIT | CANCELED | FAILED
  amount        INTEGER NOT NULL,          -- 서버가 계산한 총액 (배송비 0)
  order_name    TEXT NOT NULL,
  items_json    TEXT NOT NULL,             -- [{id,name,color,size,qty,unitPrice}]
  buyer_json    TEXT NOT NULL,             -- {name,phone,email}
  shipping_json TEXT NOT NULL,             -- {zip,addr1,addr2,memo}
  payment_key   TEXT,
  method        TEXT,                      -- 카드 | 간편결제 | 계좌이체 | 가상계좌 ...
  approved_at   TEXT,
  payment_json  TEXT,                      -- 토스 승인 응답 원문 (디버그·환불용)
  created_at    TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at    TEXT
);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_created ON orders(created_at);

CREATE TABLE IF NOT EXISTS returns (
  return_id     TEXT PRIMARY KEY,          -- RT-YYMMDD-XXXX
  order_id      TEXT NOT NULL REFERENCES orders(order_id),
  type          TEXT NOT NULL,             -- RETURN | EXCHANGE
  reason        TEXT NOT NULL,             -- CHANGE_OF_MIND | DEFECT | WRONG_ITEM
  items_json    TEXT NOT NULL,             -- [{id,color,size,qty,exchangeSize?}]
  detail        TEXT,
  refund_account_json TEXT,                -- {bank,number,holder} — 가상계좌·계좌이체 결제 시만
  status        TEXT NOT NULL,             -- RECEIVED | APPROVED | REFUNDED | REJECTED | EXCHANGED
  created_at    TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at    TEXT
);
CREATE INDEX IF NOT EXISTS idx_returns_order ON returns(order_id);

-- 주문 조회 실패 카운터 (IP 기준 5회/10분)
CREATE TABLE IF NOT EXISTS lookup_attempts (
  ip            TEXT PRIMARY KEY,
  fails         INTEGER NOT NULL DEFAULT 0,
  blocked_until TEXT,
  updated_at    TEXT NOT NULL DEFAULT (datetime('now'))
);
