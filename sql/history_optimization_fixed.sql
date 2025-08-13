-- 历史记录性能优化 SQL 脚本 - 修复版本
-- 创建统一历史记录视图和优化查询

-- 1. 创建统一历史记录视图 (修复版本)
CREATE OR REPLACE VIEW user_history_unified AS
SELECT 
  ba.id,
  ba.user_id,
  'bazi' as analysis_type,
  COALESCE(ba.person_name, '未知') as person_name,
  '八字分析 - ' || ba.person_name as title,
  SUBSTRING(COALESCE(ba.ai_analysis, ''), 1, 100) || '...' as summary,
  ba.ai_analysis as result,
  JSON_BUILD_OBJECT(
    'person_name', ba.person_name,
    'birth_date', ba.birth_date,
    'birth_time', ba.birth_time,
    'birth_city', ba.birth_city,
    'gender', ba.gender
  ) as input_data,
  JSON_BUILD_OBJECT(
    'result', ba.ai_analysis,
    'bazi_result', ba.bazi_result,
    'created_at', ba.created_at
  ) as output_data,
  ba.points_cost,
  CASE WHEN uf.analysis_id IS NOT NULL THEN true ELSE false END as is_favorite,
  ARRAY[]::text[] as tags,
  ba.created_at,
  ba.created_at as updated_at
FROM bazi_analyses ba
LEFT JOIN user_favorites uf ON (uf.user_id = ba.user_id AND uf.analysis_type = 'bazi' AND uf.analysis_id = ba.id)

UNION ALL

SELECT 
  ha.id,
  ha.user_id,
  'hepan' as analysis_type,
  ha.person1_name || ' & ' || ha.person2_name as person_name,
  '合盘配对 - ' || ha.person1_name || ' & ' || ha.person2_name as title,
  SUBSTRING(COALESCE(ha.ai_analysis, ''), 1, 100) || '...' as summary,
  ha.ai_analysis as result,
  JSON_BUILD_OBJECT(
    'person1_name', ha.person1_name,
    'person1_birth_date', ha.person1_birth_date,
    'person1_birth_city', ha.person1_birth_city,
    'person1_gender', ha.person1_gender,
    'person2_name', ha.person2_name,
    'person2_birth_date', ha.person2_birth_date,
    'person2_birth_city', ha.person2_birth_city,
    'person2_gender', ha.person2_gender
  ) as input_data,
  JSON_BUILD_OBJECT(
    'result', ha.ai_analysis,
    'compatibility_result', ha.compatibility_result,
    'created_at', ha.created_at
  ) as output_data,
  ha.points_cost,
  CASE WHEN uf.analysis_id IS NOT NULL THEN true ELSE false END as is_favorite,
  ARRAY[]::text[] as tags,
  ha.created_at,
  ha.created_at as updated_at
FROM hepan_analyses ha
LEFT JOIN user_favorites uf ON (uf.user_id = ha.user_id AND uf.analysis_type = 'hepan' AND uf.analysis_id = ha.id)

UNION ALL

SELECT 
  bd.id,
  bd.user_id,
  'bugua' as analysis_type,
  SUBSTRING(COALESCE(bd.question, '未知问题'), 1, 20) as person_name,
  '卜卦占卜 - ' || SUBSTRING(COALESCE(bd.question, '未知问题'), 1, 20) as title,
  SUBSTRING(COALESCE(bd.ai_analysis, ''), 1, 100) || '...' as summary,
  bd.ai_analysis as result,
  JSON_BUILD_OBJECT(
    'question', bd.question,
    'question_category', bd.question_category,
    'divination_method', bd.divination_method,
    'coin_results', bd.coin_results
  ) as input_data,
  JSON_BUILD_OBJECT(
    'result', bd.ai_analysis,
    'hexagram_result', bd.hexagram_result,
    'created_at', bd.created_at
  ) as output_data,
  bd.points_cost,
  CASE WHEN uf.analysis_id IS NOT NULL THEN true ELSE false END as is_favorite,
  ARRAY[]::text[] as tags,
  bd.created_at,
  bd.created_at as updated_at
