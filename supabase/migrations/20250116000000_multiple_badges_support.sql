-- Migration: Update Badge System to VaaS Tiers + Multiple Badges Support
-- Date: 2025-01-16
-- Description:
--   1. Add new VaaS tier values (verified, vetted, elite) to badge_level enum
--   2. Migrate existing data from old values to new values
--   3. Create user_badges junction table for multiple badges support

-- =====================================================
-- STEP 1: ADD NEW ENUM VALUES
-- =====================================================

-- Add new VaaS tier values to the existing enum
-- (PostgreSQL allows adding values but not removing them easily)
ALTER TYPE badge_level ADD VALUE IF NOT EXISTS 'verified';
ALTER TYPE badge_level ADD VALUE IF NOT EXISTS 'vetted';
ALTER TYPE badge_level ADD VALUE IF NOT EXISTS 'elite';

-- =====================================================
-- STEP 2: MIGRATE EXISTING DATA TO NEW VALUES
-- =====================================================

-- Map old badge levels to new VaaS tiers:
-- compliance -> verified (blue, basic tier)
-- capability -> vetted (green, mid tier)
-- reputation -> vetted (green, mid tier)
-- enterprise -> elite (gold, top tier)

UPDATE profiles SET badge_level = 'verified' WHERE badge_level = 'compliance';
UPDATE profiles SET badge_level = 'vetted' WHERE badge_level = 'capability';
UPDATE profiles SET badge_level = 'vetted' WHERE badge_level = 'reputation';
UPDATE profiles SET badge_level = 'elite' WHERE badge_level = 'enterprise';

-- =====================================================
-- STEP 3: CREATE USER_BADGES JUNCTION TABLE
-- =====================================================

-- Junction table to support many-to-many relationship between users and badges
CREATE TABLE IF NOT EXISTS user_badges (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  badge_level badge_level NOT NULL,

  -- Metadata
  awarded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  awarded_by UUID REFERENCES profiles(id), -- Admin who awarded the badge
  notes TEXT, -- Optional notes about why this badge was awarded

  -- Ensure a user can only have one instance of each badge type
  CONSTRAINT unique_user_badge UNIQUE (user_id, badge_level),

  -- Ensure 'none' badge is never stored (it represents absence of badges)
  CONSTRAINT no_none_badge CHECK (badge_level != 'none')
);

-- =====================================================
-- STEP 4: INDEXES
-- =====================================================

CREATE INDEX IF NOT EXISTS idx_user_badges_user_id ON user_badges(user_id);
CREATE INDEX IF NOT EXISTS idx_user_badges_badge_level ON user_badges(badge_level);
CREATE INDEX IF NOT EXISTS idx_user_badges_awarded_at ON user_badges(awarded_at);

-- =====================================================
-- STEP 5: MIGRATE EXISTING BADGES TO JUNCTION TABLE
-- =====================================================

-- Migrate existing single badge_level to user_badges table
-- Only migrate users who have a badge (not 'none')
INSERT INTO user_badges (user_id, badge_level, awarded_at, notes)
SELECT
  id,
  badge_level,
  verification_completed_at,
  'Migrated from original badge_level column'
FROM profiles
WHERE badge_level NOT IN ('none', 'compliance', 'capability', 'reputation', 'enterprise')
  AND badge_level IS NOT NULL
ON CONFLICT (user_id, badge_level) DO NOTHING;

-- =====================================================
-- STEP 6: ADD HELPER FUNCTIONS
-- =====================================================

-- Function to get all badges for a user as an array
CREATE OR REPLACE FUNCTION get_user_badges(p_user_id UUID)
RETURNS badge_level[] AS $$
BEGIN
  RETURN ARRAY(
    SELECT badge_level
    FROM user_badges
    WHERE user_id = p_user_id
    ORDER BY
      CASE badge_level
        WHEN 'elite' THEN 1
        WHEN 'vetted' THEN 2
        WHEN 'verified' THEN 3
        ELSE 4
      END
  );
END;
$$ LANGUAGE plpgsql STABLE;

-- Function to get highest badge for a user (for backward compatibility)
CREATE OR REPLACE FUNCTION get_highest_badge(p_user_id UUID)
RETURNS badge_level AS $$
DECLARE
  highest badge_level;
BEGIN
  SELECT badge_level INTO highest
  FROM user_badges
  WHERE user_id = p_user_id
  ORDER BY
    CASE badge_level
      WHEN 'elite' THEN 1
      WHEN 'vetted' THEN 2
      WHEN 'verified' THEN 3
      ELSE 4
    END
  LIMIT 1;

  -- Return 'none' if user has no badges
  RETURN COALESCE(highest, 'none');
END;
$$ LANGUAGE plpgsql STABLE;

-- Function to check if user has a specific badge
CREATE OR REPLACE FUNCTION user_has_badge(p_user_id UUID, p_badge_level badge_level)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM user_badges
    WHERE user_id = p_user_id AND badge_level = p_badge_level
  );
END;
$$ LANGUAGE plpgsql STABLE;

