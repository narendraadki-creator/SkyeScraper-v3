# Units Module Test Guide

## Overview
The Units Module implements dynamic schema support for unit management with Excel/PDF import functionality. This guide covers testing the complete units workflow.

## Test Environment Setup

### Prerequisites
1. ✅ Database migrations completed (001-008)
2. ✅ Authentication working
3. ✅ Projects module working
4. ✅ At least one project created

### Access Points
- **Units Page**: `/projects/{projectId}/units`
- **From Project Details**: Click "Manage Units" button

## Test Scenarios

### 1. Upload Excel with Custom Columns

#### Test Data Preparation
Create a test Excel file with the following columns:
```
unit_number | floor | area_sqft | bedrooms | bathrooms | price | type | discount_20 | discount_15 | payment_plan | view | balcony | status
A-101      | 1     | 1200      | 2        | 2         | 850000| Apartment | 680000 | 722500 | 60% DC / 40% PHPP | Business Bay | Yes | Available
A-102      | 1     | 1350      | 3        | 2         | 950000| Apartment | 760000 | 807500 | 60% DC / 40% PHPP | Business Bay | Yes | Available
B-201      | 2     | 1500      | 3        | 3         | 1100000| Apartment | 880000 | 935000 | 60% DC / 40% PHPP | Business Bay | Yes | Sold
```

#### Test Steps
1. **Navigate to Units Page**
   - Go to a project details page
   - Click "Manage Units" button
   - Verify URL: `/projects/{projectId}/units`

2. **Start Import Process**
   - Click "Import Units" button
   - Verify import modal opens

3. **Upload File**
   - Drag and drop Excel file or click "Choose File"
   - Verify file is accepted (Excel/CSV only)
   - Check console for processing logs

4. **Review Detected Columns**
   - Verify all columns are detected
   - Check sample data preview
   - Verify suggested mappings

5. **Confirm Mapping**
   - Review auto-mapped columns:
     - `unit_number` → Unit Number
     - `floor` → Floor Number
     - `area_sqft` → Area (sqft)
     - `bedrooms` → Bedrooms
     - `bathrooms` → Bathrooms
     - `price` → Price
     - `type` → Unit Type
     - `status` → Status
   - Verify custom fields mapped to `custom_fields.*`:
     - `discount_20` → Custom: discount_20
     - `discount_15` → Custom: discount_15
     - `payment_plan` → Custom: payment_plan
     - `view` → Custom: view
     - `balcony` → Custom: balcony

6. **Preview Import**
   - Review sample data (first 5 rows)
   - Verify data types are correct
   - Check import strategy options
   - Confirm total rows and valid rows

7. **Start Import**
   - Click "Start Import"
   - Monitor progress
   - Verify success message

### 2. View Units List

#### Test Steps
1. **Verify Units Display**
   - Check units table loads
   - Verify standard columns: Unit Number, Type, Floor, Area, Bedrooms, Bathrooms, Price, Status
   - Verify custom columns: discount_20, discount_15, payment_plan, view, balcony

2. **Test Filtering**
   - Filter by status: Available, Held, Sold, Reserved
   - Filter by unit type: Apartment, Villa, etc.
   - Filter by floor number
   - Search by unit number

3. **Test Sorting**
   - Click column headers to sort
   - Verify ascending/descending works
   - Test sorting on custom fields

4. **Test Selection**
   - Select individual units
   - Select all units
   - Verify bulk actions appear

### 3. Verify Database Storage

#### Database Verification
1. **Check Units Table**
   ```sql
   SELECT 
     unit_number, 
     unit_type, 
     floor_number, 
     area_sqft, 
     bedrooms, 
     bathrooms, 
     price, 
     status,
     custom_fields
   FROM units 
   WHERE project_id = 'your-project-id'
   ORDER BY unit_number;
   ```

2. **Verify Custom Fields**
   - Check `custom_fields` JSONB column contains:
     ```json
     {
       "discount_20": 680000,
       "discount_15": 722500,
       "payment_plan": "60% DC / 40% PHPP",
       "view": "Business Bay",
       "balcony": "Yes"
     }
     ```

3. **Check Import History**
   ```sql
   SELECT 
     source_file_name,
     import_type,
     total_rows,
     units_created,
     units_updated,
     version_number,
     processing_status
   FROM unit_imports 
   WHERE project_id = 'your-project-id'
   ORDER BY imported_at DESC;
   ```

### 4. Update Units (New Excel)

#### Test Steps
1. **Create Updated Excel File**
   - Modify existing data
   - Add new units
   - Change some prices/statuses

2. **Import New File**
   - Upload updated Excel
   - Choose "Merge with Existing" strategy
   - Verify version_number increments
   - Check old data preserved

3. **Verify Updates**
   - Check units table for changes
   - Verify new units added
   - Confirm existing units updated
   - Check import history shows new version

## Expected Results

### ✅ Success Criteria
1. **File Upload**: Excel/CSV files accepted, PDF rejected
2. **Column Detection**: All columns detected correctly
3. **Auto-Mapping**: Standard fields auto-mapped, custom fields to JSONB
4. **Data Preview**: Sample data shown correctly
5. **Import Process**: Units created/updated successfully
6. **Database Storage**: 
   - Standard fields in dedicated columns
   - Custom fields in `custom_fields` JSONB
   - Import version tracking
7. **UI Display**: 
   - Dynamic table with custom columns
   - Filtering and sorting works
   - Custom field values displayed correctly

### ❌ Error Scenarios
1. **Invalid File Type**: Should show error for non-Excel/CSV files
2. **Missing Required Fields**: Should handle missing unit_number
3. **Data Type Errors**: Should handle invalid numbers/dates
4. **Duplicate Units**: Should handle based on import strategy

## Troubleshooting

### Common Issues
1. **File Not Processing**: Check browser console for errors
2. **Columns Not Detected**: Verify Excel file format
3. **Import Fails**: Check database connection and RLS policies
4. **Custom Fields Not Showing**: Verify column mapping to `custom_fields.*`

### Debug Commands
```sql
-- Check units with custom fields
SELECT unit_number, custom_fields 
FROM units 
WHERE custom_fields IS NOT NULL;

-- Check import history
SELECT * FROM unit_imports 
ORDER BY imported_at DESC 
LIMIT 5;

-- Check for import errors
SELECT errors FROM unit_imports 
WHERE errors IS NOT NULL AND jsonb_array_length(errors) > 0;
```

## Performance Notes
- Large files (1000+ rows) may take time to process
- Import progress should be shown
- Database indexes on `project_id` and `unit_number` for performance

## Security Notes
- File uploads validated for type and size
- RLS policies ensure organization isolation
- Import history tracks who imported what
- Version control prevents data loss
