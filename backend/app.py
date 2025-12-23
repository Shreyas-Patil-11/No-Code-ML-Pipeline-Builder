


from flask import Flask, request, jsonify
from flask_cors import CORS
import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split, cross_val_score
from sklearn.preprocessing import StandardScaler, MinMaxScaler, LabelEncoder, RobustScaler
from sklearn.linear_model import LogisticRegression
from sklearn.tree import DecisionTreeClassifier
from sklearn.ensemble import RandomForestClassifier, GradientBoostingClassifier
from sklearn.svm import SVC
from sklearn.neighbors import KNeighborsClassifier
from sklearn.metrics import (
    accuracy_score, precision_score, recall_score, f1_score, 
    confusion_matrix, classification_report
)
import io
import base64
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
import seaborn as sns
import warnings
import traceback

warnings.filterwarnings('ignore')

app = Flask(__name__)
CORS(app)


def convert_to_serializable(obj):
    """Recursively convert numpy types to Python native types"""
    if obj is None:
        return None
    elif isinstance(obj, dict):
        return {str(key): convert_to_serializable(value) for key, value in obj.items()}
    elif isinstance(obj, (list, tuple)):
        return [convert_to_serializable(item) for item in obj]
    elif isinstance(obj, np.integer):
        return int(obj)
    elif isinstance(obj, np.floating):
        if np.isnan(obj) or np.isinf(obj):
            return None
        return float(obj)
    elif isinstance(obj, np.bool_):
        return bool(obj)
    elif isinstance(obj, np.ndarray):
        return [convert_to_serializable(item) for item in obj.tolist()]
    elif isinstance(obj, (pd.Timestamp, pd.Timedelta)):
        return str(obj)
    elif isinstance(obj, float):
        if np.isnan(obj) or np.isinf(obj):
            return None
        return float(obj)
    elif isinstance(obj, bool):
        return bool(obj)
    elif isinstance(obj, int):
        return int(obj)
    elif isinstance(obj, str):
        return str(obj)
    elif pd.isna(obj):
        return None
    else:
        try:
            return str(obj)
        except:
            return None


def safe_jsonify(data):
    """Safely convert data to JSON-serializable format"""
    try:
        converted = convert_to_serializable(data)
        return jsonify(converted)
    except Exception as e:
        print(f"JSON serialization error: {e}")
        traceback.print_exc()
        return jsonify({'error': f'Serialization error: {str(e)}'}), 500


# Global storage for session data
session_data = {}


def reset_session():
    """Reset all session data"""
    global session_data
    session_data = {
        'original_df': None,
        'processed_df': None,
        'X_train': None,
        'X_test': None,
        'y_train': None,
        'y_test': None,
        'target_column': None,
        'feature_columns': None,
        'scaler': None,
        'model': None,
        'label_encoder': None,
        'feature_encoders': {}
    }


# Initialize session
reset_session()


def detect_column_type(series):
    """Detect the semantic type of a column"""
    try:
        non_null = series.dropna()
        
        if len(non_null) == 0:
            return 'empty'
        
        if pd.api.types.is_numeric_dtype(series):
            unique_count = non_null.nunique()
            if unique_count <= 10 and unique_count < len(non_null) * 0.05:
                return 'categorical_numeric'
            return 'numeric'
        
        if pd.api.types.is_datetime64_any_dtype(series):
            return 'datetime'
        
        if series.dtype == 'object' or str(series.dtype) == 'category':
            unique_count = non_null.nunique()
            
            try:
                numeric_series = pd.to_numeric(non_null, errors='coerce')
                valid_numeric = numeric_series.notna().sum()
                if valid_numeric / len(non_null) > 0.8:
                    return 'numeric_string'
            except:
                pass
            
            if unique_count <= 50 or unique_count / len(non_null) < 0.5:
                return 'categorical'
            
            return 'text'
        
        return 'unknown'
    except Exception as e:
        print(f"Error detecting column type: {e}")
        return 'unknown'


