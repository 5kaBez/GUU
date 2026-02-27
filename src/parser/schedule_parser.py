import openpyxl
import pandas as pd
from pathlib import Path
from datetime import datetime
import sys

# Add parent directory to path
sys.path.insert(0, str(Path(__file__).parent.parent))

from utils import setup_logging
from database import Database
from config import DATABASE_PATH

logger = setup_logging('parser')


class ExcelParser:
    """Parser for Excel and CSV schedule files with exact column names"""
    
    # Expected column names from Excel (EXACT match)
    EXPECTED_COLUMNS = [
        'Форма обучения',
        'Уровень образования',
        'Курс',
        'Институт',
        'Направление',
        'Программа',
        'Номер группы',
        'День недели',
        'Номер пары',
        'Время пары',
        'Чётность',
        'Предмет',
        'Вид пары',
        'Преподаватель',
        'Номер аудитории',
        'Недели'
    ]
    
    # Map Excel names to DB column names (English - simple and reliable)
    COLUMN_MAPPING = {
        'Форма обучения': 'form_of_education',
        'Уровень образования': 'degree',
        'Курс': 'course',
        'Институт': 'institute',
        'Направление': 'direction',
        'Программа': 'program_name',
        'Группа': 'group_name',
        'Номер группы': 'group_number',
        'День недели': 'day_of_week',
        'Номер пары': 'lesson_number',
        'Время пары': 'lesson_time',
        'Чётность': 'week_type',
        'Предмет': 'subject',
        'Вид пары': 'lesson_type',
        'Преподаватель': 'teacher',
        'Номер аудитории': 'room_number',
        'Недели': 'weeks'
    }
    
    DAYS_OF_WEEK = {
        'понедельник': 'Понедельник',
        'вторник': 'Вторник',
        'среда': 'Среда',
        'четверг': 'Четверг',
        'пятница': 'Пятница',
        'суббота': 'Суббота',
        'воскресенье': 'Воскресенье'
    }
    
    def __init__(self, db=None):
        self.db = db or Database(DATABASE_PATH)
        # Column mapping: Excel columns we want to keep (Программа -> Группа happens in save_to_database)
        self.COLUMN_MAPPING = {
            'Форма обучения': 'Форма обучения',
            'Уровень образования': 'Уровень образования',
            'Курс': 'Курс',
            'Институт': 'Институт',
            'Направление': 'Направление',
            'Программа': 'Программа',  # Stays as-is for cleaning, renamed in save_to_database
            'Номер группы': 'Номер группы',
            'День недели': 'День недели',
            'Номер пары': 'Номер пары',
            'Время пары': 'Время пары',
            'Чётность': 'Чётность',
            'Предмет': 'Предмет',
            'Вид пары': 'Вид пары',
            'Преподаватель': 'Преподаватель',
            'Номер аудитории': 'Номер аудитории',
            'Недели': 'Недели'
        }
        logger.info("ExcelParser initialized")
        
    def parse_file(self, filepath):
        """Parse Excel or CSV file and return data"""
        try:
            filepath = Path(filepath)
            logger.info(f"Starting to parse file: {filepath}")
            
            # Determine file type and read
            if filepath.suffix.lower() == '.csv':
                df = pd.read_csv(filepath, encoding='utf-8', dtype=str)
            else:
                # Read Excel with dtype=str to prevent automatic type conversion
                df = pd.read_excel(filepath, sheet_name=0, dtype=str)
            
            logger.info(f"Loaded {len(df)} rows from {filepath}")
            logger.info(f"Columns: {list(df.columns)}")
            
            # Handle both "Группа" and "Программа" column names (some files may use one or the other)
            # If both columns exist, fill empty "Программа" from "Группа"
            if 'Группа' in df.columns and 'Программа' in df.columns:
                # Fill empty Программа values from Группа
                mask = (df['Программа'].isna()) | (df['Программа'] == '')
                df.loc[mask, 'Программа'] = df.loc[mask, 'Группа']
                logger.info(f"Filled empty 'Программа' values from 'Группа' column")
            # Rename "Группа" to "Программа" if "Программа" doesn't exist
            elif 'Группа' in df.columns and 'Программа' not in df.columns:
                df = df.rename(columns={'Группа': 'Программа'})
                logger.info("Renamed 'Группа' column to 'Программа'")
            
            # Filter to keep only columns we need (don't rename yet - _clean_data needs original names)
            # Select only columns that are in COLUMN_MAPPING
            keep_cols = [col for col in df.columns if col in self.COLUMN_MAPPING.keys()]
            if keep_cols:
                df = df[keep_cols]
            
            logger.info(f"Columns kept for processing: {list(df.columns)}")
            
            # Clean data (uses original column names from Excel)
            cleaned_df = self._clean_data(df)
            
            logger.info(f"Successfully parsed {len(cleaned_df)} valid records")
            return cleaned_df
            
        except Exception as e:
            logger.error(f"Error parsing file {filepath}: {str(e)}", exc_info=True)
            raise
    
    def _clean_data(self, df):
        """Clean and validate data - using Russian column names from DB"""
        logger.info(f"Starting data cleaning for {len(df)} rows")
        
        # Remove rows with empty critical fields
        critical_fields = ['Предмет', 'День недели', 'Номер пары']
        
        # Check which critical fields exist in df
        existing_critical = [f for f in critical_fields if f in df.columns]
        
        if existing_critical:
            before_drop = len(df)
            df = df.dropna(subset=existing_critical, how='any')
            logger.info(f"Dropped {before_drop - len(df)} rows with missing critical fields")
        
        # Ensure Программа column exists and is filled
        if 'Программа' not in df.columns:
            logger.info("Created 'Программа' column (was missing)")
            if 'Направление' in df.columns:
                df['Программа'] = df['Направление']
            else:
                df['Программа'] = '-'
        else:
            # Fill empty Программа with Направление or default
            empty_mask = (df['Программа'].isna()) | (df['Программа'] == '')
            filled_count = empty_mask.sum()
            if 'Направление' in df.columns:
                df.loc[empty_mask, 'Программа'] = df.loc[empty_mask, 'Направление']
                # Only use "-" as last resort
                still_empty = (df['Программа'].isna()) | (df['Программа'] == '')
                df.loc[still_empty, 'Программа'] = '-'
            else:
                df.loc[empty_mask, 'Программа'] = '-'
            
            # Clean up any 'nan' string values
            df.loc[df['Программа'] == 'nan', 'Программа'] = '-'
            
            logger.info(f"Filled {filled_count} missing 'Программа' values with Направление or default")
        
        # Fill optional fields with defaults
        optional_fields = ['Преподаватель', 'Номер аудитории']
        for field in optional_fields:
            if field in df.columns:
                df[field] = df[field].fillna('-').astype(str)
            else:
                df[field] = '-'
        
        # Fill form_of_education if missing
        if 'Форма обучения' in df.columns:
            df['Форма обучения'] = df['Форма обучения'].fillna('Очная').astype(str)
        else:
            df['Форма обучения'] = 'Очная'
        
        # Normalize day names
        if 'День недели' in df.columns:
            df['День недели'] = df['День недели'].astype(str).str.strip().str.lower()
            df['День недели'] = df['День недели'].map(self.DAYS_OF_WEEK)
            df = df[df['День недели'].notna()]
        
        # Convert course to integer
        if 'Курс' in df.columns:
            try:
                df['Курс'] = pd.to_numeric(df['Курс'], errors='coerce').astype('Int64')
            except Exception:
                pass
        
        # Convert lesson_number to integer
        if 'Номер пары' in df.columns:
            try:
                df['Номер пары'] = pd.to_numeric(df['Номер пары'], errors='coerce').astype('Int64')
            except Exception:
                pass
        
        logger.info(f"Data cleaning completed. Final: {len(df)} rows")
        return df
    
    def populate_hierarchy(self, df):
        """Populate institutes, programs, directions, and groups tables
        
        Hierarchy: Institute -> Program -> Direction -> Group
        """
        try:
            conn = self.db.connect()
            cursor = conn.cursor()
            
            # Get unique institutes
            institutes = df['институт'].unique() if 'институт' in df.columns else []
            inst_map = {}
            
            for inst in institutes:
                inst_str = str(inst).strip() if pd.notna(inst) else ''
                if inst_str and inst_str != 'nan':
                    try:
                        cursor.execute(
                            'INSERT OR IGNORE INTO institutes (name) VALUES (?)',
                            (inst_str,)
                        )
                        
                        result = cursor.execute(
                            'SELECT id FROM institutes WHERE name = ?',
                            (inst_str,)
                        ).fetchone()
                        if result:
                            inst_map[inst_str] = result[0]
                    except Exception as e:
                        logger.warning(f"Error inserting institute {inst_str}: {str(e)}")
            
            conn.commit()
            
            # Get unique programs per institute
            if 'институт' in df.columns and 'программа' in df.columns:
                inst_prog_pairs = df[['институт', 'программа']].drop_duplicates()
                prog_map = {}
                
                for _, row in inst_prog_pairs.iterrows():
                    inst_name = str(row['институт']).strip() if pd.notna(row['институт']) else ''
                    prog_name = str(row['программа']).strip() if pd.notna(row['программа']) else ''
                    
                    if inst_name and prog_name and inst_name != 'nan' and prog_name != 'nan':
                        try:
                            inst_id = inst_map.get(inst_name)
                            if inst_id:
                                cursor.execute(
                                    'INSERT OR IGNORE INTO programs (institute_id, name) VALUES (?, ?)',
                                    (inst_id, prog_name)
                                )
                                
                                result = cursor.execute(
                                    'SELECT id FROM programs WHERE institute_id = ? AND name = ?',
                                    (inst_id, prog_name)
                                ).fetchone()
                                if result:
                                    prog_map[(inst_name, prog_name)] = result[0]
                        except Exception as e:
                            logger.warning(f"Error with program {prog_name}: {str(e)}")
                
                conn.commit()
                
                # Get unique directions per program
                if 'направление' in df.columns:
                    dirs = df[['программа', 'направление']].drop_duplicates()
                    dir_map = {}
                    
                    for _, row in dirs.iterrows():
                        prog_name = str(row['программа']).strip() if pd.notna(row['программа']) else ''
                        dir_name = str(row['направление']).strip() if pd.notna(row['направление']) else ''
                        
                        if prog_name and dir_name and prog_name != 'nan' and dir_name != 'nan':
                            try:
                                prog_inst = df[df['программа'] == prog_name]['институт'].iloc[0]
                                prog_inst = str(prog_inst).strip() if pd.notna(prog_inst) else ''
                                
                                prog_id = prog_map.get((prog_inst, prog_name))
                                if prog_id:
                                    cursor.execute(
                                        'INSERT OR IGNORE INTO directions (program_id, name) VALUES (?, ?)',
                                        (prog_id, dir_name)
                                    )
                                    
                                    result = cursor.execute(
                                        'SELECT id FROM directions WHERE program_id = ? AND name = ?',
                                        (prog_id, dir_name)
                                    ).fetchone()
                                    if result:
                                        dir_map[(prog_name, dir_name)] = result[0]
                            except Exception as e:
                                logger.warning(f"Error with direction {dir_name}: {str(e)}")
                    
                    conn.commit()
                    
                    # Get unique groups per direction
                    if 'группа' in df.columns:
                        groups = df[['направление', 'группа', 'курс', 'форма_обучения']].drop_duplicates()
                        
                        for _, row in groups.iterrows():
                            dir_name = str(row['направление']).strip() if pd.notna(row['направление']) else ''
                            group_name = str(row['группа']).strip() if pd.notna(row['группа']) else ''
                            course = row['курс']
                            form = str(row['форма_обучения']).strip() if pd.notna(row['форма_обучения']) else 'Очная'
                            
                            if dir_name and group_name and dir_name != 'nan' and group_name != 'nan':
                                try:
                                    prog_name = df[df['направление'] == dir_name]['программа'].iloc[0]
                                    prog_name = str(prog_name).strip() if pd.notna(prog_name) else ''
                                    
                                    dir_id = dir_map.get((prog_name, dir_name))
                                    if dir_id:
                                        if hasattr(course, 'item'):
                                            course_val = int(course.item())
                                        elif pd.notna(course):
                                            course_val = int(course)
                                        else:
                                            course_val = 1
                                        
                                        cursor.execute(
                                            'INSERT OR IGNORE INTO groups (direction_id, name, course, form_of_education) VALUES (?, ?, ?, ?)',
                                            (dir_id, group_name, course_val, form)
                                        )
                                except Exception as e:
                                    logger.warning(f"Error with group {group_name}: {str(e)}")
            
            conn.commit()
            conn.close()
            
            logger.info("✅ Successfully populated hierarchy tables")
            return True
            
        except Exception as e:
            logger.error(f"❌ Error populating hierarchy tables: {str(e)}", exc_info=True)
            return False
    
    def save_to_database(self, df, mode='replace', admin_user_id=None):
        """Save parsed data to database - using Russian column names"""
        try:
            conn = self.db.connect()
            cursor = conn.cursor()
            
            records_added = 0
            records_failed = 0
            
            if mode == 'replace':
                logger.info("Clearing existing schedule records")
                cursor.execute('DELETE FROM schedule')
                conn.commit()
            
            # Get all columns from DataFrame
            available_cols = list(df.columns)
            
            # Database columns in correct order (EXACT Russian names for DB)
            all_db_cols = [
                'Форма обучения',
                'Уровень образования',
                'Курс',
                'Институт',
                'Направление',
                'Программа',  # Excel "Программа" -> DB "Программа"
                'Номер группы',
                'День недели',
                'Номер пары',
                'Время пары',
                'Чётность',
                'Предмет',
                'Вид пары',
                'Преподаватель',
                'Номер аудитории',
                'Недели'
            ]
            
            # Excel column names that will be read and mapped to DB columns
            # This mapping determines which Excel column to read for each DB column
            excel_col_mapping = {
                'Форма обучения': 'Форма обучения',
                'Уровень образования': 'Уровень образования',
                'Курс': 'Курс',
                'Институт': 'Институт',
                'Направление': 'Направление',
                'Программа': 'Программа',  # DB col "Программа" reads from Excel col "Программа"
                'Номер группы': 'Номер группы',
                'День недели': 'День недели',
                'Номер пары': 'Номер пары',
                'Время пары': 'Время пары',
                'Чётность': 'Чётность',
                'Предмет': 'Предмет',
                'Вид пары': 'Вид пары',
                'Преподаватель': 'Преподаватель',
                'Номер аудитории': 'Номер аудитории',
                'Недели': 'Недели'
            }
            
            # Build column list with proper quoting for Russian names
            cols_sql = ','.join([f'"{col}"' for col in all_db_cols])
            placeholders = ','.join(['?' for _ in all_db_cols])
            
            insert_query = f'''
                INSERT INTO schedule ({cols_sql})
                VALUES ({placeholders})
            '''
            
            logger.info(f"Saving {len(all_db_cols)} columns to database")
            
            for idx, (_, row) in enumerate(df.iterrows()):
                try:
                    values = []
                    # Build values in the exact order of all_db_cols
                    for db_col in all_db_cols:
                        # Find the Excel column name that maps to this DB column
                        excel_col = excel_col_mapping.get(db_col, db_col)
                        
                        if excel_col in available_cols:
                            val = row[excel_col] if excel_col in row.index else None
                            
                            if hasattr(val, 'item'):
                                val = val.item()
                            elif pd.isna(val):
                                val = None
                            elif db_col in ['Курс', 'Номер пары']:
                                try:
                                    val = int(val) if pd.notna(val) else None
                                except:
                                    val = None
                        else:
                            # Column not in DataFrame, use None
                            val = None
                        
                        values.append(val)
                    
                    values = tuple(values)
                    cursor.execute(insert_query, values)
                    records_added += 1
                    
                    if (idx + 1) % 500 == 0:
                        logger.info(f"Processed {idx + 1} records")
                    
                except Exception as e:
                    records_failed += 1
                    if records_failed <= 5:
                        logger.warning(f"Failed to insert row: {str(e)}")
            
            conn.commit()
            conn.close()
            
            logger.info(f"Import completed: {records_added} added, {records_failed} failed")
            return {
                'success': True,
                'records_added': records_added,
                'records_failed': records_failed
            }
            
        except Exception as e:
            logger.error(f"Error saving to database: {str(e)}")
            raise


if __name__ == '__main__':
    parser = ExcelParser()
    print("Parser module ready for import")
