import { useState } from "react";

const TOPICS = [
  { id: "setup", label: "Setup & Sample Data", icon: "ti-database" },
  { id: "csv", label: "Reading & Writing CSV/Excel", icon: "ti-file-spreadsheet" },
  { id: "basics", label: "DataFrame Basics", icon: "ti-table" },
  { id: "cleaning", label: "Cleaning Missing Data", icon: "ti-eraser" },
  { id: "groupby", label: "GroupBy & Aggregation", icon: "ti-chart-bar" },
  { id: "performance", label: "Performance & Memory", icon: "ti-bolt" },
  { id: "multiindex", label: "MultiIndex & Pivot Tables", icon: "ti-layout-grid" },
  { id: "viz", label: "Visualization", icon: "ti-chart-line" },
  { id: "timeseries", label: "Time Series Analysis", icon: "ti-clock" },
  { id: "apply", label: "apply, map & lambda", icon: "ti-function" },
  { id: "merging", label: "Merging & Joining", icon: "ti-arrows-join" },
  { id: "summary", label: "Summary & Next Steps", icon: "ti-award" },
];

const LESSONS = {
  setup: {
    title: "Setup & Sample Dataset",
    intro: "We start by importing pandas and creating a realistic sales dataset that we'll use throughout every lesson. Run this code first in your environment before anything else.",
    sections: [
      {
        heading: "Install & Import",
        code: `# Install pandas (run once in terminal or notebook cell)
# pip install pandas openpyxl matplotlib seaborn

import pandas as pd          # pandas — the core library
import numpy as np            # numpy — for numeric operations
import matplotlib.pyplot as plt  # for charts
import seaborn as sns         # for prettier charts

print("pandas version:", pd.__version__)`,
      },
      {
        heading: "Create a sample sales dataset",
        code: `# We seed numpy so results are reproducible every run
np.random.seed(42)

# Number of rows in our fake dataset
n = 200

# Build the DataFrame row-by-row from a dict of lists
df = pd.DataFrame({
    "order_id":   range(1001, 1001 + n),
    "date":       pd.date_range("2023-01-01", periods=n, freq="D"),
    "region":     np.random.choice(["North", "South", "East", "West"], n),
    "product":    np.random.choice(["Widget A", "Widget B", "Gadget X"], n),
    "salesperson": np.random.choice(["Alice", "Bob", "Carol", "Dave"], n),
    "units_sold": np.random.randint(1, 50, n),
    "unit_price":  np.random.choice([9.99, 14.99, 24.99, 49.99], n),
    "discount":   np.random.choice([0.0, 0.05, 0.10, 0.15], n),
})

# Derive a revenue column from the others
df["revenue"] = df["units_sold"] * df["unit_price"] * (1 - df["discount"])

# Intentionally sprinkle some NaN (missing) values so we can clean them later
missing_idx = np.random.choice(df.index, 15, replace=False)
df.loc[missing_idx, "units_sold"] = np.nan

print(df.head())        # peek at the first 5 rows
print("\\nShape:", df.shape)  # (rows, columns)`,
      },
    ],
    exercise: {
      question: "Add a new column called `total_discount_given` which equals `units_sold * unit_price * discount`. Then print only rows where the discount is greater than 0.",
      solution: `# New column: how much money was discounted
df["total_discount_given"] = df["units_sold"] * df["unit_price"] * df["discount"]

# Filter rows where a discount was applied
discounted = df[df["discount"] > 0]
print(discounted.head())`,
    },
  },

  csv: {
    title: "Reading & Writing CSV / Excel",
    intro: "pandas makes it trivial to load data from files and save results back. These are the two functions you'll use in nearly every project.",
    sections: [
      {
        heading: "Save to CSV and reload it",
        code: `# --- WRITING ---
# index=False means don't write the row numbers as a column
df.to_csv("sales_data.csv", index=False)
print("CSV saved!")

# --- READING ---
df_loaded = pd.read_csv(
    "sales_data.csv",
    parse_dates=["date"],   # tell pandas to treat this column as a date
)
print(df_loaded.dtypes)     # check the column types`,
      },
      {
        heading: "Save and load Excel",
        code: `# --- WRITING Excel ---
# Requires: pip install openpyxl
df.to_excel("sales_data.xlsx", sheet_name="Sales", index=False)

# --- READING Excel ---
df_excel = pd.read_excel(
    "sales_data.xlsx",
    sheet_name="Sales",
    parse_dates=["date"],
)
print(df_excel.head(3))`,
      },
      {
        heading: "Useful read_csv options",
        code: `# Read only specific columns (faster for large files)
df_small = pd.read_csv(
    "sales_data.csv",
    usecols=["date", "region", "revenue"],
    parse_dates=["date"],
    nrows=50,            # only load the first 50 rows (great for previewing)
)

# Read a CSV that uses semicolons instead of commas
# df_semi = pd.read_csv("file.csv", sep=";")

print(df_small.shape)`,
      },
    ],
    exercise: {
      question: "Save only the columns `order_id`, `date`, `product`, and `revenue` to a new CSV called `revenue_only.csv`. Then reload it and confirm the shape is (200, 4).",
      solution: `# Select the columns we want, then save
df[["order_id", "date", "product", "revenue"]].to_csv("revenue_only.csv", index=False)

# Reload and verify
check = pd.read_csv("revenue_only.csv", parse_dates=["date"])
print(check.shape)   # should print (200, 4)`,
    },
  },

  basics: {
    title: "DataFrame Basics: Indexing, Slicing & Filtering",
    intro: "A DataFrame is like a spreadsheet in Python. Here you'll learn the three main ways to access data: column selection, .loc (label-based), and .iloc (position-based).",
    sections: [
      {
        heading: "Basic inspection",
        code: `print(df.shape)          # (rows, cols)
print(df.dtypes)         # column data types
print(df.describe())     # summary statistics for numeric columns
print(df.info())         # memory usage + nulls overview`,
      },
      {
        heading: "Selecting columns",
        code: `# Single column → returns a Series (like a list with labels)
print(df["region"].head())

# Multiple columns → returns a DataFrame
print(df[["region", "product", "revenue"]].head())`,
      },
      {
        heading: "Row slicing with .iloc (by position)",
        code: `# .iloc uses integer positions (like Python list indexing)
print(df.iloc[0])           # first row
print(df.iloc[0:5])         # rows 0-4
print(df.iloc[0:5, 1:4])    # rows 0-4, columns 1-3`,
      },
      {
        heading: "Row selection with .loc (by label)",
        code: `# .loc uses the index label (here just integers, but could be strings)
print(df.loc[0, "region"])              # single cell
print(df.loc[0:4, ["region","revenue"]]) # range of rows + named columns`,
      },
      {
        heading: "Filtering rows with conditions",
        code: `# Single condition
north = df[df["region"] == "North"]
print(north.shape)

# Multiple conditions — use & (AND) or | (OR), always wrap in parens!
high_value = df[(df["revenue"] > 500) & (df["region"] == "West")]
print(high_value.head())

# .isin() — check against a list of values
widgets = df[df["product"].isin(["Widget A", "Widget B"])]
print(widgets["product"].value_counts())`,
      },
    ],
    exercise: {
      question: "Filter the DataFrame to show only rows where the salesperson is 'Alice' AND units_sold is greater than 20. Print the result's shape and the average revenue.",
      solution: `alice_big = df[
    (df["salesperson"] == "Alice") &
    (df["units_sold"] > 20)
]
print("Shape:", alice_big.shape)
print("Avg revenue: $", alice_big["revenue"].mean().round(2))`,
    },
  },

  cleaning: {
    title: "Cleaning Missing / Null Data",
    intro: "Real datasets always have gaps. pandas gives you several strategies: detect nulls, drop them, or fill them intelligently.",
    sections: [
      {
        heading: "Detect missing values",
        code: `# Count nulls per column
print(df.isnull().sum())

# Percentage of nulls per column
null_pct = df.isnull().mean() * 100
print(null_pct.round(2))

# Show only rows that have at least one null
print(df[df.isnull().any(axis=1)].head())`,
      },
      {
        heading: "Drop rows or columns with nulls",
        code: `# Drop rows where ANY column is null
df_no_null = df.dropna()
print("Dropped rows:", len(df) - len(df_no_null))

# Drop rows only where 'units_sold' is null
df_clean = df.dropna(subset=["units_sold"])
print("Cleaned shape:", df_clean.shape)

# Drop columns where more than 10% of values are null
df.dropna(axis=1, thresh=int(0.9 * len(df)), inplace=False)`,
      },
      {
        heading: "Fill missing values",
        code: `# Fill with the column median (better than mean for skewed data)
median_units = df["units_sold"].median()
df["units_sold"] = df["units_sold"].fillna(median_units)

# Forward-fill: use the previous valid value (great for time series)
df["units_sold"] = df["units_sold"].fillna(method="ffill")

# Fill with a fixed value
df["discount"] = df["discount"].fillna(0.0)

print(df.isnull().sum())  # should now show 0 nulls`,
      },
    ],
    exercise: {
      question: "Recreate the nulls: set `units_sold` to NaN for rows 10–19. Then fill those NaN values with the mean of the remaining values. Confirm no nulls remain.",
      solution: `# Re-introduce nulls
df.loc[10:19, "units_sold"] = np.nan

# Fill with the column mean
mean_val = df["units_sold"].mean()
df["units_sold"] = df["units_sold"].fillna(mean_val)

# Verify
print("Nulls remaining:", df["units_sold"].isnull().sum())  # 0`,
    },
  },

  groupby: {
    title: "GroupBy & Aggregation",
    intro: "GroupBy is pandas' answer to SQL's GROUP BY. It splits the data into groups, applies a function to each group, and combines the results — the 'split-apply-combine' pattern.",
    sections: [
      {
        heading: "Basic groupby",
        code: `# Total revenue by region
region_revenue = df.groupby("region")["revenue"].sum()
print(region_revenue)

# Multiple aggregations at once
stats = df.groupby("region")["revenue"].agg(["sum", "mean", "count"])
print(stats.round(2))`,
      },
      {
        heading: "Group by multiple columns",
        code: `# Revenue breakdown by region AND product
breakdown = df.groupby(["region", "product"])["revenue"].sum().reset_index()
print(breakdown.head(8))

# reset_index() turns the group labels back into regular columns`,
      },
      {
        heading: "Named aggregation (cleanest syntax)",
        code: `# agg() with keyword arguments lets you name the output columns
summary = df.groupby("salesperson").agg(
    total_revenue   = ("revenue",    "sum"),
    avg_units       = ("units_sold", "mean"),
    num_orders      = ("order_id",   "count"),
).round(2)

print(summary)`,
      },
      {
        heading: "Transform — keep original index",
        code: `# transform() returns a Series of the same length as the input
# Useful for adding a group-level stat as a new column

df["region_avg_revenue"] = df.groupby("region")["revenue"].transform("mean")
print(df[["region", "revenue", "region_avg_revenue"]].head())`,
      },
    ],
    exercise: {
      question: "Find the top-performing salesperson per region (highest total revenue). Hint: groupby region + salesperson, sum revenue, then use idxmax or sort + head.",
      solution: `top = (
    df.groupby(["region", "salesperson"])["revenue"]
    .sum()
    .reset_index()
    .sort_values("revenue", ascending=False)
)

# Top salesperson per region
best = top.groupby("region").first().reset_index()
print(best)`,
    },
  },

  performance: {
    title: "Performance & Memory Optimization",
    intro: "When datasets grow large, small changes in how you store and process data can reduce memory by 50–80% and speed up operations dramatically.",
    sections: [
      {
        heading: "Check memory usage",
        code: `# deep=True gives a precise measurement (follows object pointers)
print(df.memory_usage(deep=True))
print("Total MB:", df.memory_usage(deep=True).sum() / 1e6)`,
      },
      {
        heading: "Use categories for low-cardinality strings",
        code: `# 'region' only has 4 unique values — storing as 'category' is much cheaper
df["region"]      = df["region"].astype("category")
df["product"]     = df["product"].astype("category")
df["salesperson"] = df["salesperson"].astype("category")

print("Memory after categories:", df.memory_usage(deep=True).sum() / 1e6, "MB")`,
      },
      {
        heading: "Downcast numeric types",
        code: `# int64 uses 8 bytes; int16 uses 2 bytes for values up to 32,767
df["units_sold"] = pd.to_numeric(df["units_sold"], downcast="integer")

# float64 → float32 (loses a tiny bit of precision, usually fine)
df["revenue"]    = df["revenue"].astype("float32")
df["unit_price"] = df["unit_price"].astype("float32")

print(df.dtypes)`,
      },
      {
        heading: "Vectorised operations vs loops",
        code: `import time

# ❌ Slow: Python loop over rows
start = time.time()
revenues = []
for _, row in df.iterrows():
    revenues.append(row["units_sold"] * row["unit_price"])
print("Loop time:", round(time.time() - start, 4), "s")

# ✅ Fast: vectorised (operates on whole column at once)
start = time.time()
revenues_vec = df["units_sold"] * df["unit_price"]
print("Vector time:", round(time.time() - start, 4), "s")
# Vectorised is typically 10-100x faster`,
      },
    ],
    exercise: {
      question: "Print the memory usage before and after converting `region`, `product`, and `salesperson` to the `category` dtype. How much memory did you save?",
      solution: `before = df.memory_usage(deep=True).sum()

df["region"]      = df["region"].astype("category")
df["product"]     = df["product"].astype("category")
df["salesperson"] = df["salesperson"].astype("category")

after = df.memory_usage(deep=True).sum()
saved = (before - after) / 1e3

print(f"Before: {before/1e3:.1f} KB  |  After: {after/1e3:.1f} KB  |  Saved: {saved:.1f} KB")`,
    },
  },

  multiindex: {
    title: "MultiIndex & Pivot Tables",
    intro: "MultiIndex lets you have a hierarchy in your row or column labels. Pivot tables reshape the data from long format to wide format — like Excel pivot tables but in code.",
    sections: [
      {
        heading: "Create a MultiIndex",
        code: `# Group and set a two-level index
mi = df.groupby(["region", "product"])["revenue"].sum()
print(mi)
print("\\nIndex levels:", mi.index.names)

# Access a specific group
print(mi["North"])        # all products in North
print(mi["North"]["Widget A"])  # specific cell`,
      },
      {
        heading: "Reset and set MultiIndex",
        code: `df_mi = df.set_index(["region", "product"])
print(df_mi.head())

# Select with .loc using a tuple
print(df_mi.loc[("North", "Widget A")].head())

# Reset back to a flat integer index
df_flat = df_mi.reset_index()`,
      },
      {
        heading: "Pivot tables",
        code: `# Pivot: regions as rows, products as columns, revenue as values
pivot = pd.pivot_table(
    df,
    values   = "revenue",
    index    = "region",
    columns  = "product",
    aggfunc  = "sum",       # could also be "mean", "count", etc.
    fill_value = 0,         # replace NaN with 0
    margins  = True,        # add row/column totals
    margins_name = "Total",
)
print(pivot.round(2))`,
      },
      {
        heading: "Crosstab — count relationships",
        code: `# How many orders did each salesperson make per region?
ct = pd.crosstab(
    df["salesperson"],
    df["region"],
    margins=True,
)
print(ct)`,
      },
    ],
    exercise: {
      question: "Create a pivot table that shows the average `units_sold` per `salesperson` (rows) and `product` (columns). Round to 1 decimal place.",
      solution: `avg_units = pd.pivot_table(
    df,
    values  = "units_sold",
    index   = "salesperson",
    columns = "product",
    aggfunc = "mean",
    fill_value = 0,
).round(1)
print(avg_units)`,
    },
  },

  viz: {
    title: "Data Visualization with matplotlib & seaborn",
    intro: "pandas integrates directly with matplotlib. seaborn sits on top of it and produces beautiful statistical charts with much less code.",
    sections: [
      {
        heading: "Quick line and bar chart",
        code: `# Monthly revenue trend (resample by month)
monthly = df.set_index("date")["revenue"].resample("ME").sum()

fig, axes = plt.subplots(1, 2, figsize=(12, 4))

# Line chart
monthly.plot(ax=axes[0], title="Monthly Revenue Trend", color="steelblue")
axes[0].set_ylabel("Revenue ($)")

# Bar chart — revenue by region
region_rev = df.groupby("region")["revenue"].sum()
region_rev.plot(kind="bar", ax=axes[1], title="Revenue by Region",
                color="coral", rot=0)
axes[1].set_ylabel("Revenue ($)")

plt.tight_layout()
plt.savefig("revenue_charts.png", dpi=120)
plt.show()`,
      },
      {
        heading: "Seaborn — boxplot and heatmap",
        code: `fig, axes = plt.subplots(1, 2, figsize=(13, 5))

# Boxplot: revenue distribution by region
sns.boxplot(data=df, x="region", y="revenue",
            palette="Set2", ax=axes[0])
axes[0].set_title("Revenue Distribution by Region")

# Heatmap: pivot the data first
pivot = pd.pivot_table(df, values="revenue",
                       index="region", columns="product",
                       aggfunc="mean")
sns.heatmap(pivot, annot=True, fmt=".0f",
            cmap="YlOrRd", ax=axes[1])
axes[1].set_title("Avg Revenue: Region × Product")

plt.tight_layout()
plt.savefig("seaborn_charts.png", dpi=120)
plt.show()`,
      },
    ],
    exercise: {
      question: "Create a horizontal bar chart showing total `revenue` per `salesperson`, sorted from highest to lowest. Add a title and label the x-axis.",
      solution: `sp_rev = df.groupby("salesperson")["revenue"].sum().sort_values()

sp_rev.plot(kind="barh", figsize=(8, 4),
            color="mediumseagreen", title="Revenue by Salesperson")
plt.xlabel("Total Revenue ($)")
plt.tight_layout()
plt.savefig("salesperson_revenue.png", dpi=120)
plt.show()`,
    },
  },

  timeseries: {
    title: "Time Series Analysis",
    intro: "pandas has first-class support for dates and times. Once a column has a datetime dtype, you unlock resampling, rolling windows, and period arithmetic.",
    sections: [
      {
        heading: "Set a DatetimeIndex and resample",
        code: `# Set 'date' as the index — unlocks all time-based features
ts = df.set_index("date").sort_index()

# Resample: sum revenue per week (W), month (ME), or quarter (QE)
weekly   = ts["revenue"].resample("W").sum()
monthly  = ts["revenue"].resample("ME").sum()

print(monthly)`,
      },
      {
        heading: "Rolling window statistics",
        code: `# 7-day rolling average of daily revenue
daily   = ts["revenue"].resample("D").sum()
rolling = daily.rolling(window=7).mean()  # NaN for first 6 days

# Plot original vs smoothed
ax = daily.plot(alpha=0.4, label="Daily", figsize=(10, 4))
rolling.plot(ax=ax, color="red", label="7-day rolling avg")
ax.legend()
ax.set_title("Daily Revenue with Rolling Average")
plt.tight_layout()
plt.savefig("rolling_avg.png", dpi=120)
plt.show()`,
      },
      {
        heading: "Date component extraction",
        code: `# Extract parts of a date into new columns
df["year"]       = df["date"].dt.year
df["month"]      = df["date"].dt.month
df["day_of_week"]= df["date"].dt.day_name()   # e.g. "Monday"
df["quarter"]    = df["date"].dt.quarter

# Revenue by day of week
print(df.groupby("day_of_week")["revenue"].mean().round(2))`,
      },
    ],
    exercise: {
      question: "Calculate the monthly total `units_sold` and find the month with the highest total. Hint: resample on the date index, then use `.idxmax()`.",
      solution: `monthly_units = (
    df.set_index("date")["units_sold"]
    .resample("ME")
    .sum()
)
best_month = monthly_units.idxmax()
print("Best month:", best_month.strftime("%B %Y"))
print("Units:", monthly_units[best_month])`,
    },
  },

  apply: {
    title: "apply, map & lambda Functions",
    intro: "These tools let you run custom Python logic on a column or row without writing a loop. `map` is for Series, `apply` works on both Series and DataFrames.",
    sections: [
      {
        heading: "map — transform each value in a Series",
        code: `# map with a dict: replace values
region_map = {"North": "N", "South": "S", "East": "E", "West": "W"}
df["region_code"] = df["region"].map(region_map)
print(df[["region", "region_code"]].head())

# map with a lambda: apply a function to each value
df["revenue_k"] = df["revenue"].map(lambda x: round(x / 1000, 2))
print(df["revenue_k"].head())`,
      },
      {
        heading: "apply on a Series — custom function",
        code: `# Define a function and apply it column-wise
def classify_deal(revenue):
    if revenue >= 1000:
        return "Large"
    elif revenue >= 400:
        return "Medium"
    else:
        return "Small"

df["deal_size"] = df["revenue"].apply(classify_deal)
print(df["deal_size"].value_counts())`,
      },
      {
        heading: "apply on a DataFrame — row-wise logic",
        code: `# axis=1 means apply the function to each ROW
# The row is passed as a Series with column names as the index
def effective_price(row):
    return row["unit_price"] * (1 - row["discount"])

df["eff_price"] = df.apply(effective_price, axis=1)
print(df[["unit_price", "discount", "eff_price"]].head())

# Equivalent one-liner with lambda
df["eff_price"] = df.apply(
    lambda r: r["unit_price"] * (1 - r["discount"]), axis=1
)`,
      },
    ],
    exercise: {
      question: "Using `apply`, create a column `performance` that labels each row as `'Overperforming'` if units_sold > region average, otherwise `'Underperforming'`.",
      solution: `# First create the region average as a column via transform
df["region_avg_units"] = df.groupby("region")["units_sold"].transform("mean")

# Now apply row-wise logic
df["performance"] = df.apply(
    lambda r: "Overperforming" if r["units_sold"] > r["region_avg_units"]
              else "Underperforming",
    axis=1
)
print(df["performance"].value_counts())`,
    },
  },

  merging: {
    title: "Merging & Joining DataFrames",
    intro: "Just like SQL JOINs, pandas lets you combine DataFrames on shared keys. `merge` is the most flexible; `concat` stacks them vertically or horizontally.",
    sections: [
      {
        heading: "Create two DataFrames to join",
        code: `# Salesperson performance targets
targets = pd.DataFrame({
    "salesperson": ["Alice", "Bob", "Carol", "Dave"],
    "monthly_target": [5000, 6000, 5500, 4500],
    "region_assigned": ["North", "South", "East", "West"],
})

# Product catalog with cost data
catalog = pd.DataFrame({
    "product":   ["Widget A", "Widget B", "Gadget X"],
    "category":  ["Basic", "Basic", "Premium"],
    "cost_price": [4.99, 7.99, 14.99],
})

print(targets)
print(catalog)`,
      },
      {
        heading: "Inner and left merge",
        code: `# INNER JOIN: only rows that exist in BOTH DataFrames
df_inner = pd.merge(df, targets, on="salesperson", how="inner")
print("Inner:", df_inner.shape)

# LEFT JOIN: all rows from df, matched rows from targets (NaN if no match)
df_left = pd.merge(df, targets, on="salesperson", how="left")
print("Left:", df_left.shape)

# Merge on a column with different names
df_enriched = pd.merge(
    df, catalog,
    on="product",  # same name in both
    how="left",
)
print(df_enriched[["product", "category", "cost_price"]].head())`,
      },
      {
        heading: "Concat — stack DataFrames",
        code: `# Split data into two halves and then re-combine
df_q1 = df[df["date"].dt.quarter == 1]
df_q2 = df[df["date"].dt.quarter == 2]

# Stack vertically (add rows)
df_h1 = pd.concat([df_q1, df_q2], ignore_index=True)
print("Q1:", len(df_q1), "  Q2:", len(df_q2), "  H1:", len(df_h1))

# Stack horizontally (add columns) — axis=1
df_wide = pd.concat([df[["revenue"]], df[["units_sold"]]], axis=1)
print(df_wide.head(3))`,
      },
    ],
    exercise: {
      question: "Merge `df` with `targets` (left join on `salesperson`). Then add a column `above_target` that is True if the order's revenue alone exceeds 10% of the monthly target.",
      solution: `df_merged = pd.merge(df, targets, on="salesperson", how="left")

df_merged["above_target"] = (
    df_merged["revenue"] > df_merged["monthly_target"] * 0.10
)
print(df_merged[["salesperson", "revenue", "monthly_target", "above_target"]].head(8))
print("\\nAbove target:", df_merged["above_target"].sum())`,
    },
  },

  summary: {
    title: "Summary & What to Learn Next",
    intro: "You've now worked through the core of pandas! Here's a quick recap of every concept, plus a roadmap for what to explore next.",
    sections: [
      {
        heading: "Key takeaways",
        code: `# 1. Always start by exploring your data
df.head(), df.info(), df.describe()

# 2. Load files with parse_dates and usecols to stay efficient
pd.read_csv("file.csv", parse_dates=["date"], usecols=["a","b"])

# 3. Filter with boolean masks, .loc, .iloc
df[(df["col"] > 0) & (df["other"] == "val")]

# 4. Fill or drop nulls — don't leave them for later
df["col"].fillna(df["col"].median())

# 5. GroupBy is your best friend for aggregations
df.groupby("key").agg(total=("col", "sum"))

# 6. Downscast types + use 'category' for big memory wins
df["col"] = df["col"].astype("category")

# 7. pivot_table reshapes wide ↔ long beautifully
pd.pivot_table(df, values="v", index="r", columns="c")

# 8. Set DatetimeIndex first, then resample / rolling
df.set_index("date")["revenue"].resample("ME").sum()

# 9. Use .apply() for row-wise custom logic, vectorise when possible
df["new"] = df.apply(lambda r: custom_fn(r), axis=1)

# 10. merge() = SQL JOIN, concat() = stack rows or columns
pd.merge(df_a, df_b, on="key", how="left")`,
      },
      {
        heading: "Next steps to master",
        code: `# ─── Intermediate ───────────────────────────────────────────
# 1. String operations:  df["col"].str.lower(), .str.contains()
# 2. Window functions:   df.groupby("x")["y"].transform("rank")
# 3. Categorical ordering: pd.CategoricalDtype(ordered=True)
# 4. query() method:     df.query("revenue > 500 and region == 'North'")
# 5. style API:          df.style.background_gradient(cmap="Blues")

# ─── Advanced ────────────────────────────────────────────────
# 6. Dask: pandas API on datasets larger than RAM
# 7. Polars: a faster pandas alternative written in Rust
# 8. SQLAlchemy + read_sql: query databases directly into DataFrames
# 9. Statsmodels / scikit-learn: build models on your clean DataFrames
# 10. Plotly Express: interactive charts in one line of code`,
      },
    ],
    exercise: {
      question: "Challenge: Using everything you've learned, produce a one-page summary DataFrame that shows, per salesperson: total revenue, average discount, best product (by revenue), and number of large deals (revenue > 1000).",
      solution: `best_product = (
    df.groupby(["salesperson", "product"])["revenue"]
    .sum()
    .reset_index()
    .sort_values("revenue", ascending=False)
    .groupby("salesperson")["product"]
    .first()
)

summary = df.groupby("salesperson").agg(
    total_revenue   = ("revenue",  "sum"),
    avg_discount    = ("discount", "mean"),
    large_deals     = ("revenue",  lambda x: (x > 1000).sum()),
).round(2)

summary["best_product"] = best_product
print(summary)`,
    },
  },
};