def ensure_integer_labels(y):
    """Ensure labels are integers for classification"""
    y = np.array(y)
    
    # If already integer type, return as is
    if np.issubdtype(y.dtype, np.integer):
        return y.astype(int)
    
    # If float, check if they are whole numbers
    if np.issubdtype(y.dtype, np.floating):
        # Check if all values are whole numbers
        if np.all(np.equal(np.mod(y, 1), 0)):
            return y.astype(int)
        else:
            # Not whole numbers - need to encode
            unique_vals = np.unique(y)
            mapping = {val: idx for idx, val in enumerate(unique_vals)}
            return np.array([mapping[val] for val in y], dtype=int)
    
    # For other types, use label encoding
    le = LabelEncoder()
    return le.fit_transform(y.astype(str))


@app.route('/api/upload', methods=['POST'])
def upload_file():
    try:
        reset_session()
        
        if 'file' not in request.files:
            return safe_jsonify({'error': 'No file provided.'}), 400
        
        file = request.files['file']
        
        if file.filename == '':
            return safe_jsonify({'error': 'No file selected.'}), 400
        
        filename = file.filename.lower()
        
        valid_extensions = ['.csv', '.xlsx', '.xls']
        if not any(filename.endswith(ext) for ext in valid_extensions):
            return safe_jsonify({'error': 'Unsupported file format. Use CSV or Excel.'}), 400
        
        try:
            file.seek(0)
            
            if filename.endswith('.csv'):
                encodings = ['utf-8', 'latin-1', 'cp1252', 'iso-8859-1']
                df = None
                
                for encoding in encodings:
                    try:
                        file.seek(0)
                        df = pd.read_csv(file, encoding=encoding, low_memory=False)
                        break
                    except:
                        continue
                
                if df is None:
                    file.seek(0)
                    df = pd.read_csv(file, encoding='utf-8', errors='ignore', low_memory=False)
            else:
                df = pd.read_excel(file, engine='openpyxl')
                
        except Exception as e:
            return safe_jsonify({'error': f'Error reading file: {str(e)}'}), 400
        
        if df is None or df.empty:
            return safe_jsonify({'error': 'The file is empty or could not be read.'}), 400
        
        # Clean data
        df.columns = df.columns.astype(str).str.strip()
        df = df.dropna(axis=1, how='all')
        df = df.loc[:, ~df.columns.duplicated()]
        
        session_data['original_df'] = df.copy()
        
        # Analyze columns
        column_info = []
        for col in df.columns:
            try:
                col_type = detect_column_type(df[col])
                null_count = int(df[col].isnull().sum())
                null_percent = round(float(null_count / len(df) * 100), 1)
                unique_count = int(df[col].nunique())
                
                is_numeric = col_type in ['numeric', 'numeric_string', 'categorical_numeric']
                is_usable = col_type not in ['empty', 'text', 'datetime', 'unknown']
                
                sample_values = []
                for val in df[col].dropna().head(3).tolist():
                    sample_values.append(convert_to_serializable(val))
                
                column_info.append({
                    'name': str(col),
                    'type': str(col_type),
                    'dtype': str(df[col].dtype),
                    'nullCount': null_count,
                    'nullPercent': null_percent,
                    'uniqueCount': unique_count,
                    'isNumeric': bool(is_numeric),
                    'isUsable': bool(is_usable),
                    'sampleValues': sample_values
                })
            except Exception as e:
                print(f"Error processing column {col}: {e}")
                continue
        
        # Sample data
        sample_data = []
        for _, row in df.head(10).iterrows():
            row_dict = {str(col): convert_to_serializable(row[col]) for col in df.columns}
            sample_data.append(row_dict)
        
        total_nulls = int(df.isnull().sum().sum())
        total_cells = int(df.shape[0] * df.shape[1])
        
        return safe_jsonify({
            'success': True,
            'filename': str(file.filename),
            'rows': int(len(df)),
            'columns': int(len(df.columns)),
            'columnInfo': column_info,
            'sampleData': sample_data,
            'dataQuality': {
                'totalNulls': total_nulls,
                'totalCells': total_cells,
                'completeness': round(float((1 - total_nulls / total_cells) * 100), 1) if total_cells > 0 else 0.0,
                'numericColumns': int(sum(1 for c in column_info if c.get('isNumeric', False))),
                'categoricalColumns': int(sum(1 for c in column_info if c.get('type') == 'categorical')),
                'usableColumns': int(sum(1 for c in column_info if c.get('isUsable', False)))
            }
        })
        
    except Exception as e:
        traceback.print_exc()
        return safe_jsonify({'error': f'Upload error: {str(e)}'}), 500


