-- 创建分析记录表，统一存储所有类型的分析历史
CREATE TABLE analysis_records (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  
  -- 分析基本信息
  analysis_type TEXT NOT NULL CHECK (analysis_type IN ('bazi', 'hepan', 'bugua', 'dream', 'name', 'calendar')),
  title TEXT NOT NULL, -- 记录标题，如 "张三的八字分析"
  summary TEXT, -- 简要摘要，用于列表展示
  
  -- 分析数据（JSON格式存储，灵活适应不同分析类型）
  input_data JSONB NOT NULL, -- 输入参数
  output_data JSONB NOT NULL, -- 分析结果
  
  -- 元数据
  points_cost INTEGER NOT NULL DEFAULT 0, -- 消耗的天机点数
  is_favorite BOOLEAN NOT NULL DEFAULT FALSE, -- 是否收藏
  tags TEXT[] DEFAULT ARRAY[]::TEXT[], -- 用户自定义标签
  
  -- 分享设置
  is_shared BOOLEAN NOT NULL DEFAULT FALSE, -- 是否设置为可分享
  share_token TEXT UNIQUE, -- 分享令牌
  
  -- 时间戳
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 创建索引优化查询性能
CREATE INDEX idx_analysis_records_user_id_created_at ON analysis_records(user_id, created_at DESC);
CREATE INDEX idx_analysis_records_analysis_type ON analysis_records(analysis_type);
CREATE INDEX idx_analysis_records_is_favorite ON analysis_records(is_favorite) WHERE is_favorite = TRUE;
CREATE INDEX idx_analysis_records_tags ON analysis_records USING GIN(tags);
CREATE INDEX idx_analysis_records_share_token ON analysis_records(share_token) WHERE share_token IS NOT NULL;

-- 创建全文搜索索引（支持中文搜索）
CREATE INDEX idx_analysis_records_search ON analysis_records USING GIN(
  to_tsvector('simple', title || ' ' || COALESCE(summary, ''))
);

-- 创建更新时间触发器
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = TIMEZONE('utc'::text, NOW());
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_analysis_records_updated_at
  BEFORE UPDATE ON analysis_records
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- 启用行级安全策略
ALTER TABLE analysis_records ENABLE ROW LEVEL SECURITY;

-- 用户只能查看自己的分析记录
CREATE POLICY "Users can view own analysis records"
  ON analysis_records FOR SELECT
  USING (auth.uid() = user_id);

-- 用户只能插入自己的分析记录  
CREATE POLICY "Users can insert own analysis records"
  ON analysis_records FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- 用户只能更新自己的分析记录
CREATE POLICY "Users can update own analysis records"
  ON analysis_records FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- 用户只能删除自己的分析记录
CREATE POLICY "Users can delete own analysis records"
  ON analysis_records FOR DELETE
  USING (auth.uid() = user_id);

-- 公开分享的记录可以被任何人查看
CREATE POLICY "Public shared records can be viewed by anyone"
  ON analysis_records FOR SELECT
  USING (is_shared = TRUE AND share_token IS NOT NULL);

-- 添加注释
COMMENT ON TABLE analysis_records IS '分析记录表，统一存储所有类型的算命分析历史';
COMMENT ON COLUMN analysis_records.analysis_type IS '分析类型：bazi(八字), hepan(合盘), bugua(卜卦), dream(解梦), name(姓名), calendar(日历)';
COMMENT ON COLUMN analysis_records.input_data IS '输入数据，JSON格式存储，适应不同分析类型';
COMMENT ON COLUMN analysis_records.output_data IS '分析结果，JSON格式存储，适应不同分析类型';
COMMENT ON COLUMN analysis_records.share_token IS '分享令牌，用于生成分享链接';