function CodeBlock({ code }) {
  const [copied, setCopied] = useState(false);
  const handleCopy = () => {
    navigator.clipboard.writeText(code).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    });
  };
  return (
    <div style={{
      position: "relative",
      background: "var(--color-background-secondary)",
      border: "0.5px solid var(--color-border-tertiary)",
      borderRadius: "var(--border-radius-md)",
      marginBottom: "1rem",
    }}>
      <button
        onClick={handleCopy}
        style={{
          position: "absolute", top: 8, right: 8,
          fontSize: 12, padding: "3px 10px",
          background: copied ? "var(--color-background-success)" : "var(--color-background-primary)",
          color: copied ? "var(--color-text-success)" : "var(--color-text-secondary)",
          border: "0.5px solid var(--color-border-secondary)",
          borderRadius: "var(--border-radius-md)",
          cursor: "pointer",
        }}
      >
        {copied ? "Copied!" : "Copy"}
      </button>
      <pre style={{
        margin: 0, padding: "1rem 3rem 1rem 1rem",
        fontFamily: "var(--font-mono)", fontSize: 13,
        lineHeight: 1.65, overflowX: "auto",
        color: "var(--color-text-primary)",
        whiteSpace: "pre-wrap", wordBreak: "break-word",
      }}>{code}</pre>
    </div>
  );
}

