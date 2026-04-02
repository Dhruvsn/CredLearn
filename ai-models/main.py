import pandas as pd
import numpy as np
from sklearn.metrics.pairwise import cosine_similarity
from sklearn.neighbors import NearestNeighbors

# Load datasets
skills = pd.read_csv('skills.csv')
users = pd.read_csv('users.csv')

# -------------------------------
# Content-Based Filtering
# -------------------------------
def content_based(user_skills):
    # Convert categorical data to numeric
    skill_features = skills[['category', 'difficulty', 'demand']]
    skill_features = pd.get_dummies(skill_features)

    # Calculate similarity
    similarity = cosine_similarity(skill_features)

    recommended = []

    for skill in user_skills:
        idx = skills[skills['skill'] == skill].index[0]
        sim_scores = list(enumerate(similarity[idx]))
        sim_scores = sorted(sim_scores, key=lambda x: x[1], reverse=True)

        for i in sim_scores[1:3]:
            recommended.append(skills.iloc[i[0]]['skill'])

    return list(set(recommended))


# -------------------------------
# Collaborative Filtering (KNN)
# -------------------------------
def collaborative(user_id):
    user_matrix = users.set_index('user')

    model = NearestNeighbors(metric='cosine')
    model.fit(user_matrix)

    user_vector = user_matrix.loc[user_id].values.reshape(1, -1)
    distances, indices = model.kneighbors(user_vector, n_neighbors=3)

    similar_users = user_matrix.iloc[indices[0]].index.tolist()

    recommended = []

    for sim_user in similar_users:
        skills_learned = user_matrix.loc[sim_user]
        for skill, val in skills_learned.items():
            if val == 1 and user_matrix.loc[user_id][skill] == 0:
                recommended.append(skill)

    return list(set(recommended))


# -------------------------------
# Hybrid Recommendation
# -------------------------------
def hybrid(user_id, user_skills):
    rec1 = content_based(user_skills)
    rec2 = collaborative(user_id)

    final = list(set(rec1 + rec2))
    return final


# -------------------------------
# Test Example
# -------------------------------
user_id = "U1"
user_skills = ["Python"]

print("Content-Based:", content_based(user_skills))
print("Collaborative:", collaborative(user_id))
print("Hybrid Recommendation:", hybrid(user_id, user_skills))
