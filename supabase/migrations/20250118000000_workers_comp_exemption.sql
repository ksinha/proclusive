-- Workers' Compensation Exemption Support
-- Add support for sole proprietor exemption from workers' comp requirements

-- Add workers_comp_exempt_sole_prop column to applications table
ALTER TABLE applications
ADD COLUMN workers_comp_exempt_sole_prop BOOLEAN DEFAULT FALSE;

-- Add comment to document the column
COMMENT ON COLUMN applications.workers_comp_exempt_sole_prop IS
'Indicates if the applicant is a sole proprietor without employees and exempt from workers compensation requirements. When TRUE, workers comp documentation is optional.';