function ExerciseBlock({ question, solution }) {
  const [show, setShow] = useState(false);
  return (
    <div style={{
      borderRadius: "var(--border-radius-lg)",
      border: "0.5px solid var(--color-border-tertiary)",
      overflow: "hidden",
      marginTop: "1.5rem",
    }}>
      <div style={{
        background: "var(--color-background-info)",
        padding: "0.75rem 1.25rem",
        display: "flex", alignItems: "center", gap: 8,
      }}>
        <i className="ti ti-pencil" style={{ fontSize: 16, color: "var(--color-text-info)" }} aria-hidden />
        <span style={{ fontSize: 13, fontWeight: 500, color: "var(--color-text-info)" }}>Exercise</span>
      </div>
      <div style={{ padding: "1rem 1.25rem", background: "var(--color-background-primary)" }}>
        <p style={{ margin: "0 0 1rem", fontSize: 14, color: "var(--color-text-primary)", lineHeight: 1.6 }}>
          {question}
        </p>
        <button
          onClick={() => setShow(s => !s)}
          style={{
            fontSize: 13, padding: "6px 14px",
            background: show ? "var(--color-background-secondary)" : "var(--color-background-primary)",
            color: "var(--color-text-secondary)",
            border: "0.5px solid var(--color-border-secondary)",
            borderRadius: "var(--border-radius-md)",
            cursor: "pointer",
            display: "flex", alignItems: "center", gap: 6,
          }}
        >
          <i className={`ti ${show ? "ti-eye-off" : "ti-eye"}`} style={{ fontSize: 14 }} aria-hidden />
          {show ? "Hide solution" : "Reveal solution"}
        </button>
        {show && (
          <div style={{ marginTop: "1rem" }}>
            <CodeBlock code={solution} />
          </div>
        )}
      </div>
    </div>
  );
}

