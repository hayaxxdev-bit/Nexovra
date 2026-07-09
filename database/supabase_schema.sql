-- ============================================================
-- FINANCEOS — SUPABASE SCHEMA
-- Versi: 1.0.0
-- Deskripsi: Schema lengkap dengan RLS, Triggers, Indexes, Views
-- ============================================================

-- ============================================================
-- EXTENSIONS
-- ============================================================
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm"; -- untuk full-text search

-- ============================================================
-- 1. PROFILES
-- ============================================================
CREATE TABLE profiles (
  id          UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name   VARCHAR(100),
  avatar_url  TEXT,
  phone       VARCHAR(20),
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  updated_at  TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- 2. SETTINGS
-- ============================================================
CREATE TABLE settings (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  currency        VARCHAR(10)  DEFAULT 'IDR',
  currency_symbol VARCHAR(5)   DEFAULT 'Rp',
  date_format     VARCHAR(20)  DEFAULT 'DD/MM/YYYY',
  theme           VARCHAR(10)  DEFAULT 'light',
  language        VARCHAR(10)  DEFAULT 'id',
  created_at      TIMESTAMPTZ  DEFAULT NOW(),
  updated_at      TIMESTAMPTZ  DEFAULT NOW(),
  UNIQUE(user_id)
);

-- ============================================================
-- 3. ACCOUNT TYPES (master data, tidak per-user)
-- ============================================================
CREATE TABLE account_types (
  id          SMALLINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  name        VARCHAR(50) NOT NULL,
  icon        VARCHAR(50),
  is_default  BOOLEAN DEFAULT FALSE
);

INSERT INTO account_types (name, icon, is_default) VALUES
  ('Cash',           'banknotes',     TRUE),
  ('Bank',           'building-bank', TRUE),
  ('E-Wallet',       'device-mobile', TRUE),
  ('Tabungan',       'piggy-bank',    TRUE),
  ('Investasi',      'trending-up',   FALSE),
  ('Kas Perusahaan', 'briefcase',     FALSE),
  ('Lainnya',        'wallet',        FALSE);

-- ============================================================
-- 4. ACCOUNTS (multi-wallet)
-- ============================================================
CREATE TABLE accounts (
  id               UUID     PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id          UUID     NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  account_type_id  SMALLINT REFERENCES account_types(id),
  name             VARCHAR(100) NOT NULL,
  description      TEXT,
  initial_balance  NUMERIC(15,2) DEFAULT 0,
  current_balance  NUMERIC(15,2) DEFAULT 0,
  currency         VARCHAR(10)  DEFAULT 'IDR',
  color            VARCHAR(7)   DEFAULT '#3B82F6',
  icon             VARCHAR(50)  DEFAULT 'wallet',
  is_active        BOOLEAN DEFAULT TRUE,
  is_default       BOOLEAN DEFAULT FALSE,
  sort_order       INTEGER DEFAULT 0,
  notes            TEXT,
  created_at       TIMESTAMPTZ DEFAULT NOW(),
  updated_at       TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- 5. CATEGORIES
-- ============================================================
CREATE TABLE categories (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name        VARCHAR(100) NOT NULL,
  type        VARCHAR(20)  NOT NULL CHECK (type IN (
                'income','expense','transfer','debt',
                'receivable','investment'
              )),
  color       VARCHAR(7)  DEFAULT '#6B7280',
  icon        VARCHAR(50) DEFAULT 'tag',
  parent_id   UUID REFERENCES categories(id) ON DELETE SET NULL,
  is_active   BOOLEAN DEFAULT TRUE,
  sort_order  INTEGER DEFAULT 0,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- 6. TRANSACTIONS
-- ============================================================
CREATE TABLE transactions (
  id                   UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id              UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  transaction_number   VARCHAR(30) UNIQUE NOT NULL,
  type                 VARCHAR(20) NOT NULL CHECK (type IN (
                         'income','expense','transfer','debt','receivable',
                         'investment','purchase','sale','salary','operational'
                       )),
  status               VARCHAR(20) DEFAULT 'completed' CHECK (status IN (
                         'completed','pending','cancelled','failed'
                       )),
  name                 VARCHAR(200) NOT NULL,
  amount               NUMERIC(15,2) NOT NULL CHECK (amount > 0),
  account_id           UUID REFERENCES accounts(id) ON DELETE SET NULL,
  to_account_id        UUID REFERENCES accounts(id) ON DELETE SET NULL,
  category_id          UUID REFERENCES categories(id) ON DELETE SET NULL,
  payment_method       VARCHAR(50),
  transaction_date     DATE NOT NULL DEFAULT CURRENT_DATE,
  notes                TEXT,
  reference_number     VARCHAR(100),
  created_at           TIMESTAMPTZ DEFAULT NOW(),
  updated_at           TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- 7. TRANSACTION DETAILS (split transaction)
-- ============================================================
CREATE TABLE transaction_details (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  transaction_id  UUID NOT NULL REFERENCES transactions(id) ON DELETE CASCADE,
  category_id     UUID REFERENCES categories(id) ON DELETE SET NULL,
  description     VARCHAR(200),
  amount          NUMERIC(15,2) NOT NULL,
  notes           TEXT
);

-- ============================================================
-- 8. ATTACHMENTS
-- ============================================================
CREATE TABLE attachments (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  entity_type  VARCHAR(50) NOT NULL CHECK (entity_type IN (
                 'transaction','journal','todo'
               )),
  entity_id    UUID NOT NULL,
  file_name    VARCHAR(255) NOT NULL,
  file_url     TEXT NOT NULL,
  file_type    VARCHAR(100),
  file_size    INTEGER,
  created_at   TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- 9. JOURNALS (Daily Journal / Notepad)
-- ============================================================
CREATE TABLE journals (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  journal_date  DATE NOT NULL DEFAULT CURRENT_DATE,
  title         VARCHAR(200),
  content       TEXT,
  mood          VARCHAR(20) CHECK (mood IN (
                  'happy','neutral','sad','stressed','excited','productive'
                )),
  tags          TEXT[],
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  updated_at    TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, journal_date)
);

-- ============================================================
-- 10. DAILY NOTES (Planner per hari)
-- ============================================================
CREATE TABLE daily_notes (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  note_date   DATE NOT NULL DEFAULT CURRENT_DATE,
  target      TEXT,
  agenda      TEXT,
  notes       TEXT,
  priority    VARCHAR(10) DEFAULT 'medium' CHECK (priority IN ('low','medium','high')),
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  updated_at  TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, note_date)
);

-- ============================================================
-- 11. TODOS
-- ============================================================
CREATE TABLE todos (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title         VARCHAR(200) NOT NULL,
  description   TEXT,
  status        VARCHAR(20) DEFAULT 'pending' CHECK (status IN (
                  'pending','in_progress','completed','cancelled'
                )),
  priority      VARCHAR(10) DEFAULT 'medium' CHECK (priority IN (
                  'low','medium','high','urgent'
                )),
  due_date      DATE,
  due_time      TIME,
  todo_date     DATE,
  progress      INTEGER DEFAULT 0 CHECK (progress BETWEEN 0 AND 100),
  tags          TEXT[],
  is_pinned     BOOLEAN DEFAULT FALSE,
  completed_at  TIMESTAMPTZ,
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  updated_at    TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- 12. REMINDERS
-- ============================================================
CREATE TABLE reminders (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  entity_type   VARCHAR(50) CHECK (entity_type IN ('todo','transaction','planner','custom')),
  entity_id     UUID,
  title         VARCHAR(200) NOT NULL,
  remind_at     TIMESTAMPTZ NOT NULL,
  is_sent       BOOLEAN DEFAULT FALSE,
  is_dismissed  BOOLEAN DEFAULT FALSE,
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- 13. ACTIVITY LOGS
-- ============================================================
CREATE TABLE activity_logs (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  action       VARCHAR(50) NOT NULL CHECK (action IN (
                 'create','update','delete','transfer','login','logout',
                 'export','import','restore'
               )),
  entity_type  VARCHAR(50),
  entity_id    UUID,
  description  TEXT,
  metadata     JSONB,
  created_at   TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- INDEXES — performa query
-- ============================================================
CREATE INDEX idx_accounts_user_id          ON accounts(user_id);
CREATE INDEX idx_accounts_is_active        ON accounts(user_id, is_active);
CREATE INDEX idx_transactions_user_id      ON transactions(user_id);
CREATE INDEX idx_transactions_date         ON transactions(user_id, transaction_date DESC);
CREATE INDEX idx_transactions_account      ON transactions(account_id);
CREATE INDEX idx_transactions_to_account   ON transactions(to_account_id);
CREATE INDEX idx_transactions_category     ON transactions(category_id);
CREATE INDEX idx_transactions_type         ON transactions(user_id, type);
CREATE INDEX idx_transactions_status       ON transactions(user_id, status);
CREATE INDEX idx_categories_user_id        ON categories(user_id);
CREATE INDEX idx_categories_type           ON categories(user_id, type);
CREATE INDEX idx_journals_date             ON journals(user_id, journal_date DESC);
CREATE INDEX idx_daily_notes_date          ON daily_notes(user_id, note_date DESC);
CREATE INDEX idx_todos_user_id             ON todos(user_id);
CREATE INDEX idx_todos_date                ON todos(user_id, todo_date);
CREATE INDEX idx_todos_due_date            ON todos(user_id, due_date);
CREATE INDEX idx_todos_status              ON todos(user_id, status);
CREATE INDEX idx_attachments_entity        ON attachments(entity_type, entity_id);
CREATE INDEX idx_activity_logs_user_id     ON activity_logs(user_id, created_at DESC);
CREATE INDEX idx_reminders_user_remind     ON reminders(user_id, remind_at);

-- Full-text search indexes
CREATE INDEX idx_transactions_name_search  ON transactions USING gin(name gin_trgm_ops);
CREATE INDEX idx_todos_title_search        ON todos USING gin(title gin_trgm_ops);

-- ============================================================
-- TRIGGERS — updated_at otomatis
-- ============================================================
CREATE OR REPLACE FUNCTION trigger_set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_updated_at_profiles
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();

CREATE TRIGGER set_updated_at_settings
  BEFORE UPDATE ON settings
  FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();

CREATE TRIGGER set_updated_at_accounts
  BEFORE UPDATE ON accounts
  FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();

CREATE TRIGGER set_updated_at_transactions
  BEFORE UPDATE ON transactions
  FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();

CREATE TRIGGER set_updated_at_journals
  BEFORE UPDATE ON journals
  FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();

CREATE TRIGGER set_updated_at_daily_notes
  BEFORE UPDATE ON daily_notes
  FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();

CREATE TRIGGER set_updated_at_todos
  BEFORE UPDATE ON todos
  FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();

-- ============================================================
-- TRIGGER — Auto-create profile & settings setelah register
-- ============================================================
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, full_name)
  VALUES (NEW.id, NEW.raw_user_meta_data->>'full_name');

  INSERT INTO settings (user_id)
  VALUES (NEW.id);

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- ============================================================
-- TRIGGER — Auto-generate transaction_number
-- ============================================================
CREATE OR REPLACE FUNCTION generate_transaction_number()
RETURNS TRIGGER AS $$
DECLARE
  v_date    TEXT;
  v_count   INTEGER;
  v_number  TEXT;
BEGIN
  v_date  := TO_CHAR(NOW(), 'YYYYMMDD');
  SELECT COUNT(*) + 1 INTO v_count
    FROM transactions
   WHERE user_id = NEW.user_id
     AND DATE(created_at) = CURRENT_DATE;
  v_number := 'TRX-' || v_date || '-' || LPAD(v_count::TEXT, 4, '0');
  NEW.transaction_number := v_number;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER before_insert_transaction
  BEFORE INSERT ON transactions
  FOR EACH ROW
  WHEN (NEW.transaction_number IS NULL OR NEW.transaction_number = '')
  EXECUTE FUNCTION generate_transaction_number();

-- ============================================================
-- TRIGGER — Update account balance otomatis setelah transaksi
-- ============================================================
CREATE OR REPLACE FUNCTION update_account_balance()
RETURNS TRIGGER AS $$
BEGIN
  -- INSERT baru
  IF TG_OP = 'INSERT' AND NEW.status = 'completed' THEN
    IF NEW.type IN ('income','salary','receivable','sale') THEN
      UPDATE accounts SET current_balance = current_balance + NEW.amount,
        updated_at = NOW() WHERE id = NEW.account_id;
    ELSIF NEW.type IN ('expense','purchase','operational','debt','investment') THEN
      UPDATE accounts SET current_balance = current_balance - NEW.amount,
        updated_at = NOW() WHERE id = NEW.account_id;
    ELSIF NEW.type = 'transfer' THEN
      UPDATE accounts SET current_balance = current_balance - NEW.amount,
        updated_at = NOW() WHERE id = NEW.account_id;
      UPDATE accounts SET current_balance = current_balance + NEW.amount,
        updated_at = NOW() WHERE id = NEW.to_account_id;
    END IF;

  -- DELETE — balikkan saldo
  ELSIF TG_OP = 'DELETE' AND OLD.status = 'completed' THEN
    IF OLD.type IN ('income','salary','receivable','sale') THEN
      UPDATE accounts SET current_balance = current_balance - OLD.amount,
        updated_at = NOW() WHERE id = OLD.account_id;
    ELSIF OLD.type IN ('expense','purchase','operational','debt','investment') THEN
      UPDATE accounts SET current_balance = current_balance + OLD.amount,
        updated_at = NOW() WHERE id = OLD.account_id;
    ELSIF OLD.type = 'transfer' THEN
      UPDATE accounts SET current_balance = current_balance + OLD.amount,
        updated_at = NOW() WHERE id = OLD.account_id;
      UPDATE accounts SET current_balance = current_balance - OLD.amount,
        updated_at = NOW() WHERE id = OLD.to_account_id;
    END IF;

  -- UPDATE — balikkan lama, terapkan baru
  ELSIF TG_OP = 'UPDATE' THEN
    -- Balikkan transaksi lama jika sudah completed
    IF OLD.status = 'completed' THEN
      IF OLD.type IN ('income','salary','receivable','sale') THEN
        UPDATE accounts SET current_balance = current_balance - OLD.amount,
          updated_at = NOW() WHERE id = OLD.account_id;
      ELSIF OLD.type IN ('expense','purchase','operational','debt','investment') THEN
        UPDATE accounts SET current_balance = current_balance + OLD.amount,
          updated_at = NOW() WHERE id = OLD.account_id;
      ELSIF OLD.type = 'transfer' THEN
        UPDATE accounts SET current_balance = current_balance + OLD.amount,
          updated_at = NOW() WHERE id = OLD.account_id;
        UPDATE accounts SET current_balance = current_balance - OLD.amount,
          updated_at = NOW() WHERE id = OLD.to_account_id;
      END IF;
    END IF;
    -- Terapkan transaksi baru jika completed
    IF NEW.status = 'completed' THEN
      IF NEW.type IN ('income','salary','receivable','sale') THEN
        UPDATE accounts SET current_balance = current_balance + NEW.amount,
          updated_at = NOW() WHERE id = NEW.account_id;
      ELSIF NEW.type IN ('expense','purchase','operational','debt','investment') THEN
        UPDATE accounts SET current_balance = current_balance - NEW.amount,
          updated_at = NOW() WHERE id = NEW.account_id;
      ELSIF NEW.type = 'transfer' THEN
        UPDATE accounts SET current_balance = current_balance - NEW.amount,
          updated_at = NOW() WHERE id = NEW.account_id;
        UPDATE accounts SET current_balance = current_balance + NEW.amount,
          updated_at = NOW() WHERE id = NEW.to_account_id;
      END IF;
    END IF;
  END IF;

  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_update_account_balance
  AFTER INSERT OR UPDATE OR DELETE ON transactions
  FOR EACH ROW EXECUTE FUNCTION update_account_balance();

-- ============================================================
-- TRIGGER — Auto-set completed_at pada todo
-- ============================================================
CREATE OR REPLACE FUNCTION set_todo_completed_at()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'completed' AND OLD.status != 'completed' THEN
    NEW.completed_at = NOW();
  ELSIF NEW.status != 'completed' THEN
    NEW.completed_at = NULL;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_todo_completed_at
  BEFORE UPDATE ON todos
  FOR EACH ROW EXECUTE FUNCTION set_todo_completed_at();

-- ============================================================
-- VIEWS
-- ============================================================

-- View: ringkasan saldo per user
CREATE OR REPLACE VIEW v_account_summary AS
SELECT
  a.user_id,
  at.name AS account_type,
  COUNT(a.id) AS account_count,
  SUM(a.current_balance) AS total_balance
FROM accounts a
JOIN account_types at ON a.account_type_id = at.id
WHERE a.is_active = TRUE
GROUP BY a.user_id, at.name;

-- View: total aset per user
CREATE OR REPLACE VIEW v_total_assets AS
SELECT
  user_id,
  SUM(current_balance) AS total_assets
FROM accounts
WHERE is_active = TRUE
GROUP BY user_id;

-- View: transaksi dengan nama akun & kategori
CREATE OR REPLACE VIEW v_transactions_detail AS
SELECT
  t.*,
  a.name  AS account_name,
  a.color AS account_color,
  a.icon  AS account_icon,
  ta.name AS to_account_name,
  c.name  AS category_name,
  c.color AS category_color,
  c.icon  AS category_icon
FROM transactions t
LEFT JOIN accounts    a  ON t.account_id    = a.id
LEFT JOIN accounts    ta ON t.to_account_id = ta.id
LEFT JOIN categories  c  ON t.category_id   = c.id;

-- View: statistik bulanan per user
CREATE OR REPLACE VIEW v_monthly_stats AS
SELECT
  user_id,
  DATE_TRUNC('month', transaction_date) AS month,
  SUM(CASE WHEN type IN ('income','salary','sale','receivable') THEN amount ELSE 0 END) AS total_income,
  SUM(CASE WHEN type IN ('expense','purchase','operational','debt') THEN amount ELSE 0 END) AS total_expense,
  SUM(CASE WHEN type IN ('income','salary','sale','receivable') THEN amount ELSE 0 END) -
  SUM(CASE WHEN type IN ('expense','purchase','operational','debt') THEN amount ELSE 0 END) AS net_profit
FROM transactions
WHERE status = 'completed'
GROUP BY user_id, DATE_TRUNC('month', transaction_date);

-- View: todos hari ini
CREATE OR REPLACE VIEW v_todos_today AS
SELECT * FROM todos
WHERE todo_date = CURRENT_DATE
   OR (due_date = CURRENT_DATE AND status != 'completed');

-- ============================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================
ALTER TABLE profiles        ENABLE ROW LEVEL SECURITY;
ALTER TABLE settings        ENABLE ROW LEVEL SECURITY;
ALTER TABLE accounts        ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories      ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions     ENABLE ROW LEVEL SECURITY;
ALTER TABLE transaction_details ENABLE ROW LEVEL SECURITY;
ALTER TABLE attachments      ENABLE ROW LEVEL SECURITY;
ALTER TABLE journals         ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_notes      ENABLE ROW LEVEL SECURITY;
ALTER TABLE todos            ENABLE ROW LEVEL SECURITY;
ALTER TABLE reminders        ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_logs    ENABLE ROW LEVEL SECURITY;

-- profiles
CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE USING (auth.uid() = id);

-- settings
CREATE POLICY "Users can manage own settings"
  ON settings FOR ALL USING (auth.uid() = user_id);

-- accounts
CREATE POLICY "Users can manage own accounts"
  ON accounts FOR ALL USING (auth.uid() = user_id);

-- categories
CREATE POLICY "Users can manage own categories"
  ON categories FOR ALL USING (auth.uid() = user_id);

-- transactions
CREATE POLICY "Users can manage own transactions"
  ON transactions FOR ALL USING (auth.uid() = user_id);

-- transaction_details
CREATE POLICY "Users can manage own transaction details"
  ON transaction_details FOR ALL
  USING (EXISTS (
    SELECT 1 FROM transactions t
    WHERE t.id = transaction_details.transaction_id
      AND t.user_id = auth.uid()
  ));

-- attachments
CREATE POLICY "Users can manage own attachments"
  ON attachments FOR ALL USING (auth.uid() = user_id);

-- journals
CREATE POLICY "Users can manage own journals"
  ON journals FOR ALL USING (auth.uid() = user_id);

-- daily_notes
CREATE POLICY "Users can manage own daily notes"
  ON daily_notes FOR ALL USING (auth.uid() = user_id);

-- todos
CREATE POLICY "Users can manage own todos"
  ON todos FOR ALL USING (auth.uid() = user_id);

-- reminders
CREATE POLICY "Users can manage own reminders"
  ON reminders FOR ALL USING (auth.uid() = user_id);

-- activity_logs
CREATE POLICY "Users can view own activity logs"
  ON activity_logs FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "System can insert activity logs"
  ON activity_logs FOR INSERT WITH CHECK (auth.uid() = user_id);

-- account_types (public read, no RLS needed)
GRANT SELECT ON account_types TO authenticated, anon;

-- ============================================================
-- DEFAULT CATEGORIES (dibuat saat user register via Edge Function)
-- Simpan sebagai template yang bisa dipanggil
-- ============================================================
CREATE OR REPLACE FUNCTION create_default_categories(p_user_id UUID)
RETURNS VOID AS $$
BEGIN
  INSERT INTO categories (user_id, name, type, color, icon, sort_order) VALUES
    -- Income
    (p_user_id, 'Gaji',          'income',  '#10B981', 'briefcase',    1),
    (p_user_id, 'Bonus',         'income',  '#059669', 'gift',         2),
    (p_user_id, 'Freelance',     'income',  '#34D399', 'code',         3),
    (p_user_id, 'Investasi',     'income',  '#6EE7B7', 'trending-up',  4),
    (p_user_id, 'Penjualan',     'income',  '#A7F3D0', 'shopping-bag', 5),
    (p_user_id, 'Lainnya',       'income',  '#D1FAE5', 'plus-circle',  6),
    -- Expense
    (p_user_id, 'Makanan',       'expense', '#EF4444', 'tools-kitchen',1),
    (p_user_id, 'Transportasi',  'expense', '#F97316', 'car',          2),
    (p_user_id, 'Listrik',       'expense', '#EAB308', 'bolt',         3),
    (p_user_id, 'Internet',      'expense', '#3B82F6', 'wifi',         4),
    (p_user_id, 'Belanja',       'expense', '#8B5CF6', 'shopping-cart',5),
    (p_user_id, 'Kesehatan',     'expense', '#EC4899', 'heart',        6),
    (p_user_id, 'Pendidikan',    'expense', '#14B8A6', 'book',         7),
    (p_user_id, 'Hiburan',       'expense', '#F59E0B', 'device-tv',    8),
    (p_user_id, 'Operasional',   'expense', '#6B7280', 'settings',     9),
    (p_user_id, 'Marketing',     'expense', '#DC2626', 'speakerphone', 10),
    (p_user_id, 'Lainnya',       'expense', '#9CA3AF', 'dots-circle',  11),
    -- Transfer
    (p_user_id, 'Transfer',      'transfer','#6366F1', 'arrows-right-left', 1),
    -- Debt & Receivable
    (p_user_id, 'Hutang',        'debt',        '#F87171', 'arrow-down-circle', 1),
    (p_user_id, 'Piutang',       'receivable',  '#4ADE80', 'arrow-up-circle',   1),
    -- Investment
    (p_user_id, 'Saham',         'investment',  '#818CF8', 'chart-bar',   1),
    (p_user_id, 'Reksa Dana',    'investment',  '#A78BFA', 'chart-pie',   2),
    (p_user_id, 'Kripto',        'investment',  '#C4B5FD', 'currency-bitcoin', 3);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;