@app.route('/api/preprocess', methods=['POST'])
def preprocess_data():
    try:
        if session_data.get('original_df') is None:
            return safe_jsonify({'error': 'No data uploaded. Please upload a file first.'}), 400
        
        data = request.json or {}
        scaling_method = data.get('scalingMethod', 'standard')
        handle_missing = data.get('handleMissing', 'auto')
        selected_features = data.get('selectedFeatures', [])
        target_column = data.get('targetColumn', None)
        auto_select = data.get('autoSelect', False)
        
        df = session_data['original_df'].copy()
        
        # Auto-select target if not provided
        if not target_column:
            potential_targets = ['target', 'label', 'class', 'y', 'output', 'result', 'species']
            for pt in potential_targets:
                matching = [c for c in df.columns if pt in c.lower()]
                if matching:
                    target_column = matching[0]
                    break
            if not target_column:
                target_column = df.columns[-1]
        
        if target_column not in df.columns:
            return safe_jsonify({'error': f'Target column "{target_column}" not found.'}), 400
        
        # Auto-select features
        if auto_select or not selected_features:
            selected_features = []
            for col in df.columns:
                if col == target_column:
                    continue
                col_type = detect_column_type(df[col])
                if col_type in ['numeric', 'numeric_string', 'categorical_numeric', 'categorical']:
                    selected_features.append(col)
        
        selected_features = [f for f in selected_features if f != target_column and f in df.columns]
        
        if not selected_features:
            return safe_jsonify({'error': 'No suitable feature columns found.'}), 400
        
        # Handle missing target values
        target_series = df[target_column].copy()
        valid_indices = target_series.notna()
        df = df[valid_indices].reset_index(drop=True)
        target_series = df[target_column].copy()
        
        if len(df) == 0:
            return safe_jsonify({'error': 'No valid data remaining.'}), 400
        
        # Encode target - ALWAYS encode as integers for classification
        le = LabelEncoder()
        target_encoded = le.fit_transform(target_series.astype(str))
        session_data['label_encoder'] = le
        
        # Ensure integer type
        target_encoded = target_encoded.astype(int)
        
        # Check classes
        unique_classes, class_counts = np.unique(target_encoded, return_counts=True)
        n_classes = len(unique_classes)
        
        if n_classes < 2:
            return safe_jsonify({'error': 'Target must have at least 2 classes.'}), 400
        
        # Process features
        processed_features = pd.DataFrame()
        feature_encoders = {}
        
        for col in selected_features:
            if col not in df.columns:
                continue
            
            col_type = detect_column_type(df[col])
            series = df[col].copy()
            
            try:
                if col_type in ['numeric', 'numeric_string']:
                    series = pd.to_numeric(series, errors='coerce')
                    fill_val = series.mean() if series.notna().sum() > 0 else 0
                    series = series.fillna(fill_val)
                    processed_features[col] = series
                    
                elif col_type in ['categorical', 'categorical_numeric']:
                    series = series.fillna('Unknown').astype(str)
                    le_feat = LabelEncoder()
                    processed_features[col] = le_feat.fit_transform(series)
                    feature_encoders[col] = le_feat
            except Exception as e:
                print(f"Warning: Could not process {col}: {e}")
                continue
        
        session_data['feature_encoders'] = feature_encoders
        
        if processed_features.empty:
            return safe_jsonify({'error': 'No features could be processed.'}), 400
        
        # Handle remaining NaN
        for col in processed_features.columns:
            if processed_features[col].isnull().any():
                fill_val = processed_features[col].mean()
                if pd.isna(fill_val):
                    fill_val = 0
                processed_features[col] = processed_features[col].fillna(fill_val)
        
        # Ensure same length
        min_len = min(len(processed_features), len(target_encoded))
        processed_features = processed_features.iloc[:min_len].reset_index(drop=True)
        target_encoded = target_encoded[:min_len]
        
        if len(processed_features) < 10:
            return safe_jsonify({'error': f'Not enough samples ({len(processed_features)}). Need at least 10.'}), 400
        
        # Re-check classes
        unique_classes, class_counts = np.unique(target_encoded, return_counts=True)
        n_classes = len(unique_classes)
        min_class_count = int(class_counts.min())
        
        if min_class_count < 2:
            return safe_jsonify({'error': 'Some classes have fewer than 2 samples.'}), 400
        
        # Apply scaling
        X = processed_features.values.astype(float)
        X = np.nan_to_num(X, nan=0.0, posinf=1e10, neginf=-1e10)
        
        if scaling_method == 'standard':
            scaler = StandardScaler()
            X_scaled = scaler.fit_transform(X)
        elif scaling_method == 'minmax':
            scaler = MinMaxScaler()
            X_scaled = scaler.fit_transform(X)
        elif scaling_method == 'robust':
            scaler = RobustScaler()
            X_scaled = scaler.fit_transform(X)
        else:
            X_scaled = X
            scaler = None
        
        session_data['scaler'] = scaler
        
        # Create processed dataframe - store target as INTEGER
        processed_df = pd.DataFrame(X_scaled, columns=processed_features.columns)
        processed_df['__target__'] = target_encoded.astype(int)
        
        session_data['processed_df'] = processed_df
        session_data['target_column'] = '__target__'
        session_data['feature_columns'] = list(processed_features.columns)
        
        # Prepare response
        sample_data = []
        for i in range(min(10, len(processed_df))):
            row = processed_df.iloc[i]
            row_dict = {str(col): convert_to_serializable(row[col]) for col in processed_df.columns}
            sample_data.append(row_dict)
        
        class_distribution = {str(int(k)): int(v) for k, v in zip(unique_classes, class_counts)}
        
        class_labels = {}
        if session_data['label_encoder'] is not None:
            for i, label in enumerate(session_data['label_encoder'].classes_):
                class_labels[str(i)] = str(label)
        
        max_count = int(class_counts.max())
        min_count = int(class_counts.min())
        is_balanced = bool((max_count / min_count) < 3) if min_count > 0 else False
        
        return safe_jsonify({
            'success': True,
            'scalingMethod': str(scaling_method),
            'handleMissing': str(handle_missing),
            'rowsAfterProcessing': int(len(processed_df)),
            'rowsRemoved': int(len(session_data['original_df']) - len(processed_df)),
            'featuresUsed': [str(f) for f in processed_features.columns],
            'featuresCount': int(len(processed_features.columns)),
            'targetColumn': str(target_column),
            'sampleData': sample_data,
            'classDistribution': class_distribution,
            'classLabels': class_labels,
            'numClasses': int(n_classes),
            'minClassCount': int(min_class_count),
            'isBalanced': is_balanced
        })
        
    except Exception as e:
        traceback.print_exc()
        return safe_jsonify({'error': f'Preprocessing error: {str(e)}'}), 500