export default function PandasTutorial() {
  const [active, setActive] = useState("setup");
  const lesson = LESSONS[active];
  const topicIdx = TOPICS.findIndex(t => t.id === active);

  return (
    <div style={{ display: "flex", minHeight: 600, fontFamily: "var(--font-sans)" }}>
      {/* Sidebar */}
      <nav style={{
        width: 220, flexShrink: 0,
        borderRight: "0.5px solid var(--color-border-tertiary)",
        paddingTop: "0.5rem",
      }}>
        <div style={{ padding: "0.5rem 1rem 0.75rem", borderBottom: "0.5px solid var(--color-border-tertiary)", marginBottom: "0.5rem" }}>
          <p style={{ margin: 0, fontSize: 11, fontWeight: 500, color: "var(--color-text-tertiary)", letterSpacing: "0.08em", textTransform: "uppercase" }}>
            pandas for data analysis
          </p>
        </div>
        {TOPICS.map((t, i) => {
          const done = i < topicIdx;
          const isCurrent = t.id === active;
          return (
            <button
              key={t.id}
              onClick={() => setActive(t.id)}
              style={{
                width: "100%", textAlign: "left",
                padding: "7px 12px",
                background: isCurrent ? "var(--color-background-secondary)" : "transparent",
                border: "none",
                borderLeft: isCurrent ? "2px solid var(--color-text-info)" : "2px solid transparent",
                cursor: "pointer",
                display: "flex", alignItems: "center", gap: 8,
                color: isCurrent ? "var(--color-text-primary)" : "var(--color-text-secondary)",
                fontSize: 13,
              }}
            >
              <i className={`ti ${t.icon}`} style={{ fontSize: 15, flexShrink: 0 }} aria-hidden />
              <span style={{ lineHeight: 1.35 }}>{t.label}</span>
              {done && (
                <i className="ti ti-check" style={{ marginLeft: "auto", fontSize: 13, color: "var(--color-text-success)", flexShrink: 0 }} aria-hidden />
              )}
            </button>
          );
        })}
      </nav>

      {/* Main content */}
      <main style={{ flex: 1, padding: "1.5rem 2rem", overflowY: "auto" }}>
        <h2 style={{ margin: "0 0 0.4rem", fontSize: 18, fontWeight: 500 }}>
          {topicIdx + 1}. {lesson.title}
        </h2>
        <p style={{ margin: "0 0 1.5rem", fontSize: 14, color: "var(--color-text-secondary)", lineHeight: 1.65 }}>
          {lesson.intro}
        </p>

        {lesson.sections.map((sec, i) => (
          <div key={i} style={{ marginBottom: "1.5rem" }}>
            <p style={{
              margin: "0 0 0.5rem",
              fontSize: 13, fontWeight: 500,
              color: "var(--color-text-primary)",
              display: "flex", alignItems: "center", gap: 6,
            }}>
              <span style={{
                display: "inline-flex", alignItems: "center", justifyContent: "center",
                width: 20, height: 20, borderRadius: "50%",
                background: "var(--color-background-info)",
                color: "var(--color-text-info)",
                fontSize: 11, fontWeight: 500, flexShrink: 0,
              }}>{i + 1}</span>
              {sec.heading}
            </p>
            <CodeBlock code={sec.code} />
          </div>
        ))}

        <ExerciseBlock question={lesson.exercise.question} solution={lesson.exercise.solution} />

        {/* Navigation */}
        <div style={{
          display: "flex", justifyContent: "space-between",
          marginTop: "2rem", paddingTop: "1rem",
          borderTop: "0.5px solid var(--color-border-tertiary)",
        }}>
          <button
            disabled={topicIdx === 0}
            onClick={() => setActive(TOPICS[topicIdx - 1].id)}
            style={{
              padding: "7px 16px", fontSize: 13,
              background: "var(--color-background-primary)",
              color: topicIdx === 0 ? "var(--color-text-tertiary)" : "var(--color-text-secondary)",
              border: "0.5px solid var(--color-border-secondary)",
              borderRadius: "var(--border-radius-md)",
              cursor: topicIdx === 0 ? "not-allowed" : "pointer",
              display: "flex", alignItems: "center", gap: 6,
            }}
          >
            <i className="ti ti-arrow-left" aria-hidden /> Previous
          </button>
          <span style={{ fontSize: 12, color: "var(--color-text-tertiary)", alignSelf: "center" }}>
            {topicIdx + 1} / {TOPICS.length}
          </span>
          <button
            disabled={topicIdx === TOPICS.length - 1}
            onClick={() => setActive(TOPICS[topicIdx + 1].id)}
            style={{
              padding: "7px 16px", fontSize: 13,
              background: "var(--color-background-primary)",
              color: topicIdx === TOPICS.length - 1 ? "var(--color-text-tertiary)" : "var(--color-text-secondary)",
              border: "0.5px solid var(--color-border-secondary)",
              borderRadius: "var(--border-radius-md)",
              cursor: topicIdx === TOPICS.length - 1 ? "not-allowed" : "pointer",
              display: "flex", alignItems: "center", gap: 6,
            }}
          >
            Next <i className="ti ti-arrow-right" aria-hidden />
          </button>
        </div>
      </main>
    </div>
  );
}
