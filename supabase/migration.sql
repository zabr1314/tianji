-- 天机AI平台数据库迁移脚本
-- 安全地创建表和功能，避免重复错误

-- 启用必要的扩展
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 用户资料扩展表 (扩展 auth.users)
CREATE TABLE IF NOT EXISTS public.user_profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  username VARCHAR(50) UNIQUE,
  display_name VARCHAR(100),
  avatar_url TEXT,
  birth_date DATE,
  birth_time TIME,
  birth_city VARCHAR(100),
  gender VARCHAR(10) CHECK (gender IN ('male', 'female')),
  phone VARCHAR(20),
  wechat_id VARCHAR(50),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 天机点账户表
CREATE TABLE IF NOT EXISTS public.tianji_accounts (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  current_points INTEGER DEFAULT 100 NOT NULL CHECK (current_points >= 0),
  total_earned INTEGER DEFAULT 100 NOT NULL,
  total_spent INTEGER DEFAULT 0 NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id)
);

-- 天机点交易记录表
CREATE TABLE IF NOT EXISTS public.tianji_transactions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  transaction_type VARCHAR(20) NOT NULL CHECK (transaction_type IN ('earn', 'spend', 'refund', 'gift')),
  amount INTEGER NOT NULL,
  balance_after INTEGER NOT NULL,
  service_type VARCHAR(50), -- bazi, hepan, bugua, calendar, name, dream
  description TEXT,
  reference_id UUID, -- 关联的分析记录ID
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 八字分析记录表
CREATE TABLE IF NOT EXISTS public.bazi_analyses (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  person_name VARCHAR(100) NOT NULL,
  birth_date DATE NOT NULL,
  birth_time TIME NOT NULL,
  birth_city VARCHAR(100) NOT NULL,
  gender VARCHAR(10) CHECK (gender IN ('male', 'female')),
  bazi_result JSONB NOT NULL, -- 存储八字计算结果
  ai_analysis TEXT, -- AI分析内容
  points_cost INTEGER NOT NULL DEFAULT 200,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 合盘分析记录表  
CREATE TABLE IF NOT EXISTS public.hepan_analyses (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  person1_name VARCHAR(100) NOT NULL,
  person1_birth_date DATE NOT NULL,
  person1_birth_time TIME NOT NULL,
  person1_birth_city VARCHAR(100) NOT NULL,
  person1_gender VARCHAR(10) CHECK (person1_gender IN ('male', 'female')),
  person2_name VARCHAR(100) NOT NULL,
  person2_birth_date DATE NOT NULL,
  person2_birth_time TIME NOT NULL,
  person2_birth_city VARCHAR(100) NOT NULL,
  person2_gender VARCHAR(10) CHECK (person2_gender IN ('male', 'female')),
  compatibility_result JSONB NOT NULL, -- 存储合盘结果
  ai_analysis TEXT, -- AI分析内容
  points_cost INTEGER NOT NULL DEFAULT 300,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 卜卦记录表
CREATE TABLE IF NOT EXISTS public.bugua_divinations (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  question TEXT NOT NULL,
  question_category VARCHAR(50) NOT NULL,
  divination_method VARCHAR(20) CHECK (divination_method IN ('coins', 'time')),
  coin_results INTEGER[], -- 投币结果数组
  hexagram_result JSONB NOT NULL, -- 卦象结果
  ai_analysis TEXT, -- AI分析内容
  points_cost INTEGER NOT NULL DEFAULT 150,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 运势日历记录表
CREATE TABLE IF NOT EXISTS public.calendar_fortunes (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  person_name VARCHAR(100) NOT NULL,
  birth_date DATE NOT NULL,
  birth_time TIME NOT NULL,
  birth_city VARCHAR(100) NOT NULL,
  gender VARCHAR(10) CHECK (gender IN ('male', 'female')),
  target_date DATE NOT NULL,
  fortune_result JSONB NOT NULL, -- 运势分析结果
  ai_analysis TEXT, -- AI分析内容
  points_cost INTEGER NOT NULL DEFAULT 100,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, target_date, person_name) -- 防止重复查询同一天
);

-- 姓名分析记录表
CREATE TABLE IF NOT EXISTS public.name_analyses (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name_to_analyze VARCHAR(10) NOT NULL,
  analysis_type VARCHAR(20) CHECK (analysis_type IN ('current', 'suggestion')),
  birth_date DATE, -- 可选
  birth_time TIME, -- 可选
  birth_city VARCHAR(100), -- 可选
  gender VARCHAR(10) CHECK (gender IN ('male', 'female')), -- 可选
  analysis_result JSONB NOT NULL, -- 姓名分析结果
  ai_analysis TEXT, -- AI分析内容
  points_cost INTEGER NOT NULL DEFAULT 120,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 解梦记录表
CREATE TABLE IF NOT EXISTS public.dream_interpretations (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  dream_content TEXT NOT NULL,
  dream_category VARCHAR(50) NOT NULL,
  dream_mood VARCHAR(50) NOT NULL,
  dream_frequency VARCHAR(20),
  lucid_dream BOOLEAN DEFAULT FALSE,
  dreamer_age_range VARCHAR(10),
  dreamer_gender VARCHAR(10) CHECK (dreamer_gender IN ('male', 'female')),
  dreamer_life_stage VARCHAR(20),
  recent_stress BOOLEAN DEFAULT FALSE,
  interpretation_result JSONB NOT NULL, -- 解梦结果
  ai_analysis TEXT, -- AI分析内容
  points_cost INTEGER NOT NULL DEFAULT 80,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 用户收藏表
CREATE TABLE IF NOT EXISTS public.user_favorites (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  analysis_type VARCHAR(50) NOT NULL, -- bazi, hepan, bugua, calendar, name, dream
  analysis_id UUID NOT NULL, -- 对应分析记录的ID
  title VARCHAR(200), -- 收藏标题
  notes TEXT, -- 用户备注
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, analysis_type, analysis_id)
);

-- 系统配置表
CREATE TABLE IF NOT EXISTS public.system_settings (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  setting_key VARCHAR(100) UNIQUE NOT NULL,
  setting_value JSONB NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 充值订单表
CREATE TABLE IF NOT EXISTS public.recharge_orders (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  order_number VARCHAR(50) UNIQUE NOT NULL,
  amount DECIMAL(10,2) NOT NULL, -- 充值金额(RMB)
  points INTEGER NOT NULL, -- 获得天机点
  payment_method VARCHAR(50) NOT NULL, -- alipay, wechat等
  payment_status VARCHAR(20) DEFAULT 'pending' CHECK (payment_status IN ('pending', 'completed', 'failed', 'cancelled')),
  payment_id VARCHAR(100), -- 第三方支付ID
  paid_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 创建索引（只在不存在时创建）
DO $$
BEGIN
  -- 检查索引是否存在，不存在则创建
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_user_profiles_username') THEN
    CREATE INDEX idx_user_profiles_username ON public.user_profiles(username);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_tianji_accounts_user_id') THEN
    CREATE INDEX idx_tianji_accounts_user_id ON public.tianji_accounts(user_id);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_tianji_transactions_user_id') THEN
    CREATE INDEX idx_tianji_transactions_user_id ON public.tianji_transactions(user_id);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_tianji_transactions_created_at') THEN
    CREATE INDEX idx_tianji_transactions_created_at ON public.tianji_transactions(created_at);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_bazi_analyses_user_id') THEN
    CREATE INDEX idx_bazi_analyses_user_id ON public.bazi_analyses(user_id);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_bazi_analyses_created_at') THEN
    CREATE INDEX idx_bazi_analyses_created_at ON public.bazi_analyses(created_at);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_hepan_analyses_user_id') THEN
    CREATE INDEX idx_hepan_analyses_user_id ON public.hepan_analyses(user_id);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_bugua_divinations_user_id') THEN
    CREATE INDEX idx_bugua_divinations_user_id ON public.bugua_divinations(user_id);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_calendar_fortunes_user_id') THEN
    CREATE INDEX idx_calendar_fortunes_user_id ON public.calendar_fortunes(user_id);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_calendar_fortunes_target_date') THEN
    CREATE INDEX idx_calendar_fortunes_target_date ON public.calendar_fortunes(target_date);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_name_analyses_user_id') THEN
    CREATE INDEX idx_name_analyses_user_id ON public.name_analyses(user_id);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_dream_interpretations_user_id') THEN
    CREATE INDEX idx_dream_interpretations_user_id ON public.dream_interpretations(user_id);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_user_favorites_user_id') THEN
    CREATE INDEX idx_user_favorites_user_id ON public.user_favorites(user_id);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_recharge_orders_user_id') THEN
    CREATE INDEX idx_recharge_orders_user_id ON public.recharge_orders(user_id);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_recharge_orders_order_number') THEN
    CREATE INDEX idx_recharge_orders_order_number ON public.recharge_orders(order_number);
  END IF;
END
$$;

-- 创建或替换触发器函数：更新 updated_at 字段
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- 创建触发器（先删除再创建避免冲突）
DROP TRIGGER IF EXISTS update_user_profiles_updated_at ON public.user_profiles;
CREATE TRIGGER update_user_profiles_updated_at 
  BEFORE UPDATE ON public.user_profiles 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_tianji_accounts_updated_at ON public.tianji_accounts;
CREATE TRIGGER update_tianji_accounts_updated_at 
  BEFORE UPDATE ON public.tianji_accounts 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_system_settings_updated_at ON public.system_settings;
CREATE TRIGGER update_system_settings_updated_at 
  BEFORE UPDATE ON public.system_settings 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 启用行级安全策略
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tianji_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tianji_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bazi_analyses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hepan_analyses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bugua_divinations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.calendar_fortunes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.name_analyses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.dream_interpretations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.recharge_orders ENABLE ROW LEVEL SECURITY;

-- 删除已存在的策略（如果存在）然后重新创建
DO $$
BEGIN
  -- 用户资料策略
  DROP POLICY IF EXISTS "Users can view own profile" ON public.user_profiles;
  CREATE POLICY "Users can view own profile" ON public.user_profiles
    FOR SELECT USING (auth.uid() = id);

  DROP POLICY IF EXISTS "Users can update own profile" ON public.user_profiles;
  CREATE POLICY "Users can update own profile" ON public.user_profiles
    FOR UPDATE USING (auth.uid() = id);

  DROP POLICY IF EXISTS "Users can insert own profile" ON public.user_profiles;
  CREATE POLICY "Users can insert own profile" ON public.user_profiles
    FOR INSERT WITH CHECK (auth.uid() = id);

  -- 天机点账户策略
  DROP POLICY IF EXISTS "Users can view own tianji account" ON public.tianji_accounts;
  CREATE POLICY "Users can view own tianji account" ON public.tianji_accounts
    FOR SELECT USING (auth.uid() = user_id);

  DROP POLICY IF EXISTS "Users can update own tianji account" ON public.tianji_accounts;
  CREATE POLICY "Users can update own tianji account" ON public.tianji_accounts
    FOR UPDATE USING (auth.uid() = user_id);

  DROP POLICY IF EXISTS "Users can insert own tianji account" ON public.tianji_accounts;
  CREATE POLICY "Users can insert own tianji account" ON public.tianji_accounts
    FOR INSERT WITH CHECK (auth.uid() = user_id);

  -- 交易记录策略
  DROP POLICY IF EXISTS "Users can view own transactions" ON public.tianji_transactions;
  CREATE POLICY "Users can view own transactions" ON public.tianji_transactions
    FOR SELECT USING (auth.uid() = user_id);

  DROP POLICY IF EXISTS "Users can insert own transactions" ON public.tianji_transactions;
  CREATE POLICY "Users can insert own transactions" ON public.tianji_transactions
    FOR INSERT WITH CHECK (auth.uid() = user_id);

  -- 八字分析策略
  DROP POLICY IF EXISTS "Users can view own bazi analyses" ON public.bazi_analyses;
  CREATE POLICY "Users can view own bazi analyses" ON public.bazi_analyses
    FOR SELECT USING (auth.uid() = user_id);

  DROP POLICY IF EXISTS "Users can insert own bazi analyses" ON public.bazi_analyses;
  CREATE POLICY "Users can insert own bazi analyses" ON public.bazi_analyses
    FOR INSERT WITH CHECK (auth.uid() = user_id);

  -- 合盘分析策略
  DROP POLICY IF EXISTS "Users can view own hepan analyses" ON public.hepan_analyses;
  CREATE POLICY "Users can view own hepan analyses" ON public.hepan_analyses
    FOR SELECT USING (auth.uid() = user_id);

  DROP POLICY IF EXISTS "Users can insert own hepan analyses" ON public.hepan_analyses;
  CREATE POLICY "Users can insert own hepan analyses" ON public.hepan_analyses
    FOR INSERT WITH CHECK (auth.uid() = user_id);

  -- 卜卦策略
  DROP POLICY IF EXISTS "Users can view own bugua divinations" ON public.bugua_divinations;
  CREATE POLICY "Users can view own bugua divinations" ON public.bugua_divinations
    FOR SELECT USING (auth.uid() = user_id);

  DROP POLICY IF EXISTS "Users can insert own bugua divinations" ON public.bugua_divinations;
  CREATE POLICY "Users can insert own bugua divinations" ON public.bugua_divinations
    FOR INSERT WITH CHECK (auth.uid() = user_id);

  -- 运势日历策略
  DROP POLICY IF EXISTS "Users can view own calendar fortunes" ON public.calendar_fortunes;
  CREATE POLICY "Users can view own calendar fortunes" ON public.calendar_fortunes
    FOR SELECT USING (auth.uid() = user_id);

  DROP POLICY IF EXISTS "Users can insert own calendar fortunes" ON public.calendar_fortunes;
  CREATE POLICY "Users can insert own calendar fortunes" ON public.calendar_fortunes
    FOR INSERT WITH CHECK (auth.uid() = user_id);

  -- 姓名分析策略
  DROP POLICY IF EXISTS "Users can view own name analyses" ON public.name_analyses;
  CREATE POLICY "Users can view own name analyses" ON public.name_analyses
    FOR SELECT USING (auth.uid() = user_id);

  DROP POLICY IF EXISTS "Users can insert own name analyses" ON public.name_analyses;
  CREATE POLICY "Users can insert own name analyses" ON public.name_analyses
    FOR INSERT WITH CHECK (auth.uid() = user_id);

  -- 解梦策略
  DROP POLICY IF EXISTS "Users can view own dream interpretations" ON public.dream_interpretations;
  CREATE POLICY "Users can view own dream interpretations" ON public.dream_interpretations
    FOR SELECT USING (auth.uid() = user_id);

  DROP POLICY IF EXISTS "Users can insert own dream interpretations" ON public.dream_interpretations;
  CREATE POLICY "Users can insert own dream interpretations" ON public.dream_interpretations
    FOR INSERT WITH CHECK (auth.uid() = user_id);

  -- 收藏策略
  DROP POLICY IF EXISTS "Users can view own favorites" ON public.user_favorites;
  CREATE POLICY "Users can view own favorites" ON public.user_favorites
    FOR SELECT USING (auth.uid() = user_id);

  DROP POLICY IF EXISTS "Users can insert own favorites" ON public.user_favorites;
  CREATE POLICY "Users can insert own favorites" ON public.user_favorites
    FOR INSERT WITH CHECK (auth.uid() = user_id);

  DROP POLICY IF EXISTS "Users can delete own favorites" ON public.user_favorites;
  CREATE POLICY "Users can delete own favorites" ON public.user_favorites
    FOR DELETE USING (auth.uid() = user_id);

  -- 充值订单策略
  DROP POLICY IF EXISTS "Users can view own recharge orders" ON public.recharge_orders;
  CREATE POLICY "Users can view own recharge orders" ON public.recharge_orders
    FOR SELECT USING (auth.uid() = user_id);

  DROP POLICY IF EXISTS "Users can insert own recharge orders" ON public.recharge_orders;
  CREATE POLICY "Users can insert own recharge orders" ON public.recharge_orders
    FOR INSERT WITH CHECK (auth.uid() = user_id);
END
$$;

-- 插入初始系统配置（如果不存在）
INSERT INTO public.system_settings (setting_key, setting_value, description) 
VALUES 
  ('points_rates', '{"1_rmb": 10, "new_user_bonus": 300}', '天机点兑换率和新用户奖励'),
  ('service_costs', '{"bazi": 200, "hepan": 300, "bugua": 150, "calendar": 100, "name": 120, "dream": 80}', '各项服务的天机点费用'),
  ('daily_limits', '{"bazi": 5, "hepan": 3, "bugua": 10, "calendar": 1, "name": 5, "dream": 10}', '每日使用次数限制'),
  ('maintenance_mode', 'false', '维护模式开关'),
  ('announcement', '{"title": "欢迎使用天机AI", "content": "传统智慧遇见现代AI", "active": true}', '系统公告')
ON CONFLICT (setting_key) DO NOTHING;

-- 创建或替换函数：用户注册时自动创建账户
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.user_profiles (id, username, display_name)
  VALUES (NEW.id, NULL, NEW.raw_user_meta_data->>'display_name');
  
  INSERT INTO public.tianji_accounts (user_id, current_points, total_earned)
  VALUES (NEW.id, 300, 300);
  
  INSERT INTO public.tianji_transactions (user_id, transaction_type, amount, balance_after, description)
  VALUES (NEW.id, 'earn', 300, 300, '新用户注册奖励');
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 创建触发器：用户注册时自动执行（先删除再创建）
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 创建或替换函数：扣除天机点
CREATE OR REPLACE FUNCTION public.spend_tianji_points(
  p_user_id UUID,
  p_amount INTEGER,
  p_service_type VARCHAR,
  p_description TEXT DEFAULT NULL,
  p_reference_id UUID DEFAULT NULL
)
RETURNS BOOLEAN AS $$
DECLARE
  current_balance INTEGER;
  new_balance INTEGER;
BEGIN
  -- 获取当前余额
  SELECT current_points INTO current_balance
  FROM public.tianji_accounts
  WHERE user_id = p_user_id;
  
  -- 检查余额是否足够
  IF current_balance IS NULL OR current_balance < p_amount THEN
    RETURN FALSE;
  END IF;
  
  -- 计算新余额
  new_balance := current_balance - p_amount;
  
  -- 更新账户余额
  UPDATE public.tianji_accounts
  SET 
    current_points = new_balance,
    total_spent = total_spent + p_amount,
    updated_at = NOW()
  WHERE user_id = p_user_id;
  
  -- 记录交易
  INSERT INTO public.tianji_transactions (
    user_id, 
    transaction_type, 
    amount, 
    balance_after, 
    service_type,
    description,
    reference_id
  ) VALUES (
    p_user_id, 
    'spend', 
    p_amount, 
    new_balance, 
    p_service_type,
    p_description,
    p_reference_id
  );
  
  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 创建或替换函数：增加天机点
CREATE OR REPLACE FUNCTION public.add_tianji_points(
  p_user_id UUID,
  p_amount INTEGER,
  p_transaction_type VARCHAR DEFAULT 'earn',
  p_description TEXT DEFAULT NULL
)
RETURNS BOOLEAN AS $$
DECLARE
  current_balance INTEGER;
  new_balance INTEGER;
BEGIN
  -- 获取当前余额
  SELECT current_points INTO current_balance
  FROM public.tianji_accounts
  WHERE user_id = p_user_id;
  
  IF current_balance IS NULL THEN
    RETURN FALSE;
  END IF;
  
  -- 计算新余额
  new_balance := current_balance + p_amount;
  
  -- 更新账户余额
  UPDATE public.tianji_accounts
  SET 
    current_points = new_balance,
    total_earned = CASE WHEN p_transaction_type = 'earn' THEN total_earned + p_amount ELSE total_earned END,
    updated_at = NOW()
  WHERE user_id = p_user_id;
  
  -- 记录交易
  INSERT INTO public.tianji_transactions (
    user_id, 
    transaction_type, 
    amount, 
    balance_after, 
    description
  ) VALUES (
    p_user_id, 
    p_transaction_type, 
    p_amount, 
    new_balance, 
    p_description
  );
  
  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;