# ==============================================================================
# EXPLORATORY DATA ANALYSIS (EDA) - IRIS DATASET
# A Complete 10-Step Guide Built with NumPy, Pandas, Matplotlib, and Seaborn
# ==============================================================================

"""
Exploratory Data Analysis (EDA) is a critical initial step in any data science
and machine learning project. It involves investigating datasets to discover patterns,
spot anomalies, test hypotheses, and check assumptions using statistical summaries
and visual graphics before applying machine learning algorithms.

Core Objectives of EDA:
1. Maximize Insight: Understand variable distributions and relationships.
2. Assess Data Quality: Identify missing values, errors, or inconsistencies.
3. Detect Outliers: Pinpoint anomalous values that could distort models.
4. Generate Hypotheses: Inform feature engineering and model selection.
"""

# ==============================================================================
# STEP 1: IMPORT LIBRARIES
# ==============================================================================
print("=" * 75)
print("STEP 1: IMPORTING FOUNDATIONAL LIBRARIES")
print("=" * 75)

import numpy as np
import pandas as pd
import matplotlib.pyplot as plt
import seaborn as sns

# Optional inline settings when running in notebooks
# %matplotlib inline

print("Libraries successfully imported:")
print(f"  • NumPy version:      {np.__version__}")
print(f"  • Pandas version:     {pd.__version__}")
print(f"  • Matplotlib version: {plt.matplotlib.__version__}")
print(f"  • Seaborn version:    {sns.__version__}")


# ==============================================================================
# STEP 2: LOAD AND STRUCTURE DATASET
# ==============================================================================
print("\n" + "=" * 75)
print("STEP 2: LOADING AND STRUCTURING THE IRIS DATASET")
print("=" * 75)

from sklearn.datasets import load_iris

# Load the classic Fisher's Iris dataset
iris = load_iris()

# Create a Pandas DataFrame using features and feature names
df = pd.DataFrame(iris.data, columns=iris.feature_names)

# Add target column (numeric: 0, 1, 2)
df['species'] = iris.target

# Convert numeric targets into human-readable species labels:
# 0 -> 'setosa', 1 -> 'versicolor', 2 -> 'virginica'
species_map = {i: label for i, label in enumerate(iris.target_names)}
df['species'] = df['species'].map(species_map)

print("First 5 rows of structured DataFrame:")
print(df.head())


# ==============================================================================
# STEP 3: BASIC INFORMATION AND SUMMARY STATISTICS
# ==============================================================================
print("\n" + "=" * 75)
print("STEP 3: BASIC INFORMATION AND SUMMARY STATISTICS")
print("=" * 75)

print("\n--- [3.1] First Row Preview (df.head(1)) ---")
print(df.head(1))

print("\n--- [3.2] DataFrame Structure and Data Types (df.info()) ---")
df.info()

print("\n--- [3.3] Numerical Summary Statistics (df.describe()) ---")
print(df.describe())

print("\n--- [3.4] Comprehensive Summary Including Categories (df.describe(include='all')) ---")
print(df.describe(include='all'))


# ==============================================================================
# STEP 4: CHECK MISSING VALUES
# ==============================================================================
print("\n" + "=" * 75)
print("STEP 4: CHECKING FOR MISSING VALUES (NULLS)")
print("=" * 75)

missing_counts = df.isnull().sum()
print("Missing values count per column:")
print(missing_counts)

if missing_counts.sum() == 0:
    print("\n[Result] Dataset is completely clean! Zero missing values detected across all columns.")
else:
    print(f"\n[Result] Detected {missing_counts.sum()} missing values requiring imputation or handling.")


# ==============================================================================
# STEP 5: DISTRIBUTION OF EACH FEATURE (HISTOGRAMS)
# ==============================================================================
print("\n" + "=" * 75)
print("STEP 5: VISUALIZING FEATURE DISTRIBUTIONS (HISTOGRAMS)")
print("=" * 75)
print("Generating histograms for numerical features...")

# Plot histograms for all 4 numerical measurements
df.hist(figsize=(10, 8), bins=10, color='#0EA894', edgecolor='#1F2937')
plt.suptitle("Distribution of Numerical Variables - Iris Dataset", fontsize=14, fontweight='bold')
plt.tight_layout()
# plt.show() # Uncomment to display window when running locally
plt.close()

print("Distribution Insights:")
print("  • Sepal Width: Displays a roughly Normal (bell-shaped) unimodal distribution centered at ~3.0 cm.")
print("  • Petal Length & Petal Width: Clearly bimodal (two peaks), showing that small petals separate")
print("    one species completely from the others.")


# ==============================================================================
# STEP 6: SPECIES COUNT AND TARGET CLASS BALANCE
# ==============================================================================
print("\n" + "=" * 75)
print("STEP 6: SPECIES COUNT AND TARGET CLASS BALANCE")
print("=" * 75)

species_counts = df['species'].value_counts()
print("Counts per flower species:")
print(species_counts)

