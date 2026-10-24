import pandas as pd
import joblib

from sklearn.compose import ColumnTransformer
from sklearn.preprocessing import OneHotEncoder
from sklearn.pipeline import Pipeline
from sklearn.ensemble import RandomForestRegressor
from sklearn.model_selection import train_test_split
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score

data = pd.read_csv("data/emergency_history.csv")

X = data[["location", "hour", "day_of_week"]]
y = data["emergency_count"]

X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.25, random_state=42
)

preprocessor = ColumnTransformer(
    transformers=[
        ("location", OneHotEncoder(handle_unknown="ignore"), ["location"])
    ],
    remainder="passthrough"
)

model = Pipeline([
    ("preprocessor", preprocessor),
    ("regressor", RandomForestRegressor(n_estimators=100, random_state=42))
])

model.fit(X_train, y_train)

predictions = model.predict(X_test)

print("Model training completed.")
print("Training records:", len(X_train))
print("Testing records:", len(X_test))
print("Mean Absolute Error:", round(mean_absolute_error(y_test, predictions), 2))
print("Root Mean Squared Error:", round(mean_squared_error(y_test, predictions) ** 0.5, 2))
print("R2 Score:", round(r2_score(y_test, predictions), 2))

joblib.dump(model, "data/emergency_demand_model.pkl")
print("Model saved to data/emergency_demand_model.pkl")
