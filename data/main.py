from generators import showEmbeddings
import loaders.loadMovies as loadMovies, generators.usersInfo as usersInfo, loaders.loadShows as loadShows

#import generators.movieEmbeddings as movieEmbeddings

from db import supabase
try:
    ######################### User data ################################################################
    '''
    print("--------------------------------------------------------------")
    print("Generating user dataset...\n")
    user_dict = usersInfo.generate_user_data([])
    print("\nUser dataset generated.\n")

    print("--------------------------------------------------------------")
    print("\nInserting user data into the database...\n")
    usersUuids = usersInfo.loadUsersIntoDB(user_dict)
    print("\nUser data inserted into the database.")

     ######################### Movie data ################################################################
    
    print("-------------------------------------------------------------")
    print("\nGenerating movie dataset...\n")
    movie_dict,movie_reviews_dict = loadMovies.createMovieDataset()
    print("\nMovie dataset generated.")
    
    print("--------------------------------------------------------------")
    print("\nInserting movie data into the database...\n")
    loadMovies.loadMoviesIntoDB(movie_dict)
    print("\nMovie data inserted into the database.")
    
    print("--------------------------------------------------------------")
    print("\nInserting movie reviews data into the database...\n")
    loadMovies.loadReviewsIntoDB(movie_reviews_dict, usersUuids)
    print("\nMovie reviews data inserted into the database.")

    print("--------------------------------------------------------------")
    print("\nGenerating movie embeddings...\n")
    movieEmbeddings.loadEmbeddings()
    print("\nMovie embeddings generated.")
    '''
    ######################### Show data ################################################################
    '''
    print("--------------------------------------------------------------")
    print("\nGenerating movie dataset...\n")
    show_dict,show_reviews_dict = loadShows.createShowDataset()
    print("\nMovie dataset generated.")

    print("--------------------------------------------------------------")
    print("\nInserting show data into the database...\n")
    loadShows.loadShowsIntoDB(show_dict)
    print("\nShow data inserted into the database.")

    print("--------------------------------------------------------------")
    print("\nInserting show reviews data into the database...\n")
    loadShows.loadReviewsIntoDB(show_reviews_dict, usersUuids)
    print("\nShow reviews data inserted into the database.")

    '''
    print("--------------------------------------------------------------")
    print("\nGenerating show embeddings...\n")
    showEmbeddings.loadEmbeddings()
    print("\nShow embeddings generated.")
    
    '''
    def searchMovies(query, limit=5):
        embedding = movieEmbeddings.generate_embedding(query)
        
        results = supabase.rpc("search_movies", {
            "query_embedding": embedding,
            "match_count": limit
        }).execute()
        
        return results.data

    def prettyPrintResults(results):
        print("\n🎬 Search Results:\n")
        for i, movie in enumerate(results, 1):
            similarity = round(movie['similarity'] * 100, 1)
            print(f"{i}. {movie['titulo']}")
            print(f"   📝 {movie['sinopsis']}")
            print(f"   🎯 Match: {similarity}%")
            print()

    prettyPrintResults(searchMovies("peliculas provenientes de "))
    
    '''
except Exception as e:
    print(f"An error occurred: {e}")