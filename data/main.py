import loadMovies, loadUsers

try:
    print("--------------------------------------------------------------")
    print("Generating user dataset...\n")
    user_df = loadUsers.generate_user_data([])
    print("\nUser dataset generated.\n")

    print("--------------------------------------------------------------")
    print("\nGenerating movie dataset...\n")
    movie_df = loadMovies.createMovieDataset() # create the dataset and save it as a csv file
    print("\nMovie dataset generated.")

    print("--------------------------------------------------------------")
    print("\nInserting user data into the database...\n")
    loadUsers.loadIntoDB(user_df.to_dict(orient="records"))
    print("\nUser data inserted into the database.")

except Exception as e:
    print(f"An error occurred: {e}")