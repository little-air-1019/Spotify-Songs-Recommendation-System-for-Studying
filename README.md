# Spotify Song Recommendation System for Studying

## File structure

- **Dataset**: Datasets to train model
- **filtering_study_list**: A package for filtering study list
  - `__init__.py`: initialize file of the package.
  - `get_all_tracks.py`: to get all tracks of a artist by his/her albums.
  - `study_list_filter`: to filter the tracks.
  - `tracks_to_dataframe`: gathering tracks' information and making them to a dataframe.
- **spotify**: A package for requesting spotify api (when spotipy is unavailable)
- **static**: Static files for flask server, a webpage project as well.
- **templates**: Template files for flask server.
- `__main__.py`: The Main function for this project.
- `model.pkl`: The XGBoost Model to predict the track is suitable for studying or not.
- `analysis.ipynb`: The document of the analysis for this project.
- `server.crt`: The SSL certificate for this project.

## Usage

1. Install the required packages:

  ```
  pip install -r .\\requirements.txt
  ```

2. Open the `server.crt` file to install the project certificate. 
   
3. Run the `__main__.py` file at this folder:

  ```
  cd path/to/project; py .
  ```
 

4. Open the browser (Chromium-Based is better) and open https://localhost:5000.

5. Search an artist in the search box and selected the artist you like.

6. After checking the information and click the play button below.

7. Wait for the program until the tracks after filtering are showing (it will take about serverl minutes), and click the button below.

8. If not logged in the page, click the button and login to get the your playlists.
  
9. Select the playlist and this will automatically append the tracks to.

## Development

### Regenerate Server Certificate and Key

Please read the following documentation: [如何使用 OpenSSL 建立開發測試用途的自簽憑證 (Self-Signed Certificate)](https://blog.miniasp.com/post/2019/02/25/Creating-Self-signed-Certificate-using-OpenSSL).

### Modify codes for testing easily

- Open `\\filtering_study_list\get_all_tracks.py`, Uncomment the line 17th of the file.

### When Spotify api is no response (or all the requests are response 429 errors)

- Open [Spotify for Developers Dashboard](https://developer.spotify.com/dashboard) create a new app, Set the redirect url to `https:\\localhost:5000`.

- Open `\\__main__.py` file and modify the `CLIENT_ID` and `CLIENT_SECRET` to another app just created.

- Replace the static files' client id and re-build.

  - Open `\\static\src\request.ts` file and modify the `clientId` to the same app and input `npm run build` at terminal.  
  
  - If this doesn't install nodejs and relative moudles: Open `\\static\src\build\main.bundle.js` and modify the `clientId` and replace to new client id. (Search `client_id` for old client id, Mention it: Don't replace the character doesn't.)