@app.route('/api/split', methods=['POST'])
def split_data():
    try:
        if session_data.get('processed_df') is None:
            return safe_jsonify({'error': 'No processed data. Please preprocess first.'}), 400
        
        data = request.json or {}
        split_ratio = float(data.get('splitRatio', 0.8))
        random_state = int(data.get('randomState', 42))
        
        if split_ratio <= 0.1 or split_ratio >= 0.99:
            return safe_jsonify({'error': 'Split ratio must be between 0.1 and 0.99'}), 400
        
        df = session_data['processed_df']
        target_col = session_data['target_column']
        feature_cols = session_data['feature_columns']
        
        X = df[feature_cols].values.astype(float)
        # IMPORTANT: Ensure y is integer for classification
        y = df[target_col].values.astype(int)
        
        n_samples = len(X)
        
        if n_samples < 4:
            return safe_jsonify({'error': 'Not enough samples for splitting.'}), 400
        
        # Check stratification
        unique_classes, class_counts = np.unique(y, return_counts=True)
        n_classes = len(unique_classes)
        min_class_count = int(class_counts.min())
        
        min_samples_needed = max(2, int(np.ceil(2 / (1 - split_ratio))))
        can_stratify = min_class_count >= min_samples_needed
        
        warnings_list = []
        
        try:
            if can_stratify and n_classes > 1:
                X_train, X_test, y_train, y_test = train_test_split(
                    X, y, train_size=split_ratio, random_state=random_state, stratify=y
                )
                stratified = True
            else:
                X_train, X_test, y_train, y_test = train_test_split(
                    X, y, train_size=split_ratio, random_state=random_state
                )
                stratified = False
                if not can_stratify:
                    warnings_list.append(f"Stratification disabled: minimum class has {min_class_count} samples.")
        except ValueError as e:
            X_train, X_test, y_train, y_test = train_test_split(
                X, y, train_size=split_ratio, random_state=random_state
            )
            stratified = False
            warnings_list.append(f"Used random split: {str(e)}")
        
        # IMPORTANT: Store as integers
        session_data['X_train'] = X_train.astype(float)
        session_data['X_test'] = X_test.astype(float)
        session_data['y_train'] = y_train.astype(int)
        session_data['y_test'] = y_test.astype(int)
        
        # Distributions
        train_unique, train_counts = np.unique(y_train, return_counts=True)
        test_unique, test_counts = np.unique(y_test, return_counts=True)
        
        train_dist = {str(int(k)): int(v) for k, v in zip(train_unique, train_counts)}
        test_dist = {str(int(k)): int(v) for k, v in zip(test_unique, test_counts)}
        
        class_labels = {}
        if session_data.get('label_encoder') is not None:
            for i, label in enumerate(session_data['label_encoder'].classes_):
                class_labels[str(i)] = str(label)
        
        return safe_jsonify({
            'success': True,
            'trainSize': int(len(X_train)),
            'testSize': int(len(X_test)),
            'totalSize': int(n_samples),
            'splitRatio': float(split_ratio),
            'trainDistribution': train_dist,
            'testDistribution': test_dist,
            'classLabels': class_labels,
            'features': [str(f) for f in feature_cols],
            'numFeatures': int(len(feature_cols)),
            'stratified': bool(stratified),
            'warnings': warnings_list if warnings_list else None
        })
        
    except Exception as e:
        traceback.print_exc()
        return safe_jsonify({'error': f'Split error: {str(e)}'}), 500