FROM bugua_divinations bd
LEFT JOIN user_favorites uf ON (uf.user_id = bd.user_id AND uf.analysis_type = 'bugua' AND uf.analysis_id = bd.id)

UNION ALL

SELECT 
  cf.id,
  cf.user_id,
  'calendar' as analysis_type,
  cf.person_name || ' (' || cf.target_date || ')' as person_name,
  '运势分析 - ' || cf.person_name || ' (' || cf.target_date || ')' as title,
  SUBSTRING(COALESCE(cf.ai_analysis, ''), 1, 100) || '...' as summary,
  cf.ai_analysis as result,
  JSON_BUILD_OBJECT(
    'person_name', cf.person_name,
    'birth_date', cf.birth_date,
    'birth_time', cf.birth_time,
    'birth_city', cf.birth_city,
    'gender', cf.gender,
    'target_date', cf.target_date
  ) as input_data,
  JSON_BUILD_OBJECT(
    'result', cf.ai_analysis,
    'fortune_result', cf.fortune_result,
    'created_at', cf.created_at
  ) as output_data,
  cf.points_cost,
  CASE WHEN uf.analysis_id IS NOT NULL THEN true ELSE false END as is_favorite,
  ARRAY[]::text[] as tags,
  cf.created_at,
  cf.created_at as updated_at
FROM calendar_fortunes cf
LEFT JOIN user_favorites uf ON (uf.user_id = cf.user_id AND uf.analysis_type = 'calendar' AND uf.analysis_id = cf.id)

UNION ALL

SELECT 
  na.id,
  na.user_id,
  'name' as analysis_type,
  na.name_to_analyze as person_name,
  '姓名分析 - ' || na.name_to_analyze as title,
  SUBSTRING(COALESCE(na.ai_analysis, ''), 1, 100) || '...' as summary,
  na.ai_analysis as result,
  JSON_BUILD_OBJECT(
    'name_to_analyze', na.name_to_analyze,
    'analysis_type', na.analysis_type,
    'birth_date', na.birth_date,
    'birth_time', na.birth_time,
    'birth_city', na.birth_city,
    'gender', na.gender
  ) as input_data,
  JSON_BUILD_OBJECT(
    'result', na.ai_analysis,
    'analysis_result', na.analysis_result,
    'created_at', na.created_at
  ) as output_data,
  na.points_cost,
  CASE WHEN uf.analysis_id IS NOT NULL THEN true ELSE false END as is_favorite,
  ARRAY[]::text[] as tags,
  na.created_at,
  na.created_at as updated_at
FROM name_analyses na
LEFT JOIN user_favorites uf ON (uf.user_id = na.user_id AND uf.analysis_type = 'name' AND uf.analysis_id = na.id)

UNION ALL

SELECT 
  di.id,
  di.user_id,
  'dream' as analysis_type,
  SUBSTRING(COALESCE(di.dream_content, '未知梦境'), 1, 20) as person_name,
  '解梦 - ' || SUBSTRING(COALESCE(di.dream_content, '未知梦境'), 1, 20) as title,
  SUBSTRING(COALESCE(di.ai_analysis, ''), 1, 100) || '...' as summary,
  di.ai_analysis as result,
  JSON_BUILD_OBJECT(
    'dream_content', di.dream_content,
    'dream_category', di.dream_category,
    'dream_mood', di.dream_mood,
    'dream_frequency', di.dream_frequency,
    'lucid_dream', di.lucid_dream,
    'dreamer_age_range', di.dreamer_age_range,
    'dreamer_gender', di.dreamer_gender,
    'dreamer_life_stage', di.dreamer_life_stage,
    'recent_stress', di.recent_stress
  ) as input_data,
  JSON_BUILD_OBJECT(
    'result', di.ai_analysis,
    'interpretation_result', di.interpretation_result,
    'created_at', di.created_at
  ) as output_data,
  di.points_cost,
  CASE WHEN uf.analysis_id IS NOT NULL THEN true ELSE false END as is_favorite,
  ARRAY[]::text[] as tags,
  di.created_at,
  di.created_at as updated_at
