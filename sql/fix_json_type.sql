-- 修复 JSON 类型不匹配问题

-- 重新创建历史记录统计 RPC 函数，修复 JSON 类型问题
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

  -- 获取各类型统计 - 修复：使用 JSONB_OBJECT_AGG 而不是 JSON_OBJECT_AGG
  SELECT JSONB_OBJECT_AGG(analysis_type, type_count)
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