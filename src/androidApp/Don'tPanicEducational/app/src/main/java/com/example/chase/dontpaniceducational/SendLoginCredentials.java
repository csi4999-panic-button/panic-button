package com.example.chase.dontpaniceducational;

import android.os.AsyncTask;
import android.util.JsonReader;

import java.io.IOException;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.net.HttpURLConnection;
import java.net.URL;

public abstract class SendLoginCredentials extends AsyncTask<URL, Integer, Long> {
    protected void doInBackground() {
        try {
            URL apiEndpoint = new URL("http://www.panic-button.stream");
            HttpURLConnection myConnection = (HttpURLConnection) apiEndpoint.openConnection();
            myConnection.setRequestProperty("User-Agent", "android-app");
            if (myConnection.getResponseCode() == 200) {
                InputStream responseBody = myConnection.getInputStream();
                InputStreamReader responeBodyReader = new InputStreamReader(responseBody, "UTF-8");
                JsonReader jsonReader = new JsonReader(responeBodyReader);
            } else {

            }
        } catch (IOException e) {
            e.printStackTrace();
        }

    }

    protected void onProgressUpdate() {

    }

    protected void onPostExecute() {

    }
}
