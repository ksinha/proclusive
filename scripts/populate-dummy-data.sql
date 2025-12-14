-- Populate database with 20 dummy construction industry profiles
-- Run this in your Supabase SQL Editor

-- Step 1: Insert users into auth.users first (with dummy passwords)
-- Note: Passwords are hashed with bcrypt. The plain text password for all is "DummyPass123!"

DO $$
DECLARE
  user_emails TEXT[] := ARRAY[
    'john.miller@acmeconstruction.com',
    'sarah.chen@electricpro.com',
    'mike.rodriguez@plumbingworks.com',
    'jennifer.park@hvacsystems.com',
    'david.thompson@carpentrymaster.com',
    'lisa.nguyen@roofingexperts.com',
    'robert.anderson@concrete-pro.com',
    'amanda.wilson@paintersplus.com',
    'carlos.garcia@masonry-works.com',
    'emily.brown@flooring-specialists.com',
    'james.lee@steel-fabrication.com',
    'patricia.martinez@landscaping-pro.com',
    'kevin.patel@drywall-solutions.com',
    'michelle.kim@glass-glazing.com',
    'thomas.wright@demolition-experts.com',
    'jessica.taylor@insulation-pro.com',
    'anthony.davis@waterproofing.com',
    'nicole.johnson@elevator-services.com',
    'brian.white@fire-suppression.com',
    'stephanie.moore@excavation-services.com'
  ];
  email_address TEXT;
BEGIN
  FOREACH email_address IN ARRAY user_emails
  LOOP
    -- Only insert if user doesn't exist
    IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = email_address) THEN
      INSERT INTO auth.users (
        id,
        instance_id,
        email,
        encrypted_password,
        email_confirmed_at,
        created_at,
        updated_at,
        raw_app_meta_data,
        raw_user_meta_data,
        aud,
        role
      )
      VALUES (
        gen_random_uuid(),
        '00000000-0000-0000-0000-000000000000',
        email_address,
        '$2a$10$rH8qNVzKdPWqGdYqGZ3eZ.8FqJzNvxQz8pKx9qBjQk5YvxZzQGqGm',
        NOW(),
        NOW(),
        NOW(),
        '{"provider":"email","providers":["email"]}',
        '{}',
        'authenticated',
        'authenticated'
      );
    END IF;
  END LOOP;
END $$;

-- Step 2: Now insert profiles using the user IDs we just created
DO $$
DECLARE
  user_emails TEXT[] := ARRAY[
    'john.miller@acmeconstruction.com',
    'sarah.chen@electricpro.com',
    'mike.rodriguez@plumbingworks.com',
    'jennifer.park@hvacsystems.com',
    'david.thompson@carpentrymaster.com',
    'lisa.nguyen@roofingexperts.com',
    'robert.anderson@concrete-pro.com',
    'amanda.wilson@paintersplus.com',
    'carlos.garcia@masonry-works.com',
    'emily.brown@flooring-specialists.com',
    'james.lee@steel-fabrication.com',
    'patricia.martinez@landscaping-pro.com',
    'kevin.patel@drywall-solutions.com',
    'michelle.kim@glass-glazing.com',
    'thomas.wright@demolition-experts.com',
    'jessica.taylor@insulation-pro.com',
    'anthony.davis@waterproofing.com',
    'nicole.johnson@elevator-services.com',
    'brian.white@fire-suppression.com',
    'stephanie.moore@excavation-services.com'
  ];
  v_user_id UUID;
  email_address TEXT;
  counter INT := 0;