FROM dream_interpretations di
LEFT JOIN user_favorites uf ON (uf.user_id = di.user_id AND uf.analysis_type = 'dream' AND uf.analysis_id = di.id);

-- 2. 创建索引优化查询性能
CREATE INDEX IF NOT EXISTS idx_bazi_analyses_user_id_created_at 
ON bazi_analyses (user_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_hepan_analyses_user_id_created_at 
ON hepan_analyses (user_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_bugua_divinations_user_id_created_at 
ON bugua_divinations (user_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_calendar_fortunes_user_id_created_at 
ON calendar_fortunes (user_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_name_analyses_user_id_created_at 
ON name_analyses (user_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_dream_interpretations_user_id_created_at 
ON dream_interpretations (user_id, created_at DESC);

-- 收藏表索引
CREATE INDEX IF NOT EXISTS idx_user_favorites_user_id_analysis_type 
ON user_favorites (user_id, analysis_type, analysis_id);

-- 3. 创建高效的历史记录查询 RPC 函数
CREATE OR REPLACE FUNCTION get_user_history(
  p_user_id UUID,
  p_analysis_type TEXT DEFAULT NULL,
  p_is_favorite BOOLEAN DEFAULT NULL,
  p_search_query TEXT DEFAULT NULL,
  p_limit INTEGER DEFAULT 20,
  p_offset INTEGER DEFAULT 0,
  p_sort_by TEXT DEFAULT 'created_at',
  p_sort_order TEXT DEFAULT 'desc'
) RETURNS TABLE (
  id UUID,
  user_id UUID,
  analysis_type TEXT,
  title TEXT,
  summary TEXT,
  input_data JSONB,
  output_data JSONB,
  points_cost INTEGER,
  is_favorite BOOLEAN,
  tags TEXT[],
  created_at TIMESTAMP WITH TIME ZONE,
  updated_at TIMESTAMP WITH TIME ZONE
) 
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    h.id,
    h.user_id,
    h.analysis_type,
    h.title,
    h.summary,
    h.input_data,
    h.output_data,
    h.points_cost,
    h.is_favorite,
    h.tags,
    h.created_at,
    h.updated_at
  FROM user_history_unified h
  WHERE h.user_id = p_user_id
    AND (p_analysis_type IS NULL OR h.analysis_type = p_analysis_type)
    AND (p_is_favorite IS NULL OR h.is_favorite = p_is_favorite)
    AND (p_search_query IS NULL OR h.title ILIKE '%' || p_search_query || '%')
  ORDER BY 
    CASE 
      WHEN p_sort_by = 'created_at' AND p_sort_order = 'desc' THEN h.created_at
    END DESC,
    CASE 
      WHEN p_sort_by = 'created_at' AND p_sort_order = 'asc' THEN h.created_at
    END ASC,
    CASE 
      WHEN p_sort_by = 'points_cost' AND p_sort_order = 'desc' THEN h.points_cost
    END DESC,
    CASE 
      WHEN p_sort_by = 'points_cost' AND p_sort_order = 'asc' THEN h.points_cost
    END ASC
  LIMIT p_limit OFFSET p_offset;
END;
$$;

-- 4. 创建历史记录统计 RPC 函数
CREATE OR REPLACE FUNCTION get_user_history_stats(p_user_id UUID)
RETURNS TABLE (
  total_count BIGINT,
  total_points BIGINT,
  favorite_count BIGINT,
  type_counts JSONB,
  most_used_type TEXT,
  average_points_per_record NUMERIC
)
LANGUAGE plpgsql
AS $$
DECLARE
  v_type_counts JSONB;
  v_most_used_type TEXT;
  v_total_count BIGINT;
  v_total_points BIGINT;
  v_favorite_count BIGINT;
BEGIN
  -- 获取基本统计信息
  SELECT 
    COUNT(*),
    SUM(points_cost),
    SUM(CASE WHEN is_favorite THEN 1 ELSE 0 END)
  INTO v_total_count, v_total_points, v_favorite_count
  FROM user_history_unified
  WHERE user_id = p_user_id;

  -- 获取各类型统计
  SELECT JSON_OBJECT_AGG(analysis_type, type_count)
  INTO v_type_counts
  FROM (
    SELECT analysis_type, COUNT(*) as type_count
    FROM user_history_unified
    WHERE user_id = p_user_id
    GROUP BY analysis_type
  ) t;

  -- 获取最常用类型
  SELECT analysis_type
  INTO v_most_used_type
  FROM user_history_unified
  WHERE user_id = p_user_id
  GROUP BY analysis_type
  ORDER BY COUNT(*) DESC
  LIMIT 1;

  RETURN QUERY
  SELECT 
    COALESCE(v_total_count, 0),
    COALESCE(v_total_points, 0),
    COALESCE(v_favorite_count, 0),
    COALESCE(v_type_counts, '{}'::JSONB),
    v_most_used_type,
    CASE 
      WHEN v_total_count > 0 THEN ROUND(v_total_points::NUMERIC / v_total_count, 2)
      ELSE 0
    END;
END;
$$;

-- 5. 创建批量更新收藏状态的函数（使用user_favorites表）
CREATE OR REPLACE FUNCTION update_record_favorite(
  p_record_id UUID,
  p_user_id UUID,
  p_analysis_type TEXT,
  p_is_favorite BOOLEAN
) RETURNS BOOLEAN
LANGUAGE plpgsql
AS $$
DECLARE
  v_title TEXT;
BEGIN
  -- 生成收藏标题
  CASE p_analysis_type
    WHEN 'bazi' THEN
      SELECT '八字分析 - ' || person_name INTO v_title
      FROM bazi_analyses WHERE id = p_record_id;
    WHEN 'hepan' THEN
      SELECT '合盘配对 - ' || person1_name || ' & ' || person2_name INTO v_title
      FROM hepan_analyses WHERE id = p_record_id;
    WHEN 'bugua' THEN
      SELECT '卜卦占卜 - ' || SUBSTRING(question, 1, 20) INTO v_title
      FROM bugua_divinations WHERE id = p_record_id;
    WHEN 'calendar' THEN
      SELECT '运势分析 - ' || person_name || ' (' || target_date || ')' INTO v_title
      FROM calendar_fortunes WHERE id = p_record_id;
    WHEN 'name' THEN
      SELECT '姓名分析 - ' || name_to_analyze INTO v_title
      FROM name_analyses WHERE id = p_record_id;
    WHEN 'dream' THEN
      SELECT '解梦 - ' || SUBSTRING(dream_content, 1, 20) INTO v_title
      FROM dream_interpretations WHERE id = p_record_id;
    ELSE
      RETURN FALSE;
  END CASE;

  IF p_is_favorite THEN
    -- 添加到收藏
    INSERT INTO user_favorites (user_id, analysis_type, analysis_id, title)
    VALUES (p_user_id, p_analysis_type, p_record_id, v_title)
    ON CONFLICT (user_id, analysis_type, analysis_id) DO NOTHING;
  ELSE
    -- 从收藏中移除
    DELETE FROM user_favorites 
    WHERE user_id = p_user_id 
      AND analysis_type = p_analysis_type 
      AND analysis_id = p_record_id;
  END IF;

  RETURN TRUE;
END;
$$;