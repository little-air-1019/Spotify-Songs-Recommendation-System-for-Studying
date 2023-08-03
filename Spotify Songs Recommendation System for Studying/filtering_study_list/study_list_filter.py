from xgboost import XGBModel as Model, DMatrix as Martix
import pandas as pd


def study_list_filter(model: Model, tracks: dict, tracks_info: pd.DataFrame):
    '''
    Filtering the tracks.

    Params:
    - model: A model object to predict the tracks is suitable for studying or not.
    - tracks: A list of tracks to filter.
    - tracks_info: A dataframe containing the tracks' information.
    '''

    # Let dataframe of songs be like model accepted
    dummy = pd.get_dummies(tracks_info, columns = ["key", "mode"])
    dummy = dummy.filter(regex="^key_|^mode_")

    for i in range(12):
        if "key_" + str(i) not in dummy.columns:
            dummy.insert(i, "key_"+str(i), 0)

    data = pd.concat([tracks_info.drop(["key", "mode"], axis=1), dummy], axis=1)
    # Drop unnecessary columns
    tracks_to_predict = data.drop(["track", "track_id", "artist", "acousticness", "album", "year"], axis=1)

    # prevent missing data
    for col in tracks_to_predict.columns:
        tracks_to_predict[col] = pd.to_numeric(tracks_to_predict[col], errors='coerce')

    tracks_to_predict = Martix(tracks_to_predict, enable_categorical=True)
    pred = model.predict(tracks_to_predict)
    
    # return passing predictions
    return [tracks[tracks_info['track_id'][i]] for i, val in enumerate(pred) if val == 1]