-- Function to award a badge to a user
CREATE OR REPLACE FUNCTION award_badge(
  p_user_id UUID,
  p_badge_level badge_level,
  p_awarded_by UUID DEFAULT NULL,
  p_notes TEXT DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
  v_badge_id UUID;
BEGIN
  -- Don't allow awarding 'none' or old badge values
  IF p_badge_level IN ('none', 'compliance', 'capability', 'reputation', 'enterprise') THEN
    RAISE EXCEPTION 'Cannot award badge type: %. Use verified, vetted, or elite.', p_badge_level;
  END IF;

  -- Insert badge (will fail if badge already exists due to unique constraint)
  INSERT INTO user_badges (user_id, badge_level, awarded_by, notes)
  VALUES (p_user_id, p_badge_level, p_awarded_by, p_notes)
  ON CONFLICT (user_id, badge_level) DO NOTHING
  RETURNING id INTO v_badge_id;

  -- Update profile's is_verified flag if this is their first badge
  UPDATE profiles
  SET is_verified = TRUE,
      verification_completed_at = COALESCE(verification_completed_at, NOW())
  WHERE id = p_user_id AND is_verified = FALSE;

  RETURN v_badge_id;
END;
$$ LANGUAGE plpgsql;

-- Function to revoke a badge from a user
CREATE OR REPLACE FUNCTION revoke_badge(
  p_user_id UUID,
  p_badge_level badge_level
)
RETURNS BOOLEAN AS $$
DECLARE
  v_deleted BOOLEAN;
BEGIN
  DELETE FROM user_badges
  WHERE user_id = p_user_id AND badge_level = p_badge_level;

  GET DIAGNOSTICS v_deleted = ROW_COUNT;

  -- If user has no more badges, set is_verified to FALSE
  IF NOT EXISTS (SELECT 1 FROM user_badges WHERE user_id = p_user_id) THEN
    UPDATE profiles
    SET is_verified = FALSE,
        verification_completed_at = NULL
    WHERE id = p_user_id;
  END IF;

  RETURN v_deleted > 0;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- STEP 7: BACKWARD COMPATIBILITY TRIGGER
-- =====================================================

-- Sync highest badge back to profiles.badge_level for backward compatibility
CREATE OR REPLACE FUNCTION sync_badge_level()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE profiles
  SET badge_level = get_highest_badge(
    CASE
      WHEN TG_OP = 'DELETE' THEN OLD.user_id
      ELSE NEW.user_id
    END
  )
  WHERE id = CASE
    WHEN TG_OP = 'DELETE' THEN OLD.user_id
    ELSE NEW.user_id
  END;

  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Drop triggers if they exist before recreating
DROP TRIGGER IF EXISTS sync_badge_level_on_insert ON user_badges;
DROP TRIGGER IF EXISTS sync_badge_level_on_delete ON user_badges;

CREATE TRIGGER sync_badge_level_on_insert
AFTER INSERT ON user_badges
FOR EACH ROW EXECUTE FUNCTION sync_badge_level();

CREATE TRIGGER sync_badge_level_on_delete
AFTER DELETE ON user_badges
FOR EACH ROW EXECUTE FUNCTION sync_badge_level();

-- =====================================================
-- STEP 8: ROW LEVEL SECURITY (RLS) POLICIES
-- =====================================================

ALTER TABLE user_badges ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view own badges" ON user_badges;
DROP POLICY IF EXISTS "Public can view verified user badges" ON user_badges;
DROP POLICY IF EXISTS "Admins can view all badges" ON user_badges;
DROP POLICY IF EXISTS "Admins can award badges" ON user_badges;
DROP POLICY IF EXISTS "Admins can revoke badges" ON user_badges;
DROP POLICY IF EXISTS "Admins can update badges" ON user_badges;

-- Users can view their own badges
CREATE POLICY "Users can view own badges"
  ON user_badges FOR SELECT
  USING (auth.uid() = user_id);

-- Public can view badges of verified users (for directory)
CREATE POLICY "Public can view verified user badges"
  ON user_badges FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = user_badges.user_id AND is_verified = TRUE
    )
  );

-- Admins can view all badges
CREATE POLICY "Admins can view all badges"
  ON user_badges FOR SELECT
  USING (is_admin());

-- Only admins can insert badges
CREATE POLICY "Admins can award badges"
  ON user_badges FOR INSERT
  WITH CHECK (is_admin());

-- Only admins can delete badges
CREATE POLICY "Admins can revoke badges"
  ON user_badges FOR DELETE
  USING (is_admin());

-- Only admins can update badge notes
CREATE POLICY "Admins can update badges"
  ON user_badges FOR UPDATE
  USING (is_admin());

-- =====================================================
-- STEP 9: COMMENTS
-- =====================================================

COMMENT ON TABLE user_badges IS 'Junction table allowing users to have multiple VaaS badges (verified, vetted, elite)';
COMMENT ON COLUMN user_badges.badge_level IS 'The VaaS tier badge: verified (blue), vetted (green), or elite (gold)';
COMMENT ON COLUMN user_badges.awarded_at IS 'Timestamp when the badge was awarded';
COMMENT ON COLUMN user_badges.awarded_by IS 'Admin who awarded the badge';
COMMENT ON COLUMN user_badges.notes IS 'Optional notes about why this badge was awarded';