@app.route('/api/train', methods=['POST'])
def train_model():
    try:
        print("=" * 50)
        print("TRAIN REQUEST RECEIVED")
        print("=" * 50)
        
        # Check if data exists
        if session_data.get('X_train') is None:
            print("ERROR: No training data available")
            return safe_jsonify({'error': 'No training data available. Please split the data first.'}), 400
        
        data = request.json or {}
        model_type = data.get('modelType', 'logistic_regression')
        model_params = data.get('params', {})
        
        print(f"Model type: {model_type}")
        print(f"Model params: {model_params}")
        
        X_train = session_data['X_train'].astype(float)
        X_test = session_data['X_test'].astype(float)
        # CRITICAL: Ensure y is integer for classification
        y_train = session_data['y_train'].astype(int)
        y_test = session_data['y_test'].astype(int)
        
        print(f"X_train shape: {X_train.shape}, dtype: {X_train.dtype}")
        print(f"y_train shape: {y_train.shape}, dtype: {y_train.dtype}")
        print(f"y_train unique values: {np.unique(y_train)}")
        
        # Validate data
        if len(X_train) < 2:
            return safe_jsonify({'error': 'Not enough training samples.'}), 400
        
        if len(X_test) < 1:
            return safe_jsonify({'error': 'Not enough test samples.'}), 400
        
        # Clean X data
        X_train = np.nan_to_num(X_train, nan=0.0, posinf=1e10, neginf=-1e10)
        X_test = np.nan_to_num(X_test, nan=0.0, posinf=1e10, neginf=-1e10)
        
        n_classes = len(np.unique(y_train))
        print(f"Number of classes: {n_classes}")
        
        # Create model
        try:
            if model_type == 'logistic_regression':
                max_iter = int(model_params.get('maxIter', 1000))
                C = float(model_params.get('C', 1.0))
                max_iter = max(100, min(max_iter, 5000))
                C = max(0.001, min(C, 100))
                
                model = LogisticRegression(
                    max_iter=max_iter, C=C, random_state=42,
                    solver='lbfgs', multi_class='auto', n_jobs=-1
                )
                model_display_name = "Logistic Regression"
                
            elif model_type == 'decision_tree':
                max_depth = model_params.get('maxDepth')
                min_samples_split = int(model_params.get('minSamplesSplit', 2))
                
                if max_depth is not None and str(max_depth).strip() not in ['', 'null', 'None']:
                    max_depth = max(1, min(int(max_depth), 30))
                else:
                    max_depth = None
                min_samples_split = max(2, min(min_samples_split, max(2, len(X_train) // 4)))
                
                model = DecisionTreeClassifier(
                    max_depth=max_depth, min_samples_split=min_samples_split, random_state=42
                )
                model_display_name = "Decision Tree"
                
            elif model_type == 'random_forest':
                n_estimators = int(model_params.get('nEstimators', 100))
                max_depth = model_params.get('maxDepth')
                
                n_estimators = max(10, min(n_estimators, 500))
                if max_depth is not None and str(max_depth).strip() not in ['', 'null', 'None']:
                    max_depth = max(1, min(int(max_depth), 30))
                else:
                    max_depth = None
                
                model = RandomForestClassifier(
                    n_estimators=n_estimators, max_depth=max_depth, random_state=42, n_jobs=-1
                )
                model_display_name = "Random Forest"
                
            elif model_type == 'gradient_boosting':
                n_estimators = int(model_params.get('nEstimators', 100))
                learning_rate = float(model_params.get('learningRate', 0.1))
                
                n_estimators = max(10, min(n_estimators, 500))
                learning_rate = max(0.01, min(learning_rate, 1.0))
                
                model = GradientBoostingClassifier(
                    n_estimators=n_estimators, learning_rate=learning_rate, random_state=42
                )
                model_display_name = "Gradient Boosting"
                
            elif model_type == 'svm':
                C = float(model_params.get('C', 1.0))
                kernel = str(model_params.get('kernel', 'rbf'))
                
                C = max(0.001, min(C, 100))
                if kernel not in ['linear', 'rbf', 'poly']:
                    kernel = 'rbf'
                
                model = SVC(C=C, kernel=kernel, random_state=42, probability=True)
                model_display_name = "Support Vector Machine"
                
            elif model_type == 'knn':
                n_neighbors = int(model_params.get('nNeighbors', 5))
                n_neighbors = max(1, min(n_neighbors, min(50, len(X_train) - 1)))
                
                model = KNeighborsClassifier(n_neighbors=n_neighbors, n_jobs=-1)
                model_display_name = "K-Nearest Neighbors"
                
            else:
                print(f"ERROR: Unknown model type: {model_type}")
                return safe_jsonify({'error': f'Unknown model type: {model_type}'}), 400
                
        except Exception as e:
            print(f"ERROR creating model: {e}")
            traceback.print_exc()
            return safe_jsonify({'error': f'Error creating model: {str(e)}'}), 400
        
        # Train model
        print(f"Training {model_display_name}...")
        try:
            model.fit(X_train, y_train)
            print("Training complete!")
        except Exception as e:
            print(f"ERROR training model: {e}")
            traceback.print_exc()
            return safe_jsonify({'error': f'Training failed: {str(e)}'}), 400
        
        session_data['model'] = model
        
        # Predictions
        y_pred_train = model.predict(X_train)
        y_pred_test = model.predict(X_test)
        
        # Metrics
        train_accuracy = float(accuracy_score(y_train, y_pred_train))
        test_accuracy = float(accuracy_score(y_test, y_pred_test))
        
        print(f"Train accuracy: {train_accuracy:.4f}")
        print(f"Test accuracy: {test_accuracy:.4f}")
        
        # Precision, recall, F1
        try:
            if n_classes == 2:
                unique_labels = np.unique(y_test)
                pos_label = int(unique_labels[1]) if len(unique_labels) > 1 else int(unique_labels[0])
                precision = float(precision_score(y_test, y_pred_test, pos_label=pos_label, zero_division=0))
                recall = float(recall_score(y_test, y_pred_test, pos_label=pos_label, zero_division=0))
                f1 = float(f1_score(y_test, y_pred_test, pos_label=pos_label, zero_division=0))
            else:
                precision = float(precision_score(y_test, y_pred_test, average='weighted', zero_division=0))
                recall = float(recall_score(y_test, y_pred_test, average='weighted', zero_division=0))
                f1 = float(f1_score(y_test, y_pred_test, average='weighted', zero_division=0))
        except Exception as e:
            print(f"Metrics error: {e}")
            precision = recall = f1 = 0.0
        
        # Cross-validation
        cv_mean = None
        cv_std = None
        if len(X_train) >= 10:
            try:
                n_splits = min(5, len(X_train) // 2)
                if n_splits >= 2:
                    cv_scores = cross_val_score(model, X_train, y_train, cv=n_splits, scoring='accuracy')
                    cv_mean = float(np.mean(cv_scores))
                    cv_std = float(np.std(cv_scores))
            except Exception as e:
                print(f"CV warning: {e}")
        
        # Confusion matrix
        cm = confusion_matrix(y_test, y_pred_test)
        
        # Class labels
        cm_labels = []
        if session_data.get('label_encoder') is not None:
            try:
                all_classes = session_data['label_encoder'].classes_
                present_classes = sorted(set(y_test.tolist() + y_pred_test.tolist()))
                for i in present_classes:
                    if i < len(all_classes):
                        cm_labels.append(str(all_classes[i]))
                    else:
                        cm_labels.append(str(i))
            except Exception as e:
                print(f"Label error: {e}")
                cm_labels = [str(i) for i in range(cm.shape[0])]
        else:
            cm_labels = [str(i) for i in range(cm.shape[0])]
        
        # Generate confusion matrix plot
        print("Generating confusion matrix plot...")
        cm_image = None
        try:
            plt.figure(figsize=(8, 6))
            plt.clf()
            
            sns.heatmap(cm, annot=True, fmt='d', cmap='Blues', cbar=True,
                        xticklabels=cm_labels, yticklabels=cm_labels,
                        annot_kws={'size': 12})
            plt.title(f'Confusion Matrix - {model_display_name}', fontsize=14, fontweight='bold', pad=20)
            plt.ylabel('Actual', fontsize=12)
            plt.xlabel('Predicted', fontsize=12)
            plt.tight_layout()
            
            buffer = io.BytesIO()
            plt.savefig(buffer, format='png', dpi=120, bbox_inches='tight', facecolor='white')
            buffer.seek(0)
            cm_image = base64.b64encode(buffer.getvalue()).decode('utf-8')
            plt.close()
        except Exception as e:
            print(f"Error generating confusion matrix: {e}")
            plt.close('all')
        
        # Feature importance
        feature_importance = None
        feature_importance_image = None
        
        if hasattr(model, 'feature_importances_'):
            try:
                importance = model.feature_importances_
                feature_names = session_data['feature_columns']
                
                feature_importance = {str(name): float(imp) for name, imp in zip(feature_names, importance)}
                
                plt.figure(figsize=(10, max(6, len(feature_names) * 0.35)))
                plt.clf()
                
                sorted_idx = np.argsort(importance)
                colors = plt.cm.viridis(np.linspace(0.3, 0.9, len(sorted_idx)))
                
                y_pos = np.arange(len(sorted_idx))
                plt.barh(y_pos, importance[sorted_idx], align='center', color=colors)
                plt.yticks(y_pos, [feature_names[i] for i in sorted_idx])
                plt.xlabel('Feature Importance', fontsize=12)
                plt.title(f'Feature Importance - {model_display_name}', fontsize=14, fontweight='bold', pad=20)
                plt.tight_layout()
                
                buffer = io.BytesIO()
                plt.savefig(buffer, format='png', dpi=120, bbox_inches='tight', facecolor='white')
                buffer.seek(0)
                feature_importance_image = base64.b64encode(buffer.getvalue()).decode('utf-8')
                plt.close()
            except Exception as e:
                print(f"Error generating feature importance: {e}")
                plt.close('all')
        
        # Coefficients
        coefficients = None
        coefficients_image = None
        
        if hasattr(model, 'coef_'):
            try:
                feature_names = session_data['feature_columns']
                
                if model.coef_.ndim == 1:
                    coef = model.coef_
                elif model.coef_.shape[0] == 1:
                    coef = model.coef_[0]
                else:
                    coef = np.mean(model.coef_, axis=0)
                
                coefficients = {str(name): float(c) for name, c in zip(feature_names, coef)}
                
                plt.figure(figsize=(10, max(6, len(feature_names) * 0.35)))
                plt.clf()
                
                sorted_idx = np.argsort(np.abs(coef))
                colors = ['#ef4444' if c < 0 else '#22c55e' for c in coef[sorted_idx]]
                
                y_pos = np.arange(len(sorted_idx))
                plt.barh(y_pos, coef[sorted_idx], align='center', color=colors)
                plt.yticks(y_pos, [feature_names[i] for i in sorted_idx])
                plt.xlabel('Coefficient Value', fontsize=12)
                plt.title(f'Feature Coefficients - {model_display_name}', fontsize=14, fontweight='bold', pad=20)
                plt.axvline(x=0, color='black', linestyle='-', linewidth=0.5)
                plt.tight_layout()
                
                buffer = io.BytesIO()
                plt.savefig(buffer, format='png', dpi=120, bbox_inches='tight', facecolor='white')
                buffer.seek(0)
                coefficients_image = base64.b64encode(buffer.getvalue()).decode('utf-8')
                plt.close()
            except Exception as e:
                print(f"Error generating coefficients: {e}")
                plt.close('all')
        
        print("Building response...")
        
        response_data = {
            'success': True,
            'modelType': str(model_type),
            'modelDisplayName': str(model_display_name),
            'metrics': {
                'trainAccuracy': round(train_accuracy, 4),
                'testAccuracy': round(test_accuracy, 4),
                'precision': round(precision, 4),
                'recall': round(recall, 4),
                'f1Score': round(f1, 4),
                'cvMean': round(cv_mean, 4) if cv_mean is not None else None,
                'cvStd': round(cv_std, 4) if cv_std is not None else None
            },
            'confusionMatrix': [[int(cell) for cell in row] for row in cm.tolist()],
            'confusionMatrixImage': cm_image,
            'classLabels': cm_labels,
            'featureImportance': feature_importance,
            'featureImportanceImage': feature_importance_image,
            'coefficients': coefficients,
            'coefficientsImage': coefficients_image,
            'numClasses': int(n_classes),
            'trainSamples': int(len(X_train)),
            'testSamples': int(len(X_test)),
            'numFeatures': int(len(session_data['feature_columns']))
        }
        
        print("=" * 50)
        print("TRAINING COMPLETE - Sending response")
        print("=" * 50)
        
        return safe_jsonify(response_data)
        
    except Exception as e:
        print(f"TRAIN ERROR: {e}")
        traceback.print_exc()
        plt.close('all')
        return safe_jsonify({'error': f'Training error: {str(e)}'}), 500


@app.route('/api/reset', methods=['POST'])
def reset_pipeline():
    try:
        reset_session()
        plt.close('all')
        return safe_jsonify({'success': True, 'message': 'Pipeline reset successfully'})
    except Exception as e:
        return safe_jsonify({'error': f'Reset failed: {str(e)}'}), 500


@app.route('/api/health', methods=['GET'])
def health_check():
    return safe_jsonify({
        'status': 'healthy',
        'sessionState': {
            'hasData': session_data.get('original_df') is not None,
            'hasProcessedData': session_data.get('processed_df') is not None,
            'hasSplitData': session_data.get('X_train') is not None,
            'hasModel': session_data.get('model') is not None
        }
    })


if __name__ == '__main__':
    print("=" * 50)
    print("Starting ML Pipeline Backend...")
    print("Server running at http://localhost:5000")
    print("=" * 50)
    app.run(debug=True, port=5000, threaded=True)