BEGIN
  FOREACH email_address IN ARRAY user_emails
  LOOP
    counter := counter + 1;

    -- Get the user ID for this email
    SELECT id INTO v_user_id FROM auth.users WHERE email = email_address;

    IF v_user_id IS NULL THEN
      CONTINUE;
    END IF;

    -- Only insert profile if it doesn't already exist
    IF NOT EXISTS (SELECT 1 FROM profiles WHERE id = v_user_id) THEN
      -- Insert profile based on email
      CASE email_address
      WHEN 'john.miller@acmeconstruction.com' THEN
        INSERT INTO profiles (id, email, full_name, company_name, phone, business_type, primary_trade, service_areas, website, linkedin_url, street_address, city, state, zip_code, bio, years_in_business, team_size, tin_number, is_public, is_verified, badge_level)
        VALUES (v_user_id, email_address, 'John Miller', 'Acme Construction Co.', '(555) 123-4567', 'LLC', 'General Contractor', ARRAY['San Francisco', 'Oakland', 'San Jose'], 'https://acmeconstruction.com', 'https://linkedin.com/in/johnmiller', '1234 Market Street', 'San Francisco', 'CA', '94102', 'Premier general contractor specializing in commercial construction projects. 15 years of experience delivering high-quality builds on time and within budget.', 15, '20-50', '12-3456789', true, true, 'compliance');
        

      WHEN 'sarah.chen@electricpro.com' THEN
        INSERT INTO profiles (id, email, full_name, company_name, phone, business_type, primary_trade, service_areas, website, linkedin_url, street_address, city, state, zip_code, bio, years_in_business, team_size, tin_number, is_public)
        VALUES (v_user_id, email_address, 'Sarah Chen', 'ElectricPro Solutions', '(555) 234-5678', 'Corporation', 'Electrical', ARRAY['Los Angeles', 'Pasadena', 'Glendale'], 'https://electricprosolutions.com', 'https://linkedin.com/in/sarahchen', '5678 Sunset Blvd', 'Los Angeles', 'CA', '90028', 'Licensed electrical contractor serving commercial and residential clients. Expert in smart building systems and sustainable energy solutions.', 8, '10-20', '98-7654321', true);
        

      WHEN 'mike.rodriguez@plumbingworks.com' THEN
        INSERT INTO profiles (id, email, full_name, company_name, phone, business_type, primary_trade, service_areas, website, linkedin_url, street_address, city, state, zip_code, bio, years_in_business, team_size, tin_number, is_public)
        VALUES (v_user_id, email_address, 'Mike Rodriguez', 'Rodriguez Plumbing Works', '(555) 345-6789', 'Sole Proprietorship', 'Plumbing', ARRAY['San Diego', 'Chula Vista', 'Oceanside'], 'https://rodriguezplumbing.com', 'https://linkedin.com/in/mikerodriguez', '2345 Harbor Dr', 'San Diego', 'CA', '92101', 'Family-owned plumbing business with a reputation for reliable service. Specializing in commercial plumbing systems and emergency repairs.', 12, '5-10', '45-6789012', true);
        

      WHEN 'jennifer.park@hvacsystems.com' THEN
        INSERT INTO profiles (id, email, full_name, company_name, phone, business_type, primary_trade, service_areas, website, linkedin_url, street_address, city, state, zip_code, bio, years_in_business, team_size, tin_number, is_public)
        VALUES (v_user_id, email_address, 'Jennifer Park', 'Park HVAC Systems', '(555) 456-7890', 'LLC', 'HVAC', ARRAY['Sacramento', 'Roseville', 'Folsom'], 'https://parkhvac.com', 'https://linkedin.com/in/jenniferpark', '7890 J Street', 'Sacramento', 'CA', '95814', 'Leading HVAC contractor specializing in commercial climate control systems. Certified in energy-efficient HVAC design and installation.', 10, '10-20', '23-4567890', true);
        

      WHEN 'david.thompson@carpentrymaster.com' THEN
        INSERT INTO profiles (id, email, full_name, company_name, phone, business_type, primary_trade, service_areas, website, linkedin_url, street_address, city, state, zip_code, bio, years_in_business, team_size, tin_number, is_public)
        VALUES (v_user_id, email_address, 'David Thompson', 'Thompson Carpentry Masters', '(555) 567-8901', 'Partnership', 'Carpentry', ARRAY['Portland', 'Beaverton', 'Hillsboro'], 'https://thompsoncarpentry.com', 'https://linkedin.com/in/davidthompson', '3456 SW Broadway', 'Portland', 'OR', '97205', 'Master carpenters delivering exceptional custom woodwork and finish carpentry. Known for craftsmanship and attention to detail.', 18, '5-10', '67-8901234', true);
        

      WHEN 'lisa.nguyen@roofingexperts.com' THEN
        INSERT INTO profiles (id, email, full_name, company_name, phone, business_type, primary_trade, service_areas, website, linkedin_url, street_address, city, state, zip_code, bio, years_in_business, team_size, tin_number, is_public)
        VALUES (v_user_id, email_address, 'Lisa Nguyen', 'Nguyen Roofing Experts', '(555) 678-9012', 'LLC', 'Roofing', ARRAY['Seattle', 'Tacoma', 'Bellevue'], 'https://nguyenroofing.com', 'https://linkedin.com/in/lisanguyen', '4567 Pike Street', 'Seattle', 'WA', '98101', 'Professional roofing contractor with expertise in commercial flat roofs and sustainable roofing materials. Licensed and fully insured.', 14, '20-50', '89-0123456', true);
        

      WHEN 'robert.anderson@concrete-pro.com' THEN
        INSERT INTO profiles (id, email, full_name, company_name, phone, business_type, primary_trade, service_areas, website, linkedin_url, street_address, city, state, zip_code, bio, years_in_business, team_size, tin_number, is_public)
        VALUES (v_user_id, email_address, 'Robert Anderson', 'Anderson Concrete Pro', '(555) 789-0123', 'Corporation', 'Concrete', ARRAY['Phoenix', 'Scottsdale', 'Tempe'], 'https://andersonconcrete.com', 'https://linkedin.com/in/robertanderson', '5678 E Camelback Rd', 'Phoenix', 'AZ', '85018', 'Leading concrete contractor specializing in large-scale commercial foundations and decorative concrete work. Over 20 years in the industry.', 22, '50+', '34-5678901', true);
        

      WHEN 'amanda.wilson@paintersplus.com' THEN
        INSERT INTO profiles (id, email, full_name, company_name, phone, business_type, primary_trade, service_areas, website, linkedin_url, street_address, city, state, zip_code, bio, years_in_business, team_size, tin_number, is_public)
        VALUES (v_user_id, email_address, 'Amanda Wilson', 'Wilson Painters Plus', '(555) 890-1234', 'LLC', 'Painting', ARRAY['Denver', 'Boulder', 'Aurora'], 'https://wilsonpainters.com', 'https://linkedin.com/in/amandawilson', '6789 Colfax Ave', 'Denver', 'CO', '80220', 'Professional painting contractor offering interior and exterior services for commercial properties. Eco-friendly paint options available.', 9, '10-20', '56-7890123', true);
        

      WHEN 'carlos.garcia@masonry-works.com' THEN
        INSERT INTO profiles (id, email, full_name, company_name, phone, business_type, primary_trade, service_areas, website, linkedin_url, street_address, city, state, zip_code, bio, years_in_business, team_size, tin_number, is_public)
        VALUES (v_user_id, email_address, 'Carlos Garcia', 'Garcia Masonry Works', '(555) 901-2345', 'Sole Proprietorship', 'Masonry', ARRAY['Austin', 'Round Rock', 'Cedar Park'], 'https://garciamasonry.com', 'https://linkedin.com/in/carlosgarcia', '7890 Congress Ave', 'Austin', 'TX', '78701', 'Expert masonry contractor specializing in brick, stone, and concrete block construction. Family business with three generations of experience.', 25, '10-20', '78-9012345', true);
        

      WHEN 'emily.brown@flooring-specialists.com' THEN
        INSERT INTO profiles (id, email, full_name, company_name, phone, business_type, primary_trade, service_areas, website, linkedin_url, street_address, city, state, zip_code, bio, years_in_business, team_size, tin_number, is_public)
        VALUES (v_user_id, email_address, 'Emily Brown', 'Brown Flooring Specialists', '(555) 012-3456', 'LLC', 'Flooring', ARRAY['Dallas', 'Fort Worth', 'Plano'], 'https://brownflooring.com', 'https://linkedin.com/in/emilybrown', '8901 Main Street', 'Dallas', 'TX', '75201', 'Commercial flooring experts offering installation, refinishing, and maintenance. Specialists in hardwood, tile, and luxury vinyl.', 11, '10-20', '90-1234567', true);
        

      WHEN 'james.lee@steel-fabrication.com' THEN
        INSERT INTO profiles (id, email, full_name, company_name, phone, business_type, primary_trade, service_areas, website, linkedin_url, street_address, city, state, zip_code, bio, years_in_business, team_size, tin_number, is_public)
        VALUES (v_user_id, email_address, 'James Lee', 'Lee Steel Fabrication', '(555) 123-4568', 'Corporation', 'Steel Erection', ARRAY['Houston', 'Pasadena', 'Sugar Land'], 'https://leesteelfab.com', 'https://linkedin.com/in/jameslee', '9012 Westheimer Rd', 'Houston', 'TX', '77042', 'Industrial steel fabrication and erection contractor. Specializing in commercial buildings, warehouses, and industrial facilities.', 16, '50+', '12-3456780', true);
        

      WHEN 'patricia.martinez@landscaping-pro.com' THEN
        INSERT INTO profiles (id, email, full_name, company_name, phone, business_type, primary_trade, service_areas, website, linkedin_url, street_address, city, state, zip_code, bio, years_in_business, team_size, tin_number, is_public)
        VALUES (v_user_id, email_address, 'Patricia Martinez', 'Martinez Landscaping Pro', '(555) 234-5679', 'LLC', 'Landscaping', ARRAY['Miami', 'Fort Lauderdale', 'West Palm Beach'], 'https://martinezlandscaping.com', 'https://linkedin.com/in/patriciamartinez', '1234 Biscayne Blvd', 'Miami', 'FL', '33132', 'Full-service commercial landscaping company. Expert in tropical landscape design, irrigation systems, and ongoing maintenance programs.', 13, '20-50', '23-4567891', true);
        

      WHEN 'kevin.patel@drywall-solutions.com' THEN
        INSERT INTO profiles (id, email, full_name, company_name, phone, business_type, primary_trade, service_areas, website, linkedin_url, street_address, city, state, zip_code, bio, years_in_business, team_size, tin_number, is_public)
        VALUES (v_user_id, email_address, 'Kevin Patel', 'Patel Drywall Solutions', '(555) 345-6780', 'Partnership', 'Drywall', ARRAY['Atlanta', 'Marietta', 'Alpharetta'], 'https://pateldrywall.com', 'https://linkedin.com/in/kevinpatel', '2345 Peachtree St', 'Atlanta', 'GA', '30303', 'Professional drywall installation and finishing for commercial projects. Known for quality workmanship and meeting tight deadlines.', 7, '10-20', '45-6789013', true);
        

      WHEN 'michelle.kim@glass-glazing.com' THEN
        INSERT INTO profiles (id, email, full_name, company_name, phone, business_type, primary_trade, service_areas, website, linkedin_url, street_address, city, state, zip_code, bio, years_in_business, team_size, tin_number, is_public)
        VALUES (v_user_id, email_address, 'Michelle Kim', 'Kim Glass & Glazing', '(555) 456-7891', 'LLC', 'Glazing', ARRAY['Boston', 'Cambridge', 'Somerville'], 'https://kimglassandglazing.com', 'https://linkedin.com/in/michellekim', '3456 Boylston St', 'Boston', 'MA', '02215', 'Commercial glass and glazing contractor specializing in curtain wall systems, storefront glazing, and architectural glass installations.', 10, '10-20', '67-8901235', true);
        

      WHEN 'thomas.wright@demolition-experts.com' THEN
        INSERT INTO profiles (id, email, full_name, company_name, phone, business_type, primary_trade, service_areas, website, linkedin_url, street_address, city, state, zip_code, bio, years_in_business, team_size, tin_number, is_public)
        VALUES (v_user_id, email_address, 'Thomas Wright', 'Wright Demolition Experts', '(555) 567-8902', 'Corporation', 'Demolition', ARRAY['Chicago', 'Naperville', 'Evanston'], 'https://wrightdemolition.com', 'https://linkedin.com/in/thomaswright', '4567 S Michigan Ave', 'Chicago', 'IL', '60605', 'Licensed demolition contractor with expertise in selective demolition, structural demolition, and environmental abatement services.', 19, '20-50', '89-0123457', true);
        

      WHEN 'jessica.taylor@insulation-pro.com' THEN
        INSERT INTO profiles (id, email, full_name, company_name, phone, business_type, primary_trade, service_areas, website, linkedin_url, street_address, city, state, zip_code, bio, years_in_business, team_size, tin_number, is_public)
        VALUES (v_user_id, email_address, 'Jessica Taylor', 'Taylor Insulation Pro', '(555) 678-9013', 'LLC', 'Insulation', ARRAY['Philadelphia', 'King of Prussia', 'Cherry Hill'], 'https://taylorinsulation.com', 'https://linkedin.com/in/jessicataylor', '5678 Market Street', 'Philadelphia', 'PA', '19103', 'Commercial insulation contractor offering thermal, acoustic, and fire-rated insulation solutions. Energy efficiency experts.', 8, '5-10', '34-5678902', true);
        

      WHEN 'anthony.davis@waterproofing.com' THEN
        INSERT INTO profiles (id, email, full_name, company_name, phone, business_type, primary_trade, service_areas, website, linkedin_url, street_address, city, state, zip_code, bio, years_in_business, team_size, tin_number, is_public)
        VALUES (v_user_id, email_address, 'Anthony Davis', 'Davis Waterproofing Services', '(555) 789-0124', 'Sole Proprietorship', 'Waterproofing', ARRAY['New York', 'Brooklyn', 'Queens'], 'https://daviswaterproofing.com', 'https://linkedin.com/in/anthonydavis', '6789 Broadway', 'New York', 'NY', '10019', 'Specialized waterproofing contractor for commercial buildings. Expert in foundation waterproofing, roof membranes, and below-grade protection.', 15, '10-20', '56-7890124', true);
        

      WHEN 'nicole.johnson@elevator-services.com' THEN
        INSERT INTO profiles (id, email, full_name, company_name, phone, business_type, primary_trade, service_areas, website, linkedin_url, street_address, city, state, zip_code, bio, years_in_business, team_size, tin_number, is_public)
        VALUES (v_user_id, email_address, 'Nicole Johnson', 'Johnson Elevator Services', '(555) 890-1235', 'Corporation', 'Elevator Installation', ARRAY['Las Vegas', 'Henderson', 'Paradise'], 'https://johnsonelevator.com', 'https://linkedin.com/in/nicolejohnson', '7890 Las Vegas Blvd', 'Las Vegas', 'NV', '89101', 'Commercial elevator installation and maintenance company. Certified technicians for hydraulic and traction elevator systems.', 12, '20-50', '78-9012346', true);
        

      WHEN 'brian.white@fire-suppression.com' THEN
        INSERT INTO profiles (id, email, full_name, company_name, phone, business_type, primary_trade, service_areas, website, linkedin_url, street_address, city, state, zip_code, bio, years_in_business, team_size, tin_number, is_public)
        VALUES (v_user_id, email_address, 'Brian White', 'White Fire Suppression Systems', '(555) 901-2346', 'LLC', 'Fire Protection', ARRAY['Nashville', 'Franklin', 'Murfreesboro'], 'https://whitefiresuppression.com', 'https://linkedin.com/in/brianwhite', '8901 Music Row', 'Nashville', 'TN', '37203', 'Fire protection systems contractor specializing in sprinkler systems, fire alarms, and suppression systems for commercial buildings.', 11, '10-20', '90-1234568', true);
        

      WHEN 'stephanie.moore@excavation-services.com' THEN
        INSERT INTO profiles (id, email, full_name, company_name, phone, business_type, primary_trade, service_areas, website, linkedin_url, street_address, city, state, zip_code, bio, years_in_business, team_size, tin_number, is_public)
        VALUES (v_user_id, email_address, 'Stephanie Moore', 'Moore Excavation Services', '(555) 012-3457', 'Partnership', 'Excavation', ARRAY['Charlotte', 'Raleigh', 'Durham'], 'https://mooreexcavation.com', 'https://linkedin.com/in/stephaniemoore', '9012 Tryon Street', 'Charlotte', 'NC', '28202', 'Professional excavation and site preparation contractor. Specialized equipment for commercial developments and utility installations.', 14, '20-50', '12-3456781', true);
        

      ELSE
        -- Skip unknown emails
        NULL;
      END CASE;
    END IF;

    -- Create application for this profile (only if one doesn't exist)
    IF NOT EXISTS (SELECT 1 FROM applications WHERE applications.user_id = v_user_id) THEN
      INSERT INTO applications (user_id, status, tos_accepted, tos_accepted_at)
      VALUES (
        v_user_id,
        (CASE
          WHEN counter <= 13 THEN 'approved'
          WHEN counter <= 19 THEN 'pending'
          ELSE 'rejected'
        END)::application_status,
        true,
        NOW()
      );
    END IF;

  END LOOP;
END $$;

-- Verify the results
SELECT
  COUNT(*) as total_profiles,
  COUNT(CASE WHEN a.status = 'approved' THEN 1 END) as approved,
  COUNT(CASE WHEN a.status = 'pending' THEN 1 END) as pending,
  COUNT(CASE WHEN a.status = 'rejected' THEN 1 END) as rejected
FROM profiles p
LEFT JOIN applications a ON p.id = a.user_id
WHERE p.email LIKE '%@%construction.com'
   OR p.email LIKE '%@electric%'
   OR p.email LIKE '%@plumbing%'
   OR p.email LIKE '%@hvac%'
   OR p.email LIKE '%@carpentry%'
   OR p.email LIKE '%@roofing%'
   OR p.email LIKE '%@concrete%'
   OR p.email LIKE '%@painters%'
   OR p.email LIKE '%@masonry%'
   OR p.email LIKE '%@flooring%'
   OR p.email LIKE '%@steel%'
   OR p.email LIKE '%@landscaping%'
   OR p.email LIKE '%@drywall%'
   OR p.email LIKE '%@glass%'
   OR p.email LIKE '%@demolition%'
   OR p.email LIKE '%@insulation%'
   OR p.email LIKE '%@waterproofing%'
   OR p.email LIKE '%@elevator%'
   OR p.email LIKE '%@fire-%'
   OR p.email LIKE '%@excavation%';
