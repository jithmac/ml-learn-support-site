# =========================================================
# Lecture 2: Data Preprocessing Pipeline
# Built with NumPy, Pandas, Matplotlib, and Scikit-Learn
# =========================================================

# ---------------------------------------------------------
# Step 1 & 2: Import Libraries
# ---------------------------------------------------------
import numpy as np
import pandas as pd
import matplotlib.pyplot as plt
from sklearn.impute import SimpleImputer
from sklearn.preprocessing import OneHotEncoder, LabelEncoder
from sklearn.compose import ColumnTransformer
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import MinMaxScaler

print("=" * 60)
print("MACHINE LEARNING DATA PREPROCESSING PIPELINE")
print("=" * 60)

# ---------------------------------------------------------
# Step 3: Import Dataset and Split Features & Target
# ---------------------------------------------------------
print("\n[Step 3] Importing dataset 'Data.csv'...")
dataset = pd.read_csv('Data.csv')
print("Dataset preview:")
print(dataset.head())

# Features (Independent variables: Country, Age, Salary)
x = dataset.iloc[:, :-1].values

# Target (Dependent variable: Purchased)
y = dataset.iloc[:, -1].values

print("\nFeatures X shape:", x.shape)
print("Target y shape:", y.shape)

# ---------------------------------------------------------
# Step 4: Handling Missing Values
# ---------------------------------------------------------
print("\n[Step 4] Checking for missing values:")
print(dataset.isna().sum())

# Impute missing numerical values using mean of column
imputer = SimpleImputer(missing_values=np.nan, strategy='mean')
imputer.fit(x[:, 1:3])
x[:, 1:3] = imputer.transform(x[:, 1:3])

print("\nFeatures X after Mean Imputation (Notice Age & Salary filled):")
print(x)

# ---------------------------------------------------------
# Step 5: Encoding Categorical Data
# ---------------------------------------------------------
print("\n[Step 5] Encoding categorical data...")

# 5.1 Encode Independent Variable: Country (One-Hot Encoding)
ct = ColumnTransformer(
    transformers=[('encoder', OneHotEncoder(), [0])],
    remainder='passthrough'
)
x = np.array(ct.fit_transform(x))
print("\nFeatures X after OneHotEncoder (First 3 rows, 5 columns):")
print(x[:3])

# 5.2 Encode Dependent Variable: Purchased (Label Encoding: No=0, Yes=1)
le = LabelEncoder()
y_encoded = le.fit_transform(y)
print("\nTarget y after LabelEncoder:")
print(y_encoded)

# ---------------------------------------------------------
# Step 6: Splitting the Dataset into Training Set and Test Set
# ---------------------------------------------------------
print("\n[Step 6] Splitting dataset (80% Train, 20% Test)...")
x_train, x_test, y_train, y_test = train_test_split(
    x,
    y_encoded,
    test_size=0.2,
    random_state=42
)

print(f"x_train shape: {x_train.shape}, y_train shape: {y_train.shape}")
print(f"x_test shape:  {x_test.shape},  y_test shape:  {y_test.shape}")

# ---------------------------------------------------------
# Step 7: Feature Scaling (MinMaxScaler / Normalization)
# ---------------------------------------------------------
print("\n[Step 7] Applying Feature Scaling with MinMaxScaler...")
scaler = MinMaxScaler()

# Fit on training set and transform
x_train = scaler.fit_transform(x_train)

# Transform test set using the same scaler fitted on training data
x_test = scaler.transform(x_test)

print("\nNormalized x_train (First 3 samples, range [0, 1]):")
print(np.round(x_train[:3], 3))

print("\nNormalized x_test (Unseen evaluation set):")
print(np.round(x_test, 3))

print("\n" + "=" * 60)
print("[SUCCESS] PREPROCESSING COMPLETE: DATA READY FOR MODEL TRAINING!")
print("=" * 60)
