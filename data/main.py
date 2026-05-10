import loadMovies, loadUsers

try:
    print("--------------------------------------------------------------")
    print("Generating user dataset...\n")
    user_df = loadUsers.generate_user_data([])
    print("\nUser dataset generated.\n")

    print("--------------------------------------------------------------")
    print("\nGenerating movie dataset...\n")
    movie_dict,reviews_dict = loadMovies.createMovieDataset()
    print("\nMovie dataset generated.")

    print("--------------------------------------------------------------")
    print("\nInserting user data into the database...\n")
    loadUsers.loadIntoDB(user_df.to_dict(orient="records"))
    print("\nUser data inserted into the database.")

    print("--------------------------------------------------------------")
    print("\nInserting movie data into the database...\n")
    loadMovies.loadIntoDB(movie_dict)
    print("\nMovie data inserted into the database.")

except Exception as e:
    print(f"An error occurred: {e}")