# Visualizing target distribution
plt.figure(figsize=(6, 4))
sns.countplot(x='species', data=df, palette=['#0EA894', '#F59E0B', '#6366F1'])
plt.title("Species Distribution (Class Balance)", fontsize=13, fontweight='bold')
plt.xlabel("Species")
plt.ylabel("Count")
plt.tight_layout()
# plt.show()
plt.close()

print("\nBalance Insight: Exactly 50 observations per class (1/3 each). Perfect class balance ensures")
print("that future classification models won't suffer from majority-class prediction bias.")


# ==============================================================================
# STEP 7: PAIRPLOT (MULTIVARIATE RELATIONSHIPS)
# ==============================================================================
print("\n" + "=" * 75)
print("STEP 7: PAIRPLOT (MULTIVARIATE RELATIONSHIPS)")
print("=" * 75)
print("Generating pairwise scatter plots with species hue separation...")

# Pairplot creates an N x N matrix of scatter plots and diagonal KDE distributions
# pairplot = sns.pairplot(df, hue='species', palette=['#0EA894', '#F59E0B', '#6366F1'])
# plt.suptitle("Pairwise Relationships Across Iris Features", y=1.02, fontsize=14)
# plt.show()
# plt.close()

print("Pairplot Insights:")
print("  • Petal Length vs. Petal Width provides the clearest linear separation between species.")
print("  • Iris setosa forms an isolated cluster with zero overlap, making it easily classifiable.")
print("  • Iris versicolor and Iris virginica have slight overlap in sepal dimensions but can be")
print("    differentiated by petal size.")


# ==============================================================================
# STEP 8: CORRELATION MATRIX AND HEATMAP
# ==============================================================================
print("\n" + "=" * 75)
print("STEP 8: CORRELATION MATRIX AND HEATMAP")
print("=" * 75)

# Calculate Pearson correlation coefficient among numeric columns
corr = df.select_dtypes(include=['float64', 'int64']).corr()
print("Pearson Correlation Matrix:")
print(np.round(corr, 3))

# Plot heatmap
plt.figure(figsize=(7, 5))
sns.heatmap(corr, annot=True, cmap='coolwarm', vmin=-1, vmax=1, fmt=".2f", linewidths=0.5)
plt.title("Correlation Heatmap of Iris Measurements", fontsize=13, fontweight='bold')
plt.tight_layout()
# plt.show()
plt.close()

print("\nKey Correlation Observations:")
print("  1. Petal Length and Petal Width have an extremely strong positive correlation (r = +0.96).")
print("  2. Sepal Length correlates strongly with Petal Length (r = +0.87) and Petal Width (r = +0.82).")
print("  3. Sepal Width has a moderate negative correlation with Petal Length (r = -0.43).")
print("  4. Sepal Length and Sepal Width exhibit almost zero linear correlation (r = -0.12).")


# ==============================================================================
# STEP 9: BOXPLOTS TO DETECT OUTLIERS
# ==============================================================================
print("\n" + "=" * 75)
print("STEP 9: BOXPLOTS FOR OUTLIER DETECTION")
print("=" * 75)
print("Generating boxplots across features...")

plt.figure(figsize=(10, 6))
df.boxplot(color=dict(boxes='#0EA894', whiskers='#6B7280', medians='#EF4444', caps='#374151'))
plt.title("Boxplots for Outlier Detection (Interquartile Range Rule)", fontsize=13, fontweight='bold')
plt.ylabel("Measurement (cm)")
plt.tight_layout()
# plt.show()
plt.close()

print("Outlier Detection Insights:")
print("  • Using the 1.5 * IQR rule, Sepal Width has a few mild outliers (values < 2.05 cm and > 4.05 cm).")
print("  • Sepal Length, Petal Length, and Petal Width show zero outlier points beyond whiskers.")
print("  • These isolated outliers in Sepal Width are genuine biological variations, not measurement errors.")


# ==============================================================================
# STEP 10: SIMPLE INSIGHTS AND GROUP AGGREGATIONS
# ==============================================================================
print("\n" + "=" * 75)
print("STEP 10: SIMPLE INSIGHTS & GROUPED AGGREGATIONS")
print("=" * 75)

print("Average measurements grouped per species (df.groupby('species').mean()):")
species_means = df.groupby('species').mean()
print(species_means)

print("\nSummary Takeaways for Machine Learning:")
print("  • Iris setosa: Characterized by noticeably small petals (length 1.46 cm, width 0.25 cm)")
print("    and relatively broad sepals (3.43 cm).")
print("  • Iris versicolor: Intermediate in all petal dimensions (length 4.26 cm, width 1.33 cm).")
print("  • Iris virginica: Displays the largest petals (length 5.55 cm, width 2.03 cm) and longest sepals (6.59 cm).")
print("  • Modeling Decision: Because classes form distinct clusters, simple linear classifiers,")
print("    decision trees, or K-Nearest Neighbors (KNN) will achieve >95% accuracy on this dataset!")
print("=" * 75)
print("EDA COMPLETE: DATA IS FULLY EXPLORED AND READY FOR MODELING!")
print("=" * 75)
